import React, { createContext, useContext, useReducer, useEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CartContextType, CartState, CartAction, CartItem } from '@/types/cart';
import { Cake, CakeSize } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { showErrorToast } from '@/utils/toast';


// Default cart state
const defaultCartState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  deliveryFee: 0,
  total: 0,
  isOpen: false,
};

// Tax rate (can be moved to data.ts later)
const TAX_RATE = 0.0825; // 8.25%

// Cart reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  // Ensure state.items is always an array
  const safeState = {
    ...state,
    items: state.items || []
  };

  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if the item already exists with the same cake, size, and special instructions
      const existingItemIndex = safeState.items.findIndex(
        (item) => 
          item.cakeId === action.payload.cakeId && 
          item.size.label === action.payload.size.label &&
          item.specialInstructions === action.payload.specialInstructions
      );

      let newItems;
      
      if (existingItemIndex > -1) {
        // Update existing item quantity
        newItems = safeState.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...safeState.items, action.payload];
      }
      
      // Calculate new totals
      const subtotal = calculateSubtotal(newItems);
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax + safeState.deliveryFee;
      
      return {
        ...safeState,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }
    
    case 'REPLACE_CART': {
      // Replace the entire cart state (used when loading from server/localStorage)
      // Calculate totals to ensure consistency
      const items = action.payload.items || [];
      const subtotal = calculateSubtotal(items);
      const tax = subtotal * TAX_RATE;
      const deliveryFee = action.payload.deliveryFee || 0;
      const total = subtotal + tax + deliveryFee;
      
      return {
        ...action.payload,
        items,
        subtotal,
        tax,
        total,
        // Keep the current isOpen state to avoid UI glitches
        isOpen: safeState.isOpen,
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = safeState.items.filter((item) => item.id !== action.payload);
      const subtotal = calculateSubtotal(newItems);
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax + safeState.deliveryFee;
      
      return {
        ...safeState,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item
        return cartReducer(safeState, { type: 'REMOVE_ITEM', payload: id });
      }
      
      const newItems = safeState.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      
      const subtotal = calculateSubtotal(newItems);
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax + safeState.deliveryFee;
      
      return {
        ...safeState,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }
    
    case 'UPDATE_ITEM_CUSTOMIZATIONS': {
      const { id, customizations } = action.payload;
      
      const newItems = safeState.items.map((item) =>
        item.id === id ? { ...item, customizations } : item
      );
      
      // No need to recalculate subtotal as price doesn't change
      return {
        ...safeState,
        items: newItems,
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...defaultCartState,
        isOpen: safeState.isOpen,
      };
    
    case 'TOGGLE_CART':
      return {
        ...safeState,
        isOpen: action.payload !== undefined ? action.payload : !safeState.isOpen,
      };
      
    default:
      return safeState;
  }
};

// Helper function to calculate subtotal
const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart state from localStorage if available
  const [state, dispatch] = useReducer(cartReducer, defaultCartState, () => {
    if (typeof window === 'undefined') return defaultCartState;
    
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : defaultCartState;
  });

  // Sync states and refs
  const [isFirestoreLoading, setIsFirestoreLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastSyncedStateRef = useRef<CartState | null>(null);
  
  // Get auth context
  const { user } = useAuth();

  // Load cart from Firestore or localStorage when user signs in/out
  useEffect(() => {
    const loadUserCart = async () => {
      if (user) {
        // User is logged in.
        setIsFirestoreLoading(true);
        
        try {
          const cartRef = doc(db, 'users', user.uid, 'carts', 'current');
          const userCartSnap = await getDoc(cartRef);
          
          const localCart = localStorage.getItem('cart');
          const hasLocalCart = localCart && JSON.parse(localCart).items.length > 0;
          
          if (userCartSnap.exists()) {
            // Firebase cart exists, load it
            const firestoreCartData = userCartSnap.data() as CartState;
            console.log("Cart loaded from Firestore:", firestoreCartData);
            
            // Check if we have a local cart to potentially merge
            if (hasLocalCart && !userCartSnap.data().lastSynced) {
              // If user has a local cart and the Firestore cart has no sync timestamp,
              // we should merge them (prioritizing Firestore items for duplicates)
              const localCartData = JSON.parse(localCart) as CartState;
              
              // Get unique item IDs from both carts
              const firestoreItemIds = new Set(firestoreCartData.items.map(item => 
                `${item.cakeId}-${item.size.label}-${item.specialInstructions || ''}`
              ));
              
              // Add local items that don't exist in Firestore
              const uniqueLocalItems = localCartData.items.filter(item => 
                !firestoreItemIds.has(`${item.cakeId}-${item.size.label}-${item.specialInstructions || ''}`)
              );
              
              // Merge carts if we have unique local items
              if (uniqueLocalItems.length > 0) {
                console.log(`Merging ${uniqueLocalItems.length} local items with Firestore cart`);
                const mergedCart = {
                  ...firestoreCartData,
                  items: [...firestoreCartData.items, ...uniqueLocalItems],
                  // Recalculate totals will happen in reducer
                };
                
                // Use the reducer to handle calculations properly
                dispatch({ type: 'REPLACE_CART', payload: mergedCart });
                return; // Skip the normal dispatch below as we've already dispatched
              }
            }
            
            // If we didn't merge, just use the Firestore cart
            dispatch({ type: 'REPLACE_CART', payload: firestoreCartData });
          } else if (hasLocalCart) {
            // No Firestore cart but we have localStorage cart - keep using it
            // It will get synced to Firestore in the save effect
            console.log("No cart in Firestore, but found local cart. Using local cart.");
            const localCartData = JSON.parse(localCart) as CartState;
            dispatch({ type: 'REPLACE_CART', payload: localCartData });
          } else {
            // No Firestore cart and no local cart - use empty default
            console.log("No Firestore or local cart found. Starting with empty cart.");
            dispatch({ type: 'REPLACE_CART', payload: defaultCartState });
          }
          
          // Set up real-time listener for changes from other tabs/devices
          const unsubscribe = onSnapshot(cartRef, (snapshot) => {
            if (snapshot.exists() && !isSyncing) {
              const remoteCart = snapshot.data() as CartState;
              const currentCart = lastSyncedStateRef.current;
              
              // Only update if the remote cart is different from what we know
              // This helps prevent update loops and unnecessary renders
              if (currentCart && JSON.stringify(remoteCart) !== JSON.stringify(currentCart)) {
                console.log("Remote cart changed. Updating local state.");
                dispatch({ type: 'REPLACE_CART', payload: remoteCart });
              }
            }
          }, (error) => {
            console.error("Error in cart snapshot listener:", error);
          });
          
          // Store unsubscribe function for cleanup
          unsubscribeRef.current = unsubscribe;
        } catch (error) {
          console.error('Error loading cart from Firestore:', error);
          // If Firestore load fails, try localStorage as fallback
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            dispatch({ type: 'REPLACE_CART', payload: JSON.parse(savedCart) });
          }
        } finally {
          setIsFirestoreLoading(false);
        }
      } else {
        // User logged out or is guest. Load from localStorage.
        setIsFirestoreLoading(false);
        
        // Clean up any existing Firestore listener
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        
        console.log("User logged out/guest, loading cart from localStorage.");
        const savedCart = localStorage.getItem('cart');
        dispatch({ type: 'REPLACE_CART', payload: savedCart ? JSON.parse(savedCart) : defaultCartState });
      }
    };

    loadUserCart();
    
    // Clean up function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [user]); // Only re-run when user object changes

// Helper function to sanitize data for Firestore (convert undefined to null)
const sanitizeForFirestore = (data: any): any => {
  if (data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore);
  }
  if (typeof data === 'object' && data !== null) {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value !== undefined) { // Omit undefined properties entirely or convert to null
          sanitizedObject[key] = sanitizeForFirestore(value);
        }
        // To convert undefined to null instead of omitting:
        // sanitizedObject[key] = sanitizeForFirestore(value); 
      }
    }
    return sanitizedObject;
  }
  return data;
};

  // Debounced save cart to Firestore/localStorage with error handling
  const debouncedSaveCart = useCallback(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout to save after 500ms of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      // Skip saving if we're currently loading from Firestore
      if (isFirestoreLoading) {
        console.log("Skipping save because Firestore is loading");
        return;
      }
      
      if (user) {
        try {
          // Set syncing flag to prevent snapshot listener from overwriting
          setIsSyncing(true);
          
          // Update last synced state ref
          lastSyncedStateRef.current = state;
          
          // Save to Firestore
          console.log("Saving cart to Firestore for user:", user.uid);
          const cartRef = doc(db, 'users', user.uid, 'carts', 'current');
          const sanitizedState = sanitizeForFirestore({
            ...state,
            lastSynced: serverTimestamp(), // Add timestamp for conflict resolution
          });
          await setDoc(cartRef, sanitizedState, { merge: true });
        } catch (error) {
          console.error('Error saving cart to Firestore:', error);
          showErrorToast('Failed to save your cart. Please try again.');
          // We still save to localStorage as backup
          localStorage.setItem('cart', JSON.stringify(state));
        } finally {
          setIsSyncing(false);
        }
      } else {
        // User is not logged in, save to localStorage
        console.log("Saving cart to localStorage for guest");
        localStorage.setItem('cart', JSON.stringify(state));
      }
    }, 500); // 500ms debounce
  }, [state, user, isFirestoreLoading]);

  // Save cart whenever state changes
  useEffect(() => {
    // Skip initial empty cart save or when loading
    if (state.items.length === 0 && !localStorage.getItem('cart')) {
      return;
    }
    
    debouncedSaveCart();
    
    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, debouncedSaveCart]);

  // Add item to cart
  const addItem = (cake: Cake, size: CakeSize, quantity: number, specialInstructions?: string) => {
    const image = (cake.images && cake.images.length > 0) ? cake.images[0] : cake.imageUrl || '/placeholder-cake.jpg';
    const newItem: CartItem = {
      id: uuidv4(),
      cakeId: cake.id,
      name: cake.name,
      price: size.price,
      quantity,
      size,
      image: image, // Use safely accessed image
      specialInstructions,
      isCustomizable: false // Regular products are not customizable
    };

    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  // Add custom item to cart
  const addCustomItem = (cake: Cake, size: CakeSize, quantity: number, customizations: CartItem['customizations']) => {
    const image = (cake.images && cake.images.length > 0) ? cake.images[0] : cake.imageUrl || '/placeholder-cake.jpg';
    const newItem: CartItem = {
      id: uuidv4(),
      cakeId: cake.id,
      name: cake.name,
      price: size.price,
      quantity,
      size,
      image: image, // Use safely accessed image
      customizations,
      isCustomizable: true // Custom items are customizable by definition
    };

    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  // Update item customizations
  const updateItemCustomizations = (id: string, customizations: CartItem['customizations']) => {
    dispatch({ type: 'UPDATE_ITEM_CUSTOMIZATIONS', payload: { id, customizations } });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Toggle cart visibility
  const toggleCart = (forceState?: boolean) => {
    dispatch({ type: 'TOGGLE_CART', payload: forceState });
  };

  const value: CartContextType = {
    state,
    addItem,
    addCustomItem,
    removeItem,
    updateQuantity,
    updateItemCustomizations,
    clearCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
