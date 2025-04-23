import { Cake, TestimonialType, FaqType, TeamMember, CompanyInfo, AboutSection, ContactInfo, ServiceInfo, BusinessHours, ProcessStep, HomePageContent, SocialLink } from '@/types';

// Company Information
export const companyInfo: CompanyInfo = {
  name: "Nana Pastry",
  foundedYear: 2020,
  tagline: "Crafting Sweet Memories, One Bite at a Time",
  logo: "/images/cakes/logo.png",
  mission: "Our mission is to bring joy to our customers through exceptional baked goods, made with love and care. We value quality, creativity, and customer satisfaction above all else.",
  vision: "To be the premier destination for custom cakes, known for our exceptional creativity, quality ingredients, and personalized service."
};

// About Page Sections
export const aboutSections: AboutSection[] = [
  {
    id: "our-journey",
    title: "Our Journey",
    content: "Nana Pastry began as a small home-based bakery, inspired by a passion for creating delicious and beautifully crafted desserts. Our journey is rooted in a love for baking and a commitment to quality. Established in 2020, we've been dedicated to bringing joy through our creations ever since.",
    image: "/images/cakes/about-our-journey.webp"
  },
  {
    id: "our-approach",
    title: "Our Approach",
    content: "At Nana Pastry, we believe that every cake should be as unique as the occasion it celebrates. Our pastries feel like home, with a natural taste that brings comfort and joy to every bite. We use high-quality, natural ingredients to create treats that are both delicious and wholesome.",
    image: "/images/cakes/about-our-approach.webp"
  },
  {
    id: "our-commitment",
    title: "Our Commitment",
    content: "We're committed to quality in everything we do. From sourcing the freshest ingredients to ensuring timely delivery, we maintain the highest standards at every step. We believe in creating pastries that not only look beautiful but taste exceptional as well.",
    image: "/images/cakes/about-our-commitment.png"
  }
];

// Contact Information
export const contactInfo: ContactInfo = {
  address: "To be provided",
  email: "nanapastry263@gmail.com",
  phone: "512-698-8086",
  mapLocation: {
    lat: 30.267153,
    lng: -97.743057
  }
};

// Social Media Links
export const socialMediaLinks: SocialLink[] = [
  { platform: "instagram", url: "https://www.instagram.com/nana.47784?igsh=MTM0dDk1cDYyYWdvZg==" },
  { platform: "twitter", url: "https://x.com/NanaPastry?t=lVMmlbevfRoPvN85qcCRXA&s=01" },
  { platform: "pinterest", url: "https://pin.it/66N4Fyw5K" }
];

// Business Hours
export const businessHours: BusinessHours = {
  monday: { open: "9:00 AM", close: "6:00 PM" },
  tuesday: { open: "9:00 AM", close: "6:00 PM" },
  wednesday: { open: "9:00 AM", close: "6:00 PM" },
  thursday: { open: "9:00 AM", close: "6:00 PM" },
  friday: { open: "9:00 AM", close: "6:00 PM" },
  saturday: { open: "10:00 AM", close: "4:00 PM" },
  sunday: { open: "Closed", close: "Closed" }
};

// Service Information
export const serviceInfo: ServiceInfo = {
  deliveryRadius: 20,
  deliveryFees: "From $10 - $20 depending on distance",
  setupService: true,
  setupFees: "Starting at $25 for weddings and large events",
  orderLeadTime: "1-2 weeks for custom cakes, 48 hours for standard orders",
  depositAmount: "25% of total order"
};

// Cake Design Process
export const designProcess: ProcessStep[] = [
  {
    step: 1,
    title: "Initial Consultation",
    description: "We'll discuss your cake vision, preferences, event details, and requirements."
  },
  {
    step: 2,
    title: "Design Proposal",
    description: "Our cake artists will create a custom design concept based on your ideas."
  },
  {
    step: 3,
    title: "Tasting & Refinement",
    description: "Sample flavors and refine the design until it perfectly matches your vision."
  },
  {
    step: 4,
    title: "Finalization",
    description: "Confirm all details and place your order with a deposit to secure your date."
  },
  {
    step: 5,
    title: "Creation & Delivery",
    description: "Our pastry chefs craft your cake with care and deliver it to your venue."
  }
];

// Homepage Content
export const homeContent: HomePageContent = {
  hero: {
    title: "Custom Cakes for Your Special Moments",
    subtitle: "Handcrafted with love and creativity",
    description: "From birthdays to weddings, our custom cakes are designed to make your celebration unforgettable.",
    buttonText: "Order Your Cake",
    buttonLink: "/request-custom-design",
    image: "images/cakes/hero-bg.jpg",
    backgroundImage: "images/cakes/hero-image.webp"
  },
  featuredCategories: [
    {
      title: "Wedding Cakes",
      description: "Elegant multi-tiered masterpieces for your perfect day",
      image: "/src/assets/images/wedding-cakes.jpg",
      link: "/products?category=wedding"
    },
    {
      title: "Birthday Cakes",
      description: "Festive cakes to celebrate another year of joy",
      image: "/src/assets/images/birthday-cakes.jpg",
      link: "/products?category=birthday"
    },
    {
      title: "Custom Creations",
      description: "Unique designs tailored to your special occasion",
      image: "/src/assets/images/custom-cakes.jpg",
      link: "/request-custom-design"
    }
  ]
};

