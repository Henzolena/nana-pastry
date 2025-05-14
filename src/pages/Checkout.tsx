import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { getUserProfile } from '@/services/firestore';
import { createNewOrder, OrderData, OrderItem } from '@/services/order';
import { useAuth } from '@/contexts/AuthContext';

import CustomerInfoForm, { CustomerInfo } from '@/components/checkout/CustomerInfoForm';
import DeliveryOptionsForm, { DeliveryInfo as DeliveryInfoType } from '@/components/checkout/DeliveryOptionsForm';
// Correct imports for component props
import OrderReview from '@/components/checkout/OrderReview';
import PaymentMethod, { PaymentInfo } from '@/components/checkout/PaymentMethod';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
import { v4 as uuidv4 } from 'uuid';
import CheckoutLayout, { CheckoutStep } from '@/components/checkout/CheckoutLayout';
import { showErrorToast, showSuccessToast } from '@/utils/toast'; // Import toast utilities
// Import cart types
// Import Order interface


// Checkout state interface
interface CheckoutState {
  customerInfo: CustomerInfo | null;
  customizationOptions?: any; // We'll type this properly later
  deliveryInfo: DeliveryInfoType | null; // Use imported type
  paymentInfo: PaymentInfo | null;
  orderId: string;
}

// Steps configuration - Include enum values for easier lookup
const checkoutSteps = [
  { id: CheckoutStep.CUSTOMER_INFO, title: 'Your Information' },
  { id: CheckoutStep.CAKE_CUSTOMIZATION, title: 'Cake Customization' },
  { id: CheckoutStep.SHIPPING, title: 'Delivery' },
  { id: CheckoutStep.PAYMENT, title: 'Payment' },
  { id: CheckoutStep.REVIEW, title: 'Review' },
  { id: CheckoutStep.CONFIRMATION, title: 'Confirmation' },
];



