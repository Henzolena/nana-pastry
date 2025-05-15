import { Cake, TestimonialType, FaqType, TeamMember, CompanyInfo, AboutSection, ContactInfo, ServiceInfo, BusinessHours, ProcessStep, HomePageContent, SocialLink, PickupInfo } from '@/types';

// --- Global Cake Details ---
export const availableFlavors: string[] = [
  'Chocolate', 'Vanilla', 'Red Velvet', 'Lemon', 'Carrot', 'Custard Vanilla', 'Marble', 'Coconut', 
  'Strawberry', 'German Chocolate', 'Funfetti', 'Banana', 'Spice', 'Coffee', 'White Chocolate',
  'Mocha', 'Peanut Butter', 'Black Forest', 'Tiramisu', 'Almond', 'Pumpkin', 'Apple Cinnamon'
];

export const availableFillings: string[] = [
  'Buttercream', 'Fruit Preserves', 'Chocolate Ganache', 'Cream Cheese', 'Custard', 'Lemon Curd',
  'Mousse', 'Caramel', 'Dulce de Leche', 'Raspberry', 'Strawberry', 'Bavarian Cream',
  'Fresh Fruit', 'Nutella', 'Marshmallow', 'Coffee Cream', 'Coconut Cream', 'Peanut Butter'
];

export const availableFrostings: string[] = [
  'Buttercream', 'Fondant', 'Whipped Cream', 'Cream Cheese', 'Chocolate Ganache', 'Royal Icing',
  'Mirror Glaze', 'Swiss Meringue', 'Italian Meringue', 'American Buttercream',
  'Caramel Drizzle', 'Fruit Glaze', 'Marzipan', 'Crushed Nuts'
];

export const availableShapes: string[] = [
  'Round', 'Square', 'Rectangle', 'Sheet', 'Heart', 'Custom Sculpted', 'Tiered', 'Hexagon', 'Oval',
  'Number/Letter', 'Novelty', 'Topsy Turvy', 'Pillow', '3D'
];

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
    content: "At Nana Pastry, we believe that every cake should be as unique as the occasion it celebrates. Our pastries feel like home, with a natural taste that brings comfort and joy to every bite. We use high-quality, natural ingredients, with organic options available upon request, to create treats that are both delicious and wholesome.",
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

// Business Hours (Assuming these are general business hours, pickup specific below)
export const businessHours: BusinessHours = {
  monday: { open: "9:00 AM", close: "6:00 PM" },
  tuesday: { open: "9:00 AM", close: "6:00 PM" },
  wednesday: { open: "9:00 AM", close: "6:00 PM" },
  thursday: { open: "9:00 AM", close: "6:00 PM" },
  friday: { open: "9:00 AM", close: "6:00 PM" },
  saturday: { open: "10:00 AM", close: "4:00 PM" },
  sunday: { open: "Closed", close: "Closed" }
};

// --- Pickup Information --- Added based on client info
export const pickupInfo: PickupInfo = {
  hours: {
    monday: "10 AM - 6 PM",
    tuesday: "10 AM - 6 PM",
    wednesday: "10 AM - 6 PM",
    thursday: "10 AM - 6 PM",
    friday: "10 AM - 6 PM",
    saturday: "9 AM - 4 PM",
    sunday: "Closed"
  },
  address: contactInfo.address
};

// Service Information - Updated based on client info
export const serviceInfo: ServiceInfo = {
  deliveryRadius: 20,
  deliveryFees: "$10 - $20 depending on distance",
  setupService: true,
  setupFees: "$25 for weddings and large events",
  orderLeadTime: "At least 1-2 weeks in advance for custom cakes, and 48 hours for standard orders.",
  depositAmount: "25% of total order",
  cancellationPolicy: "Cancellations made more than 7 days before the event receive a full refund. Cancellations within 7 days are non-refundable."
};

