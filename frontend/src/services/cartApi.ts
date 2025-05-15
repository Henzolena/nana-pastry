import { apiGet, apiPost, apiPut, apiDelete } from './apiService';
import { CartItem, CartState } from '@/types/cart';

// Types
export interface CartResponse {
  success: boolean;
  message?: string;
  cart?: CartState;
}

/**
 * Cart API service for interacting with the backend
 */
export const cartApi = {
  /**
   * Get the current user's cart from the backend
   */
  getUserCart: async (): Promise<CartState> => {
    try {
      return await apiGet<CartState>('/carts/current');
    } catch (error) {
      console.error('Error fetching user cart:', error);
      throw error;
    }
  },

  /**
   * Save a cart to the backend
   */
  saveCart: async (cart: CartState): Promise<CartResponse> => {
    try {
      return await apiPut<CartResponse>('/carts/current', cart);
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  },

  /**
   * Add an item to the cart
   */
  addItem: async (item: CartItem): Promise<CartResponse> => {
    try {
      return await apiPost<CartResponse>('/carts/items', item);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  /**
   * Update an item in the cart
   */
  updateItem: async (itemId: string, updates: Partial<CartItem>): Promise<CartResponse> => {
    try {
      return await apiPut<CartResponse>(`/carts/items/${itemId}`, updates);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  /**
   * Remove an item from the cart
   */
  removeItem: async (itemId: string): Promise<CartResponse> => {
    try {
      return await apiDelete<CartResponse>(`/carts/items/${itemId}`);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  /**
   * Clear the cart
   */
  clearCart: async (): Promise<CartResponse> => {
    try {
      return await apiDelete<CartResponse>('/carts/current');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Merge guest cart with user cart when logging in
   */
  mergeGuestCart: async (guestCart: CartState): Promise<CartResponse> => {
    try {
      return await apiPost<CartResponse>('/carts/merge', { guestCart });
    } catch (error) {
      console.error('Error merging guest cart:', error);
      throw error;
    }
  }
};
