import { apiPost, apiGet, apiPut } from './apiService'; // Import API service
import type { CartItem } from '../types/cart';
import { FirestoreDocument } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
// Remove direct Firestore imports
// import { getDocumentById, addDocument, updateDocument, getDocuments, FirestoreDocument } from '../lib/firestore';
// import { where, Timestamp, orderBy } from 'firebase/firestore';
// Remove userService import as profile update is backend responsibility
// import { updateOrderStats } from './userService';

// Order status types
export type OrderStatus =
  | 'pending'    // Initial status when order is placed
  | 'approved'   // Order has been approved by the baker
  | 'processing' // Baker is working on the order
  | 'ready'      // Order is ready for pickup/delivery
  | 'delivered'  // Order has been delivered
  | 'picked-up'  // Order has been picked up by customer
  | 'completed'  // Order is complete
  | 'cancelled'  // Order has been cancelled

// Payment status types
export type PaymentStatus =
  | 'unpaid'    // No payment received yet
  | 'pending'   // Payment initiated but not confirmed
  | 'partial'   // Partial payment received
  | 'paid'      // Full payment received
  | 'refunded'  // Payment has been refunded

// Order item interface
export interface OrderItem {
  cakeId: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  customizations?: {
    size?: string;
    flavors?: string[];
    fillings?: string[];
    frostings?: string[];
    shape?: string;
    addons?: string[];
    specialInstructions?: string;
  };
}

// Payment transaction record
export interface PaymentTransaction {
  id: string;
  amount: number;
  method: 'credit-card' | 'cash' | 'cash-app';
  date: string; // Use string for DTO to backend
  confirmationId?: string;
  cashAppDetails?: {
    confirmationId?: string;
    lastUpdated?: string; // Use string for DTO to backend
  };
  cardDetails?: {
    last4?: string;
    brand?: string;
  };
  notes?: string;
}

// Status history record
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string; // Use string for DTO to backend
  note?: string;
  updatedBy?: string; // userId or "system"
}

// Payment status history record
export interface PaymentStatusHistoryEntry {
  status: PaymentStatus;
  timestamp: string; // Use string for DTO to backend
  note?: string;
  updatedBy?: string; // userId or "system"
}

// Define the basic Order data without Firestore-specific fields
export interface OrderData {
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  deliveryMethod: 'pickup' | 'delivery';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryInfo?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryDate?: string; // Use string for DTO to backend
    deliveryTime: string;
    deliveryFee: number;
  };
  pickupInfo?: {
    pickupDate: string; // Use string for DTO to backend
    pickupTime: string;
    storeLocation?: string;
  };
  specialInstructions?: string;
  isCustomOrder: boolean;
  customOrderDetails?: {
    consultationDate?: string; // Use string for DTO to backend
    consultationTime?: string;
    designNotes?: string;
    referenceImages?: string[];
    depositAmount?: number;
  };
  // Status tracking
  statusHistory?: StatusHistoryEntry[];
  // Payment tracking
  paymentStatusHistory?: PaymentStatusHistoryEntry[];
  // Payment transactions
  payments?: PaymentTransaction[];
  // Balance tracking
  balanceDue?: number;
  amountPaid?: number;
  // Add a field to track if the order has been linked to a user profile
  profileUpdated?: boolean; // This might be backend internal now
  // Idempotency key for preventing duplicate orders
  idempotencyKey?: string;
  createdAt?: string; // Use string for DTO from backend
  updatedAt?: string; // Use string for DTO from backend
}

// Full Order type received from backend (includes ID)
export type Order = OrderData & FirestoreDocument & {
  createdAt: Date | string | Timestamp; // Ensure createdAt is properly typed
};

/**
 * Create a new order via the backend API
 * @param orderData Order data to send to the backend
 * @returns Promise with order ID
 */
export const createNewOrder = async (orderData: Omit<OrderData, 'status' | 'paymentStatus' | 'amountPaid' | 'balanceDue' | 'statusHistory' | 'paymentStatusHistory' | 'payments' | 'profileUpdated' | 'createdAt' | 'updatedAt'> & { idempotencyKey?: string }): Promise<string> => {
  try {
    // Explicitly construct the payload to send, ensuring only allowed fields are included.
    // Backend's CreateOrderDto defines what's allowed.
    // userId, status, paymentStatus are set by the backend.
    const { 
      userId, // remove
      status, // remove
      paymentStatus, // remove
      amountPaid, // remove (calculated by backend)
      balanceDue, // remove (calculated by backend)
      statusHistory, // remove (managed by backend)
      paymentStatusHistory, // remove (managed by backend)
      payments, // remove (managed by backend)
      profileUpdated, // remove (internal backend logic)
      createdAt, // remove (set by backend)
      updatedAt, // remove (set by backend)
      ...payload // keep the rest
    } = orderData as OrderData; // Cast to full OrderData to access all keys for destructuring

    console.log("Payload for createNewOrder:", payload);

    const response = await apiPost<{ id: string }>('/orders', payload);
    return response.id;
  } catch (error) {
    console.error('Error creating order via API:', error);
    // Re-throw the error for the caller to handle (e.g., show a toast)
    throw error;
  }
};

