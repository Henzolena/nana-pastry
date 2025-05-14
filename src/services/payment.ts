import { getDocumentById, updateDocument } from '../lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { Order, getOrder, updatePaymentStatus } from './order';

// Collection name
const COLLECTION_NAME = 'orders';

/**
 * Payment methods for the application
 */
export type PaymentMethod = 'credit-card' | 'cash' | 'cash-app';

/**
 * Payment status types
 */
export type PaymentStatus = 'unpaid' | 'pending' | 'partial' | 'paid' | 'refunded';

/**
 * Payment transaction record
 */
export interface PaymentTransaction {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: Date | Timestamp;
  confirmationId?: string;
  cashAppDetails?: {
    confirmationId?: string;
  };
  cardDetails?: {
    last4?: string;
    brand?: string;
  };
  notes?: string;
}

/**
 * Payment status history record
 */
export interface PaymentStatusHistoryEntry {
  status: PaymentStatus;
  timestamp: Date | Timestamp;
  note?: string;
  updatedBy?: string; // userId or "system"
}

/**
 * Record a payment for an order
 * @param orderId Order ID
 * @param paymentData Payment transaction data
 * @returns Promise with payment ID
 */
export const recordPayment = async (
  orderId: string,
  paymentData: Omit<PaymentTransaction, 'id'>
): Promise<string> => {
  try {
    // Get current order
    const order = await getOrder(orderId);
    
    // Create a unique payment ID
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Create the payment transaction record
    const paymentTransaction: PaymentTransaction = {
      ...paymentData,
      id: paymentId,
      // Ensure date is a Date object if not already
      date: paymentData.date || new Date()
    };
    
    // Calculate new balance due and amount paid
    const currentAmountPaid = order.amountPaid || 0;
    const newAmountPaid = currentAmountPaid + paymentData.amount;
    const newBalanceDue = Math.max(0, order.total - newAmountPaid);
    
    // Determine new payment status based on balance
    let newPaymentStatus: PaymentStatus = order.paymentStatus as PaymentStatus;
    
    if (newBalanceDue <= 0) {
      newPaymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'partial';
    }
    
    // Add payment to the order and update balance info
    await updateDocument(COLLECTION_NAME, orderId, {
      payments: order.payments 
        ? [...(order.payments || []), paymentTransaction] 
        : [paymentTransaction],
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue
    });
    
    // Update payment status if it changed
    if (newPaymentStatus !== order.paymentStatus) {
      await updatePaymentStatus(
        orderId, 
        newPaymentStatus, 
        `Payment of ${paymentData.amount.toFixed(2)} recorded. New balance: ${newBalanceDue.toFixed(2)}`
      );
    }
    
    return paymentId;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw new Error('Failed to record payment.');
  }
};

/**
 * Process a Cash App payment for an order
 * @param orderId Order ID
 * @param amount Payment amount
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
    return await recordPayment(orderId, {
      amount,
      method: 'cash-app',
      date: new Date(),
      confirmationId,
      cashAppDetails: {
        confirmationId
      },
      notes
    });
  } catch (error) {
    console.error('Error processing Cash App payment:', error);
    throw new Error('Failed to process Cash App payment.');
  }
};

/**
 * Get payment history for an order
 * @param orderId Order ID
 * @returns Promise with payment transaction array
 */
export const getOrderPayments = async (orderId: string): Promise<PaymentTransaction[]> => {
  try {
    const order = await getOrder(orderId);
    return order.payments || [];
  } catch (error) {
    console.error('Error getting order payments:', error);
    throw new Error('Failed to retrieve payment history.');
  }
};

/**
 * Refund a payment
 * @param orderId Order ID
 * @param paymentId ID of the payment to refund
 * @param amount Amount to refund (defaults to full payment amount)
 * @param notes Refund notes
 * @returns Promise indicating success
 */
export const refundPayment = async (
  orderId: string,
  paymentId: string,
  amount?: number,
  notes?: string
): Promise<void> => {
  try {
    const order = await getOrder(orderId);
    
    // Find the payment
    const payment = order.payments?.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }
    
    // Determine refund amount (default to full payment)
    const refundAmount = amount || payment.amount;
    
    // Create a refund transaction
    const refundTransaction: PaymentTransaction = {
      id: `refund_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: -refundAmount, // Negative amount for refund
      method: payment.method,
      date: new Date(),
      confirmationId: payment.confirmationId,
      notes: notes || `Refund for payment ${paymentId}`
    };
    
    // Calculate new balance after refund
    const currentAmountPaid = order.amountPaid || 0;
    const newAmountPaid = Math.max(0, currentAmountPaid - refundAmount);
    const newBalanceDue = order.total - newAmountPaid;
    
    // Update payment status
    let newPaymentStatus: PaymentStatus = 'refunded';
    if (newAmountPaid > 0 && newBalanceDue > 0) {
      newPaymentStatus = 'partial';
    } else if (newAmountPaid === 0) {
      newPaymentStatus = 'unpaid';
    }
    
    // Add refund to the order and update balance info
    await updateDocument(COLLECTION_NAME, orderId, {
      payments: [...(order.payments || []), refundTransaction],
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue
    });
    
    // Update payment status
    await updatePaymentStatus(
      orderId, 
      newPaymentStatus, 
      `Refund of ${refundAmount.toFixed(2)} processed. New balance: ${newBalanceDue.toFixed(2)}`
    );
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund.');
  }
};
