import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Calendar, Home, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, parseDate } from '@/utils/formatters';
import { CustomerInfo } from './CustomerInfoForm';
import { DeliveryInfo } from './DeliveryOptionsForm';
import { PaymentInfo } from './PaymentMethod';
import { createNewOrder, OrderData} from '@/services/order';

// Remove Timestamp import as date fields are now strings
// import { Timestamp } from 'firebase/firestore';

interface OrderConfirmationProps {
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  orderId: string;
  items: any[];
  total: number;
}



const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  customerInfo,
  deliveryInfo,
  paymentInfo,
  orderId,
}) => {
  const { state: cartState, clearCart } = useCart();
  const { user } = useAuth();
  const [, setIsOrderSaved] = useState(false);
  const [orderSaveError, setOrderSaveError] = useState<string | null>(null);
  const [firestoreOrderId, setFirestoreOrderId] = useState<string | null>(null);


  // Use a ref to track if an order has ever been submitted in this session
  const hasSubmittedOrder = React.useRef(false);

  // Format the pickup date or provide delivery info (updated to handle string dates)
  const getDeliveryOrPickupDate = (): string => {
    // For pickup, check if we have a pickupDate
    if (deliveryInfo.method === 'pickup' && deliveryInfo.pickupDate) {
      try {
        // Parse the string date before formatting
        const date = new Date(deliveryInfo.pickupDate);
        return formatDate(date, { type: 'dayDate', fallback: 'Scheduled pickup (date to be confirmed)' });
      } catch (error) {
        console.error('Error formatting pickup date:', error);
        return 'Scheduled pickup (date to be confirmed)';
      }
    }
    // For delivery, check if we have a deliveryDate
    else if (deliveryInfo.method === 'delivery') {
      if (deliveryInfo.deliveryDate) {
        try {
          // Parse the string date before formatting
          const date = new Date(deliveryInfo.deliveryDate);
          return formatDate(date, { type: 'dayDate', fallback: 'Scheduled delivery (date to be confirmed)' });
        } catch (error) {
          console.error('Error formatting delivery date:', error);
          return 'Scheduled delivery (date to be confirmed)';
        }
      } else {
        // No delivery date specified
        return 'Delivery arranged (Est. 2-3 business days)';
      }
    }

    // Fallback
    return 'Date to be confirmed';
  };

  // Get pickup time slot
  const getPickupTime = (): string => {
    return deliveryInfo.method === 'pickup' ? (deliveryInfo.pickupTime || 'Time not selected') : 'N/A';
  };



  // Convert cart items to order items
  const orderItems = useMemo(() => {
    return cartState.items.map(item => ({
      cakeId: item.id || "",  // Provide default empty string
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.image,
      customizations: item.customizations || {}
    }));
  }, [cartState.items]);

  // Save the order to Firestore only once when component mounts
  useEffect(() => {
    // Skip if we've already submitted an order in this session
    if (hasSubmittedOrder.current || !cartState.items.length) {
      return;
    }

    // Immediately mark as submitted to prevent any possibility of duplicate submissions
    hasSubmittedOrder.current = true;

    // Define the async function
    const submitOrder = async () => {
      try {
        setOrderSaveError(null);

        // Create a stable idempotency key based ONLY on userId and orderId
        // This ensures it's the same key even across page refreshes
        const stableIdempotencyKey = `order_${user?.uid || 'guest'}_${orderId}`;

        // Create order data
        const orderData: OrderData = {
          userId: user?.uid || undefined,
          items: orderItems,
          subtotal: cartState.subtotal,
          tax: cartState.tax,
          total: cartState.total,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: paymentInfo.method || "",
          deliveryMethod: deliveryInfo.method || "pickup",
          customerInfo: {
            name: user?.displayName || `${customerInfo.firstName} ${customerInfo.lastName}` || "",
            email: user?.email || customerInfo.email || "",
            phone: customerInfo.phone || ""
          },
          isCustomOrder: cartState.items.some(item => item.customizations && Object.keys(item.customizations).length > 0),
          ...(deliveryInfo.method === 'delivery' && {
            deliveryInfo: {
              address: deliveryInfo.address || "",
              city: deliveryInfo.city || "",
              state: deliveryInfo.state || "",
              zipCode: deliveryInfo.zipCode || "",
              deliveryDate: (() => {
                try {
                  if (deliveryInfo.deliveryDate) {
                    // Format date as ISO string for backend
                    const date = new Date(deliveryInfo.deliveryDate);
                    return date.toISOString();
                  }
                  // Default to current date formatted as ISO string
                  return new Date().toISOString();
                } catch (err) {
                  console.error('Error formatting deliveryDate:', err);
                  // Optionally handle invalid date string
                  return new Date().toISOString(); // Fallback to current date
                }
              })(),
              deliveryTime: deliveryInfo.deliveryTime || "12:00 PM",
              deliveryFee: 10 // Default delivery fee
            }
          }),
          ...(deliveryInfo.method === 'pickup' && {
            pickupInfo: {
              storeLocation: "Main Store",
              pickupTime: deliveryInfo.pickupTime || "12:00 PM",
              pickupDate: (() => {
                try {
                  if (deliveryInfo.pickupDate) {
                    // Format date as ISO string for backend
                    const date = new Date(deliveryInfo.pickupDate);
                    return date.toISOString();
                  }
                  // Default to current date formatted as ISO string
                  return new Date().toISOString();
                } catch (err) {
                  console.error('Error formatting pickupDate:', err);
                  // Optionally handle invalid date string
                  return new Date().toISOString(); // Fallback to current date
                }
              })(),
            }
          }),
          // Use the stable idempotency key
          idempotencyKey: stableIdempotencyKey
        };

        console.log('Submitting order with idempotency key:', stableIdempotencyKey);
        const savedOrderId = await createNewOrder(orderData);
        console.log('Order saved successfully with ID:', savedOrderId);

        setFirestoreOrderId(savedOrderId);
        clearCart();
        setIsOrderSaved(true);
      } catch (err: any) {
        console.error('Error saving order:', err);
        setOrderSaveError(err.message || 'Failed to process your order. Please try again.');
        // We don't reset hasSubmittedOrder.current here because we still want to prevent duplicate submissions
      }
    };

    // Execute the order submission
    submitOrder();

    // No dependency array - this effect runs exactly once when the component mounts
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-3 text-2xl font-bold text-gray-900">Thank you for your order!</h2>
        <p className="mt-1 text-sm text-gray-500">
          We've received your order and will begin processing it right away.
        </p>
        {firestoreOrderId && (
          <p className="mt-2 font-medium">
            Your order reference: <span className="text-hotpink">{firestoreOrderId}</span>
          </p>
        )}

        {orderSaveError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-center text-left">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">{orderSaveError}</p>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden text-left mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-gray-500" />
            Order Details
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Order Reference</h4>
              <p className="font-medium">{firestoreOrderId || orderId}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h4>
              <p className="capitalize">
                {paymentInfo.method === 'credit-card'
                  ? 'Credit Card'
                  : paymentInfo.method === 'cash-app'
                    ? 'Cash App'
                    : 'Cash on Delivery'
                }
                {paymentInfo.method === 'cash-app' && paymentInfo.cashAppDetails?.confirmationId && (
                  <span className="block text-sm text-gray-500 mt-1">
                    Confirmation ID: {paymentInfo.cashAppDetails.confirmationId}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h4>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p>{formatCurrency(cartState.subtotal)}</p>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <p>Tax</p>
                <p>{formatCurrency(cartState.tax)}</p>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <p>{deliveryInfo.method === 'delivery' ? 'Delivery Fee' : 'Pickup Fee'}</p>
                <p>{formatCurrency(deliveryInfo.method === 'delivery' ? 15 : 0)}</p>
              </div>
              <div className="flex justify-between font-medium mt-4 pt-4 border-t border-gray-100">
                <p>Total</p>
                <p className="text-hotpink">{formatCurrency(cartState.subtotal + cartState.tax + (deliveryInfo.method === 'delivery' ? 15 : 0))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden text-left mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            {deliveryInfo.method === 'delivery' ? (
              <Home className="mr-2 h-5 w-5 text-gray-500" />
            ) : (
              <Calendar className="mr-2 h-5 w-5 text-gray-500" />
            )}
            {deliveryInfo.method === 'delivery' ? 'Delivery' : 'Pickup'} Information
          </h3>
        </div>

        <div className="p-6">
          <div className="p-6 border rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {deliveryInfo.method === 'delivery' ? 'Delivery' : 'Pickup'} Information
            </h3>
            {deliveryInfo.method === 'delivery' ? (
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {deliveryInfo.address}</p>
                <p><span className="font-medium">City:</span> {deliveryInfo.city}</p>
                <p><span className="font-medium">State:</span> {deliveryInfo.state}</p>
                <p><span className="font-medium">Zip Code:</span> {deliveryInfo.zipCode}</p>
                <p><span className="font-medium">Delivery Date:</span> {getDeliveryOrPickupDate()}</p>
                <p><span className="font-medium">Delivery Time:</span> {deliveryInfo.deliveryTime || '12:00 PM'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p><span className="font-medium">Pickup Date:</span> {getDeliveryOrPickupDate()}</p>
                <p><span className="font-medium">Pickup Time:</span> {getPickupTime()}</p>
                <p><span className="font-medium">Location:</span> Main Store</p>
              </div>
            )}
          </div>

          {deliveryInfo.deliveryInstructions && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Special Instructions</h4>
              <p className="text-sm">{deliveryInfo.deliveryInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Info if not logged in */}
      {!user && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-md text-left mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Create an account to track your orders</h3>
          <p className="text-sm text-blue-700 mb-3">
            Sign up now to easily track your orders, save your favorite cakes, and get personalized recommendations.
          </p>
          <Link
            to="/auth?redirect=/account?tab=orders"
            className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Create Account or Sign In <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <p className="text-sm text-gray-500 mb-4">
          A confirmation email has been sent to {customerInfo.email}.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-hotpink hover:bg-hotpink/90"
          >
            Return to Home
          </Link>

          {firestoreOrderId && (
            <Link
              to={`/orders/${firestoreOrderId}`}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              View Order Details
            </Link>
          )}

          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
