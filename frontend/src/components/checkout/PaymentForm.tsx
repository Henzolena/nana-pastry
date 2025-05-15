import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { CreditCard, Lock } from 'lucide-react';

export interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  billingAddressSameAsShipping: boolean;
}

interface PaymentFormProps {
  initialData?: PaymentInfo;
  onSubmit: (data: PaymentInfo) => void;
  onBack: () => void;
}

const defaultFormData: PaymentInfo = {
  cardNumber: '',
  cardholderName: '',
  expiryDate: '',
  cvv: '',
  billingAddressSameAsShipping: true,
};

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  initialData, 
  onSubmit, 
  onBack 
}) => {
  const [formData, setFormData] = useState<PaymentInfo>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentInfo, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Clear error when field is edited
    if (errors[name as keyof PaymentInfo]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    
    return groups.join(' ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\s/g, '');
    const formattedValue = formatCardNumber(rawValue);
    
    e.target.value = formattedValue;
    handleChange(e);
  };

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits;
    }
    
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\//g, '');
    const formattedValue = formatExpiryDate(rawValue);
    
    e.target.value = formattedValue;
    handleChange(e);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentInfo, string>> = {};
    
    // Card number validation (16 digits)
    const cardNumberDigits = formData.cardNumber.replace(/\D/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumberDigits.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    // Expiry date validation (MM/YY format)
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d\d\/\d\d$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Use MM/YY format';
    } else {
      const [month, year] = formData.expiryDate.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    // CVV validation (3-4 digits)
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
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

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-medium mb-6 text-deepbrown">Payment Information</h2>
      
      <div className="bg-blush/5 rounded-md p-4 mb-6">
        <div className="flex items-center text-deepbrown">
          <Lock size={16} className="mr-2" />
          <p className="text-sm">Your payment information is encrypted and secure</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Credit Card Input with Icon */}
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-deepbrown mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxLength={19} // 16 digits + 3 spaces
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              className={cn(
                "block w-full pl-10 rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                "border-blush/20 bg-white/80 py-2.5",
                errors.cardNumber ? "border-red-500" : ""
              )}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <CreditCard size={16} className="text-gray-400" />
            </div>
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-deepbrown mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            placeholder="As shown on card"
            value={formData.cardholderName}
            onChange={handleChange}
            className={cn(
              "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
              "border-blush/20 bg-white/80 py-2.5",
              errors.cardholderName ? "border-red-500" : ""
            )}
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
          )}
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-deepbrown mb-1">
              Expiry Date (MM/YY)
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              placeholder="MM/YY"
              maxLength={5} // MM/YY
              value={formData.expiryDate}
              onChange={handleExpiryDateChange}
              className={cn(
                "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                "border-blush/20 bg-white/80 py-2.5",
                errors.expiryDate ? "border-red-500" : ""
              )}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-deepbrown mb-1">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              placeholder="123"
              maxLength={4}
              value={formData.cvv}
              onChange={handleChange}
              className={cn(
                "block w-full rounded-md shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                "border-blush/20 bg-white/80 py-2.5",
                errors.cvv ? "border-red-500" : ""
              )}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Same as shipping checkbox */}
        <div className="mt-4">
          <div className="flex items-center">
            <input
              id="billingAddressSameAsShipping"
              name="billingAddressSameAsShipping"
              type="checkbox"
              checked={formData.billingAddressSameAsShipping}
              onChange={handleChange}
              className="h-4 w-4 text-hotpink focus:ring-hotpink border-blush/20 rounded"
            />
            <label htmlFor="billingAddressSameAsShipping" className="ml-2 block text-sm text-deepbrown">
              Billing address is the same as shipping address
            </label>
          </div>
        </div>

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
            Complete Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 