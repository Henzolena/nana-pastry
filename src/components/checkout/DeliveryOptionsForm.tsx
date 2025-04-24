import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/services/userService';
import type { Address } from '@/services/userService';
import { MapPin, PlusCircle, Info } from 'lucide-react';

export type DeliveryMethod = 'delivery' | 'pickup';

export interface DeliveryInfo {
  method: DeliveryMethod;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  deliveryInstructions?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  savedAddressIndex?: number;
}

interface DeliveryOptionsFormProps {
  initialData?: DeliveryInfo;
  onSubmit: (data: DeliveryInfo) => void;
  onBack: () => void;
  cakeCategories?: string[]; // Categories of cakes in the order for lead time calculation
  isCustomOrder?: boolean; // Whether this is a custom order
}

const defaultFormData: DeliveryInfo = {
  method: 'delivery',
  address: '',
  apartment: '',
  city: '',
  state: '',
  zipCode: '',
  deliveryInstructions: '',
  pickupDate: '',
  pickupTime: '',
  deliveryDate: '',
  deliveryTime: '',
};

// Available pickup time slots
const timeSlots = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
];

// Available delivery time slots
const deliveryTimeSlots = [
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM',
  '3:00 PM - 6:00 PM',
];

// Helper function to calculate minimum allowed pickup/delivery date based on order details
const calculateMinDate = (cakeCategories: string[] = [], isCustomOrder: boolean = false): Date => {
  const today = new Date();

  // Default minimum lead time (48 hours for standard orders)
  let daysToAdd = 2;

  // Custom orders always require at least 7 days (1 week) lead time
  if (isCustomOrder) {
    daysToAdd = 7;
  } 
  // Wedding cakes require 21 days (3 weeks) minimum
  else if (cakeCategories.includes('wedding')) {
    daysToAdd = 21;
  } 
  // Check for celebration cakes (require 7 days)
  else if (cakeCategories.includes('celebration')) {
    daysToAdd = Math.max(daysToAdd, 7);
  }

  // Add the required days
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + daysToAdd);

  // If the date falls on a Sunday, move to Monday
  if (minDate.getDay() === 0) { // Sunday
    minDate.setDate(minDate.getDate() + 1);
  }

  return minDate;
};