// Cake Design Process
export const designProcess: ProcessStep[] = [
  { step: 1, title: "Initial Consultation", description: "We'll discuss your cake vision, preferences, event details, and requirements." },
  { step: 2, title: "Design Proposal", description: "Our cake artists will create a custom design concept based on your ideas." },
  { step: 3, title: "Tasting & Refinement", description: "Sample flavors and refine the design until it perfectly matches your vision." },
  { step: 4, title: "Finalization", description: "Confirm all details and place your order with a 25% deposit to secure your date." },
  { step: 5, title: "Creation & Delivery", description: "Our pastry chefs craft your cake with care and deliver/prepare for pickup." }
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
    { title: "Wedding Cakes", description: "Elegant multi-tiered masterpieces for your perfect day", image: "/src/assets/images/wedding-cakes.jpg", link: "/products?category=wedding" },
    { title: "Birthday Cakes", description: "Festive cakes to celebrate another year of joy", image: "/src/assets/images/birthday-cakes.jpg", link: "/products?category=birthday" },
    { title: "Custom Creations", description: "Unique designs tailored to your special occasion", image: "/src/assets/images/custom-cakes.jpg", link: "/request-custom-design" }
  ]
};

// Real cake data from client - Updated based on client info & type changes
export const cakes: Cake[] = [
  {
    id: '1',
    name: 'Vanilla Custard Birthday Cake',
    category: 'birthday',
    description: 'Delicious vanilla custard cake perfect for birthdays. Custom designs based on age, interests, and preferences (e.g., cartoon characters, sports themes, elegant designs). Most popular designs include character themes for children and elegant floral designs for adults. Add-ons like edible printing, custom toppers, and themed decorations available.',
    price: 30.00,
    images: ['/images/cakes/vanilla-custard-birthday-cake-01.png', '/images/cakes/vanilla-custard-birthday-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Vanilla extract', 'Custard'],
    baseIngredients: ['Flour', 'Sugar', 'Eggs', 'Milk', 'Vanilla extract', 'Custard'],
    flavors: ['Vanilla', 'Custard', 'Chocolate', 'Red Velvet', 'Funfetti', 'Marble'],
    baseFlavor: 'Vanilla',
    fillings: ['Custard', 'Buttercream', 'Chocolate Ganache', 'Fruit Preserves'],
    frostings: ['Buttercream', 'Fondant', 'Whipped Cream'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: '6" Round', servings: 8, price: 30.00 },
      { label: '8" Round', servings: 12, price: 45.00 },
      { label: '10" Round', servings: 20, price: 60.00 },
      { label: '12" Round', servings: 30, price: 80.00 },
      { label: 'Quarter Sheet', servings: 25, price: 70.00 },
      { label: 'Half Sheet', servings: 50, price: 130.00 },
    ],
  },
  {
    id: '2',
    name: 'Chocolate Fudge Birthday Cake',
    category: 'birthday',
    description: 'Rich chocolate fudge cake with chocolate ganache. Popular options include vanilla sponge and red velvet too. Personalized decorations available including gender reveals, milestone birthdays, sports themes, and custom photo cakes. Price range $30 - $150 depending on size and complexity.',
    price: 30.00,
    images: ['/images/cakes/chocolate-fudge-birthday-cake-01.png', '/images/cakes/chocolate-fudge-birthday-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Cocoa powder', 'Chocolate fudge'],
    baseIngredients: ['Flour', 'Sugar', 'Cocoa powder', 'Chocolate fudge'],
    flavors: ['Chocolate', 'Vanilla', 'Red Velvet', 'Funfetti', 'Marble'],
    baseFlavor: 'Chocolate',
    fillings: ['Chocolate Ganache', 'Buttercream', 'Cream Cheese'],
    frostings: ['Chocolate Ganache', 'Buttercream', 'Fondant'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: '6" Round', servings: 8, price: 30.00 },
      { label: '8" Round', servings: 12, price: 45.00 },
      { label: '10" Round', servings: 20, price: 60.00 },
      { label: '12" Round', servings: 30, price: 80.00 },
      { label: 'Quarter Sheet', servings: 25, price: 70.00 },
      { label: 'Half Sheet', servings: 50, price: 130.00 },
    ],
  },
  {
    id: '3',
    name: 'Classic Tiered Wedding Cake',
    category: 'wedding',
    description: 'Elegant multi-tiered wedding cake in classic, modern, or rustic styles. Most popular designs include textured buttercream, fresh flowers, metallic accents, and minimalist designs. Price range $200 - $800. Includes custom consultation, optional cake tasting, and delivery/setup service. Consultation includes flavor selection, design discussion, cake sample tasting, and quote preparation.',
    price: 250.00,
    images: ['/images/cakes/classic-tiered-wedding-cake-01.png', '/images/cakes/classic-tiered-wedding-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    baseIngredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk'],
    flavors: availableFlavors,
    baseFlavor: 'Vanilla',
    fillings: availableFillings,
    frostings: ['Buttercream', 'Fondant', 'Swiss Meringue', 'Italian Meringue'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Two-tier (6" + 8")', servings: 20, price: 250.00 },
      { label: 'Three-tier (6" + 8" + 10")', servings: 40, price: 400.00 },
      { label: 'Four-tier (6" + 8" + 10" + 12")', servings: 70, price: 650.00 },
      { label: 'Custom tiers and shapes', servings: 100, price: 800.00 },
    ],
  },
  {
    id: '4',
    name: 'Modern Wedding Cake',
    category: 'wedding',
    description: 'Contemporary wedding cake design with clean lines and modern aesthetics, customizable to match your wedding theme and color palette. Includes semi-naked cakes, geometric designs, and marbled fondant. Price range $200 - $800. Consultation, tasting, and setup included. Ordering requires minimum 3-4 weeks advance notice, 25% deposit.',
    price: 280.00,
    images: ['/images/cakes/modern-wedding-cake-01.png', '/images/cakes/modern-wedding-cake-02.png'],
    featured: false,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    flavors: availableFlavors,
    fillings: availableFillings,
    frostings: ['Buttercream', 'Fondant', 'Ganache', 'Swiss Meringue', 'Italian Meringue'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Two-tier (6" + 8")', servings: 20, price: 280.00 },
      { label: 'Three-tier (6" + 8" + 10")', servings: 40, price: 450.00 },
      { label: 'Four-tier (6" + 8" + 10" + 12")', servings: 70, price: 700.00 },
      { label: 'Custom tiers and shapes', servings: 100, price: 850.00 },
    ],
  },
  {
    id: '5',
    name: 'Anniversary Celebration Cake',
    category: 'celebration',
    description: 'Specially designed cake for anniversaries, graduations, baby showers, or corporate events. Includes elegant designs for milestone anniversaries, sophisticated corporate event cakes, and themed baby shower designs. Custom toppers and themed decorations available. Price range $50 - $300.',
    price: 50.00,
    images: ['/images/cakes/anniversary-celebration-cake-01.png', '/images/cakes/anniversary-celebration-cake-02.png', '/images/cakes/anniversary-celebration-cake-03.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    flavors: availableFlavors,
    fillings: availableFillings,
    frostings: availableFrostings,
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts'],
    sizes: [
      { label: '6" Round', servings: 8, price: 50.00 },
      { label: '8" Round', servings: 12, price: 70.00 },
      { label: '10" Round', servings: 20, price: 95.00 },
      { label: 'Sheet Cake (Quarter)', servings: 20, price: 80.00 },
      { label: 'Sheet Cake (Half)', servings: 40, price: 150.00 },
      { label: 'Custom Shape', servings: 30, price: 120.00 },
    ],
  },
  {
    id: '6',
    name: 'Graduation Celebration Cake',
    category: 'celebration',
    description: 'Celebrate academic achievements with themed graduation cakes featuring personalized messages, school colors, graduation caps, diplomas, and year designs. Custom shapes and school mascots available. Price range $50 - $300. Orders should be placed 1-2 weeks in advance.',
    price: 65.00,
    images: ['/images/cakes/graduation-celebration-cake-01.png', '/images/cakes/graduation-celebration-cake-02.png'],
    featured: false,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Natural flavorings'],
    flavors: availableFlavors,
    fillings: availableFillings,
    frostings: availableFrostings,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: '8" Round', servings: 12, price: 65.00 },
      { label: '10" Round', servings: 20, price: 85.00 },
      { label: 'Sheet Cake (Half)', servings: 40, price: 120.00 },
      { label: 'Custom Shape', servings: 30, price: 150.00 },
    ],
  },
  {
    id: '7',
    name: 'Classic Chocolate Cupcakes',
    category: 'cupcakes',
    description: 'Delicious chocolate cupcakes topped with rich frosting. Available individually, in dozen packs, or custom packaging for events. Perfect for parties, corporate events, and wedding cupcake towers. Custom toppers, sprinkles, and themed decorations available. Gluten-free options available upon request.',
    price: 3.00,
    images: ['/images/cakes/classic-chocolate-cupcakes-01.png', '/images/cakes/classic-chocolate-cupcakes-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Cocoa powder', 'Buttercream'],
    flavors: ['Chocolate', 'Vanilla', 'Red Velvet', 'Lemon', 'Carrot', 'Funfetti'],
    fillings: ['Buttercream', 'Ganache', 'Custard', 'Fruit Preserves'],
    frostings: ['Buttercream', 'Ganache', 'Cream Cheese', 'Whipped Cream'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Single', servings: 1, price: 3.00 },
      { label: 'Box of 6', servings: 6, price: 18.00 },
      { label: 'Box of 12 (Dozen)', servings: 12, price: 30.00 },
      { label: 'Box of 24 (Two Dozen)', servings: 24, price: 55.00 },
      { label: 'Custom Order (50+)', servings: 50, price: 120.00 },
    ],
  },
  {
    id: '8',
    name: 'Vanilla Cupcakes',
    category: 'cupcakes',
    description: 'Light and fluffy vanilla cupcakes with creamy frosting. Available individually, in dozen packs, or custom packaging for events. Perfect for parties, corporate events, and wedding cupcake towers. Custom decorations, seasonal themes, and personalized messaging available. Gluten-free options available upon request.',
    price: 3.00,
    images: ['/images/cakes/vanilla-cupcakes-01.png', '/images/cakes/vanilla-cupcakes-02.png'],
    featured: false,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla extract', 'Buttercream'],
    flavors: ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Carrot', 'Funfetti'],
    fillings: ['Buttercream', 'Fruit Preserves', 'Custard', 'Chocolate Ganache'],
    frostings: ['Buttercream', 'Cream Cheese', 'Whipped Cream', 'Ganache'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Single', servings: 1, price: 3.00 },
      { label: 'Box of 6', servings: 6, price: 18.00 },
      { label: 'Box of 12 (Dozen)', servings: 12, price: 30.00 },
      { label: 'Box of 24 (Two Dozen)', servings: 24, price: 55.00 },
      { label: 'Custom Order (50+)', servings: 50, price: 120.00 },
    ],
  },
  {
    id: '9',
    name: 'Pumpkin Spice Seasonal Cake',
    category: 'seasonal',
    description: 'Fall-inspired pumpkin spice cake with cream cheese frosting. Seasonal offerings include peppermint chocolate (winter), fresh fruit (summer), spring floral designs, and holiday-themed cakes. Available as whole cakes or cupcakes. Price varies by season and design complexity.',
    price: 55.00,
    images: ['/images/cakes/pumpkin-spice-seasonal-cake-01.png', '/images/cakes/pumpkin-spice-seasonal-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Pumpkin puree', 'Cinnamon', 'Nutmeg', 'Cloves', 'Cream cheese'],
    flavors: ['Pumpkin Spice', 'Chocolate Peppermint', 'Fresh Fruit', 'Eggnog', 'Apple Cinnamon'],
    fillings: ['Cream Cheese', 'Buttercream', 'Fruit Preserves', 'Chocolate Ganache'],
    frostings: ['Cream Cheese', 'Buttercream', 'Whipped Cream', 'Ganache'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: '6" Round', servings: 8, price: 55.00 },
      { label: '8" Round', servings: 12, price: 75.00 },
      { label: '10" Round', servings: 20, price: 95.00 },
      { label: 'Cupcakes (Dozen)', servings: 12, price: 36.00 },
    ],
  },
  {
    id: '10',
    name: 'Fully Customized Cake',
    category: 'custom',
    description: 'Create your dream cake! Fully customizable designs (shapes: Round, Square, Sheet, Custom), flavors, fillings, and frostings. Process involves consultation, design proposal, and approval. We specialize in 3D sculpted cakes, wedding/celebration cakes, corporate branding cakes, and special dietary needs (vegan, gluten-free). Requires 1-2 weeks lead time minimum, with a 25% deposit.',
    price: 60.00,
    images: ['/images/cakes/fully-customized-cake-01.png', '/images/cakes/fully-customized-cake-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Milk', 'Custom ingredients based on design'],
    flavors: availableFlavors,
    fillings: availableFillings,
    frostings: availableFrostings,
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts (optional)'],
    sizes: [
      { label: '6" Round', servings: 8, price: 60.00 },
      { label: '8" Round', servings: 12, price: 85.00 },
      { label: '10" Round', servings: 20, price: 110.00 },
      { label: 'Tiered/Complex', servings: 40, price: 250.00 },
      { label: '3D Sculpted Cake', servings: 25, price: 300.00 },
      { label: 'Custom Shape & Size', servings: 30, price: 200.00 },
    ],
  },
  {
    id: '11',
    name: 'Specialty Cookies',
    category: 'other',
    description: 'Custom decorated cookies perfect for any occasion. Available individually or in gift boxes. Options include royal icing designs, custom shapes, edible printing, and personalized messages. Ideal for parties, corporate events, and wedding favors. Price range $10 - $50 based on quantity and complexity.',
    price: 3.50,
    images: ['/images/cakes/specialty-cookies-01.png', '/images/cakes/specialty-cookies-02.png'],
    featured: true,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla extract', 'Royal icing'],
    flavors: ['Vanilla Sugar', 'Chocolate', 'Gingerbread', 'Lemon', 'Cinnamon'],
    frostings: ['Royal Icing', 'Fondant', 'Buttercream'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Single', servings: 1, price: 3.50 },
      { label: 'Half Dozen', servings: 6, price: 18.00 },
      { label: 'Dozen', servings: 12, price: 32.00 },
      { label: 'Custom Gift Box', servings: 8, price: 28.00 },
      { label: 'Event Order (50+)', servings: 50, price: 125.00 },
    ],
  },
  {
    id: '12',
    name: 'Cake Pops',
    category: 'other',
    description: 'Delightful bite-sized cake pops in various flavors and designs. Perfect for parties, gifts, and dessert tables. Custom shapes, colors, and themes available. Individually wrapped options for party favors. Price range $15 - $40 based on quantity and design complexity.',
    price: 15.00,
    images: ['/images/cakes/cake-pops-01.png', '/images/cakes/cake-pops-02.png'],
    featured: false,
    ingredients: ['Cake crumbs', 'Frosting', 'Chocolate coating', 'Decorative sprinkles'],
    flavors: ['Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Funfetti'],
    frostings: ['Chocolate Coating', 'Colored Candy Coating', 'Sprinkles'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    sizes: [
      { label: 'Set of 6', servings: 6, price: 15.00 },
      { label: 'Dozen', servings: 12, price: 28.00 },
      { label: 'Two Dozen', servings: 24, price: 52.00 },
      { label: 'Custom Order (50+)', servings: 50, price: 100.00 },
    ],
  },
  {
    id: '13',
    name: 'Dessert Bars',
    category: 'other',
    description: 'Elegant dessert bars perfect for events and gatherings. Options include brownies, blondies, lemon bars, and custom varieties. Available in trays or individually packaged. Ideal for corporate events, weddings, and parties. Price range $25 - $150 depending on quantity and selection.',
    price: 30.00,
    images: ['/images/cakes/dessert-bars-01.png', '/images/cakes/dessert-bars-02.png'],
    featured: false,
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Chocolate', 'Fruits', 'Nuts (optional)'],
    flavors: ['Chocolate Brownie', 'Blondie', 'Lemon', 'Raspberry', 'Caramel'],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts (some varieties)'],
    sizes: [
      { label: 'Small Tray (12 pieces)', servings: 12, price: 30.00 },
      { label: 'Medium Tray (24 pieces)', servings: 24, price: 55.00 },
      { label: 'Large Tray (36 pieces)', servings: 36, price: 75.00 },
      { label: 'Event Package (100 pieces)', servings: 100, price: 180.00 },
    ],
  },
];

