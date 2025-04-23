'use client';

import { useState, useEffect } from 'react';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import { CartItem } from '@/components/checkout/OrderSummary';
import { Button } from '@/components/ui/button';

// Mock cart data for now - this would come from your cart context
const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Strawberry Cheesecake',
    price: 38.99,
    quantity: 1,
    image: '/images/products/strawberry-cheesecake.jpg',
  },
  {
    id: '2',
    name: 'Chocolate Truffle Cake',
    price: 42.99,
    quantity: 2,
    image: '/images/products/chocolate-cake.jpg',
    options: 'Gluten-free'
  }
];

// Checkout steps
enum CheckoutStep {
  CUSTOMER_INFO = 1,
  SHIPPING = 2,
  PAYMENT = 3,
  REVIEW = 4
}

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.CUSTOMER_INFO);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shippingCost, setShippingCost] = useState(9.99);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  
  // In a real implementation, this would fetch cart data from context or localStorage
  useEffect(() => {
    setCartItems(mockCartItems);
    
    // Calculate totals
    const itemsSubtotal = mockCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 
      0
    );
    
    setSubtotal(itemsSubtotal);
    setTax(itemsSubtotal * 0.08); // 8% tax rate example
    setTotal(itemsSubtotal + (itemsSubtotal * 0.08) + shippingCost - discount);
  }, [shippingCost, discount]);

  const nextStep = () => {
    if (currentStep < CheckoutStep.REVIEW) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > CheckoutStep.CUSTOMER_INFO) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case CheckoutStep.CUSTOMER_INFO:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-deepbrown mb-6">Customer Information</h2>
            <p className="text-warmgray-600">Customer information form will go here</p>
            
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={nextStep}
                className="bg-hotpink hover:bg-hotpink/90 text-white"
              >
                Continue to Shipping
              </Button>
            </div>
          </div>
        );
      
      case CheckoutStep.SHIPPING:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-deepbrown mb-6">Shipping Options</h2>
            <p className="text-warmgray-600">Shipping options will go here</p>
            
            <div className="mt-8 flex justify-between">
              <Button 
                onClick={prevStep}
                variant="outline"
                className="border-hotpink text-hotpink hover:bg-hotpink/5"
              >
                Back
              </Button>
              <Button 
                onClick={nextStep}
                className="bg-hotpink hover:bg-hotpink/90 text-white"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        );
      
      case CheckoutStep.PAYMENT:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-deepbrown mb-6">Payment Information</h2>
            <p className="text-warmgray-600">Payment form will go here</p>
            
            <div className="mt-8 flex justify-between">
              <Button 
                onClick={prevStep}
                variant="outline"
                className="border-hotpink text-hotpink hover:bg-hotpink/5"
              >
                Back
              </Button>
              <Button 
                onClick={nextStep}
                className="bg-hotpink hover:bg-hotpink/90 text-white"
              >
                Review Order
              </Button>
            </div>
          </div>
        );
      
      case CheckoutStep.REVIEW:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-deepbrown mb-6">Review Your Order</h2>
            <p className="text-warmgray-600">Order review will go here</p>
            
            <div className="mt-8 flex justify-between">
              <Button 
                onClick={prevStep}
                variant="outline"
                className="border-hotpink text-hotpink hover:bg-hotpink/5"
              >
                Back
              </Button>
              <Button 
                className="bg-hotpink hover:bg-hotpink/90 text-white"
              >
                Place Order
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <CheckoutLayout
      orderSummaryItems={cartItems}
      subtotal={subtotal}
      shippingCost={shippingCost}
      tax={tax}
      discount={discount}
      total={total}
      currentStep={currentStep}
      totalSteps={4}
    >
      {renderStepContent()}
    </CheckoutLayout>
  );
} 