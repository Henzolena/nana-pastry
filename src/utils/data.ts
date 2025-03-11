import { Cake, TestimonialType, FaqType, TeamMember } from '@/types';

// Sample cake data
export const cakes: Cake[] = [
  {
    id: '1',
    name: 'Strawberry Dream Cake',
    category: 'birthday',
    description: 'Light vanilla sponge layered with fresh strawberries and whipped cream, finished with a delicate pink buttercream and edible flowers.',
    price: 58.99,
    images: ['/src/assets/images/cake1.jpg'],
    featured: true,
    ingredients: ['Organic flour', 'Farm-fresh eggs', 'Vanilla bean', 'Fresh strawberries', 'Whipped cream', 'Buttercream'],
    flavors: ['Vanilla', 'Strawberry'],
    allergens: ['Eggs', 'Dairy', 'Wheat'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
    ],
  },
  {
    id: '2',
    name: 'Elegant Rose Gold Wedding Cake',
    category: 'wedding',
    description: 'Three-tiered white chocolate cake with raspberry filling, covered in smooth fondant with hand-painted rose gold accents and sugar flowers.',
    price: 299.99,
    images: ['/src/assets/images/cake2.jpg'],
    featured: true,
    ingredients: ['White chocolate', 'Fondant', 'Raspberry preserve', 'Vanilla bean', 'Buttercream'],
    flavors: ['White Chocolate', 'Raspberry'],
    allergens: ['Eggs', 'Dairy', 'Wheat'],
    sizes: [
      { label: 'Small (2-tier)', servings: 30, priceModifier: 0 },
      { label: 'Medium (3-tier)', servings: 50, priceModifier: 150 },
      { label: 'Large (4-tier)', servings: 80, priceModifier: 300 },
    ],
  },
  {
    id: '3',
    name: 'Chocolate Indulgence Cake',
    category: 'celebration',
    description: 'Rich chocolate sponge with creamy ganache, topped with chocolate curls and gold dust for an elegant finish.',
    price: 64.99,
    images: ['/src/assets/images/cake3.jpg'],
    featured: true,
    ingredients: ['Dark chocolate', 'Cocoa powder', 'Espresso', 'Chocolate ganache'],
    flavors: ['Dark Chocolate', 'Coffee'],
    allergens: ['Eggs', 'Dairy', 'Wheat'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
    ],
  },
  {
    id: '4',
    name: 'Lavender Lemon Bliss Cupcakes',
    category: 'cupcakes',
    description: 'Delicate lemon cupcakes with a hint of lavender, topped with lavender-infused buttercream and a candied lemon slice.',
    price: 36.99,
    images: ['/src/assets/images/cake4.jpg'],
    featured: false,
    ingredients: ['Lemon zest', 'Lavender extract', 'Buttercream', 'Candied lemon'],
    flavors: ['Lemon', 'Lavender'],
    allergens: ['Eggs', 'Dairy', 'Wheat'],
    sizes: [
      { label: 'Box of 6', servings: 6, priceModifier: 0 },
      { label: 'Box of 12', servings: 12, priceModifier: 25 },
      { label: 'Box of 24', servings: 24, priceModifier: 60 },
    ],
  },
  {
    id: '5',
    name: 'Pink Champagne Celebration Cake',
    category: 'celebration',
    description: 'Light champagne-infused sponge with strawberry champagne buttercream, decorated with metallic accents and fresh berries.',
    price: 68.99,
    images: ['/src/assets/images/cake5.jpg'],
    featured: true,
    ingredients: ['Champagne', 'Strawberry puree', 'Buttercream', 'Edible gold leaf'],
    flavors: ['Champagne', 'Strawberry'],
    allergens: ['Eggs', 'Dairy', 'Wheat', 'Alcohol'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
    ],
  },
  {
    id: '6',
    name: 'Winter Wonderland Cake',
    category: 'seasonal',
    description: 'Spiced gingerbread cake with cinnamon cream cheese frosting, decorated with sugared cranberries and rosemary sprigs.',
    price: 62.99,
    images: ['/src/assets/images/cake6.jpg'],
    featured: false,
    ingredients: ['Gingerbread spice', 'Molasses', 'Cream cheese', 'Sugared cranberries'],
    flavors: ['Gingerbread', 'Cinnamon'],
    allergens: ['Eggs', 'Dairy', 'Wheat'],
    sizes: [
      { label: '6" Round', servings: 8, priceModifier: 0 },
      { label: '8" Round', servings: 12, priceModifier: 15 },
      { label: '10" Round', servings: 20, priceModifier: 30 },
    ],
  },
];

