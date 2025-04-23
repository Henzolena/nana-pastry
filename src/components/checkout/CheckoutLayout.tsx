import React from 'react';
import { cn } from '@/utils/cn';
import OrderSummary, { CartItem } from './OrderSummary';

export enum CheckoutStep {
  CUSTOMER_INFO = 'CUSTOMER_INFO',
  SHIPPING = 'SHIPPING',
  PAYMENT = 'PAYMENT',
  REVIEW = 'REVIEW',
  CONFIRMATION = 'CONFIRMATION'
}

interface StepInfo {
  label: string;
  completed: boolean;
  current: boolean;
}

interface CheckoutLayoutProps {
  children: React.ReactNode;
  currentStep: CheckoutStep;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export default function CheckoutLayout({
  children,
  currentStep,
  items,
  subtotal,
  tax,
  shippingCost,
  discount,
  total
}: CheckoutLayoutProps) {
  const steps: { [key in CheckoutStep]: StepInfo } = {
    [CheckoutStep.CUSTOMER_INFO]: {
      label: 'Customer Information',
      completed: currentStep !== CheckoutStep.CUSTOMER_INFO,
      current: currentStep === CheckoutStep.CUSTOMER_INFO
    },
    [CheckoutStep.SHIPPING]: {
      label: 'Shipping',
      completed: 
        currentStep !== CheckoutStep.CUSTOMER_INFO && 
        currentStep !== CheckoutStep.SHIPPING,
      current: currentStep === CheckoutStep.SHIPPING
    },
    [CheckoutStep.PAYMENT]: {
      label: 'Payment',
      completed: currentStep === CheckoutStep.REVIEW,
      current: currentStep === CheckoutStep.PAYMENT
    },
    [CheckoutStep.REVIEW]: {
      label: 'Review',
      completed: false,
      current: currentStep === CheckoutStep.REVIEW
    },
    [CheckoutStep.CONFIRMATION]: {
      label: 'Confirmation',
      completed: false,
      current: currentStep === CheckoutStep.CONFIRMATION
    }
  };

  const stepOrder = [
    CheckoutStep.CUSTOMER_INFO,
    CheckoutStep.SHIPPING,
    CheckoutStep.PAYMENT,
    CheckoutStep.REVIEW,
    CheckoutStep.CONFIRMATION
  ];

  return (
    <div className="bg-warmgray-50 min-h-screen mt-32 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-deepbrown mb-6 mt-12">Checkout</h1>
        
        {/* Steps indicator */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {stepOrder.map((step, index) => {
                const { label, completed, current } = steps[step];
                return (
                  <li key={step} className={cn("relative flex-1", 
                    index === stepOrder.length - 1 ? "" : "pr-8")}>
                    <div className="flex items-center">
                      <div 
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          completed ? "bg-hotpink" : current ? "border-2 border-hotpink bg-white" : "border-2 border-warmgray-300 bg-white"
                        )}
                      >
                        {completed ? (
                          <span className="text-white font-bold text-sm">✓</span>
                        ) : (
                          <span className={cn(
                            "text-sm font-medium", 
                            current ? "text-hotpink" : "text-warmgray-500"
                          )}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      {index < stepOrder.length - 1 && (
                        <div className={cn(
                          "ml-4 w-full h-0.5", 
                          completed ? "bg-hotpink" : "bg-warmgray-300"
                        )} />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className={cn(
                        "text-sm font-medium",
                        current ? "text-hotpink" : completed ? "text-deepbrown" : "text-warmgray-500"
                      )}>
                        {label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-x-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
          
          <div className="mt-8 lg:mt-0">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              tax={tax}
              shippingCost={shippingCost}
              discount={discount}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 