/**
 * Convert cart items to order items
 * @param cartItems Array of cart items
 * @returns Array of order items
 */
export const cartItemsToOrderItems = (cartItems: CartItem[]): OrderItem[] => {
  return cartItems.map(item => ({
    cakeId: item.cakeId,
    name: item.name,
    imageUrl: item.image,
    price: item.price,
    quantity: item.quantity,
    customizations: item.customizations
  }));
};

/**
 * Get order details by ID via the backend API
 * @param orderId Order ID
 * @returns Promise with order details
 */
export const getOrder = async (orderId: string): Promise<Order> => {
  try {
    const order = await apiGet<Order>(`/orders/${orderId}`);
    // The backend handles authorization and NotFoundException
    return order;
  } catch (error) {
    console.error('Error getting order via API:', error);
    throw error;
  }
};

/**
 * Update order status via the backend API
 * @param orderId Order ID
 * @param status New order status
 * @param note Optional note about the status change
 * @returns Promise indicating success
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<void> => {
  try {
    // The backend handles authorization, history, and updatedBy
    await apiPut<void>(`/orders/${orderId}/status`, { status, note });
  } catch (error) {
    console.error('Error updating order status via API:', error);
    throw error;
  }
};

// Removed updatePaymentStatus as it's handled by backend recordPayment/processCashAppPayment or admin flow

/**
 * Get all orders for a user via the backend API
 * @returns Promise with array of orders
 */
export const getUserOrderHistory = async (): Promise<Order[]> => {
  try {
    // The backend endpoint /orders/my-history automatically filters by the authenticated user
    const orders = await apiGet<Order[]>('/orders/my-history');
    // The backend handles authorization and sorting
    return orders;
  } catch (error) {
    console.error('Error getting user order history via API:', error);
    throw error;
  }
};

// Removed linkOrderToUser as this logic should be handled by the backend

/**
 * Calculate estimated pickup or delivery date
 * @param isRush Whether this is a rush order
 * @param isCustom Whether this is a custom order
 * @returns Estimated date
 */
export const calculateEstimatedDate = (
  isRush: boolean = false,
  isCustom: boolean = false
): Date => {
  const now = new Date();
  let daysToAdd = isCustom ? 14 : 3; // Default: 3 days for standard, 14 for custom

  // Rush orders are fulfilled 1 day faster (if possible)
  if (isRush && !isCustom) {
    daysToAdd = Math.max(1, daysToAdd - 1);
  }

  const result = new Date(now);
  result.setDate(result.getDate() + daysToAdd);

  // Ensure the date is a business day (Mon-Sat, not Sunday)
  if (result.getDay() === 0) { // Sunday
    result.setDate(result.getDate() + 1);
  }

  return result;
};

/**
 * Format a date as a string (YYYY-MM-DD)
 * @deprecated Use formatDate from utils/formatters instead
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDateForDisplay = (date: Date): string => {
  // Import formatDate from utils to avoid circular dependencies
  const { formatDate } = require('../utils/formatters');
  return formatDate(date, { type: 'date' });
};

/**
 * Generate available pickup time slots
 * @param date Pickup date
 * @returns Array of available time slots
 */
export const getAvailableTimeSlots = (date: Date): string[] => {
  // This is a mock implementation
  // In a real app, this would check the database for availability
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  if (isWeekend) {
    return ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'];
  } else {
    return ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
            '2:00 PM', '3:00 PM', '4:00 PM'];
  }
};

/**
 * Record a payment for an order via the backend API
 * @param orderId Order ID
 * @param paymentData Payment transaction data
 * @returns Promise with payment ID
 */
export const recordPayment = async (
  orderId: string,
  paymentData: Omit<PaymentTransaction, 'id'>
): Promise<string> => {
  try {
    // The backend handles payment recording, balance updates, and payment status updates
    const response = await apiPost<{ paymentId: string }>(`/orders/${orderId}/payments`, paymentData);
    return response.paymentId;
  } catch (error) {
    console.error('Error recording payment via API:', error);
    throw error;
  }
};

/**
 * Process a Cash App payment for an order via the backend API
 * @param orderId Order ID
 * @param amount Payment amount (if 0, will use the order's total or balance due)
 * @param confirmationId Cash App confirmation ID
 * @param notes Optional payment notes
 * @returns Promise with payment ID
 */
export const processCashAppPayment = async (
  orderId: string,
  amount: number,
  confirmationId: string,
  notes?: string
): Promise<string> => {
  try {
    // The backend handles processing, including fetching order total/balance if amount is 0
    const response = await apiPost<{ paymentId: string }>(`/orders/${orderId}/payments/cashapp`, { amount, confirmationId, notes });
    return response.paymentId;
  } catch (error) {
    console.error('Error processing Cash App payment via API:', error);
    throw error;
  }
};
