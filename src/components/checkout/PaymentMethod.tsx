import React, { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { cn } from '@/utils/cn';
import { 
  CreditCard, 
  DollarSign,
  // CheckCircle2
} from 'lucide-react';

export interface PaymentInfo {
  method: 'credit-card' | 'cash';
  cardDetails?: {
    number?: string;
    name?: string;
    expiry?: string;
    cvc?: string;
  };
}

interface PaymentMethodProps {
  initialData?: PaymentInfo;
  onSubmit: (data: PaymentInfo) => void;
  onBack: () => void;
}

const defaultFormData: PaymentInfo = {
  method: 'credit-card',
  cardDetails: {
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  }
};

const PaymentMethod: React.FC<PaymentMethodProps> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<PaymentInfo>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'cardDetails') {
        setFormData((prev) => ({
          ...prev,
          cardDetails: {
            ...(prev.cardDetails ?? {}),
            [child]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value as 'credit-card' | 'cash'
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.method === 'credit-card') {
      if (!formData.cardDetails?.number) {
        newErrors['cardDetails.number'] = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardDetails.number.replace(/\s/g, ''))) {
        newErrors['cardDetails.number'] = 'Please enter a valid card number';
      }
      
      if (!formData.cardDetails?.name) {
        newErrors['cardDetails.name'] = 'Name on card is required';
      }
      
      if (!formData.cardDetails?.expiry) {
        newErrors['cardDetails.expiry'] = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardDetails.expiry)) {
        newErrors['cardDetails.expiry'] = 'Please use MM/YY format';
      }
      
      if (!formData.cardDetails?.cvc) {
        newErrors['cardDetails.cvc'] = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.cardDetails.cvc)) {
        newErrors['cardDetails.cvc'] = 'CVC must be 3 or 4 digits';
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

  // Format credit card number with spaces
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCardNumber(value);
    setFormData({
      ...formData,
      cardDetails: {
        ...formData.cardDetails!,
        number: formattedValue,
      }
    });
    
    // Clear error when field is edited
    if (errors['cardDetails.number']) {
      setErrors({ ...errors, ['cardDetails.number']: '' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-medium mb-6">Payment Method</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Options */}
        <div>
          <RadioGroup value={formData.method} onChange={method => setFormData({ ...formData, method: method as 'credit-card' | 'cash' })}>
            <RadioGroup.Label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </RadioGroup.Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioGroup.Option value="credit-card">
                {({ checked }) => (
                  <div 
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer",
                      checked ? "border-hotpink bg-hotpink/5 ring-1 ring-hotpink" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center mr-3",
                        checked ? "border-hotpink" : "border-gray-300"
                      )}>
                        {checked && <div className="w-2.5 h-2.5 rounded-full bg-hotpink" />}
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Credit Card</p>
                          <p className="text-sm text-gray-500">Pay with your credit or debit card</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </RadioGroup.Option>
              
              <RadioGroup.Option value="cash">
                {({ checked }) => (
                  <div 
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer",
                      checked ? "border-hotpink bg-hotpink/5 ring-1 ring-hotpink" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center mr-3",
                        checked ? "border-hotpink" : "border-gray-300"
                      )}>
                        {checked && <div className="w-2.5 h-2.5 rounded-full bg-hotpink" />}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Cash on Delivery/Pickup</p>
                          <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </RadioGroup.Option>
            </div>
          </RadioGroup>
        </div>
        
        {/* Credit Card Form */}
        {formData.method === 'credit-card' && (
          <div className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium">Card Details</h3>
            
            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                maxLength={19} // 16 digits + 3 spaces
                value={formData.cardDetails?.number || ''}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                  errors['cardDetails.number'] ? "border-red-500" : ""
                )}
              />
              {errors['cardDetails.number'] && (
                <p className="mt-1 text-sm text-red-600">{errors['cardDetails.number']}</p>
              )}
            </div>
            
            {/* Name on Card */}
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                id="cardName"
                name="cardDetails.name"
                value={formData.cardDetails?.name || ''}
                onChange={handleChange}
                placeholder="John Doe"
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                  errors['cardDetails.name'] ? "border-red-500" : ""
                )}
              />
              {errors['cardDetails.name'] && (
                <p className="mt-1 text-sm text-red-600">{errors['cardDetails.name']}</p>
              )}
            </div>
            
            {/* Expiry Date and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="cardExpiry"
                  name="cardDetails.expiry"
                  value={formData.cardDetails?.expiry || ''}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className={cn(
                    "block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                    errors['cardDetails.expiry'] ? "border-red-500" : ""
                  )}
                />
                {errors['cardDetails.expiry'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['cardDetails.expiry']}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  id="cardCvc"
                  name="cardDetails.cvc"
                  value={formData.cardDetails?.cvc || ''}
                  onChange={handleChange}
                  placeholder="123"
                  className={cn(
                    "block w-full rounded-md border-gray-300 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm",
                    errors['cardDetails.cvc'] ? "border-red-500" : ""
                  )}
                />
                {errors['cardDetails.cvc'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['cardDetails.cvc']}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-hotpink focus:ring-hotpink border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the terms and conditions
            </label>
            <p className="text-gray-500">
              By placing this order, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
        
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="py-3 px-4 bg-white text-deepbrown border border-blush/20 rounded-md font-medium hover:bg-warmgray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-full md:w-auto py-3 px-8 bg-hotpink text-white rounded-md font-medium hover:bg-hotpink/90 transition-colors shadow-sm"
          >
            Complete Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethod; 