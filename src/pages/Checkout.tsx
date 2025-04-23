import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

import CustomerInfoForm, { CustomerInfo } from '@/components/checkout/CustomerInfoForm';
import DeliveryOptionsForm, { DeliveryInfo } from '@/components/checkout/DeliveryOptionsForm';
import OrderReview from '@/components/checkout/OrderReview';
import PaymentMethod, { PaymentInfo } from '@/components/checkout/PaymentMethod';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
import { v4 as uuidv4 } from 'uuid';
import CheckoutLayout, { CheckoutStep } from '@/components/checkout/CheckoutLayout';

// Checkout state interface
interface CheckoutState {
  customerInfo: CustomerInfo | null;
  deliveryInfo: DeliveryInfo | null;
  paymentInfo: PaymentInfo | null;
  orderId: string;
}

// Steps configuration - Include enum values for easier lookup
const checkoutSteps = [
  { id: CheckoutStep.CUSTOMER_INFO, title: 'Your Information' },
  { id: CheckoutStep.SHIPPING, title: 'Delivery' },
  { id: CheckoutStep.PAYMENT, title: 'Payment' },
  { id: CheckoutStep.REVIEW, title: 'Review' },
  { id: CheckoutStep.CONFIRMATION, title: 'Confirmation' }, // Add confirmation step definition
];



const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.CUSTOMER_INFO);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    customerInfo: null,
    deliveryInfo: null,
    paymentInfo: null,
    orderId: `ORD-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${uuidv4().substring(0, 8).toUpperCase()}`,
  });

  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem('customerInfo');
    if (savedCustomerInfo) {
      try {
        const parsedInfo = JSON.parse(savedCustomerInfo);
        setCheckoutState(prev => ({ ...prev, customerInfo: parsedInfo }));
      } catch (error) {
        console.error('Error parsing saved customer info:', error);
      }
    }
  }, []);

  useEffect(() => {
    const currentStepIndex = checkoutSteps.findIndex(step => step.id === currentStep);
    if (cartState.items.length === 0 && currentStepIndex < checkoutSteps.findIndex(step => step.id === CheckoutStep.CONFIRMATION)) {
      console.log('Cart is empty, redirecting to /cart');
      navigate('/cart');
    }
  }, [cartState.items, currentStep, navigate]);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const getCurrentStepIndex = () => checkoutSteps.findIndex(step => step.id === currentStep);

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < checkoutSteps.length - 1) {
      setCurrentStep(checkoutSteps[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(checkoutSteps[currentIndex - 1].id);
      window.scrollTo(0, 0);
    } else {
      navigate('/cart'); // Go back to cart from the first step
    }
  };

  const handleCustomerInfoSubmit = (customerInfo: CustomerInfo) => {
    console.log('Customer Info Submitted:', customerInfo);
    setCheckoutState(prev => ({ ...prev, customerInfo }));
    if (customerInfo.saveInfo) {
       localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    }
    goToNextStep();
  };

  const handleDeliveryOptionsSubmit = (deliveryInfo: DeliveryInfo) => {
    console.log('Delivery Info Submitted:', deliveryInfo);
    setCheckoutState(prev => ({ ...prev, deliveryInfo }));
    goToNextStep();
  };

  const handleOrderReviewSubmit = () => {
    console.log('Order Reviewed');
    goToNextStep(); // Move to payment
  };

  const handlePaymentSubmit = (paymentInfo: PaymentInfo) => {
    console.log('Payment Info Submitted:', paymentInfo);
    // TODO: Add actual payment processing logic here
    console.log('Simulating payment processing...');
    setCheckoutState(prev => ({ ...prev, paymentInfo }));
    // If payment is successful, move to confirmation
    setCurrentStep(CheckoutStep.CONFIRMATION); // Go to confirmation step
    window.scrollTo(0, 0);
  };

  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // Example 8% tax
  const shippingCost = checkoutState.deliveryInfo?.method === 'pickup' ? 0 : 5.99; // Example shipping
  const discount = 0; // Example discount
  const total = subtotal + tax + shippingCost - discount;

  let currentStepContent;
  
  // Render the correct component based on the current step
  switch (currentStep) {
    case CheckoutStep.CUSTOMER_INFO:
      currentStepContent = (
        <CustomerInfoForm 
          initialData={checkoutState.customerInfo || undefined} 
          onSubmit={handleCustomerInfoSubmit} 
        />
      );
      break;
    case CheckoutStep.SHIPPING:
      currentStepContent = (
        <DeliveryOptionsForm 
          initialData={checkoutState.deliveryInfo || undefined} 
          onSubmit={handleDeliveryOptionsSubmit} 
          onBack={goToPreviousStep} 
        />
      );
      break;
    case CheckoutStep.PAYMENT:
      currentStepContent = (
        <PaymentMethod
          initialData={checkoutState.paymentInfo || undefined}
          onSubmit={handlePaymentSubmit}
          onBack={goToPreviousStep}
        />
      );
      break;
    case CheckoutStep.REVIEW:
      // Ensure we have the necessary info before showing review
      if (checkoutState.customerInfo && checkoutState.deliveryInfo) {
        currentStepContent = (
          <OrderReview 
            customerInfo={checkoutState.customerInfo}
            deliveryInfo={checkoutState.deliveryInfo}
            onSubmit={handleOrderReviewSubmit} // Renamed handler for clarity
          />
        );
      } else {
        // Should not happen if flow is correct, but handle defensively
        currentStepContent = <div className="text-center p-4 text-red-500">Missing information to review order. Please go back.</div>;
        // Optionally, navigate back automatically
        // setCurrentStep(CheckoutStep.CUSTOMER_INFO); 
      }
      break;
    case CheckoutStep.CONFIRMATION:
      // Placeholder for OrderConfirmation
      currentStepContent = <div className="text-center p-4">Order Confirmation Placeholder</div>;
      break;
    default:
      currentStepContent = <div>Invalid Step</div>;
  }

  const showLayout = currentStep !== CheckoutStep.CONFIRMATION; // Don't show layout on confirmation

  // We will wrap the step content with CheckoutLayout for steps before confirmation
  // Confirmation page will be standalone

  if (!showLayout) {
     // Render confirmation page directly (or placeholder)
     return (
        <motion.div 
           className="container mx-auto px-4 pt-44 pb-16 md:pb-20" // Increased pt, adjusted pb
           initial="initial"
           animate="animate"
           exit="exit"
           variants={pageVariants} >
          {/* Replace with actual OrderConfirmation component later */} 
          <OrderConfirmation 
            customerInfo={checkoutState.customerInfo!} 
            deliveryInfo={checkoutState.deliveryInfo!} 
            paymentInfo={checkoutState.paymentInfo!} 
            orderId={checkoutState.orderId}
          />
        </motion.div>
     );
  }

  return (
    <motion.div
      // Remove excessive padding here, let CheckoutLayout handle it
      className="container mx-auto px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <CheckoutLayout
        currentStep={currentStep}
        items={cartState.items} // Use actual cart items
        subtotal={subtotal}
        tax={tax}
        shippingCost={shippingCost}
        discount={discount}
        total={total}
      >
        {/* Render the placeholder content for now */} 
        {currentStepContent}
      </CheckoutLayout>
    </motion.div>
  );
};

export default Checkout; 