import React from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import { CustomerInfo } from './CustomerInfoForm';
import { DeliveryInfo } from './DeliveryOptionsForm';

interface OrderReviewProps {
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  items: any[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  onSubmit: () => void;
  onBack: () => void;
}

const OrderReview: React.FC<OrderReviewProps> = ({ customerInfo, deliveryInfo, onSubmit }) => {
  const { state: cartState } = useCart();
  const { items, subtotal, tax } = cartState;
  
  // Calculate delivery fee based on delivery method
  const deliveryFee = deliveryInfo.method === 'delivery' ? 15 : 0; // Example delivery fee value
  
  // Calculate total
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Simplified since we're now using the shared formatDate utility

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-medium mb-6">Review Your Order</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Order Items */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="flex py-6 px-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                
                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h4>{item.name}</h4>
                      <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.size.label} ({item.size.servings} servings)</p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <p className="text-gray-500">Qty {item.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="border-t border-gray-200 px-6 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Subtotal</p>
              <p className="text-gray-900">{formatCurrency(subtotal)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Tax</p>
              <p className="text-gray-900">{formatCurrency(tax)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">
                {deliveryInfo.method === 'delivery' ? 'Delivery Fee' : 'Pickup Fee'}
              </p>
              <p className="text-gray-900">{formatCurrency(deliveryFee)}</p>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200 mt-2">
              <p className="text-gray-900">Total</p>
              <p className="text-hotpink">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>
        
        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                <p>{customerInfo.firstName} {customerInfo.lastName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Contact</h4>
                <p>{customerInfo.email}</p>
                <p>{customerInfo.phone}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delivery Information */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {deliveryInfo.method === 'pickup' ? 'Pickup' : 'Delivery'} Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Method</h4>
                <p className="capitalize">{deliveryInfo.method}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                <p>{formatDate(deliveryInfo.pickupDate, { type: 'dayDate', fallback: 'Date not selected' })}</p>
                <p>{deliveryInfo.pickupTime}</p>
              </div>
            </div>
            
            {deliveryInfo.method === 'delivery' && deliveryInfo.address && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Delivery Address</h4>
                <p>{deliveryInfo.address}</p>
                <p>
                  {deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}
                </p>
              </div>
            )}
            
            {deliveryInfo.deliveryInstructions && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Special Instructions</h4>
                <p className="text-sm text-gray-700">{deliveryInfo.deliveryInstructions}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-hotpink text-white rounded-md font-medium hover:bg-hotpink/90 transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderReview; 