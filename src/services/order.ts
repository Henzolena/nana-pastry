import { getDocumentById, addDocument, updateDocument, getDocuments, FirestoreDocument } from '../lib/firestore';
import { where, Timestamp, orderBy } from 'firebase/firestore';
import type { CartItem } from '../types/cart';
import { updateOrderStats } from './userService';

// Collection name
const COLLECTION_NAME = 'orders';

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
  date: Date | Timestamp;
  confirmationId?: string;
  cashAppDetails?: {
    confirmationId?: string;
    lastUpdated?: Date | Timestamp;
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
  timestamp: Date | Timestamp;
  note?: string;
  updatedBy?: string; // userId or "system"
}

// Payment status history record
export interface PaymentStatusHistoryEntry {
  status: PaymentStatus;
  timestamp: Date | Timestamp;
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
    deliveryDate?: Date | Timestamp;
    deliveryTime: string;
    deliveryFee: number;
  };
  pickupInfo?: {
    pickupDate: Date | Timestamp;
    pickupTime: string;
    storeLocation?: string;
  };
  specialInstructions?: string;
  isCustomOrder: boolean;
  customOrderDetails?: {
    consultationDate?: Date | Timestamp;
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
  profileUpdated?: boolean;
  // Idempotency key for preventing duplicate orders
  idempotencyKey?: string;
}

// Full Order type that extends FirestoreDocument
export type Order = OrderData & FirestoreDocument;

/**
 * Create a new order in the database
 * @param orderData Order data without ID
 * @returns Promise with order ID
 */
export const createNewOrder = async (orderData: OrderData): Promise<string> => {
  try {
    // Enforce idempotency key
    if (!orderData.idempotencyKey) {
      // Fallback idempotency key if none provided
      orderData.idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      console.log(`No idempotency key provided, generated: ${orderData.idempotencyKey}`);
    }

    // Try to find existing order with this idempotency key (most likely a duplicate submission)
    try {
      // First try to find with both idempotency key AND user ID
      let existingOrders: Order[] = [];
      
      if (orderData.userId) {
        existingOrders = await getDocuments<Order>(
          COLLECTION_NAME,
          where('idempotencyKey', '==', orderData.idempotencyKey),
          where('userId', '==', orderData.userId)
        );
      }
      
      // If no match with user ID or no user ID provided, try with just the idempotency key
      if (existingOrders.length === 0) {
        existingOrders = await getDocuments<Order>(
          COLLECTION_NAME,
          where('idempotencyKey', '==', orderData.idempotencyKey)
        );
      }
      
      // If we found a matching order, return its ID instead of creating a duplicate
      if (existingOrders.length > 0) {
        console.log(`Found existing order with idempotency key ${orderData.idempotencyKey}, returning ID: ${existingOrders[0].id}`);
        return existingOrders[0].id;
      }
    } catch (err) {
      // If the lookup fails, log but continue with order creation
      console.warn('Error checking for existing order:', err);
    }
    
    // Make a clean copy for Firestore (no undefined values)
    const cleanOrderData = removeUndefinedValues(orderData);
    
    // Add profileUpdated field if user is logged in
    if (cleanOrderData.userId) {
      cleanOrderData.profileUpdated = false;
    }
    
    // Initialize payment tracking fields
    cleanOrderData.amountPaid = 0;
    cleanOrderData.balanceDue = cleanOrderData.total;
    
    // Initialize status history
    const initialStatusEntry: StatusHistoryEntry = {
      status: cleanOrderData.status,
      timestamp: new Date(),
      note: 'Order created',
      updatedBy: 'system'
    };
    cleanOrderData.statusHistory = [initialStatusEntry];
    
    // Initialize payment status history
    const initialPaymentStatusEntry: PaymentStatusHistoryEntry = {
      status: cleanOrderData.paymentStatus,
      timestamp: new Date(),
      note: 'Order created',
      updatedBy: 'system'
    };
    cleanOrderData.paymentStatusHistory = [initialPaymentStatusEntry];
    
    // Initialize empty payments array
    cleanOrderData.payments = [];
    
    // Add creation timestamp
    cleanOrderData.createdAt = new Date();
    
    // Create new order
    const orderId = await addDocument(COLLECTION_NAME, cleanOrderData);
    
    // If user is logged in, update their profile stats
    if (cleanOrderData.userId) {
      try {
        await updateOrderStats(cleanOrderData.userId, cleanOrderData.total);
        
        // Mark order as having updated the user profile
        await updateDocument(COLLECTION_NAME, orderId, { 
          profileUpdated: true 
        });
      } catch (err) {
        console.error('Error updating user profile with order stats:', err);
        // We don't throw here to avoid failing the order creation
        // The profileUpdated flag will remain false, allowing for retry later
      }
    }
    
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order. Please try again.');
  }
};

