import { firestore } from 'firebase-admin';
import { CakeCategory } from '../dto/create-cake.dto';

export interface CakeSize {
  label: string;
  servings: number;
  price: number;
  priceModifier?: number;
}

export interface Cake {
  id: string;
  name: string;
  category: CakeCategory;
  description: string;
  price: number;
  images: string[];
  isAvailable: boolean;
  bakerId?: string;
  featured: boolean;
  ingredients?: string[];
  allergens?: string[];
  sizes?: CakeSize[];
  createdAt?: Date | firestore.Timestamp | null;
  updatedAt?: Date | firestore.Timestamp | null;
}
