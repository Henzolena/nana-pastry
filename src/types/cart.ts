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
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART'; payload?: boolean }; // optional boolean to force open/close

export interface CartContextType {
  state: CartState;
  addItem: (cake: Cake, size: CakeSize, quantity: number, specialInstructions?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (forceState?: boolean) => void;
} 