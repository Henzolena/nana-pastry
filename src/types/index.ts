export interface Cake {
  id: string;
  name: string;
  category: CakeCategory;
  description: string;
  price: number;
  images: string[];
  featured: boolean;
  ingredients?: string[];
  baseIngredients?: string[];
  flavors?: string[];
  baseFlavor?: string;
  fillings?: string[];
  frostings?: string[];
  allergens?: string[];
  sizes?: CakeSize[];
}

export type CakeCategory = 
  | 'birthday'
  | 'wedding'
  | 'celebration'
  | 'cupcakes'
  | 'seasonal'
  | 'custom'
  | 'other';

export interface CakeSize {
  label: string;
  servings: number;
  price: number;
  priceModifier?: number;
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

export interface CompanyInfo {
  name: string;
  foundedYear: number;
  tagline: string;
  logo: string;
  mission: string;
  vision: string;
}

export interface AboutSection {
  id: string;
  title: string;
  content: string;
  image: string;
}

export interface ContactInfo {
  name?: string;
  address: string;
  email: string;
  phone: string;
  mapLocation: { 
    lat: number; 
    lng: number; 
  };
}

export interface ServiceInfo {
  deliveryRadius?: number;
  deliveryFees?: string;
  setupService?: boolean;
  setupFees?: string;
  orderLeadTime?: string;
  depositAmount?: string;
  cancellationPolicy?: string;
}

export interface PickupInfo {
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  address?: string;
}

export interface BusinessHours {
  [day: string]: {
    open: string;
    close: string;
  };
  monday: { open: string; close: string; };
  tuesday: { open: string; close: string; };
  wednesday: { open: string; close: string; };
  thursday: { open: string; close: string; };
  friday: { open: string; close: string; };
  saturday: { open: string; close: string; };
  sunday: { open: string; close: string; };
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    backgroundImage: string;
  };
  featuredCategories: {
    title: string;
    description: string;
    image: string;
    link: string;
  }[];
} 