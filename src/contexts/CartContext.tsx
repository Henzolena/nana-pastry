import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // We'll need to install this package
import { CartContextType, CartState, CartAction, CartItem } from '@/types/cart';
import { Cake, CakeSize } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


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
      return {
        ...action.payload,
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

  // Get auth context
  const { user } = useAuth();

  // Load cart from Firestore or localStorage when user signs in/out
  useEffect(() => {
    const loadUserCart = async () => {
      if (user) {
        try {
          // Get cart from Firestore if user is logged in
          const cartRef = doc(db, 'users', user.uid, 'carts', 'current');
          const cartSnap = await getDoc(cartRef);
          
          if (cartSnap.exists()) {
            const cartData = cartSnap.data() as CartState;
            if (cartData.items && cartData.items.length > 0) {
              dispatch({ type: 'REPLACE_CART', payload: cartData });
            }
          }
        } catch (error) {
          console.error('Error loading cart from Firestore:', error);
        }
      }
    };

    loadUserCart();
  }, [user]);

  // Save cart to Firestore (for registered users) or localStorage (for guests)
  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        try {
          // Save to Firestore for registered users
          const cartRef = doc(db, 'users', user.uid, 'carts', 'current');
          await setDoc(cartRef, state);
        } catch (error) {
          console.error('Error saving cart to Firestore:', error);
          // Fallback to localStorage if Firestore fails
          localStorage.setItem('cart', JSON.stringify(state));
        }
      } else {
        // Save to localStorage for guests
        localStorage.setItem('cart', JSON.stringify(state));
      }
    };

    saveCart();
  }, [state, user]);

  // Add item to cart
  const addItem = (cake: Cake, size: CakeSize, quantity: number, specialInstructions?: string) => {
    const newItem: CartItem = {
      id: uuidv4(),
      cakeId: cake.id,
      name: cake.name,
      price: size.price,
      quantity,
      size,
      image: cake.images[0], // First image as the thumbnail
      specialInstructions,
      isCustomizable: false // Regular products are not customizable
    };

    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  // Add custom item to cart
  const addCustomItem = (cake: Cake, size: CakeSize, quantity: number, customizations: CartItem['customizations']) => {
    const newItem: CartItem = {
      id: uuidv4(),
      cakeId: cake.id,
      name: cake.name,
      price: size.price,
      quantity,
      size,
      image: cake.images[0], // First image as the thumbnail
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