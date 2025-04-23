import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import CheckoutLayout, { CheckoutStep } from '@/components/checkout/CheckoutLayout';
import CakeCustomizationForm, { CustomizationOptions } from '@/components/checkout/CakeCustomizationForm';
import { useCart } from '@/contexts/CartContext';
import { cakes } from '@/utils/data';

export default function CakeCustomizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ cakeId?: string; cartItemIndex?: string }>();
  const { state: cartState } = useCart();

  // Determine if we're customizing a specific cart item or a new cake
  const cartItemIndex = params.cartItemIndex ? parseInt(params.cartItemIndex, 10) : undefined;
  const cartItem = cartItemIndex !== undefined && cartItemIndex >= 0 && cartItemIndex < cartState.items.length
    ? cartState.items[cartItemIndex]
    : undefined;

  // Get the selected cake ID from various sources
  const getInitialCakeId = () => {
    // If we have a specific cart item to customize
    if (cartItem) {
      return cartItem.id;
    }
    
    // Check for route parameter for direct customization
    if (params.cakeId) {
      return params.cakeId;
    }
    
    // Check for query parameter
    const searchParams = new URLSearchParams(location.search);
    const cakeIdFromUrl = searchParams.get('cakeId');
    
    if (cakeIdFromUrl) {
      return cakeIdFromUrl;
    }
    
    // If we're in the checkout flow and we have items in the cart,
    // use the first cake in the cart
    if (cartState.items.length > 0) {
      // Get the cakeId of the first item
      const firstCakeItem = cartState.items[0];
      return firstCakeItem.cakeId || '';
    }
    
    return '';
  };

  // Get existing customizations from cart item or localStorage
  const getInitialCustomizations = () => {
    // If customizing a specific cart item, use its existing customizations
    if (cartItem && cartItem.customizations) {
      return {
        ...cartItem.customizations,
        selectedCakeId: cartItem.id
      };
    }
    
    const cakeId = getInitialCakeId();
    
    // For new customizations, check localStorage first
    const savedOptions = localStorage.getItem('cakeCustomizationOptions');
    if (savedOptions) {
      const parsedOptions = JSON.parse(savedOptions);
      // If a specific cakeId is provided, override the saved cakeId
      if (cakeId) {
        return {
          ...parsedOptions,
          selectedCakeId: cakeId
        };
      }
      return parsedOptions;
    }
    
    // No saved options, create new ones with the cake ID if available
    return {
      selectedCakeId: cakeId,
      flavor: '',
      filling: '',
      frosting: '',
      shape: 'Round',
      dietaryOption: 'standard',
      addons: [],
      specialInstructions: '',
    };
  };

  // Load customization options
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>(getInitialCustomizations);
  
  // Determine if we should show the cake selection field
  // Only show it if we're not customizing a specific cart item or cake from URL
  // AND there are no items in the cart
  // This will be FALSE when:
  // 1. User selected a cake from product page (params.cakeId exists)
  // 2. User is customizing a cart item (cartItem exists)
  // 3. User has items in their cart and is in the checkout flow
  const [showCakeSelection, setShowCakeSelection] = useState<boolean>(
    !cartItem && !params.cakeId && cartState.items.length === 0
  );
  
  // Log the values to debug
  console.log("CakeCustomizationPage debug:", {
    cartItem: !!cartItem,
    cakeIdParam: !!params.cakeId,
    cartItemsCount: cartState.items.length,
    showCakeSelection
  });
  
  // These values would be calculated from the actual cart
  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0825; // Example tax rate
  const shippingCost = 0; // Will be determined in the next step
  const discount = 0;
  const total = subtotal + tax + shippingCost - discount;

  // Check if a valid cake is selected
  useEffect(() => {
    // If coming from direct product page, we may not have items in cart yet
    const cakeId = params.cakeId;
    
    // If we're not customizing a cart item, no cakeId in params, and cart is empty, redirect to cart
    if (cartItemIndex === undefined && !cakeId && cartState.items.length === 0) {
      navigate('/cart');
    }
    
    // If cakeId is in params but not valid, redirect to products
    if (cakeId && !cakes.some(cake => cake.id === cakeId)) {
      navigate('/products');
    }
    
    // If cartItemIndex is out of bounds, redirect to cart
    if (cartItemIndex !== undefined && (cartItemIndex < 0 || cartItemIndex >= cartState.items.length)) {
      navigate('/cart');
    }
    
  }, [cartState.items, navigate, params.cakeId, cartItemIndex]);

  // Update showCakeSelection if relevant dependencies change
  useEffect(() => {
    const shouldShowSelection = !cartItem && !params.cakeId && cartState.items.length === 0;
    setShowCakeSelection(shouldShowSelection);
    console.log("Updated showCakeSelection:", shouldShowSelection, "cartItems:", cartState.items.length);
  }, [cartItem, params.cakeId, cartState.items.length]);

  const handleCustomizationSubmit = (data: CustomizationOptions) => {
    // Save customization options to localStorage
    localStorage.setItem('cakeCustomizationOptions', JSON.stringify(data));
    setCustomizationOptions(data);
    
    // If we're customizing a specific cart item, update that item
    if (cartItemIndex !== undefined) {
      // In a real implementation, you would update the cart item with the new customizations
      // cartDispatch({ 
      //   type: 'UPDATE_ITEM_CUSTOMIZATIONS', 
      //   payload: { index: cartItemIndex, customizations: data } 
      // });
      
      // For now, just return to the cart page
      navigate('/cart');
      return;
    }
    
    // If we came directly from a product page (via params.cakeId), 
    // we need to add this cake to the cart first
    if (params.cakeId) {
      // This would be handled by your cart context in a real app
      // cartDispatch({ type: 'ADD_ITEM', payload: { id: params.cakeId, customizations: data } });
      // For now, we'll just navigate to checkout
    }
    
    // Navigate to shipping step in the main checkout flow
    navigate('/checkout');
  };

  const handleBack = () => {
    // Navigate back based on where we came from
    
    // If customizing a cart item, go back to cart
    if (cartItemIndex !== undefined) {
      navigate('/cart');
      return;
    }
    
    // If we came from a product page
    if (params.cakeId) {
      navigate(`/products/${params.cakeId}`);
    } else {
      // If we're in the checkout flow
      const hasCustomerInfo = localStorage.getItem('customerInfo');
      if (hasCustomerInfo) {
        navigate('/checkout');
      } else {
        navigate('/cart');
      }
    }
  };

  // Page title based on the context
  const getPageTitle = () => {
    if (cartItemIndex !== undefined) {
      return `Customize ${cartItem?.name || 'Cake'}`;
    }
    
    return 'Customize Your Cake';
  };

  // Log what's being passed to the form
  console.log("CakeCustomizationPage: About to render form with showCakeSelection =", showCakeSelection);

  return (
    <CheckoutLayout
      currentStep={cartItemIndex !== undefined ? CheckoutStep.CUSTOMER_INFO : CheckoutStep.CAKE_CUSTOMIZATION}
      items={cartState.items}
      subtotal={subtotal}
      tax={tax}
      shippingCost={shippingCost}
      discount={discount}
      total={total}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-deepbrown">{getPageTitle()}</h2>
        {cartItem && (
          <p className="text-sm text-warmgray-600 mt-2">
            Customize your {cartItem.name} to suit your preferences.
          </p>
        )}
      </div>
      
      <CakeCustomizationForm
        initialData={customizationOptions}
        onSubmit={handleCustomizationSubmit}
        onBack={handleBack}
        showCakeSelection={showCakeSelection}
      />
    </CheckoutLayout>
  );
} 