import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/services/userService';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  saveInfo: boolean;
}

interface CustomerInfoFormProps {
  initialData?: CustomerInfo;
  onSubmit: (data: CustomerInfo) => void;
}

const defaultFormData: CustomerInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  saveInfo: true,
};

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ initialData, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CustomerInfo>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [,setLoadingProfile] = useState(false);

  // Fetch user profile data when component mounts if user is logged in
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;
      
      try {
        setLoadingProfile(true);
        const userProfileData = await getUserProfile(user.uid);
        
        if (userProfileData) {
          // If we have profile data, update the form
          let firstName = '';
          let lastName = '';
          
          // Handle case where displayName might be in "First Last" format
          if (userProfileData.displayName) {
            const nameParts = userProfileData.displayName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          } else if (user.displayName) {
            const nameParts = user.displayName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          setFormData(prevData => ({
            ...prevData,
            firstName: prevData.firstName || firstName,
            lastName: prevData.lastName || lastName,
            email: prevData.email || userProfileData.email || user.email || '',
            phone: prevData.phone || userProfileData.phone || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    
    // Only fetch if user is logged in and we don't already have initial data
    if (user && !initialData) {
      fetchUserProfile();
    }
  }, [user, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof CustomerInfo]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid (must be 10 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      
      // Save to localStorage if saveInfo is checked
      if (formData.saveInfo) {
        localStorage.setItem('customerInfo', JSON.stringify(formData));
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-medium mb-6 text-deepbrown">Customer Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-deepbrown mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={cn(
                "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                "border-blush/20 bg-white/80 py-2.5",
                errors.firstName ? "border-red-500" : ""
              )}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-deepbrown mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={cn(
                "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                "border-blush/20 bg-white/80 py-2.5",
                errors.lastName ? "border-red-500" : ""
              )}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-deepbrown mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={cn(
              "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
              "border-blush/20 bg-white/80 py-2.5",
              errors.email ? "border-red-500" : ""
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-deepbrown mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(123) 456-7890"
            className={cn(
              "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
              "border-blush/20 bg-white/80 py-2.5",
              errors.phone ? "border-red-500" : ""
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Save Info Checkbox */}
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="saveInfo"
            name="saveInfo"
            checked={formData.saveInfo}
            onChange={handleChange}
            className="h-4 w-4 text-hotpink focus:ring-hotpink border-blush/20 rounded"
          />
          <label htmlFor="saveInfo" className="ml-2 block text-sm text-deepbrown">
            Save this information for next time
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-hotpink text-white rounded-md font-medium hover:bg-hotpink/90 transition-colors shadow-sm"
          >
            Continue to Delivery
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerInfoForm; 