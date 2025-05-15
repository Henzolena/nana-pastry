import { apiPost, apiGet, apiPut, apiDelete } from './apiService';
import { Order, OrderStatus, OrderData, PaymentTransaction } from './order';

/**
 * Service for order-related API operations
 * This service interacts with the NestJS backend for all order operations
 */
export const orderApi = {
  /**
   * Create a new order
   * @param orderData Order data to create
   * @returns Created order with ID
   */
  createOrder: async (orderData: Omit<OrderData, 'id'>): Promise<Order> => {
    try {
      return await apiPost<Order>('/orders', orderData);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Get all orders for the currently authenticated user
   * @returns Array of orders
   */
  getUserOrders: async (): Promise<Order[]> => {
    try {
      return await apiGet<Order[]>('/orders/my-orders');
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Get order details by ID
   * @param orderId Order ID
   * @returns Order details
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      return await apiGet<Order>(`/orders/${orderId}`);
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Update order status
   * @param orderId Order ID
   * @param status New status
   * @param note Optional note about the status change
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus, note?: string): Promise<void> => {
    try {
      await apiPut(`/orders/${orderId}/status`, { status, note });
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  },

  /**
   * Submit a payment for an order
   * @param orderId Order ID
   * @param paymentData Payment data
   * @returns Payment ID
   */
  submitPayment: async (orderId: string, paymentData: Omit<PaymentTransaction, 'id'>): Promise<string> => {
    try {
      const result = await apiPost<{ paymentId: string }>(`/orders/${orderId}/payments`, paymentData);
      return result.paymentId;
    } catch (error) {
      console.error(`Error submitting payment for order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel an order
   * @param orderId Order ID
   * @param reason Cancellation reason
   */
  cancelOrder: async (orderId: string, reason: string): Promise<void> => {
    try {
      await apiPut(`/orders/${orderId}/cancel`, { reason });
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * For admin users: Get all orders
   * @param status Optional status filter
   * @returns Array of orders
   */
  getAllOrders: async (status?: OrderStatus): Promise<Order[]> => {
    try {
      const queryParams = status ? `?status=${status}` : '';
      return await apiGet<Order[]>(`/orders${queryParams}`);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }
};
