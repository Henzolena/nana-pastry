import { Injectable } from '@nestjs/common';
import { CartItem, CartState } from './interfaces/cart.interface';
import * as admin from 'firebase-admin';

@Injectable()
export class CartService {
  private readonly db = admin.firestore();

  /**
   * Get a user's current cart
   */
  async getUserCart(userId: string): Promise<CartState> {
    try {
      const cartRef = this.db.collection('users').doc(userId).collection('carts').doc('current');
      const cartSnap = await cartRef.get();

      if (cartSnap.exists) {
        return cartSnap.data() as CartState;
      }

      // Return default empty cart
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
        isOpen: false,
      };
    } catch (error) {
      console.error('Error getting user cart:', error);
      throw new Error('Failed to retrieve cart');
    }
  }

  /**
   * Save the entire cart
   */
  async saveCart(userId: string, cartData: CartState): Promise<any> {
    try {
      const cartRef = this.db.collection('users').doc(userId).collection('carts').doc('current');
      
      // Add timestamp for synchronization
      const cartWithTimestamp = {
        ...cartData,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await cartRef.set(cartWithTimestamp, { merge: true });
      
      return {
        success: true,
        message: 'Cart saved successfully',
        cart: cartData,
      };
    } catch (error) {
      console.error('Error saving cart:', error);
      throw new Error('Failed to save cart');
    }
  }

  /**
   * Add an item to the cart
   */
  async addItem(userId: string, item: CartItem): Promise<any> {
    try {
      // Get current cart
      const cart = await this.getUserCart(userId);
      
      // Check if item already exists
      const existingIndex = cart.items.findIndex(
        (i) => i.cakeId === item.cakeId && 
               i.size.label === item.size.label && 
               i.specialInstructions === item.specialInstructions
      );
      
      if (existingIndex > -1) {
        // Update quantity of existing item
        cart.items[existingIndex].quantity += item.quantity;
      } else {
        // Add new item
        cart.items.push(item);
      }
      
      // Recalculate totals
      this.recalculateCartTotals(cart);
      
      // Save updated cart
      return this.saveCart(userId, cart);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  }

  /**
   * Update a cart item
   */
  async updateItem(userId: string, itemId: string, updates: Partial<CartItem>): Promise<any> {
    try {
      const cart = await this.getUserCart(userId);
      
      // Find the item
      const itemIndex = cart.items.findIndex((item) => item.id === itemId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      // Update the item
      cart.items[itemIndex] = {
        ...cart.items[itemIndex],
        ...updates,
      };
      
      // Recalculate totals
      this.recalculateCartTotals(cart);
      
      // Save updated cart
      return this.saveCart(userId, cart);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new Error('Failed to update cart item');
    }
  }

  /**
   * Remove an item from the cart
   */
  async removeItem(userId: string, itemId: string): Promise<any> {
    try {
      const cart = await this.getUserCart(userId);
      
      // Remove the item
      cart.items = cart.items.filter((item) => item.id !== itemId);
      
      // Recalculate totals
      this.recalculateCartTotals(cart);
      
      // Save updated cart
      return this.saveCart(userId, cart);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  }

  /**
   * Clear the cart
   */
  async clearCart(userId: string): Promise<any> {
    try {
      const emptyCart: CartState = {
        items: [],
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
        isOpen: false,
      };
      
      return this.saveCart(userId, emptyCart);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  /**
   * Merge guest cart with user cart
   */
  async mergeGuestCart(userId: string, guestCart: CartState): Promise<any> {
    try {
      // Get user's current cart from Firestore
      const userCart = await this.getUserCart(userId);
      
      // If user cart is empty, just use the guest cart
      if (userCart.items.length === 0) {
        return this.saveCart(userId, guestCart);
      }
      
      // Create a map of existing items for quick lookup
      const existingItems = new Map();
      userCart.items.forEach(item => {
        const key = `${item.cakeId}-${item.size.label}-${item.specialInstructions || ''}`;
        existingItems.set(key, item);
      });
      
      // Merge guest items that don't already exist
      for (const guestItem of guestCart.items) {
        const key = `${guestItem.cakeId}-${guestItem.size.label}-${guestItem.specialInstructions || ''}`;
        
        if (existingItems.has(key)) {
          // Item exists, update quantity
          const existingItem = existingItems.get(key);
          existingItem.quantity += guestItem.quantity;
        } else {
          // Add new item
          userCart.items.push(guestItem);
        }
      }
      
      // Recalculate totals
      this.recalculateCartTotals(userCart);
      
      // Save merged cart
      return this.saveCart(userId, userCart);
    } catch (error) {
      console.error('Error merging guest cart:', error);
      throw new Error('Failed to merge guest cart');
    }
  }

  /**
   * Helper function to recalculate cart totals
   */
  private recalculateCartTotals(cart: CartState): void {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Apply tax (assuming 8.25% tax rate)
    cart.tax = cart.subtotal * 0.0825;
    
    // Calculate total
    cart.total = cart.subtotal + cart.tax + (cart.deliveryFee || 0);
  }
}