// Sample testimonials
export const testimonials: TestimonialType[] = [
  { id: '1', name: 'Emily Johnson', image: '/src/assets/images/testimonials/EmilyJohnson.jpg', role: 'Bride', testimonial: 'Our wedding cake was absolutely stunning and tasted even better than it looked! Nana Pastry exceeded all our expectations. Our guests are still talking about it months later.', rating: 5, date: '2023-05-15' },
  { id: '2', name: 'Michael Chen', image: '/src/assets/images/testimonials/MichaelChen.jpg', testimonial: 'I ordered a birthday cake for my wife, and it was a showstopper! The attention to detail was incredible, and the flavor was divine. Will definitely be ordering again!', rating: 5, date: '2023-06-22' },
  { id: '3', name: 'Sophia Rodriguez', image: '/src/assets/images/testimonials/SophiaRodriguez.jpg', role: 'Event Planner', testimonial: 'As an event planner, I work with many bakeries, but Nana Pastry stands out for their creativity, reliability, and the exceptional quality of their cakes. Always a hit at our events!', rating: 5, date: '2023-04-10' },
  { id: '4', name: 'James Wilson', image: '/src/assets/images/testimonials/JamesWilson.jpg', testimonial: "The custom cake they made for my daughter's graduation was perfect. They took my vague ideas and created something beyond what I imagined. Highly recommend!", rating: 4, date: '2023-07-05' },
];

