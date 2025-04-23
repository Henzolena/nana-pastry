import React, { useState } from 'react';
import { cn } from '@/utils/cn';

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
}

interface DeliveryOptionsFormProps {
  initialData?: DeliveryInfo;
  onSubmit: (data: DeliveryInfo) => void;
  onBack: () => void;
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

const DeliveryOptionsForm: React.FC<DeliveryOptionsFormProps> = ({ 
  initialData, 
  onSubmit, 
  onBack 
}) => {
  const [formData, setFormData] = useState<DeliveryInfo>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryInfo, string>>>({});

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
    } else {
      // Pickup validation
      if (!formData.pickupDate) {
        newErrors.pickupDate = 'Pickup date is required';
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
      onSubmit(formData);
    }
  };

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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

            {/* Delivery Instructions */}
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
              <label htmlFor="pickupDate" className="block text-sm font-medium text-deepbrown mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                min={minDate}
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