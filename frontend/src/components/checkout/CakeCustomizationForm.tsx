import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { 
  availableFlavors, 
  availableFillings, 
  availableFrostings, 
  availableShapes,
  dietaryOptions,
  cakeAddons,
  cakes
} from '@/utils/data';
import { Check, Info, AlertCircle } from 'lucide-react';
import { Cake } from '@/types';

export interface CustomizationOptions {
  selectedCakeId?: string; // ID of the selected cake
  flavor: string;
  filling: string;
  frosting: string;
  shape: string;
  dietaryOption?: 'standard' | 'glutenFree' | 'vegan' | 'nutFree' | 'sugarFree';
  addons: string[];
  specialInstructions?: string;
}

interface CakeCustomizationFormProps {
  initialData?: CustomizationOptions;
  onSubmit: (data: CustomizationOptions) => void;
  onBack: () => void;
  showCakeSelection?: boolean; // Controls whether to show cake selection dropdown
}

const defaultFormData: CustomizationOptions = {
  selectedCakeId: '',
  flavor: '',
  filling: '',
  frosting: '',
  shape: 'Round',
  dietaryOption: 'standard',
  addons: [],
  specialInstructions: '',
};

const CakeCustomizationForm: React.FC<CakeCustomizationFormProps> = ({
  initialData,
  onSubmit,
  onBack,
  showCakeSelection = true // Default to showing cake selection
}) => {
  // Log the showCakeSelection prop to debug
  console.log("CakeCustomizationForm debug: showCakeSelection =", showCakeSelection, "type:", typeof showCakeSelection);

  const [formData, setFormData] = useState<CustomizationOptions>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CustomizationOptions, string>>>({});
  const [warnings, setWarnings] = useState<{ flavor?: boolean }>({});
  const [selectedCake, setSelectedCake] = useState<Cake | undefined>(
    formData.selectedCakeId ? cakes.find(cake => cake.id === formData.selectedCakeId) : undefined
  );

  // When the selected cake changes, update form values
  useEffect(() => {
    if (selectedCake) {
      setFormData(prev => ({
        ...prev,
        flavor: prev.flavor || selectedCake.baseFlavor || '',
        shape: prev.shape || 'Round', // Keep existing shape or set default
      }));
    } else if (!showCakeSelection) {
      // If cake selection is hidden but no cake is selected,
      // this means we're in checkout with items in cart
      // Display a clearer message about flavor selection
      setErrors(prev => ({
        ...prev,
        flavor: 'Please select a flavor for your cake'
      }));
    }
  }, [selectedCake, showCakeSelection]);

  // When selectedCakeId changes, update the selectedCake
  useEffect(() => {
    if (formData.selectedCakeId) {
      const cake = cakes.find(cake => cake.id === formData.selectedCakeId);
      setSelectedCake(cake);
    } else {
      setSelectedCake(undefined);
    }
  }, [formData.selectedCakeId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Check for warnings when changing flavor
    if (name === 'flavor' && selectedCake && selectedCake.baseFlavor) {
      if (value !== selectedCake.baseFlavor) {
        setWarnings(prev => ({ ...prev, flavor: true }));
      } else {
        setWarnings(prev => ({ ...prev, flavor: false }));
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name as keyof CustomizationOptions]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCakeSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cakeId = e.target.value;
    const cake = cakes.find(c => c.id === cakeId);
    
    setFormData(prev => ({
      ...prev,
      selectedCakeId: cakeId,
      flavor: cake?.baseFlavor || '',
      // Reset warnings
      // Keep other customizations
    }));
    
    setWarnings({});
  };

  const handleAddonToggle = (addon: string) => {
    setFormData((prev) => {
      const addons = prev.addons.includes(addon)
        ? prev.addons.filter((a) => a !== addon)
        : [...prev.addons, addon];
      
      return { ...prev, addons };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomizationOptions, string>> = {};
    
    if (showCakeSelection === true && !formData.selectedCakeId) {
      newErrors.selectedCakeId = 'Please select a cake';
    }
    if (!formData.flavor) {
      newErrors.flavor = 'Please select a flavor';
    }
    if (!formData.filling) {
      newErrors.filling = 'Please select a filling';
    }
    if (!formData.frosting) {
      newErrors.frosting = 'Please select a frosting';
    }
    if (!formData.shape) {
      newErrors.shape = 'Please select a shape';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Show confirmation if there are warnings
      if (Object.values(warnings).some(warning => warning)) {
        const userConfirmed = window.confirm(
          "You've modified some of the cake's base characteristics. This may change the cake's signature taste. Would you like to continue?"
        );
        if (!userConfirmed) {
          return;
        }
      }
      onSubmit(formData);
    }
  };

  // Filter flavors based on dietary option
  const getAvailableFlavors = (): string[] => {
    if (formData.dietaryOption === 'glutenFree' && dietaryOptions.glutenFree) {
      return dietaryOptions.glutenFree.flavors;
    } else if (formData.dietaryOption === 'vegan' && dietaryOptions.vegan) {
      return dietaryOptions.vegan.flavors;
    } else if (formData.dietaryOption === 'sugarFree' && dietaryOptions.sugarFree) {
      return dietaryOptions.sugarFree.flavors;
    }
    return availableFlavors;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        {!showCakeSelection && (
          <p className="text-sm text-warmgray-500 mb-6">
            Customize your cake with your preferred flavors, fillings, and more.
          </p>
        )}

        {/* Cake Selection - only show if showCakeSelection is true */}
        {showCakeSelection === true && (
          <div className="mb-6">
            <label htmlFor="selectedCakeId" className="block text-sm font-medium text-deepbrown mb-2">
              Select a Cake <span className="text-hotpink">*</span>
            </label>
            <select
              id="selectedCakeId"
              name="selectedCakeId"
              value={formData.selectedCakeId || ''}
              onChange={handleCakeSelection}
              className={cn(
                "block w-full rounded-md border-warmgray-200 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm py-2.5",
                errors.selectedCakeId ? "border-red-300" : ""
              )}
            >
              <option value="">Select a cake</option>
              {cakes.map((cake) => (
                <option key={cake.id} value={cake.id}>
                  {cake.name}
                </option>
              ))}
            </select>
            {errors.selectedCakeId && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedCakeId}</p>
            )}
          </div>
        )}

        {/* Display selected cake info */}
        {selectedCake && (
          <div className="mb-6 p-4 bg-warmgray-50 rounded-md">
            <h3 className="text-lg font-medium text-deepbrown mb-2">{selectedCake.name}</h3>
            <p className="text-sm text-warmgray-600 mb-3">{selectedCake.description}</p>
            {!showCakeSelection && (
              <p className="text-sm font-medium text-hotpink mb-3">
                You're customizing the cake you selected. If you'd like to choose a different cake, please return to the products page.
              </p>
            )}
            {selectedCake.baseIngredients && selectedCake.baseIngredients.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium text-deepbrown">Base Ingredients: </span>
                <span className="text-sm text-warmgray-600">
                  {selectedCake.baseIngredients.join(', ')}
                </span>
              </div>
            )}
            <div className="text-xs text-rosepink">
              Note: Changing core ingredients may alter the cake's signature taste
            </div>
          </div>
        )}
        
        {/* Message for when the user has cakes in cart */}
        {!showCakeSelection && !selectedCake && (
          <div className="mb-6 p-4 bg-warmgray-50 rounded-md border-l-4 border-hotpink">
            <h3 className="text-lg font-medium text-deepbrown mb-2">Customizing Checkout Order</h3>
            <p className="text-sm text-warmgray-600">
              You already have items in your cart. Please continue by customizing your order with your preferred flavors, fillings, and frostings.
            </p>
            <p className="text-sm font-medium text-hotpink mt-2">
              To select a different cake, please return to the products page.
            </p>
          </div>
        )}

        {/* Dietary Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-deepbrown mb-2">
            Dietary Requirements
            <span className="ml-1 text-hotpink font-normal">
              (affects available flavors and pricing)
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className={cn(
              "relative flex items-center p-3 rounded-md border transition-all",
              formData.dietaryOption === 'standard' 
                ? "border-hotpink bg-pink-50/30 text-deepbrown"
                : "border-warmgray-200 hover:border-hotpink/50"
            )}>
              <input
                type="radio"
                name="dietaryOption"
                value="standard"
                checked={formData.dietaryOption === 'standard'}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="flex-1">Standard</span>
              {formData.dietaryOption === 'standard' && (
                <Check className="h-5 w-5 text-hotpink" />
              )}
            </label>
            
            {dietaryOptions.glutenFree.available && (
              <label className={cn(
                "relative flex items-center p-3 rounded-md border transition-all",
                formData.dietaryOption === 'glutenFree' 
                  ? "border-hotpink bg-pink-50/30 text-deepbrown"
                  : "border-warmgray-200 hover:border-hotpink/50"
              )}>
                <input
                  type="radio"
                  name="dietaryOption"
                  value="glutenFree"
                  checked={formData.dietaryOption === 'glutenFree'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="flex-1">Gluten Free</span>
                <span className="text-xs text-hotpink whitespace-nowrap">
                  {dietaryOptions.glutenFree.priceAdjustment}
                </span>
                {formData.dietaryOption === 'glutenFree' && (
                  <Check className="ml-2 h-5 w-5 text-hotpink" />
                )}
              </label>
            )}
            
            {dietaryOptions.vegan.available && (
              <label className={cn(
                "relative flex items-center p-3 rounded-md border transition-all",
                formData.dietaryOption === 'vegan' 
                  ? "border-hotpink bg-pink-50/30 text-deepbrown"
                  : "border-warmgray-200 hover:border-hotpink/50"
              )}>
                <input
                  type="radio"
                  name="dietaryOption"
                  value="vegan"
                  checked={formData.dietaryOption === 'vegan'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="flex-1">Vegan</span>
                <span className="text-xs text-hotpink whitespace-nowrap">
                  {dietaryOptions.vegan.priceAdjustment}
                </span>
                {formData.dietaryOption === 'vegan' && (
                  <Check className="ml-2 h-5 w-5 text-hotpink" />
                )}
              </label>
            )}
            
            {dietaryOptions.nutFree.available && (
              <label className={cn(
                "relative flex items-center p-3 rounded-md border transition-all",
                formData.dietaryOption === 'nutFree' 
                  ? "border-hotpink bg-pink-50/30 text-deepbrown"
                  : "border-warmgray-200 hover:border-hotpink/50"
              )}>
                <input
                  type="radio"
                  name="dietaryOption"
                  value="nutFree"
                  checked={formData.dietaryOption === 'nutFree'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="flex-1">Nut Free</span>
                {formData.dietaryOption === 'nutFree' && (
                  <Check className="h-5 w-5 text-hotpink" />
                )}
              </label>
            )}
            
            {dietaryOptions.sugarFree.available && (
              <label className={cn(
                "relative flex items-center p-3 rounded-md border transition-all",
                formData.dietaryOption === 'sugarFree' 
                  ? "border-hotpink bg-pink-50/30 text-deepbrown"
                  : "border-warmgray-200 hover:border-hotpink/50"
              )}>
                <input
                  type="radio"
                  name="dietaryOption"
                  value="sugarFree"
                  checked={formData.dietaryOption === 'sugarFree'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="flex-1">Sugar Free</span>
                <span className="text-xs text-hotpink whitespace-nowrap">
                  {dietaryOptions.sugarFree.priceAdjustment}
                </span>
                {formData.dietaryOption === 'sugarFree' && (
                  <Check className="ml-2 h-5 w-5 text-hotpink" />
                )}
              </label>
            )}
          </div>
        </div>

        {/* Cake Flavor */}
        <div className="mb-6">
          <label htmlFor="flavor" className="block text-sm font-medium text-deepbrown mb-2">
            Cake Flavor <span className="text-hotpink">*</span>
            {selectedCake?.baseFlavor && (
              <span className="ml-1 text-xs text-warmgray-500">
                (Original: {selectedCake.baseFlavor})
              </span>
            )}
          </label>
          <div className="relative">
            <select
              id="flavor"
              name="flavor"
              value={formData.flavor || ''}
              onChange={handleChange}
              className={cn(
                "block w-full rounded-md border-warmgray-200 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm py-2.5",
                warnings.flavor ? "border-amber-300" : "",
                errors.flavor ? "border-red-300" : ""
              )}
            >
              <option value="">Select a flavor</option>
              {getAvailableFlavors().map((flavor) => (
                <option 
                  key={flavor} 
                  value={flavor}
                  className={selectedCake?.baseFlavor === flavor ? "font-semibold" : ""}
                >
                  {flavor} {selectedCake?.baseFlavor === flavor ? "- Original" : ""}
                </option>
              ))}
            </select>
            {warnings.flavor && (
              <div className="absolute right-0 top-0 mr-2 mt-2.5">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            )}
          </div>
          {warnings.flavor && (
            <p className="mt-1 text-sm text-amber-600">
              Changing the base flavor may alter this cake's signature taste.
            </p>
          )}
          {errors.flavor && (
            <p className="mt-1 text-sm text-red-600">{errors.flavor}</p>
          )}
        </div>

        {/* Cake Filling */}
        <div className="mb-6">
          <label htmlFor="filling" className="block text-sm font-medium text-deepbrown mb-2">
            Filling <span className="text-hotpink">*</span>
          </label>
          <select
            id="filling"
            name="filling"
            value={formData.filling || ''}
            onChange={handleChange}
            className={cn(
              "block w-full rounded-md border-warmgray-200 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm py-2.5",
              errors.filling ? "border-red-300" : ""
            )}
          >
            <option value="">Select a filling</option>
            {availableFillings.map((filling) => (
              <option key={filling} value={filling}>
                {filling}
              </option>
            ))}
          </select>
          {errors.filling && (
            <p className="mt-1 text-sm text-red-600">{errors.filling}</p>
          )}
        </div>

        {/* Cake Frosting */}
        <div className="mb-6">
          <label htmlFor="frosting" className="block text-sm font-medium text-deepbrown mb-2">
            Frosting <span className="text-hotpink">*</span>
          </label>
          <select
            id="frosting"
            name="frosting"
            value={formData.frosting || ''}
            onChange={handleChange}
            className={cn(
              "block w-full rounded-md border-warmgray-200 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm py-2.5",
              errors.frosting ? "border-red-300" : ""
            )}
          >
            <option value="">Select a frosting</option>
            {availableFrostings.map((frosting) => (
              <option key={frosting} value={frosting}>
                {frosting}
              </option>
            ))}
          </select>
          {errors.frosting && (
            <p className="mt-1 text-sm text-red-600">{errors.frosting}</p>
          )}
        </div>

        {/* Cake Shape */}
        <div className="mb-6">
          <label htmlFor="shape" className="block text-sm font-medium text-deepbrown mb-2">
            Cake Shape <span className="text-hotpink">*</span>
          </label>
          <select
            id="shape"
            name="shape"
            value={formData.shape || ''}
            onChange={handleChange}
            className={cn(
              "block w-full rounded-md border-warmgray-200 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm py-2.5",
              errors.shape ? "border-red-300" : ""
            )}
          >
            <option value="">Select a shape</option>
            {availableShapes.map((shape) => (
              <option key={shape} value={shape}>
                {shape}
              </option>
            ))}
          </select>
          {errors.shape && (
            <p className="mt-1 text-sm text-red-600">{errors.shape}</p>
          )}
        </div>

        {/* Cake Add-ons */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <label className="text-sm font-medium text-deepbrown">
              Add-ons (Optional)
            </label>
            <div className="relative group ml-1">
              <Info className="w-4 h-4 text-rosepink/70" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white p-2 rounded-md shadow-md text-xs text-warmgray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                These options may affect the final price
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cakeAddons.map((addon) => (
              <label 
                key={addon.name}
                className={cn(
                  "flex justify-between items-center p-3 border rounded-md transition-all cursor-pointer",
                  formData.addons.includes(addon.name)
                    ? "border-hotpink bg-pink-50/30"
                    : "border-warmgray-200 hover:border-hotpink/50"
                )}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.addons.includes(addon.name)}
                    onChange={() => handleAddonToggle(addon.name)}
                    className="h-4 w-4 text-hotpink border-warmgray-300 rounded focus:ring-hotpink"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-deepbrown">{addon.name}</span>
                    <span className="block text-xs text-warmgray-500">{addon.description}</span>
                  </div>
                </div>
                <span className="text-sm text-hotpink font-medium">
                  {typeof addon.price === 'number' ? `$${addon.price.toFixed(2)}` : addon.price}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="mb-6">
          <label htmlFor="specialInstructions" className="block text-sm font-medium text-deepbrown mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            rows={3}
            value={formData.specialInstructions || ''}
            onChange={handleChange}
            placeholder="Any special requests or design instructions"
            className="block w-full rounded-md border-warmgray-200 shadow-sm focus:border-hotpink focus:ring-hotpink sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-blush text-deepbrown rounded-md hover:bg-blush/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-hotpink text-white rounded-md hover:bg-hotpink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default CakeCustomizationForm; 