// Updated FAQs based on client data
export const faqs: FaqType[] = [
  {
    question: 'How far in advance should I order my cake?',
    answer: 'We recommend placing your order at least 1-2 weeks in advance for custom cakes, and 48 hours for standard orders. For wedding cakes, earlier ordering (3-4 weeks+) is advised.'
  },
  {
    question: 'Do you offer gluten-free options?',
    answer: "Yes! We offer gluten-free cake and cupcake options available upon request. Please specify your dietary requirements when placing your order."
  },
  {
    question: 'Do you use organic or natural ingredients?',
    answer: "We prioritize high-quality ingredients. We offer options using organic and natural ingredients upon request. Please mention this during your consultation."
  },
  {
    question: 'What is your delivery policy?',
    answer: 'We offer delivery within a 20-mile radius. Delivery fees range from $10-$20 depending on distance. Setup services for wedding/event cakes are available for an additional fee (typically starting at $25).'
  },
  {
    question: 'Can I customize the design, flavors, fillings, and frostings?',
    answer: 'Absolutely! We specialize in custom cakes. You can choose from our available options or request something special. Our design process includes a consultation to bring your vision to life.'
  },
  {
    question: 'What is your deposit and cancellation policy?',
    answer: 'A 25% non-refundable deposit is required to secure your order date. Cancellations made more than 7 days before the event receive a refund of payments made beyond the deposit. Cancellations within 7 days are non-refundable.'
  },
  {
    question: 'What cake flavors, fillings, and frostings do you offer?',
    answer: `We offer flavors like ${availableFlavors.join(', ')}. Fillings include ${availableFillings.join(', ')}. Frosting options are ${availableFrostings.join(', ')}.`
  },
  {
    question: 'What cake shapes and sizes do you offer?',
    answer: `We offer sizes like 6", 8", 10", and 12" rounds, plus sheet cakes. Common shapes include ${availableShapes.join(', ')}. Standard round servings are approx: 6" (8-10), 8" (12-16), 10" (20-25), 12" (30-40).`
  },
  {
    question: 'What are your pickup hours?',
    answer: `Pickup is available: ${pickupInfo.hours.monday} (Mon-Fri) and ${pickupInfo.hours.saturday} (Sat). Please schedule your pickup time when ordering.`
  },
  {
    question: 'Do you offer other desserts besides cakes?',
    answer: "Yes, we also offer custom cookies, delightful cake pops, and elegant dessert bars for events. Please contact us for details and pricing ($10 - $50+ depending on item and quantity)."
  },
  {
    question: 'How do I place an order for a custom cake?',
    answer: "You can request a custom cake through our website's custom order form, by email, or by phone. We'll arrange a consultation to discuss your vision, flavors, and design details."
  },
  {
    question: 'Do you offer cake tastings?',
    answer: "Yes, we offer cake tastings for wedding and large event orders. Tastings are complimentary when you book a wedding cake, or available for a small fee that's credited toward your final order."
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
      // { platform: 'instagram', url: '...' },
    ],
  },
];