// Real cake data from client
export const cakes: Cake[] = [
  {
    id: '1',
    name: 'Vanilla Custard Birthday Cake',
    category: 'birthday',
    description: 'Delicious vanilla custard cake with personalized decorations, perfect for celebrating birthdays with custom designs based on age, interests, and preferences.',
    price: 45.00,
    images: ['/images/cakes/vanilla-custard-birthday-cake-01.png', '/images/cakes/vanilla-custard-birthday-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Vanilla extract', 'Custard'],
    flavors: ['Vanilla', 'Custard'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
      { label: '12" Round', servings: 30, priceModifier: 50 },
    ],
  },
  {
    id: '2',
    name: 'Chocolate Fudge Birthday Cake',
    category: 'birthday',
    description: 'Rich chocolate fudge cake with personalized decorations, perfect for birthday celebrations with custom designs tailored to the birthday person.',
    price: 45.00,
    images: ['/images/cakes/chocolate-fudge-birthday-cake-01.png', '/images/cakes/chocolate-fudge-birthday-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Cocoa powder', 'Chocolate fudge'],
    flavors: ['Chocolate'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
      { label: '12" Round', servings: 30, priceModifier: 50 },
    ],
  },
  {
    id: '3',
    name: 'Classic Tiered Wedding Cake',
    category: 'wedding',
    description: 'Elegant multi-tiered wedding cake with your choice of flavors and fillings, decorated in a classic style with fine details.',
    price: 350.00,
    images: ['/images/cakes/classic-tiered-wedding-cake-01.png', '/images/cakes/classic-tiered-wedding-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    flavors: ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Single-tier', servings: 20, priceModifier: 0 },
      { label: 'Two-tier', servings: 40, priceModifier: 150 },
      { label: 'Three-tier', servings: 75, priceModifier: 300 },
    ],
  },
  {
    id: '4',
    name: 'Modern Wedding Cake',
    category: 'wedding',
    description: 'Contemporary wedding cake design with clean lines and modern aesthetics, customizable to match your wedding theme and color palette.',
    price: 400.00,
    images: ['/images/cakes/modern-wedding-cake-01.png', '/images/cakes/modern-wedding-cake-02.png'],
    featured: false,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    flavors: ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Single-tier', servings: 20, priceModifier: 0 },
      { label: 'Two-tier', servings: 40, priceModifier: 150 },
      { label: 'Three-tier', servings: 75, priceModifier: 300 },
    ],
  },
  {
    id: '5',
    name: 'Anniversary Celebration Cake',
    category: 'celebration',
    description: 'Specially designed cake for anniversaries with custom toppers and elegant decorations to mark your special milestone.',
    price: 65.00,
    images: ['/images/cakes/anniversary-celebration-cake-01.png', '/images/cakes/anniversary-celebration-cake-02.png', '/images/cakes/anniversary-celebration-cake-03.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    flavors: ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Carrot'],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
      { label: '12" Round', servings: 30, priceModifier: 50 },
    ],
  },
  {
    id: '6',
    name: 'Graduation Celebration Cake',
    category: 'celebration',
    description: 'Celebrate academic achievements with our specially designed graduation cakes featuring personalized messages and school colors.',
    price: 60.00,
    images: ['/images/cakes/graduation-celebration-cake-01.png', '/images/cakes/graduation-celebration-cake-02.png'],
    featured: false,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    flavors: ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Carrot'],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
      { label: '12" Round', servings: 30, priceModifier: 50 },
    ],
  },
  {
    id: '7',
    name: 'Classic Chocolate Cupcakes',
    category: 'cupcakes',
    description: 'Delicious chocolate cupcakes topped with rich buttercream frosting, perfect for any occasion.',
    price: 36.00,
    images: ['/images/cakes/classic-chocolate-cupcakes-01.png', '/images/cakes/classic-chocolate-cupcakes-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Cocoa powder', 'Buttercream'],
    flavors: ['Chocolate'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Box of 6', servings: 6, priceModifier: 0 },
      { label: 'Box of 12', servings: 12, priceModifier: 24 },
      { label: 'Box of 24', servings: 24, priceModifier: 60 },
    ],
  },
  {
    id: '8',
    name: 'Vanilla Cupcakes',
    category: 'cupcakes',
    description: 'Light and fluffy vanilla cupcakes with creamy frosting, available in various decorative styles.',
    price: 36.00,
    images: ['/images/cakes/vanilla-cupcakes-01.png', '/images/cakes/vanilla-cupcakes-02.png'],
    featured: false,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla extract', 'Buttercream'],
    flavors: ['Vanilla'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Box of 6', servings: 6, priceModifier: 0 },
      { label: 'Box of 12', servings: 12, priceModifier: 24 },
      { label: 'Box of 24', servings: 24, priceModifier: 60 },
    ],
  },
  {
    id: '9',
    name: 'Pumpkin Spice Seasonal Cake',
    category: 'seasonal',
    description: 'Fall-inspired pumpkin spice cake with cream cheese frosting, perfect for autumn celebrations.',
    price: 62.99,
    images: ['/images/cakes/pumpkin-spice-seasonal-cake-01.png', '/images/cakes/pumpkin-spice-seasonal-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Pumpkin puree', 'Cinnamon', 'Nutmeg', 'Cloves', 'Cream cheese'],
    flavors: ['Pumpkin Spice'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
    ],
  },
  {
    id: '10',
    name: 'Fully Customized Cake',
    category: 'custom',
    description: 'Create your dream cake with fully customizable designs, flavors, fillings, and frostings. Our design process begins with a consultation to discuss your ideas.',
    price: 75.00,
    images: ['/images/cakes/fully-customized-cake-01.png', '/images/cakes/fully-customized-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Custom ingredients based on design'],
    flavors: ['Chocolate', 'Vanilla', 'Red Velvet', 'Lemon', 'Carrot', 'Custard Vanilla'],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts (optional)'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
      { label: '12" Round', servings: 30, priceModifier: 50 },
    ],
  },
];

