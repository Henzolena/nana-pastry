import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/utils/cn';
import CustomerInfoForm, { CustomerInfo } from '@/components/checkout/CustomerInfoForm';
import DeliveryOptionsForm, { DeliveryInfo } from '@/components/checkout/DeliveryOptionsForm';
import OrderReview from '@/components/checkout/OrderReview';
import PaymentMethod, { PaymentInfo } from '@/components/checkout/PaymentMethod';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
import { v4 as uuidv4 } from 'uuid';
import CheckoutLayout, { CheckoutStep } from '@/components/checkout/CheckoutLayout';
import { Button } from '@/components/ui/Button';

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

// Mock cart data
const mockCartItems = [
  {
    id: '1',
    name: 'Strawberry Cake',
    price: 35.99,
    quantity: 1,
    image: '/images/products/cake1.jpg',
    options: 'Size: Medium'
  },
  {
    id: '2',
    name: 'Chocolate Cupcakes',
    price: 12.99,
    quantity: 2,
    image: '/images/products/cupcakes.jpg',
    options: 'Box of 6'
  }
];

// Temporary placeholder form, will be replaced
const SimpleCustomerInfoForm = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-deepbrown">Contact Information</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-deepbrown">First Name</label>
            <input 
              id="firstName" 
              placeholder="First Name"
              className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-deepbrown">Last Name</label>
            <input 
              id="lastName" 
              placeholder="Last Name"
              className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-deepbrown">Email</label>
          <input 
            id="email" 
            type="email" 
            placeholder="your@email.com"
            className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-deepbrown">Phone Number</label>
          <input 
            id="phone" 
            placeholder="(123) 456-7890"
            className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
          />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-deepbrown pt-4">Billing Address</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm font-medium text-deepbrown">Street Address</label>
          <input 
            id="address" 
            placeholder="123 Main St"
            className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="apartment" className="block text-sm font-medium text-deepbrown">Apartment, suite, etc. (optional)</label>
          <input 
            id="apartment" 
            placeholder="Apt #"
            className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-deepbrown">City</label>
            <input 
              id="city" 
              placeholder="City"
              className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="state" className="block text-sm font-medium text-deepbrown">State</label>
            <input 
              id="state" 
              placeholder="State"
              className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-deepbrown">ZIP Code</label>
            <input 
              id="zipCode" 
              placeholder="ZIP Code"
              className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5" 
            />
          </div>
        </div>
      </div>
      
      <div className="pt-6">
        <Button 
          onClick={onNext}
          className="w-full md:w-auto bg-hotpink hover:bg-hotpink/90 text-white"
        >
          Continue to Shipping
        </Button>
      </div>
    </div>
  );
};

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
  const currentStepIndex = getCurrentStepIndex();
  
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

  const showProgressBar = currentStep !== CheckoutStep.CONFIRMATION;
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