// --- Order Information ---
export const orderProcessInfo = {
  standardOrders: {
    leadTime: "48 hours minimum for standard cakes",
    depositRequired: "25% of total order",
    paymentOptions: ["Credit Card", "Debit Card", "Cash", "Venmo"],
    cancellationPolicy: "Full refund if cancelled 7+ days before pickup, deposit non-refundable within 7 days"
  },
  customOrders: {
    leadTime: "1-2 weeks minimum for custom designs",
    designProcess: [
      "Initial consultation (in-person or virtual)",
      "Design proposal and quote",
      "Optional tasting (for wedding cakes)",
      "Design approval and deposit",
      "Creation and delivery/pickup"
    ],
    depositRequired: "25% of total order",
    changePolicy: "Design changes can be accommodated up to 7 days before the event",
    customFeatures: ["Edible images", "Custom toppers", "Specialty decorations", "3D elements", "Carved designs"]
  },
  weddingOrders: {
    leadTime: "3-4 weeks minimum, 2-3 months recommended",
    consultationProcess: [
      "Initial meeting to discuss vision and budget",
      "Cake tasting session (complimentary when booking)",
      "Design finalization",
      "Contract signing and deposit payment",
      "Final details confirmation 2 weeks before wedding",
      "Delivery and setup"
    ],
    depositRequired: "25% of total order",
    finalPaymentDue: "1 week before wedding date",
    services: ["Cake stand rental", "Setup at venue", "Cake cutting guide", "Anniversary tier preservation"]
  }
};