// Sample testimonials
export const testimonials: TestimonialType[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    image: '/src/assets/images/testimonials/EmilyJohnson.jpg',
    role: 'Bride',
    testimonial: 'Our wedding cake was absolutely stunning and tasted even better than it looked! Nana Pastry exceeded all our expectations. Our guests are still talking about it months later.',
    rating: 5,
    date: '2023-05-15',
  },
  {
    id: '2',
    name: 'Michael Chen',
    image: '/src/assets/images/testimonials/MichaelChen.jpg',
    testimonial: 'I ordered a birthday cake for my wife, and it was a showstopper! The attention to detail was incredible, and the flavor was divine. Will definitely be ordering again!',
    rating: 5,
    date: '2023-06-22',
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    image: '/src/assets/images/testimonials/SophiaRodriguez.jpg',
    role: 'Event Planner',
    testimonial: 'As an event planner, I work with many bakeries, but Nana Pastry stands out for their creativity, reliability, and the exceptional quality of their cakes. Always a hit at our events!',
    rating: 5,
    date: '2023-04-10',
  },
  {
    id: '4',
    name: 'James Wilson',
    image: '/src/assets/images/testimonials/JamesWilson.jpg',
    testimonial: "The custom cake they made for my daughter's graduation was perfect. They took my vague ideas and created something beyond what I imagined. Highly recommend!",
    rating: 4,
    date: '2023-07-05',
  },
];

// Updated FAQs based on client data
export const faqs: FaqType[] = [
  {
    question: 'How far in advance should I order my cake?',
    answer: 'We recommend placing your order at least 1-2 weeks in advance for custom cakes, and 48 hours for standard orders. For wedding cakes, earlier ordering is advised.'
  },
  {
    question: 'Do you offer gluten-free options?',
    answer: "Yes! We offer gluten-free cake options available upon request. Please specify your dietary requirements when placing your order, and we'll be happy to accommodate them."
  },
  {
    question: 'What is your delivery policy?',
    answer: 'We offer delivery within a 20-mile radius of our location. Delivery fees range from $10-$20 depending on distance. For wedding and tiered cakes, we also provide setup services for an additional fee.'
  },
  {
    question: 'Can I customize the design and flavors?',
    answer: 'Absolutely! We specialize in custom cakes. You can choose from our flavor menu or request something special. Our designers will work with you to create a cake that matches your vision perfectly.'
  },
  {
    question: 'What is your deposit and cancellation policy?',
    answer: 'A 25% deposit is required to secure your order. Cancellations made more than 7 days before the event receive a full refund. Cancellations within 7 days are non-refundable.'
  },
  {
    question: 'What cake flavors and fillings do you offer?',
    answer: 'We offer a variety of flavors including chocolate, vanilla, red velvet, lemon, carrot, and custard vanilla. For fillings, we have buttercream, fruit preserves, chocolate ganache, cream cheese, and custard.'
  },
];

// Team members
export const team: TeamMember[] = [
  {
    id: '1',
    name: 'Ribka Melka',
    role: 'Head Pastry Chef & Owner',
    image: '/src/assets/images/team/RibkaMelka.jpg',
    bio: 'As the creative force behind Nana Pastry, Ribka combines artistic vision with exceptional baking skills to craft unforgettable desserts. Her passion for creating beautiful, delicious cakes is reflected in every custom creation.',
    socialLinks: [
      // Social media links temporarily hidden
      // { platform: 'instagram', url: 'https://www.instagram.com/nana.47784?igsh=MTM0dDk1cDYyYWdvZg==' },
    ],
  },
]; 