const DeliveryOptionsForm: React.FC<DeliveryOptionsFormProps> = ({ 
  initialData, 
  onSubmit, 
  onBack,
  cakeCategories = [],
  isCustomOrder = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<DeliveryInfo>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryInfo, string>>>({});
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(!user); // Default to new address if not logged in

  // Calculate minimum date based on order details
  const minDate = calculateMinDate(cakeCategories, isCustomOrder);
  const minDateString = minDate.toISOString().split('T')[0];

  // Get lead time description for the info tooltip
  const getLeadTimeDescription = (): string => {
    if (isCustomOrder) {
      return "Custom orders require at least 1 week advance notice.";
    } else if (cakeCategories.includes('wedding')) {
      return "Wedding cakes require at least 3 weeks advance notice.";
    } else if (cakeCategories.includes('celebration')) {
      return "Celebration cakes require at least 1 week advance notice.";
    } else {
      return "Standard orders require at least 48 hours advance notice.";
    }
  };

  // Fetch user's saved addresses when component mounts
  useEffect(() => {
    async function fetchUserAddresses() {
      if (!user) return;
      
      try {
        setLoadingAddresses(true);
        const userProfile = await getUserProfile(user.uid);
        
        if (userProfile && userProfile.addresses) {
          setSavedAddresses(userProfile.addresses);
          
          // If we have saved addresses and no initialData, select the default shipping address
          if (userProfile.addresses.length > 0 && !initialData?.address) {
            const defaultAddress = userProfile.addresses.find(addr => addr.isDefault && addr.type === 'shipping');
            const addressIndex = defaultAddress 
              ? userProfile.addresses.indexOf(defaultAddress) 
              : 0;
              
            handleSelectAddress(addressIndex);
            setUseNewAddress(false);
          }
        }
      } catch (err) {
        console.error('Error fetching user addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    
    if (user) {
      fetchUserAddresses();
    }
  }, [user, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name as keyof DeliveryInfo]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleMethodChange = (method: DeliveryMethod) => {
    setFormData((prev) => ({ ...prev, method }));
  };

  const handleSelectAddress = (index: number) => {
    const address = savedAddresses[index];
    if (!address) return;
    
    setSelectedAddressIndex(index);
    setUseNewAddress(false);
    
    // Update form data with the selected address
    setFormData(prev => ({
      ...prev,
      address: address.street,
      apartment: '', // Since Address type doesn't have apartment field, use empty string
      city: address.city,
      state: address.state,
      zipCode: address.zip,
      savedAddressIndex: index
    }));
    
    // Clear any address-related errors
    setErrors(prev => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      zipCode: ''
    }));
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressIndex(null);
    
    // Clear address fields when switching to new address
    setFormData(prev => ({
      ...prev,
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      savedAddressIndex: undefined
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryInfo, string>> = {};
    
    if (formData.method === 'delivery') {
      if (!formData.address?.trim()) {
        newErrors.address = 'Address is required';
      }
      if (!formData.city?.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.state?.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.zipCode?.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
        newErrors.zipCode = 'ZIP code format is invalid';
      }
      
      // Validate delivery date
      if (!formData.deliveryDate) {
        newErrors.deliveryDate = 'Delivery date is required';
      } else {
        // Validate that the delivery date meets minimum lead time requirements
        const selectedDate = new Date(formData.deliveryDate);
        if (selectedDate < minDate) {
          newErrors.deliveryDate = `Delivery date must be on or after ${minDate.toLocaleDateString()} based on your order type`;
        }
      }
      
      // Validate delivery time
      if (!formData.deliveryTime) {
        newErrors.deliveryTime = 'Delivery time is required';
      }
      
    } else {
      // Pickup validation
      if (!formData.pickupDate) {
        newErrors.pickupDate = 'Pickup date is required';
      } else {
        // Validate that the pickup date meets minimum lead time requirements
        const selectedDate = new Date(formData.pickupDate);
        if (selectedDate < minDate) {
          newErrors.pickupDate = `Pickup date must be on or after ${minDate.toLocaleDateString()} based on your order type`;
        }
      }

      if (!formData.pickupTime) {
        newErrors.pickupTime = 'Pickup time is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Ensure we have all required fields based on the method
      const updatedFormData = { ...formData };
      
      // If delivery method is 'delivery', make sure delivery fields are populated
      if (updatedFormData.method === 'delivery') {
        // Make sure we have a deliveryDate
        if (!updatedFormData.deliveryDate) {
          const today = new Date();
          // Format as YYYY-MM-DD
          updatedFormData.deliveryDate = today.toISOString().split('T')[0];
        }
        
        // Make sure we have a deliveryTime
        if (!updatedFormData.deliveryTime) {
          updatedFormData.deliveryTime = deliveryTimeSlots[0];
        }
      } 
      // If method is 'pickup', make sure pickup fields are populated
      else if (updatedFormData.method === 'pickup') {
        // Make sure we have a pickupDate
        if (!updatedFormData.pickupDate) {
          const today = new Date();
          // Format as YYYY-MM-DD
          updatedFormData.pickupDate = today.toISOString().split('T')[0];
        }
        
        // Make sure we have a pickupTime
        if (!updatedFormData.pickupTime) {
          updatedFormData.pickupTime = timeSlots[0];
        }
      }
      
      console.log("DeliveryOptionsForm submitting updated data:", updatedFormData);
      onSubmit(updatedFormData);
    }
  };

  // Render saved addresses section
  const renderSavedAddresses = () => {
    if (!user) return null;
    
    return (
      <div className="mb-6">
        {loadingAddresses ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-hotpink mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading saved addresses...</p>
          </div>
        ) : savedAddresses.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium text-deepbrown">Your saved addresses</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedAddresses.map((address, index) => (
                <div 
                  key={index}
                  onClick={() => handleSelectAddress(index)}
                  className={cn(
                    "border rounded-md p-3 cursor-pointer transition",
                    selectedAddressIndex === index 
                      ? "border-hotpink bg-hotpink/5" 
                      : "border-blush/20 hover:border-hotpink/50"
                  )}
                >
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-hotpink mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-deepbrown text-sm">
                        {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                        {address.isDefault && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zip}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div 
                onClick={handleUseNewAddress}
                className={cn(
                  "border rounded-md p-3 cursor-pointer transition flex items-center justify-center",
                  useNewAddress 
                    ? "border-hotpink bg-hotpink/5" 
                    : "border-blush/20 hover:border-hotpink/50"
                )}
              >
                <PlusCircle className="w-4 h-4 text-hotpink mr-2" />
                <span className="text-sm font-medium">Use a new address</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-medium mb-6 text-deepbrown">Delivery Options</h2>
      
      <div className="flex justify-between space-x-4 mb-6">
        <button
          type="button"
          onClick={() => handleMethodChange('delivery')}
          className={cn(
            "flex-1 py-4 px-4 rounded-md border-2 flex flex-col items-center justify-center transition-colors",
            formData.method === 'delivery'
              ? "border-hotpink bg-hotpink/5"
              : "border-blush/20 hover:border-hotpink/50"
          )}
        >
          <span className="text-lg font-medium text-deepbrown">Delivery</span>
          <span className="text-sm text-deepbrown/70 mt-1">We'll bring it to you</span>
        </button>
        
        <button
          type="button"
          onClick={() => handleMethodChange('pickup')}
          className={cn(
            "flex-1 py-4 px-4 rounded-md border-2 flex flex-col items-center justify-center transition-colors",
            formData.method === 'pickup'
              ? "border-hotpink bg-hotpink/5"
              : "border-blush/20 hover:border-hotpink/50"
          )}
        >
          <span className="text-lg font-medium text-deepbrown">Pickup</span>
          <span className="text-sm text-deepbrown/70 mt-1">You'll pick it up in-store</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {formData.method === 'delivery' ? (
          <>
            {/* Render saved addresses section if user is logged in */}
            {user && renderSavedAddresses()}
            
            {/* Only show address form if no saved addresses or "Use new address" is selected */}
            {(!user || useNewAddress || savedAddresses.length === 0) && (
              <>
                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-deepbrown mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className={cn(
                      "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                      "border-blush/20 bg-white/80 py-2.5",
                      errors.address ? "border-red-500" : ""
                    )}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                {/* Apartment */}
                <div>
                  <label htmlFor="apartment" className="block text-sm font-medium text-deepbrown mb-1">
                    Apartment, Suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-deepbrown mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className={cn(
                        "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                        "border-blush/20 bg-white/80 py-2.5",
                        errors.city ? "border-red-500" : ""
                      )}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-deepbrown mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      className={cn(
                        "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                        "border-blush/20 bg-white/80 py-2.5",
                        errors.state ? "border-red-500" : ""
                      )}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-deepbrown mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode || ''}
                      onChange={handleChange}
                      className={cn(
                        "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                        "border-blush/20 bg-white/80 py-2.5",
                        errors.zipCode ? "border-red-500" : ""
                      )}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Delivery Date */}
            <div>
              <div className="flex items-center mb-1">
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-deepbrown">
                  Delivery Date
                </label>
                <div className="relative ml-2 group">
                  <Info className="h-4 w-4 text-hotpink/70" />
                  <div className="hidden group-hover:block absolute z-10 top-full left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg w-64 text-xs text-gray-600 mt-1">
                    {getLeadTimeDescription()}
                  </div>
                </div>
              </div>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                min={minDateString}
                value={formData.deliveryDate || ''}
                onChange={handleChange}
                className={cn(
                  "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                  "border-blush/20 bg-white/80 py-2.5",
                  errors.deliveryDate ? "border-red-500" : ""
                )}
              />
              {errors.deliveryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Based on your order, earliest available delivery: {minDate.toLocaleDateString()}
              </p>
            </div>

            {/* Delivery Time */}
            <div>
              <label htmlFor="deliveryTime" className="block text-sm font-medium text-deepbrown mb-1">
                Delivery Time
              </label>
              <select
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime || ''}
                onChange={handleChange}
                className={cn(
                  "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                  "border-blush/20 bg-white/80 py-2.5",
                  errors.deliveryTime ? "border-red-500" : ""
                )}
              >
                <option value="">Select a time</option>
                {deliveryTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.deliveryTime && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryTime}</p>
              )}
            </div>
            
            {/* Always show delivery instructions */}
            <div>
              <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-deepbrown mb-1">
                Delivery Instructions (optional)
              </label>
              <textarea
                id="deliveryInstructions"
                name="deliveryInstructions"
                rows={3}
                value={formData.deliveryInstructions || ''}
                onChange={handleChange}
                placeholder="E.g., gate code, where to leave the order, etc."
                className="block w-full rounded-md border-blush/20 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm bg-white/80 py-2.5"
              />
            </div>
          </>
        ) : (
          <>
            {/* Pickup Date */}
            <div>
              <div className="flex items-center mb-1">
                <label htmlFor="pickupDate" className="block text-sm font-medium text-deepbrown">
                  Pickup Date
                </label>
                <div className="relative ml-2 group">
                  <Info className="h-4 w-4 text-hotpink/70" />
                  <div className="hidden group-hover:block absolute z-10 top-full left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg w-64 text-xs text-gray-600 mt-1">
                    {getLeadTimeDescription()}
                  </div>
                </div>
              </div>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                min={minDateString}
                value={formData.pickupDate || ''}
                onChange={handleChange}
                className={cn(
                  "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                  "border-blush/20 bg-white/80 py-2.5",
                  errors.pickupDate ? "border-red-500" : ""
                )}
              />
              {errors.pickupDate && (
                <p className="mt-1 text-sm text-red-600">{errors.pickupDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Based on your order, earliest available pickup: {minDate.toLocaleDateString()}
              </p>
            </div>

            {/* Pickup Time */}
            <div>
              <label htmlFor="pickupTime" className="block text-sm font-medium text-deepbrown mb-1">
                Pickup Time
              </label>
              <select
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime || ''}
                onChange={handleChange}
                className={cn(
                  "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                  "border-blush/20 bg-white/80 py-2.5",
                  errors.pickupTime ? "border-red-500" : ""
                )}
              >
                <option value="">Select a time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.pickupTime && (
                <p className="mt-1 text-sm text-red-600">{errors.pickupTime}</p>
              )}
            </div>

            <div className="bg-blush/5 rounded-md p-4 mt-4">
              <h3 className="text-sm font-medium text-deepbrown">Pickup Information</h3>
              <p className="text-sm text-deepbrown/70 mt-1">
                Your order will be available for pickup at our store located at:<br />
                <strong>123 Bakery Street, New York, NY 10001</strong>
              </p>
              <p className="text-sm text-deepbrown/70 mt-3">
                Please bring your order confirmation and ID when picking up your order.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="py-3 px-4 bg-white text-deepbrown border border-blush/20 rounded-md font-medium hover:bg-warmgray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="py-3 px-8 bg-hotpink text-white rounded-md font-medium hover:bg-hotpink/90 transition-colors shadow-sm"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryOptionsForm; 