const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart(); // Get clearCart
  const { user, loading: authLoading } = useAuth(); // Get logged-in user and auth loading state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.CUSTOMER_INFO);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    customerInfo: null,
    deliveryInfo: null,
    paymentInfo: null,
    orderId: `ORD-${new Date().getTime()}-${uuidv4().substring(0, 8).toUpperCase()}`,
  });
  const [loading, setLoading] = useState(false); // Add loading state for order placement

  // Calculate order summary details
  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.08; // Example 8% tax rate
  const tax = subtotal * taxRate;
  // Assuming delivery fee is part of deliveryInfo now, or calculate based on method/distance
  const shippingCost = checkoutState.deliveryInfo?.deliveryFee || 0; 
  const discount = 0; // Placeholder for discounts
  const total = subtotal + tax + shippingCost - discount;


  useEffect(() => {
    const loadCheckoutState = async () => {
      // Load saved customer info from local storage (for guests or returning users)
      const savedCustomerInfo = localStorage.getItem('customerInfo');
      if (savedCustomerInfo) {
        try {
          const parsedInfo = JSON.parse(savedCustomerInfo);
          setCheckoutState(prev => ({ ...prev, customerInfo: parsedInfo }));
        } catch (error) {
          console.error('Error parsing saved customer info from local storage:', error);
        }
      }

      // If user is logged in and customerInfo is not already loaded from local storage,
      // attempt to load it from their user profile in Firestore.
      // Wait for authLoading to be false to ensure user state is resolved.
      if (user && !authLoading && !checkoutState.customerInfo) {
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile?.address) {
            // Map user profile address to CustomerInfo format
            const customerInfoFromProfile: CustomerInfo = {
              firstName: userProfile.displayName?.split(' ')[0] || '',
              lastName: userProfile.displayName?.split(' ').slice(1).join(' ') || '',
              email: userProfile.email || '',
              phone: userProfile.phoneNumber || '',
              address: userProfile.address.street || '',
              city: userProfile.address.city || '',
              state: userProfile.address.state || '',
              zipCode: userProfile.address.zipCode || '',
              country: userProfile.address.country || '',
              saveInfo: true, // Assume logged-in users want to save info
            };
            setCheckoutState(prev => ({ ...prev, customerInfo: customerInfoFromProfile }));
          }
        } catch (error) {
          console.error('Error fetching user profile for checkout:', error);
          // Optionally show a toast or message to the user
        }
      }


      // Check if we should jump to a specific step (e.g., after customization)
      const savedStep = localStorage.getItem('checkoutStep');
      if (savedStep) {
        setCurrentStep(savedStep as CheckoutStep);
        // Clear the saved step to prevent unwanted jumps on future visits
        localStorage.removeItem('checkoutStep');
      }
    };

    loadCheckoutState();
  }, [user, authLoading]); // Depend on user and authLoading

  useEffect(() => {
    const currentStepIndex = checkoutSteps.findIndex(step => step.id === currentStep);
    // Only redirect if cart is empty AND we are before the confirmation step
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
    // Check if any items require customization before proceeding
    const needsCustomization = cartState.items.some(item => item.isCustomizable); // Assuming items have an isCustomizable flag
    if (needsCustomization) {
       // Instead of going to the next step directly, redirect to the customization page
       // Store the current step so we know where to return after customization
       localStorage.setItem('checkoutStep', CheckoutStep.CAKE_CUSTOMIZATION); // Save current step
       navigate('/checkout/customize');
    } else {
       // If no customization needed, skip customization step and go to shipping
       setCurrentStep(CheckoutStep.SHIPPING);
       window.scrollTo(0, 0);
    }
  };

  const handleDeliveryOptionsSubmit = (deliveryInfo: DeliveryInfoType) => { // Use imported type
    console.log('Delivery Info Submitted:', deliveryInfo);
    setCheckoutState(prev => ({ ...prev, deliveryInfo }));
    goToNextStep(); // Move to payment
  };

  const handleOrderReviewSubmit = () => {
    console.log('Order Reviewed');
    goToNextStep(); // Move to payment
  };

  const handlePaymentSubmit = async (paymentInfo: PaymentInfo) => { // Made async
    console.log('Payment Info Submitted:', paymentInfo);
    setCheckoutState(prev => ({ ...prev, paymentInfo }));

    // Map the cart items to the OrderItem format
    const orderItems: OrderItem[] = cartState.items.map(item => ({
      cakeId: item.cakeId,
      name: item.name,
      imageUrl: item.image,
      price: item.price,
      quantity: item.quantity,
      customizations: item.customizations ? {
        // Map the customizations to match the OrderItem.customizations structure
        size: item.size?.label,
        flavors: item.customizations.flavor ? [item.customizations.flavor] : undefined,
        fillings: item.customizations.filling ? [item.customizations.filling] : undefined,
        frostings: item.customizations.frosting ? [item.customizations.frosting] : undefined,
        shape: item.customizations.shape,
        addons: item.customizations.addons,
        specialInstructions: item.customizations.specialInstructions
      } : undefined
    }));

    // Prepare the order data
    const orderData: OrderData = {
      userId: user?.uid || undefined,
      items: orderItems,
      subtotal: Number(subtotal),
      tax: Number(tax),
      total: Number(total),
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: paymentInfo.method || '',
      deliveryMethod: checkoutState.deliveryInfo?.method || 'pickup',
      customerInfo: {
        name: `${checkoutState.customerInfo?.firstName || ''} ${checkoutState.customerInfo?.lastName || ''}`.trim(),
        email: checkoutState.customerInfo?.email || '',
        phone: checkoutState.customerInfo?.phone || ''
      },
      specialInstructions: checkoutState.deliveryInfo?.specialInstructions || '',
      isCustomOrder: cartState.items.some(item => Boolean(item.customizations)),
      idempotencyKey: `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    };

    // Add delivery-specific info if applicable
    if (checkoutState.deliveryInfo?.method === 'delivery') {
      orderData.deliveryInfo = {
        address: checkoutState.deliveryInfo.address || '',
        city: checkoutState.deliveryInfo.city || '',
        state: checkoutState.deliveryInfo.state || '',
        zipCode: checkoutState.deliveryInfo.zipCode || '',
        deliveryFee: shippingCost,
        deliveryTime: checkoutState.deliveryInfo.deliveryTime || '12:00 PM'
      };
      
      // Add delivery date if available
      if (checkoutState.deliveryInfo.deliveryDate) {
        try {
          const date = new Date(checkoutState.deliveryInfo.deliveryDate);
          orderData.deliveryInfo.deliveryDate = date;
        } catch (error) {
          console.error('Error creating delivery date:', error);
        }
      }
    }

    // Add pickup-specific info if applicable
    if (checkoutState.deliveryInfo?.method === 'pickup') {
      orderData.pickupInfo = {
        storeLocation: 'Main Store',
        pickupTime: checkoutState.deliveryInfo.pickupTime || '12:00 PM',
        pickupDate: new Date() // Default to current date
      };
      
      // Add pickup date if available
      if (checkoutState.deliveryInfo.pickupDate) {
        try {
          const date = new Date(checkoutState.deliveryInfo.pickupDate);
          orderData.pickupInfo.pickupDate = date;
        } catch (error) {
          console.error('Error creating pickup date:', error);
        }
      }
    }

    try {
      setLoading(true); // Start loading
      // Create order in Firestore
      const orderId = await createNewOrder(orderData);
      console.log('Order created in Firestore with ID:', orderId);
      setCheckoutState(prev => ({ ...prev, orderId }));

      // Clear the cart after successful order placement
      clearCart();
      showSuccessToast('Order placed successfully!');

      // Move to confirmation step
      setCurrentStep(CheckoutStep.CONFIRMATION);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error placing order:", error);
      showErrorToast('Failed to place your order. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const showLayout = currentStep !== CheckoutStep.CONFIRMATION; // Don't show layout on confirmation

  // Render the correct component based on the current step
  let currentStepContent;
  switch (currentStep) {
    case CheckoutStep.CUSTOMER_INFO:
      currentStepContent = (
        <CustomerInfoForm 
          initialData={checkoutState.customerInfo || undefined} 
          onSubmit={handleCustomerInfoSubmit} 
        />
      );
      break;
    case CheckoutStep.CAKE_CUSTOMIZATION:
      // This step should ideally be handled by the dedicated customization page
      // If we land here, it means the redirect from handleCustomerInfoSubmit failed or was bypassed.
      // We should probably redirect again or show an error.
      currentStepContent = <Navigate to="/checkout/customize" replace />;
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
          loading={loading} // Pass loading state to PaymentMethod
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
            items={cartState.items as any[]} // Cast items to any[] for now if type mismatch
            subtotal={subtotal}
            tax={tax}
            shippingCost={shippingCost}
            total={total}
            onSubmit={handleOrderReviewSubmit} // Renamed handler for clarity
            onBack={goToPreviousStep} // Add back button handler
          />
        );
      } else {
        // Should not happen if flow is correct, but handle defensively
        console.error("Missing checkout state for Review step:", checkoutState);
        currentStepContent = <div className="text-center p-4 text-red-500">Missing information to review order. Please go back to the previous steps.</div>;
        // Optionally, navigate back automatically
        // setCurrentStep(CheckoutStep.CUSTOMER_INFO); 
      }
      break;
    case CheckoutStep.CONFIRMATION:
      // This case is handled outside the CheckoutLayout
      currentStepContent = null; 
      break;
    default:
      currentStepContent = <div>Invalid Step</div>;
  }

  // We will wrap the step content with CheckoutLayout for steps before confirmation
  // Confirmation page will be standalone

  if (!showLayout) {
     // Render confirmation page directly
     // Ensure all required data is available before rendering confirmation
     if (!checkoutState.customerInfo || !checkoutState.deliveryInfo || !checkoutState.paymentInfo || !checkoutState.orderId) {
         console.error("Missing checkout state for Confirmation step:", checkoutState);
         // Redirect to an error page or back to cart/checkout start
         return <Navigate to="/cart" replace />; // Redirect to cart if data is missing
     }
     return (
        <motion.div 
           className="container mx-auto px-4 pt-44 pb-16 md:pb-20" // Increased pt, adjusted pb
           initial="initial"
           animate="animate"
           exit="exit"
           variants={pageVariants} >
          {/* Replace with actual OrderConfirmation component later */} 
          <OrderConfirmation 
            customerInfo={checkoutState.customerInfo} 
            deliveryInfo={checkoutState.deliveryInfo} 
            paymentInfo={checkoutState.paymentInfo} 
            orderId={checkoutState.orderId}
            items={cartState.items as any[]} // Pass items to confirmation
            total={total} // Pass total to confirmation
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
        {/* Render the current step content */} 
        {currentStepContent}
      </CheckoutLayout>
    </motion.div>
  );
};

export default Checkout;
