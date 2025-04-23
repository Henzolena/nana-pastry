import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Calendar, Home } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/formatters';
import { CustomerInfo } from './CustomerInfoForm';
import { DeliveryInfo } from './DeliveryOptionsForm';
import { PaymentInfo } from './PaymentMethod';

interface OrderConfirmationProps {
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  orderId: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  customerInfo,
  deliveryInfo,
  paymentInfo,
  orderId,
}) => {
  const { state: cartState, clearCart } = useCart();

  // Format the pickup date or provide delivery info
  const getDeliveryOrPickupDate = (): string => {
    if (deliveryInfo.method === 'pickup' && deliveryInfo.pickupDate) {
      try {
        const date = new Date(deliveryInfo.pickupDate + 'T00:00:00');
        if (isNaN(date.getTime())) return 'Invalid Date Selected';
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return 'Invalid Date Format';
      }
    } else if (deliveryInfo.method === 'delivery') {
      // Placeholder for delivery date - could be calculated or fetched
      return 'Delivery arranged (Est. 2-3 business days)'; 
    }
    return 'Date not specified';
  };

  // Get pickup time slot
  const getPickupTime = (): string => {
    return deliveryInfo.method === 'pickup' ? (deliveryInfo.pickupTime || 'Time not selected') : 'N/A';
  };

  // Clear cart after successful order (this would be moved to after payment processing in a real implementation)
  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

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
              <h4 className="text-sm font-medium text-gray-500 mb-1">Order Number</h4>
              <p className="font-medium">{orderId}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h4>
              <p className="capitalize">{paymentInfo.method === 'credit-card' ? 'Credit Card' : 'Cash on Delivery'}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                {deliveryInfo.method === 'delivery' ? 'Estimated Delivery' : 'Pickup'} Date & Time
              </h4>
              <p>{getDeliveryOrPickupDate()}</p>
              {deliveryInfo.method === 'pickup' && <p>{getPickupTime()}</p>}
            </div>
            
            {deliveryInfo.method === 'delivery' && deliveryInfo.address && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Delivery Address</h4>
                <p>{deliveryInfo.address}</p>
                <p>{deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}</p>
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