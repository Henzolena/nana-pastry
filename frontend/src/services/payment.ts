import { apiPost } from './apiService';
import { PaymentStatus } from './order'; // Import PaymentStatus type from order service
// Remove direct Firestore imports
// import { getDocumentById, updateDocument } from '../lib/firestore';
// import { Timestamp } from 'firebase/firestore';
// Remove import of updatePaymentStatus and Order from order service
// import { Order, getOrder, updatePaymentStatus } from './order';

/**
 * Payment methods for the application
 */
export type PaymentMethod = 'credit-card' | 'cash' | 'cash-app';

// Payment status types (Imported from order service)
// export type PaymentStatus = 'unpaid' | 'pending' | 'partial' | 'paid' | 'refunded';

/**
 * Payment transaction record (Matches type in order service)
 */
export interface PaymentTransaction {
  id: string;
  amount: number;
  method: PaymentMethod;
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

// Removed getOrderPayments and refundPayment as they are not currently used and backend handles payment logic
