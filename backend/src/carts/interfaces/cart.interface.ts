export interface CakeSize {
  label: string;
  price: number;
  description?: string;
}

export interface Customization {
  selectedCakeId: string;
  flavor: string;
  filling: string;
  frosting: string;
  shape: string;
  dietaryOption: string;
  addons: string[];
  specialInstructions: string;
}

export interface CartItem {
  id: string;
  cakeId: string;
  name: string;
  price: number;
  quantity: number;
  size: CakeSize;
  image: string;
  specialInstructions?: string;
  isCustomizable?: boolean;
  customizations?: Customization;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  isOpen: boolean;
  lastSynced?: any; // Firebase Timestamp
  lastUpdated?: any; // Firebase Timestamp
}