/**
 * Helper function to remove undefined values from an object (Firestore doesn't allow undefined)
 * @param obj Object to clean
 * @returns Cleaned object with no undefined values
 */
function removeUndefinedValues(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  
  // Handle Date and Timestamp objects
  if (obj instanceof Date) return obj;
  if (obj && typeof obj === 'object' && obj.toDate && typeof obj.toDate === 'function') return obj;
  
  // Handle other non-object types
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(item => item !== undefined);
  }
  
  const cleanedObj: any = {};
  Object.entries(obj).forEach(([key, value]) => {
    const cleanedValue = removeUndefinedValues(value);
    if (cleanedValue !== undefined) {
      cleanedObj[key] = cleanedValue;
    }
  });
  
  return cleanedObj;
}

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
 * Get order details by ID
 * @param orderId Order ID
 * @returns Promise with order details
 */
export const getOrder = async (orderId: string): Promise<Order> => {
  try {
    const order = await getDocumentById<Order>(COLLECTION_NAME, orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    return order;
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to retrieve order details.');
  }
};

/**
 * Update order status
 * @param orderId Order ID
 * @param status New order status
 * @param note Optional note about the status change
 * @param updatedBy User ID or "system" that made the change
 * @returns Promise indicating success
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus,
  note?: string,
  updatedBy: string = "system"
): Promise<void> => {
  try {
    // Get current order to validate the status transition
    const order = await getOrder(orderId);
    
    // Create status history entry
    const statusEntry: StatusHistoryEntry = {
      status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`,
      updatedBy
    };
    
    // Update the order with new status and append to history
    await updateDocument(COLLECTION_NAME, orderId, { 
      status,
      // Add this status update to the statusHistory array
      statusHistory: order.statusHistory 
        ? [...(order.statusHistory || []), statusEntry] 
        : [statusEntry]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status.');
  }
};

/**
 * Update payment status
 * @param orderId Order ID
 * @param paymentStatus New payment status
 * @param note Optional note about the payment status change
 * @param updatedBy User ID or "system" that made the change
 * @returns Promise indicating success
 */
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: PaymentStatus,
  note?: string,
  updatedBy: string = "system"
): Promise<void> => {
  try {
    // Get current order
    const order = await getOrder(orderId);
    
    // Create payment status history entry
    const paymentStatusEntry: PaymentStatusHistoryEntry = {
      status: paymentStatus,
      timestamp: new Date(),
      note: note || `Payment status changed to ${paymentStatus}`,
      updatedBy
    };
    
    // Update the order with new payment status and append to history
    await updateDocument(COLLECTION_NAME, orderId, { 
      paymentStatus,
      // Add this payment status update to the paymentStatusHistory array
      paymentStatusHistory: order.paymentStatusHistory 
        ? [...(order.paymentStatusHistory || []), paymentStatusEntry] 
        : [paymentStatusEntry]
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status.');
  }
};

/**
 * Get all orders for a user
 * @param userId User ID
 * @returns Promise with array of orders
 */
export const getUserOrderHistory = async (userId: string): Promise<Order[]> => {
  try {
    try {
      // First attempt: with ordering (requires index)
      return await getDocuments<Order>(
        COLLECTION_NAME, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } catch (indexError: any) {
      // Check if it's an index error
      if (indexError?.message?.includes('index') || indexError?.code === 'failed-precondition') {
        console.warn('Firestore index not found, falling back to unordered query', indexError);
        
        // Fallback: Get documents without ordering
        const unorderedResults = await getDocuments<Order>(
          COLLECTION_NAME,
          where('userId', '==', userId)
        );
        
        // Deduplicate orders based on ID to prevent any duplicates
        const uniqueOrders = Array.from(
          new Map(unorderedResults.map(order => [order.id, order])).values()
        );
        
        // Sort results in memory
        return uniqueOrders.sort((a, b) => {
          // Try to convert timestamps to comparable dates
          try {
            // Handle different types of timestamp/date objects
            const getTimeValue = (timestamp: any): number => {
              if (!timestamp) return 0;
              
              if (timestamp instanceof Date) {
                return timestamp.getTime();
              } else if (typeof timestamp === 'object' && timestamp.toDate) {
                // Firebase Timestamp
                return timestamp.toDate().getTime();
              } else if (typeof timestamp === 'number') {
                return timestamp;
              } else if (typeof timestamp === 'string') {
                return new Date(timestamp).getTime();
              }
              return 0;
            };
            
            const timeA = getTimeValue(a.createdAt);
            const timeB = getTimeValue(b.createdAt);
            
            // Sort descending (newest first)
            return timeB - timeA;
          } catch (err) {
            return 0; // If dates can't be compared, don't change order
          }
        });
      }
      
      // If it's not an index error, re-throw
      throw indexError;
    }
  } catch (error) {
    console.error('Error getting user order history:', error);
    throw new Error('Failed to retrieve order history.');
  }
};

/**
 * Link an anonymous order to a user account (for when a user logs in after placing an order)
 * @param orderId Order ID
 * @param userId User ID
 * @returns Promise indicating success
 */
export const linkOrderToUser = async (orderId: string, userId: string): Promise<void> => {
  try {
    const order = await getOrder(orderId);
    
    // If order already has a userId, check if it's the same
    if (order.userId && order.userId !== userId) {
      throw new Error('Order already belongs to a different user');
    }
    
    // Update the order with the user ID
    await updateDocument(COLLECTION_NAME, orderId, { 
      userId,
      profileUpdated: false  // Set to false so we update the user profile
    });
    
    // Update user profile stats
    await updateOrderStats(userId, order.total);
    
    // Mark order as having updated the user profile
    await updateDocument(COLLECTION_NAME, orderId, { 
      profileUpdated: true 
    });
    
  } catch (error) {
    console.error('Error linking order to user:', error);
    throw new Error('Failed to link order to user account.');
  }
};

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
 * Record a payment for an order
 * @param orderId Order ID
 * @param paymentData Payment transaction data
 * @returns Promise indicating success
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
    // Do NOT automatically set to 'partial' or 'paid'.
    // Payment status should be manually updated by the baker after verification.
    let newPaymentStatus: PaymentStatus = order.paymentStatus;
    
    // If the status was 'unpaid', set it to 'pending' after a payment is recorded.
    // Otherwise, keep the current status.
    if (order.paymentStatus === 'unpaid' && newAmountPaid > 0) {
      newPaymentStatus = 'pending';
    }
    
    // Add payment to the order and update balance info
    await updateDocument(COLLECTION_NAME, orderId, {
      payments: order.payments 
        ? [...(order.payments || []), paymentTransaction] 
        : [paymentTransaction],
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue
    });
    
    // Update payment status if it changed (only to 'pending' from 'unpaid')
    if (newPaymentStatus !== order.paymentStatus) {
      await updatePaymentStatus(
        orderId, 
        newPaymentStatus, 
        `Payment of ${paymentData.amount.toFixed(2)} recorded by customer. Awaiting baker verification. New balance: ${newBalanceDue.toFixed(2)}`
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
    // If amount is 0, fetch the order to determine the amount
    if (amount === 0) {
      const order = await getOrder(orderId);
      amount = order.balanceDue || order.total;
      
      // If order already has a payment with this confirmation ID, just update it
      if (order.payments?.some(p => 
        p.method === 'cash-app' && 
        p.cashAppDetails?.confirmationId?.toLowerCase() === confirmationId.toLowerCase()
      )) {
        // Find existing payment record
        const existingPayment = order.payments.find(p => 
          p.method === 'cash-app' && 
          p.cashAppDetails?.confirmationId?.toLowerCase() === confirmationId.toLowerCase()
        );
        
        if (existingPayment) {
          // Update the payment in the array
          const updatedPayments = order.payments.map(payment => {
            if (payment.id === existingPayment.id) {
              return {
                ...payment,
                cashAppDetails: {
                  ...payment.cashAppDetails,
                  confirmationId,
                  lastUpdated: new Date()
                },
                notes: notes || payment.notes
              };
            }
            return payment;
          });
          
          // Update the order document with the modified payments array
          // Do NOT automatically update paymentStatus here.
          await updateDocument(COLLECTION_NAME, orderId, {
            payments: updatedPayments
          });
          
          // Note: Payment status is NOT automatically updated to 'partial' or 'paid' here.
          // It should be manually updated by the baker after verification.
          // If the status was 'unpaid', the initial recordPayment call would have set it to 'pending'.
          
          return existingPayment.id;
        }
      }
    }
    
    // If no existing payment found, record a new one.
    // The recordPayment function now handles setting status to 'pending' from 'unpaid'.
    return await recordPayment(orderId, {
      amount,
      method: 'cash-app',
      date: new Date(),
      confirmationId,
      cashAppDetails: {
        confirmationId,
        lastUpdated: new Date()
      },
      notes
    });
  } catch (error) {
    console.error('Error processing Cash App payment:', error);
    throw new Error('Failed to process Cash App payment.');
  }
};