// Sample testimonials
export const testimonials: TestimonialType[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    image: '/src/assets/images/testimonial1.jpg',
    role: 'Bride',
    testimonial: 'Our wedding cake was absolutely stunning and tasted even better than it looked! Nana Pastry exceeded all our expectations. Our guests are still talking about it months later.',
    rating: 5,
    date: '2023-05-15',
  },
  {
    id: '2',
    name: 'Michael Chen',
    image: '/src/assets/images/testimonial2.jpg',
    testimonial: 'I ordered a birthday cake for my wife, and it was a showstopper! The attention to detail was incredible, and the flavor was divine. Will definitely be ordering again!',
    rating: 5,
    date: '2023-06-22',
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    image: '/src/assets/images/testimonial3.jpg',
    role: 'Event Planner',
    testimonial: 'As an event planner, I work with many bakeries, but Nana Pastry stands out for their creativity, reliability, and the exceptional quality of their cakes. Always a hit at our events!',
    rating: 5,
    date: '2023-04-10',
  },
  {
    id: '4',
    name: 'James Wilson',
    testimonial: "The custom cake they made for my daughter's graduation was perfect. They took my vague ideas and created something beyond what I imagined. Highly recommend!",
    rating: 4,
    date: '2023-07-05',
  },
];

// Sample FAQs
export const faqs: FaqType[] = [
  {
    question: 'How far in advance should I order my cake?',
    answer: 'We recommend placing your order at least 1-2 weeks in advance for standard cakes, and 4-6 weeks for wedding or large event cakes. During peak seasons, earlier ordering is advised.'
  },
  {
    question: 'Do you offer gluten-free or vegan options?',
    answer: "Yes! We offer both gluten-free and vegan cake options. Please specify your dietary requirements when placing your order, and we'll be happy to accommodate them."
  },
  {
    question: 'How are the cakes delivered?',
    answer: 'We offer delivery within a 25-mile radius for a small fee. Cakes are carefully packaged in specially designed boxes to ensure they arrive in perfect condition. For wedding and tiered cakes, we provide setup at your venue.'
  },
  {
    question: 'Can I customize the design and flavors?',
    answer: 'Absolutely! We specialize in custom cakes. You can choose from our flavor menu or request something special. Our designers will work with you to create a cake that matches your vision perfectly.'
  },
  {
    question: 'Do you offer cake tastings?',
    answer: 'Yes, we offer cake tastings by appointment, particularly for wedding cakes. During the tasting, you can sample various flavors and discuss your design ideas with our cake artists.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Orders can be canceled with a full refund up to 7 days before the delivery date. For cancellations within 7 days, a 50% fee applies. Wedding cake orders require a non-refundable deposit.'
  },
];

// Team members
export const team: TeamMember[] = [
  {
    id: '1',
    name: 'Sophia Williams',
    role: 'Head Pastry Chef',
    image: '/src/assets/images/team1.jpg',
    bio: 'Sophia brings 15 years of experience from top patisseries in Paris. Her innovative techniques and eye for detail make each cake a masterpiece.',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'facebook', url: 'https://facebook.com' },
    ],
  },
  {
    id: '2',
    name: 'David Chen',
    role: 'Cake Designer',
    image: '/src/assets/images/team2.jpg',
    bio: 'With a background in fine arts, David creates stunning decorative elements that transform our cakes into edible sculptures admired by all.',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'pinterest', url: 'https://pinterest.com' },
    ],
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    role: 'Flavor Specialist',
    image: '/src/assets/images/team3.jpg',
    bio: "Maria's exceptional palate and creativity lead to our unique flavor combinations. She sources the finest ingredients to ensure every bite is perfect.",
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
  },
]; 