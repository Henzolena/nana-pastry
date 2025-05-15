import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin'; // Import admin namespace
import { firebaseAdmin } from '../firebase-admin.config';
import { EmailService } from '../email/email.service'; // Import EmailService
import { Timestamp } from 'firebase-admin/firestore'; // Use admin Timestamp
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

// Collection name
const COLLECTION_NAME = 'orders';

// Order status types (copy from frontend type)
export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'picked-up'
  | 'completed'
  | 'cancelled';

// Payment status types (copy from frontend type)
export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded';

// Order item interface (copy from frontend type)
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

// Payment transaction record (copy from frontend type)
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

// Status history record (copy from frontend type)
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date | Timestamp;
  note?: string;
  updatedBy?: string; // userId or "system"
}

// Payment status history record (copy from frontend type)
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
    deliveryDate?: Date | Timestamp | string; // Allow string from DTO
    deliveryTime: string;
    deliveryFee: number;
  };
  pickupInfo?: {
    pickupDate: Date | Timestamp | string; // Allow string from DTO
    pickupTime: string;
    storeLocation?: string;
  };
  specialInstructions?: string;
  isCustomOrder: boolean;
  customOrderDetails?: {
    consultationDate?: Date | Timestamp | string; // Allow string from DTO
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
  createdAt: Timestamp; // Add createdAt timestamp
}

// Full Order type that extends FirestoreDocument (FirestoreDocument is frontend specific, use OrderData + id for backend)
export interface Order extends OrderData {
    id: string;
}


@Injectable()
export class OrdersService {
  private firestore = firebaseAdmin.firestore();
  private readonly logger = new Logger(OrdersService.name);

  constructor(private emailService: EmailService) {} // Inject EmailService

