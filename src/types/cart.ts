import { Cake, CakeSize } from '.';

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
  customizations?: {
    selectedCakeId: string;
    flavor: string;
    filling: string;
    frosting: string;
    shape: string;
    dietaryOption: string;
    addons: string[];
    specialInstructions: string;
  };
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  isOpen: boolean;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string } // id of the item to remove
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_ITEM_CUSTOMIZATIONS'; payload: { id: string; customizations: CartItem['customizations'] } }
  | { type: 'CLEAR_CART' }
  | { type: 'REPLACE_CART'; payload: CartState }
  | { type: 'TOGGLE_CART'; payload?: boolean }; // optional boolean to force open/close

export interface CartContextType {
  state: CartState;
  addItem: (cake: Cake, size: CakeSize, quantity: number, specialInstructions?: string) => void;
  addCustomItem: (cake: Cake, size: CakeSize, quantity: number, customizations: CartItem['customizations']) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemCustomizations: (id: string, customizations: CartItem['customizations']) => void;
  clearCart: () => void;
  toggleCart: (forceState?: boolean) => void;
}