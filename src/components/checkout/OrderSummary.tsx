import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  className?: string;
}

export default function OrderSummary({
  items,
  subtotal,
  tax,
  shippingCost,
  discount,
  total,
  className
}: OrderSummaryProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <div className={`bg-blush/5 rounded-lg p-6 ${className}`}>
        <h2 className="text-lg font-medium text-deepbrown mb-4">Order Summary</h2>
        <div className="flex flex-col items-center justify-center py-8">
          <ShoppingBag className="h-12 w-12 text-deepbrown/30 mb-3" />
          <p className="text-deepbrown/70 text-center">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-blush/20 p-6 rounded-lg", className)}>
      <h2 className="text-xl font-semibold text-deepbrown mb-4">Order Summary</h2>
      
      <div className="mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex py-4 border-b border-warmgray-200">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md relative">
              <img
                src={item.image}
                alt={item.name}
                className="object-cover object-center w-full h-full"
              />
            </div>
            <div className="ml-4 flex flex-1 flex-col">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-base font-medium text-deepbrown">{item.name}</h3>
                  {item.options && (
                    <p className="mt-1 text-sm text-warmgray-500">{item.options}</p>
                  )}
                </div>
                <p className="text-base font-medium text-deepbrown">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-1 items-end justify-between text-sm">
                <p className="text-warmgray-500">Qty {item.quantity}</p>
                <p className="text-base font-medium text-deepbrown">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-base">
          <p className="text-warmgray-600">Subtotal</p>
          <p className="font-medium text-deepbrown">${subtotal.toFixed(2)}</p>
        </div>
        
        <div className="flex justify-between text-base">
          <p className="text-warmgray-600">Shipping</p>
          <p className="font-medium text-deepbrown">${shippingCost.toFixed(2)}</p>
        </div>
        
        <div className="flex justify-between text-base">
          <p className="text-warmgray-600">Tax</p>
          <p className="font-medium text-deepbrown">${tax.toFixed(2)}</p>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-base text-rosepink">
            <p>Discount</p>
            <p>-${discount.toFixed(2)}</p>
          </div>
        )}
        
        <div className="border-t border-warmgray-200 pt-3 flex justify-between text-lg font-semibold">
          <p className="text-deepbrown">Total</p>
          <p className="text-deepbrown">${total.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Optional promo code section */}
      <div className="mt-6 pt-4 border-t border-warmgray-200">
        <div className="flex items-center justify-between">
          <label htmlFor="promo-code" className="block text-sm font-medium text-deepbrown">
            Have a promo code?
          </label>
          <button 
            type="button"
            className="text-sm font-medium text-hotpink hover:text-hotpink/90"
          >
            Apply
          </button>
        </div>
        <div className="mt-1">
          <input
            type="text"
            id="promo-code"
            name="promo-code"
            className="block w-full rounded-md border-warmgray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm"
            placeholder="Enter code"
          />
        </div>
      </div>
    </div>
  );
} 