  /**
   * Create a new order in the database
   * @param orderData Order data from the frontend
   * @param requestingUser The authenticated user creating the order
   * @returns Promise with order ID
   */
  async createNewOrder(orderData: CreateOrderDto, requestingUser?: { uid: string }): Promise<{ id: string }> {
    try {
      // Ensure the order is linked to the authenticated user if available
      const orderToSave: OrderData = {
          ...orderData,
          userId: requestingUser?.uid, // Link order to user if logged in
          status: 'pending', // Initial status
          paymentStatus: 'unpaid', // Initial payment status
          amountPaid: 0,
          balanceDue: orderData.total,
          statusHistory: [{ status: 'pending', timestamp: Timestamp.now(), note: 'Order created', updatedBy: requestingUser?.uid || 'system' }],
          paymentStatusHistory: [{ status: 'unpaid', timestamp: Timestamp.now(), note: 'Order created', updatedBy: requestingUser?.uid || 'system' }],
          payments: [],
          createdAt: Timestamp.now(),
          profileUpdated: requestingUser?.uid ? false : undefined, // Track if user profile needs update
          // Generate idempotency key if not provided (though frontend should ideally provide one)
          idempotencyKey: orderData.idempotencyKey || `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      } as OrderData; // Explicitly cast to OrderData

      // Convert date strings from DTO to Timestamps for Firestore
      if (orderToSave.deliveryInfo?.deliveryDate && typeof orderToSave.deliveryInfo.deliveryDate === 'string') {
          orderToSave.deliveryInfo.deliveryDate = Timestamp.fromDate(new Date(orderToSave.deliveryInfo.deliveryDate));
      }
      if (orderToSave.pickupInfo?.pickupDate && typeof orderToSave.pickupInfo.pickupDate === 'string') {
          orderToSave.pickupInfo.pickupDate = Timestamp.fromDate(new Date(orderToSave.pickupInfo.pickupDate));
      }
      if (orderToSave.customOrderDetails?.consultationDate && typeof orderToSave.customOrderDetails.consultationDate === 'string') {
          orderToSave.customOrderDetails.consultationDate = Timestamp.fromDate(new Date(orderToSave.customOrderDetails.consultationDate));
      }


      // Check for existing order with this idempotency key
      if (orderToSave.idempotencyKey) {
          const existingOrders = await this.firestore.collection(COLLECTION_NAME)
              .where('idempotencyKey', '==', orderToSave.idempotencyKey)
              .limit(1)
              .get();

          if (!existingOrders.empty) {
              const existingOrderId = existingOrders.docs[0].id;
              console.log(`Found existing order with idempotency key ${orderToSave.idempotencyKey}, returning ID: ${existingOrders[0].id}`);
              return { id: existingOrderId };
          }
      }


      // Make a clean copy for Firestore (no undefined values)
      const cleanOrderData = this.removeUndefinedValues(orderToSave);

      const docRef = await this.firestore.collection(COLLECTION_NAME).add(cleanOrderData);
      this.logger.log(`New order created with ID: ${docRef.id} for user ${orderToSave.customerInfo.email}`);

      // Send order confirmation email
      try {
        // Prepare details for the email
        const emailOrderDetails = {
          orderId: docRef.id,
          orderTotal: orderToSave.total,
          items: orderToSave.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryAddress: orderToSave.deliveryMethod === 'delivery' && orderToSave.deliveryInfo ? 
            `${orderToSave.deliveryInfo.address}, ${orderToSave.deliveryInfo.city}, ${orderToSave.deliveryInfo.state} ${orderToSave.deliveryInfo.zipCode}` : 
            undefined,
          deliveryDate: orderToSave.deliveryMethod === 'delivery' && orderToSave.deliveryInfo?.deliveryDate ? 
            (orderToSave.deliveryInfo.deliveryDate instanceof Timestamp ? orderToSave.deliveryInfo.deliveryDate.toDate().toLocaleDateString() : new Date(orderToSave.deliveryInfo.deliveryDate as string).toLocaleDateString()) :
            (orderToSave.deliveryMethod === 'pickup' && orderToSave.pickupInfo?.pickupDate ? 
              (orderToSave.pickupInfo.pickupDate instanceof Timestamp ? orderToSave.pickupInfo.pickupDate.toDate().toLocaleDateString() : new Date(orderToSave.pickupInfo.pickupDate as string).toLocaleDateString()) : 
              undefined),
        };
        
        await this.emailService.sendOrderConfirmationEmail(orderToSave.customerInfo.email, emailOrderDetails);
        this.logger.log(`Order confirmation email sent to ${orderToSave.customerInfo.email} for order ${docRef.id}`);
      } catch (emailError) {
        this.logger.error(`Failed to send order confirmation email to customer for order ${docRef.id}:`, emailError);
      }

      // Send new order notification to baker
      try {
        const bakerNotificationDetails = {
          orderId: docRef.id,
          customerName: orderToSave.customerInfo.name,
          customerEmail: orderToSave.customerInfo.email,
          orderTotal: orderToSave.total,
          items: orderToSave.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryMethod: orderToSave.deliveryMethod,
          deliveryAddress: orderToSave.deliveryMethod === 'delivery' && orderToSave.deliveryInfo ? 
            `${orderToSave.deliveryInfo.address}, ${orderToSave.deliveryInfo.city}, ${orderToSave.deliveryInfo.state} ${orderToSave.deliveryInfo.zipCode}` : 
            undefined,
          // Correctly source delivery/pickup date for baker notification
          deliveryDate: orderToSave.deliveryMethod === 'delivery' && orderToSave.deliveryInfo?.deliveryDate ? 
            (orderToSave.deliveryInfo.deliveryDate instanceof Timestamp ? orderToSave.deliveryInfo.deliveryDate.toDate().toLocaleDateString() : new Date(orderToSave.deliveryInfo.deliveryDate as string).toLocaleDateString()) :
            undefined,
          pickupDate: orderToSave.deliveryMethod === 'pickup' && orderToSave.pickupInfo?.pickupDate ?
            (orderToSave.pickupInfo.pickupDate instanceof Timestamp ? orderToSave.pickupInfo.pickupDate.toDate().toLocaleDateString() : new Date(orderToSave.pickupInfo.pickupDate as string).toLocaleDateString()) :
            undefined,
          pickupTime: orderToSave.deliveryMethod === 'pickup' ? orderToSave.pickupInfo?.pickupTime : undefined,
          specialInstructions: orderToSave.specialInstructions
        };
        await this.emailService.sendNewOrderNotificationToBaker(bakerNotificationDetails);
        this.logger.log(`New order notification sent to baker for order ${docRef.id}`);
      } catch (bakerEmailError) {
        this.logger.error(`Failed to send new order notification to baker for order ${docRef.id}:`, bakerEmailError);
      }
      
      return { id: docRef.id };
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw new BadRequestException('Failed to create order.');
    }
  }

  /**
   * Get order details by ID
   * @param orderId Order ID
   * @param requestingUser The authenticated user requesting the order
   * @returns Promise with order details
   */
  async getOrder(orderId: string, requestingUser: { uid: string, role?: string }): Promise<Order> {
    try {
      const orderDoc = await this.firestore.collection(COLLECTION_NAME).doc(orderId).get();

      if (!orderDoc.exists) {
        throw new NotFoundException(`Order with ID "${orderId}" not found.`);
      }

      const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;

      // Authorization check: Only order owner, baker, or admin can view the order
      // Assuming orderData includes a 'userId' field for the customer
      // Assuming requestingUser includes 'role' (e.g., from token or user doc)
      // TODO: Implement logic to check if the requesting user is the assigned baker for this order
      const isOrderOwner = orderData.userId && orderData.userId === requestingUser.uid;
      const isBaker = requestingUser.role === 'baker'; // Basic check, needs refinement for assigned baker
      const isAdmin = requestingUser.role === 'admin';

      if (!isOrderOwner && !isBaker && !isAdmin) {
          throw new UnauthorizedException('You are not authorized to view this order.');
      }

      return orderData;
    } catch (error) {
      console.error('Error getting order:', error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
          throw error;
      }
      throw new BadRequestException('Failed to retrieve order details.');
    }
  }

  /**
   * Update order status
   * @param orderId Order ID
   * @param updateStatusDto DTO containing new status and optional note
   * @param requestingUser The authenticated user making the change
   * @returns Promise indicating success
   */
  async updateOrderStatus(
    orderId: string,
    updateStatusDto: UpdateOrderStatusDto,
    requestingUser: { uid: string, role?: string }
  ): Promise<void> {
    try {
      const orderDocRef = this.firestore.collection(COLLECTION_NAME).doc(orderId);
      const orderDoc = await orderDocRef.get();

      if (!orderDoc.exists) {
        throw new NotFoundException(`Order with ID "${orderId}" not found.`);
      }

      const orderData = orderDoc.data() as OrderData;

      // Authorization check: Only baker or admin can update order status
      const isBaker = requestingUser.role === 'baker';
      const isAdmin = requestingUser.role === 'admin';

      if (!isBaker && !isAdmin) {
        throw new UnauthorizedException('You are not authorized to update order status.');
      }

      // Prevent updating status if order is already completed or cancelled
      if (orderData.status === 'completed' || orderData.status === 'cancelled') {
          throw new BadRequestException(`Cannot update status for an order that is already ${orderData.status}.`);
      }

      // Create status history entry
      const statusEntry: StatusHistoryEntry = {
        status: updateStatusDto.status,
        timestamp: Timestamp.now(),
        note: updateStatusDto.note || `Status changed to ${updateStatusDto.status}`,
        updatedBy: requestingUser.uid
      };

      // Update the order with new status and append to history
      await orderDocRef.update({
        status: updateStatusDto.status,
        statusHistory: admin.firestore.FieldValue.arrayUnion(statusEntry) // Use arrayUnion to append
      });

      console.log(`Order ${orderId} status updated to ${updateStatusDto.status}.`);

    } catch (error) {
      console.error('Error updating order status:', error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update order status.');
    }
  }

  /**
   * Update payment status
   * @param orderId Order ID
   * @param paymentStatus New payment status
   * @param note Optional note about the payment status change
   * @param updatedBy User ID or "system" that made the change
   * @returns Promise indicating success
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    note?: string,
    updatedBy: string = "system" // Default to system if not provided
  ): Promise<void> {
    try {
      const orderDocRef = this.firestore.collection(COLLECTION_NAME).doc(orderId);
      const orderDoc = await orderDocRef.get();

      if (!orderDoc.exists) {
        throw new NotFoundException(`Order with ID "${orderId}" not found.`);
      }

      const orderData = orderDoc.data() as OrderData;

      // Authorization check: Only baker or admin can update payment status
      // This function is also called internally by recordPayment, so we need to allow 'system' updates
      const isBaker = updatedBy !== 'system' && (await this.getUserRole(updatedBy)) === 'baker'; // Assuming a helper to get user role
      const isAdmin = updatedBy !== 'system' && (await this.getUserRole(updatedBy)) === 'admin';
      const isSystem = updatedBy === 'system';

      if (!isBaker && !isAdmin && !isSystem) {
           // If updatedBy is a user ID but not baker/admin, unauthorized
           if (updatedBy !== 'system') {
               throw new UnauthorizedException('You are not authorized to update payment status.');
           }
           // If updatedBy is system, it's allowed
      }


      // Create payment status history entry
      const paymentStatusEntry: PaymentStatusHistoryEntry = {
        status: paymentStatus,
        timestamp: Timestamp.now(),
        note: note || `Payment status changed to ${paymentStatus}`,
        updatedBy
      };

      // Update the order with new payment status and append to history
      await orderDocRef.update({
        paymentStatus: paymentStatus,
        paymentStatusHistory: admin.firestore.FieldValue.arrayUnion(paymentStatusEntry) // Use arrayUnion to append
      });

      console.log(`Order ${orderId} payment status updated to ${paymentStatus}.`);

    } catch (error) {
      console.error('Error updating payment status:', error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to update payment status.');
    }
  }

  /**
   * Get all orders for a user
   * @param userId User ID
   * @param requestingUser The authenticated user requesting the history
   * @returns Promise with array of orders
   */
  async getUserOrderHistory(userId: string, requestingUser: { uid: string, role?: string }): Promise<Order[]> {
    try {
      // Authorization check: User can only view their own order history unless they are admin
      const isAdmin = requestingUser.role === 'admin';
      if (requestingUser.uid !== userId && !isAdmin) {
          throw new UnauthorizedException('You can only view your own order history.');
      }

      // Use Admin SDK to query Firestore
      const ordersSnapshot = await this.firestore.collection(COLLECTION_NAME)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc') // Requires Firestore index
        .get();

      const orders: Order[] = [];
      ordersSnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      return orders;
    } catch (error) {
      console.error('Error getting user order history:', error);
      if (error instanceof UnauthorizedException) {
          throw error;
      }
      // Handle potential Firestore index errors gracefully if needed, similar to frontend
      throw new BadRequestException('Failed to retrieve order history.');
    }
  }

  /**
   * Record a payment for an order
   * @param orderId Order ID
   * @param paymentData Payment transaction data from the frontend
   * @param requestingUser The authenticated user recording the payment
   * @returns Promise with payment ID
   */
  async recordPayment(
    orderId: string,
    paymentData: RecordPaymentDto,
    requestingUser: { uid: string, role?: string }
  ): Promise<{ paymentId: string }> {
    try {
      const orderDocRef = this.firestore.collection(COLLECTION_NAME).doc(orderId);
      const orderDoc = await orderDocRef.get();

      if (!orderDoc.exists) {
        throw new NotFoundException(`Order with ID "${orderId}" not found.`);
      }

      const orderData = orderDoc.data() as OrderData;

      // Authorization check: Only order owner or admin can record a payment
      // TODO: Refine authorization - maybe only allow recording payment if order status is pending/approved?
      const isOrderOwner = orderData.userId && orderData.userId === requestingUser.uid;
      const isAdmin = requestingUser.role === 'admin';

      if (!isOrderOwner && !isAdmin) {
          throw new UnauthorizedException('You are not authorized to record a payment for this order.');
      }

      // Create a unique payment ID
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Create the payment transaction record
      const paymentTransaction: PaymentTransaction = {
        ...paymentData,
        id: paymentId,
        // Ensure date is a Timestamp object
        date: paymentData.date ? Timestamp.fromDate(new Date(paymentData.date)) : Timestamp.now(),
        // Convert lastUpdated in cashAppDetails if it exists
        cashAppDetails: paymentData.cashAppDetails ? {
            ...paymentData.cashAppDetails,
            lastUpdated: paymentData.cashAppDetails.lastUpdated ? Timestamp.fromDate(new Date(paymentData.cashAppDetails.lastUpdated)) : undefined
        } : undefined
      };

      // Calculate new balance due and amount paid
      const currentAmountPaid = orderData.amountPaid || 0;
      const newAmountPaid = currentAmountPaid + paymentData.amount;
      const newBalanceDue = Math.max(0, orderData.total - newAmountPaid);

      // Determine new payment status based on recorded payment, but DO NOT automatically set to 'partial' or 'paid'.
      // Payment status should be manually updated by the baker after verification.
      let newPaymentStatus: PaymentStatus = orderData.paymentStatus;

      // If the status was 'unpaid', set it to 'pending' after a payment is recorded by the customer.
      // Otherwise, keep the current status.
      if (orderData.paymentStatus === 'unpaid' && newAmountPaid > 0) {
        newPaymentStatus = 'pending';
      }

      // Add payment to the order and update balance info
      await orderDocRef.update({
        payments: admin.firestore.FieldValue.arrayUnion(paymentTransaction), // Use arrayUnion to append
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue
      });

      // Update payment status if it changed (only to 'pending' from 'unpaid')
      if (newPaymentStatus !== orderData.paymentStatus) {
        // Call the internal updatePaymentStatus method, updatedBy is the requesting user
        await this.updatePaymentStatus(
          orderId,
          newPaymentStatus,
          `Payment of ${paymentData.amount.toFixed(2)} recorded by customer. Awaiting baker verification. New balance: ${newBalanceDue.toFixed(2)}`,
          requestingUser.uid // Use requesting user's UID as updatedBy
        );
      }

      console.log(`Payment recorded for order ${orderId}. Payment ID: ${paymentId}`);
      return { paymentId };
    } catch (error) {
      console.error('Error recording payment:', error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to record payment.');
    }
  }

  /**
   * Process a Cash App payment for an order (calls recordPayment internally)
   * @param orderId Order ID
   * @param amount Payment amount (if 0, will use the order's total or balance due)
   * @param confirmationId Cash App confirmation ID
   * @param notes Optional payment notes
   * @param requestingUser The authenticated user processing the payment
   * @returns Promise with payment ID
   */
  async processCashAppPayment(
    orderId: string,
    amount: number,
    confirmationId: string,
    notes?: string,
    requestingUser?: { uid: string, role?: string } // Requesting user is optional here if called internally
  ): Promise<{ paymentId: string }> {
    try {
      // If amount is 0, fetch the order to determine the amount
      let paymentAmount = amount;
      if (paymentAmount === 0) {
        const order = await this.getOrder(orderId, requestingUser || { uid: 'system' }); // Use getOrder with requestingUser for auth check
        paymentAmount = order.balanceDue || order.total;

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
                    lastUpdated: Timestamp.now() // Update timestamp
                  },
                  notes: notes || payment.notes
                };
              }
              return payment;
            });

            // Update the order document with the modified payments array
            // Do NOT automatically update paymentStatus here.
            await this.firestore.collection(COLLECTION_NAME).doc(orderId).update({
              payments: updatedPayments
            });

            // Note: Payment status is NOT automatically updated to 'partial' or 'paid' here.
            // It should be manually updated by the baker after verification.
            // If the status was 'unpaid', the initial recordPayment call would have set it to 'pending'.

            return { paymentId: existingPayment.id };
          }
        }
      }

      // If no existing payment found, record a new one.
      // The recordPayment function now handles setting status to 'pending' from 'unpaid'.
      return await this.recordPayment(orderId, {
        amount: paymentAmount,
        method: 'cash-app',
        date: new Date().toISOString(), // Pass date as string to recordPayment DTO
        confirmationId,
        cashAppDetails: {
          confirmationId,
          lastUpdated: new Date().toISOString() // Pass date as string
        },
        notes
      }, requestingUser || { uid: 'system' }); // Pass requestingUser or system UID
    } catch (error) {
      console.error('Error processing Cash App payment:', error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to process Cash App payment.');
    }
  }

  // Helper function to get user role (needed for updatePaymentStatus authorization check)
  // This is a simplified version; a proper implementation might involve injecting UsersService
  private async getUserRole(userId: string): Promise<string | undefined> {
      try {
          const userDoc = await this.firestore.collection('users').doc(userId).get();
          return userDoc.data()?.role as string | undefined;
      } catch (error) {
          console.error('Error fetching user role in OrdersService:', error);
          return undefined;
      }
  }

  /**
   * Helper function to remove undefined values from an object (Firestore doesn't allow undefined)
   * @param obj Object to clean
   * @returns Cleaned object with no undefined values
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === undefined) return null;
    if (obj === null) return null;

    // Handle Date and Timestamp objects
    if (obj instanceof Date) return Timestamp.fromDate(obj); // Convert Date to Timestamp for Firestore
    if (obj && typeof obj === 'object' && obj.toDate && typeof obj.toDate === 'function') return obj; // Keep existing Timestamps

    // Handle other non-object types
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item)).filter(item => item !== undefined);
    }

    const cleanedObj: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      const cleanedValue = this.removeUndefinedValues(value);
      if (cleanedValue !== undefined) {
        cleanedObj[key] = cleanedValue;
      }
    });

    return cleanedObj;
  }

  async cancelOrder(orderId: string, reason: string, requestingUser: { uid: string, role?: string }): Promise<void> {
    const orderDocRef = this.firestore.collection(COLLECTION_NAME).doc(orderId);
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    const orderData = orderDoc.data() as OrderData;

    // Authorization: User can cancel their own order if pending/approved, Admin can cancel any order if not completed/delivered
    const isOrderOwner = orderData.userId === requestingUser.uid;
    const isAdmin = requestingUser.role === 'admin';
    const cancellableStatuses: OrderStatus[] = ['pending', 'approved'];

    if (!isAdmin && !isOrderOwner) {
      throw new UnauthorizedException('You are not authorized to cancel this order.');
    }

    if (!isAdmin && isOrderOwner && !cancellableStatuses.includes(orderData.status)) {
      throw new BadRequestException(`Order cannot be cancelled by user when status is "${orderData.status}".`);
    }
    
    // Admins might have broader cancellation rights, but not for already delivered/completed orders
    if (isAdmin && (orderData.status === 'delivered' || orderData.status === 'picked-up' || orderData.status === 'completed')) {
        throw new BadRequestException(`Admin cannot cancel an order that is already ${orderData.status}.`);
    }


    if (orderData.status === 'cancelled') {
      throw new BadRequestException('Order is already cancelled.');
    }

    const statusEntry: StatusHistoryEntry = {
      status: 'cancelled',
      timestamp: Timestamp.now(),
      note: `Order cancelled by ${requestingUser.role === 'admin' ? 'admin' : 'user'}. Reason: ${reason}`,
      updatedBy: requestingUser.uid,
    };

    await orderDocRef.update({
      status: 'cancelled',
      statusHistory: admin.firestore.FieldValue.arrayUnion(statusEntry),
    });

    // TODO: Handle refunds or other side effects of cancellation if applicable
    console.log(`Order ${orderId} cancelled by ${requestingUser.uid}. Reason: ${reason}`);
  }

  async getAllOrdersForAdmin(status?: OrderStatus, requestingUser?: { uid: string, role?: string }): Promise<Order[]> {
    // Controller should already verify admin role, but double-check here if necessary
    if (requestingUser?.role !== 'admin') {
        throw new UnauthorizedException('Only administrators can view all orders.');
    }

    let query: admin.firestore.Query = this.firestore.collection(COLLECTION_NAME);

    if (status) {
      query = query.where('status', '==', status);
    }

    // Add ordering, e.g., by creation date descending
    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    const orders: Order[] = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
  }
}
