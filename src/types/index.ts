export interface Cake {
  id: string;
  name: string;
  category: CakeCategory;
  description: string;
  price: number;
  images: string[];
  featured: boolean;
  ingredients?: string[];
  flavors?: string[];
  allergens?: string[];
  sizes?: CakeSize[];
}

export type CakeCategory = 
  | 'birthday'
  | 'wedding'
  | 'celebration'
  | 'cupcakes'
  | 'seasonal'
  | 'custom';

export interface CakeSize {
  label: string;
  servings: number;
  priceModifier: number;
}

export interface TestimonialType {
  id: string;
  name: string;
  image?: string;
  role?: string;
  testimonial: string;
  rating: number;
  date: string;
}

export interface FaqType {
  question: string;
  answer: string;
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'pinterest';
  url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  socialLinks?: SocialLink[];
} 