// --- Seasonal Specials ---
export const seasonalSpecials = {
  spring: ["Fresh Strawberry Cake", "Lemon Blueberry", "Carrot Cake", "Easter-themed designs"],
  summer: ["Key Lime", "Coconut Pineapple", "Fresh Berry", "Tropical themed cakes"],
  fall: ["Pumpkin Spice", "Apple Cinnamon", "Maple Walnut", "Halloween designs"],
  winter: ["Peppermint Chocolate", "Gingerbread", "Eggnog", "Holiday themed cakes"]
};

// --- Dietary Options ---
export const dietaryOptions = {
  glutenFree: {
    available: true,
    flavors: ["Vanilla", "Chocolate", "Red Velvet"],
    priceAdjustment: "+15%"
  },
  vegan: {
    available: true,
    flavors: ["Vanilla", "Chocolate", "Carrot"],
    priceAdjustment: "+20%"
  },
  nutFree: {
    available: true,
    notes: "We maintain strict protocols to avoid cross-contamination"
  },
  sugarFree: {
    available: true,
    flavors: ["Vanilla", "Chocolate"],
    priceAdjustment: "+15%"
  }
};

// --- Cake Add-ons ---
export const cakeAddons = [
  { name: "Edible Image", price: 15.00, description: "Custom printed edible image topper" },
  { name: "Fresh Flower Decoration", price: 25.00, description: "Arrangement of fresh flowers (flowers not included)" },
  { name: "Gold/Silver Leaf Accents", price: 20.00, description: "Edible metallic leaf decoration" },
  { name: "Custom Cake Topper", price: 10.00, description: "Placement of client-provided topper" },
  { name: "Custom 3D Elements", price: "Varies", description: "Hand-crafted fondant or chocolate decorations" },
  { name: "Cake Stand Rental", price: 15.00, description: "Elegant stand for display (refundable deposit required)" }
]; 