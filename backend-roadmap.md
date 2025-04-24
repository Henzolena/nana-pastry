# Nana Pastry - Firebase Backend Roadmap

This document outlines the phase-by-phase backend development plan for Nana Pastry's platform using Firebase. The backend is designed to seamlessly integrate with our existing React frontend.

## Phase 1: Firebase Setup & Authentication

### 1.1 Project Configuration
- Create Firebase project in Firebase Console
- Configure web application credentials
- Install Firebase SDK in the project
```bash
npm install firebase
# or
yarn add firebase
```
- Set up environment configuration for development, staging, and production
```
.env.development
.env.staging
.env.production
```
- Implement Firebase initialization in a dedicated service

### 1.2 Authentication
- Implement email/password authentication
- Add social login options (Google, Facebook)
- Create user profiles structure in Firestore
```javascript
// User Collection Structure
users: {
  uid: {
    email: string,
    displayName: string,
    phone: string,
    addresses: [
      {
        type: string, // 'home', 'work', etc.
        street: string,
        city: string,
        state: string,
        zip: string,
        isDefault: boolean
      }
    ],
    role: string, // 'customer', 'admin'
    created: timestamp,
    lastLogin: timestamp
  }
}
```
- Set up customer and admin roles with Custom Claims
- Implement password reset and email verification flows
- Connect authentication to frontend user flows

## Phase 2: Data Modeling & Basic CRUD

### 2.1 Firestore Collections Design

#### Users Collection
```javascript
users: {
  uid: {
    // Basic profile
    email: string,
    displayName: string,
    phone: string,
    
    // Addresses
    addresses: [
      {
        id: string,
        type: string,
        street: string,
        city: string,
        state: string,
        zip: string,
        isDefault: boolean
      }
    ],
    
    // Order history (references)
    orderIds: [string],
    
    // Preferences
    preferences: {
      favoriteProducts: [string],
      dietaryRestrictions: [string],
      savePaymentInfo: boolean
    },
    
    // Account
    role: string,
    created: timestamp,
    lastLogin: timestamp
  }
}
```

#### Products Collection
```javascript
products: {
  productId: {
    // Base information
    name: string,
    description: string,
    category: string, // 'birthday', 'wedding', 'cupcakes', etc.
    basePrice: number,
    
    // Images
    images: [string], // URLs to images in Storage
    
    // Status
    active: boolean,
    featured: boolean,
    
    // Customization options
    baseFlavor: string,
    baseIngredients: [string],
    availableSizes: [
      {
        label: string,
        servings: number,
        price: number
      }
    ],
    availableFlavors: [string],
    availableFillings: [string],
    availableFrostings: [string],
    
    // Dietary options
    allergens: [string],
    canBeGlutenFree: boolean,
    canBeVegan: boolean,
    canBeNutFree: boolean,
    
    // Metadata
    created: timestamp,
    updated: timestamp
  }
}
```

#### Orders Collection
```javascript
orders: {
  orderId: {
    // Order info
    orderNumber: string, // Human-readable ID
    userId: string,
    
    // Order items
    items: [
      {
        productId: string,
        name: string,
        quantity: number,
        size: {
          label: string,
          servings: number,
          price: number
        },
        basePrice: number,
        customizations: {
          flavor: string,
          filling: string,
          frosting: string,
          shape: string,
          dietaryOption: string,
          addons: [string],
          specialInstructions: string
        },
        totalPrice: number
      }
    ],
    
    // Customer info
    customerInfo: {
      name: string,
      email: string,
      phone: string
    },
    
    // Delivery/Pickup info
    deliveryInfo: {
      method: string, // 'delivery', 'pickup'
      address: {
        street: string,
        city: string,
        state: string,
        zip: string
      },
      scheduledDate: timestamp,
      scheduledTime: string,
      specialInstructions: string
    },
    
    // Pricing
    subtotal: number,
    tax: number,
    deliveryFee: number,
    discount: number,
    total: number,
    
    // Payment
    paymentStatus: string, // 'pending', 'paid', 'failed'
    paymentMethod: string,
    paymentId: string, // Reference to payment in Stripe
    
    // Order status
    status: string, // 'new', 'confirmed', 'in_production', 'ready', 'completed', 'cancelled'
    statusHistory: [
      {
        status: string,
        timestamp: timestamp,
        note: string
      }
    ],
    
    // Timestamps
    created: timestamp,
    updated: timestamp
  }
}
```

#### Inventory Collection
```javascript
inventory: {
  itemId: {
    name: string,
    category: string, // 'ingredient', 'packaging', etc.
    unit: string, // 'kg', 'liters', etc.
    currentStock: number,
    minStockLevel: number,
    supplier: string,
    lastRestocked: timestamp
  }
}
```

### 2.2 Firebase Storage
- Set up storage buckets for product images
- Create folder structure:
  - `/products/{productId}/`
  - `/custom-orders/{orderId}/`
  - `/users/{userId}/`
- Implement image optimization Cloud Functions
- Set up security rules for each storage path

### 2.3 Basic Operations
- Create API service layer for frontend integration
- Implement CRUD operations for each collection
- Set up backend data validation with Firestore Rules

## Phase 3: Order Processing System

### 3.1 Order Creation Flow
- Implement Cart-to-Order conversion function
```javascript
// Pseudo-code for cart to order conversion
function convertCartToOrder(cart, customerInfo, deliveryInfo) {
  const orderId = generateOrderId();
  const orderItems = cart.items.map(mapCartItemToOrderItem);
  
  return {
    orderId,
    orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
    userId: customerInfo.userId || null,
    items: orderItems,
    customerInfo,
    deliveryInfo,
    subtotal: calculateSubtotal(orderItems),
    tax: calculateTax(orderItems),
    deliveryFee: calculateDeliveryFee(deliveryInfo),
    discount: calculateDiscount(orderItems, customerInfo),
    total: calculateTotal(),
    paymentStatus: 'pending',
    status: 'new',
    statusHistory: [
      {
        status: 'new',
        timestamp: new Date(),
        note: 'Order created'
      }
    ],
    created: new Date(),
    updated: new Date()
  };
}
```
- Implement order ID generation to match frontend format
- Store customization options in structured format
- Calculate accurate pricing including all addons and customizations

### 3.2 Order Lifecycle Management
- Design order status workflow:
  1. New (created but not paid)
  2. Confirmed (paid)
  3. In Production (being prepared)
  4. Ready for Pickup/Delivery
  5. Completed (delivered/picked up)
  6. Cancelled (if applicable)
- Create Cloud Functions for order status transitions
- Implement webhooks for status change notifications
- Set up admin triggers for manual status updates

### 3.3 Custom Order Handling
- Create specialized collection for custom cake requests
```javascript
customRequests: {
  requestId: {
    userId: string,
    customerInfo: {
      name: string,
      email: string,
      phone: string
    },
    requestDetails: {
      eventType: string,
      eventDate: timestamp,
      servingsNeeded: number,
      designDescription: string,
      referenceImages: [string], // URLs to Storage
      budget: number,
      dietaryRequirements: [string]
    },
    status: string, // 'pending_review', 'consultation_scheduled', 'quote_provided', 'approved', 'declined'
    consultationDate: timestamp,
    quotedPrice: number,
    depositAmount: number,
    depositPaid: boolean,
    notes: string,
    created: timestamp,
    updated: timestamp
  }
}
```
- Build consultation scheduling system
- Implement approval workflow for custom designs
- Create Cloud Functions for notification triggers

## Phase 4: Payment Integration

### 4.1 Payment Processing
- Install Stripe Firebase Extensions
```bash
firebase ext:install stripe/firestore-stripe-payments
```
- Set up secure payment flow
```javascript
// Client-side payment function (simplified)
async function processPayment(paymentMethodId, orderId, amount) {
  const callable = firebase.functions().httpsCallable('createPaymentIntent');
  const result = await callable({
    paymentMethodId,
    orderId,
    amount,
    currency: 'usd',
    description: `Order #${orderId}`
  });
  
  return result.data;
}
```
- Implement deposit payments for custom orders
- Create receipt generation system using Cloud Functions

### 4.2 Payment Webhooks
- Set up Stripe webhook handler Cloud Function
```javascript
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle specific event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handleSuccessfulPayment(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handleFailedPayment(event.data.object);
      break;
    // Handle other event types
  }
  
  res.status(200).send({received: true});
});
```
- Create automatic order status updates based on payment events
- Implement payment failure handling and retry mechanism

### 4.3 Pricing Calculations
- Build a pricing calculator for cake customizations
```javascript
function calculatePrice(baseProduct, customizations) {
  let price = baseProduct.basePrice;
  
  // Add size pricing
  const selectedSize = baseProduct.availableSizes.find(s => s.label === customizations.size);
  if (selectedSize) {
    price = selectedSize.price;
  }
  
  // Add dietary options pricing
  if (customizations.dietaryOption === 'glutenFree') {
    price += 5.00;
  } else if (customizations.dietaryOption === 'vegan') {
    price += 7.00;
  }
  
  // Add addons pricing
  customizations.addons.forEach(addon => {
    const addonPrice = getAddonPrice(addon);
    price += addonPrice;
  });
  
  return price;
}
```
- Implement tax calculations matching frontend
- Create delivery fee structure based on location

## Phase 5: Admin Dashboard

### 5.1 Order Management
- Create Cloud Functions for admin order operations
```javascript
exports.getOrders = functions.https.onCall(async (data, context) => {
  // Check if user is an admin
  if (!context.auth || !(await isUserAdmin(context.auth.uid))) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can access orders.'
    );
  }
  
  // Get orders with filtering
  const { status, startDate, endDate, limit } = data;
  let query = db.collection('orders');
  
  if (status) {
    query = query.where('status', '==', status);
  }
  
  if (startDate) {
    query = query.where('created', '>=', new Date(startDate));
  }
  
  if (endDate) {
    query = query.where('created', '<=', new Date(endDate));
  }
  
  query = query.orderBy('created', 'desc').limit(limit || 50);
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
```
- Implement filtering and search functionality
- Build batch operations (update multiple orders)

### 5.2 Inventory Management
- Create functions for automatic inventory adjustments based on orders
```javascript
async function updateInventoryFromOrder(order) {
  // Get all products in the order
  const productPromises = order.items.map(item => 
    db.collection('products').doc(item.productId).get()
  );
  const productDocs = await Promise.all(productPromises);
  const products = productDocs.map(doc => doc.data());
  
  // Get all ingredients needed
  const ingredientsNeeded = {};
  products.forEach((product, index) => {
    const orderItem = order.items[index];
    
    product.ingredients.forEach(ing => {
      const amountNeeded = calculateIngredientAmount(ing, product, orderItem);
      ingredientsNeeded[ing.id] = (ingredientsNeeded[ing.id] || 0) + amountNeeded;
    });
  });
  
  // Update inventory
  const batch = db.batch();
  for (const [ingredientId, amount] of Object.entries(ingredientsNeeded)) {
    const ingredientRef = db.collection('inventory').doc(ingredientId);
    batch.update(ingredientRef, {
      currentStock: admin.firestore.FieldValue.increment(-amount)
    });
  }
  
  return batch.commit();
}
```
- Create low-stock alerts using Cloud Functions
- Build inventory forecasting based on scheduled orders

### 5.3 Customer Management
- Create customer views and search functions
```javascript
exports.searchCustomers = functions.https.onCall(async (data, context) => {
  // Admin check
  if (!context.auth || !(await isUserAdmin(context.auth.uid))) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can search customers.'
    );
  }
  
  const { query, limit } = data;
  let customersQuery = db.collection('users');
  
  // Search by various fields
  if (query) {
    const queryLower = query.toLowerCase();
    
    // Get users where email contains query
    const emailSnapshot = await customersQuery
      .where('email', '>=', queryLower)
      .where('email', '<=', queryLower + '\uf8ff')
      .limit(limit || 20)
      .get();
      
    // Get users where name contains query
    const nameSnapshot = await customersQuery
      .where('displayName', '>=', queryLower)
      .where('displayName', '<=', queryLower + '\uf8ff')
      .limit(limit || 20)
      .get();
      
    // Combine results
    const emailResults = emailSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const nameResults = nameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Remove duplicates
    const combined = [...emailResults];
    nameResults.forEach(user => {
      if (!combined.some(u => u.id === user.id)) {
        combined.push(user);
      }
    });
    
    return combined;
  }
  
  // If no query, return recent customers
  const snapshot = await customersQuery
    .orderBy('created', 'desc')
    .limit(limit || 20)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
```
- Implement customer communications system
- Build loyalty program backend

## Phase 6: Advanced Features

### 6.1 Scheduling System
- Create calendar integration for order scheduling
```javascript
// Structure for availability slots
availabilitySlots: {
  slotId: {
    date: timestamp,
    startTime: string, // '09:00'
    endTime: string,   // '09:30'
    maxOrders: number, // How many orders can be scheduled in this slot
    currentOrders: number,
    available: boolean,
    type: string // 'pickup', 'delivery', 'both'
  }
}

// Function to check slot availability
async function checkSlotAvailability(date, time, type) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const snapshot = await db.collection('availabilitySlots')
    .where('date', '>=', startOfDay)
    .where('date', '<=', endOfDay)
    .where('startTime', '==', time)
    .where('available', '==', true)
    .where('currentOrders', '<', db.FieldPath.documentData().maxOrders)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```
- Implement capacity management
- Build pickup time slot management
- Create delivery zone management

### 6.2 Reporting & Analytics
- Design sales reporting system
```javascript
// Function to generate sales reports
async function generateSalesReport(startDate, endDate) {
  const ordersSnapshot = await db.collection('orders')
    .where('created', '>=', startDate)
    .where('created', '<=', endDate)
    .where('status', 'in', ['confirmed', 'in_production', 'ready', 'completed'])
    .get();
    
  const orders = ordersSnapshot.docs.map(doc => doc.data());
  
  // Calculate total sales
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Calculate sales by category
  const salesByCategory = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const product = await db.collection('products').doc(item.productId).get();
      const category = product.data().category;
      
      salesByCategory[category] = (salesByCategory[category] || 0) + (item.price * item.quantity);
    });
  });
  
  // Calculate average order value
  const averageOrderValue = totalSales / orders.length || 0;
  
  return {
    totalSales,
    salesByCategory,
    averageOrderValue,
    orderCount: orders.length,
    startDate,
    endDate
  };
}
```
- Create product popularity analytics
- Build customer behavior insights with Firebase Analytics

### 6.3 Notification System
- Implement email notifications for order status changes using Firebase Extensions
```bash
firebase ext:install firebase/firestore-send-email
```
- Set up email templates for different notifications
```javascript
// Email template for order confirmation
const orderConfirmationTemplate = {
  subject: 'Your Nana Pastry Order Confirmation - {{orderNumber}}',
  html: `
    <h1>Thank you for your order!</h1>
    <p>Hi {{customerName}},</p>
    <p>We're excited to confirm your order #{{orderNumber}}.</p>
    
    <h2>Order Details:</h2>
    <ul>
      {{#each items}}
        <li>{{quantity}}x {{name}} - ${{price}}</li>
      {{/each}}
    </ul>
    
    <p><strong>Subtotal:</strong> ${{subtotal}}</p>
    <p><strong>Tax:</strong> ${{tax}}</p>
    <p><strong>Delivery Fee:</strong> ${{deliveryFee}}</p>
    <p><strong>Total:</strong> ${{total}}</p>
    
    <h2>{{deliveryMethod}} Details:</h2>
    <p><strong>Date:</strong> {{deliveryDate}}</p>
    <p><strong>Time:</strong> {{deliveryTime}}</p>
    {{#if isDelivery}}
      <p><strong>Address:</strong> {{deliveryAddress}}</p>
    {{else}}
      <p><strong>Pickup Location:</strong> {{storeAddress}}</p>
    {{/if}}
    
    <p>We'll send you updates as your order is being prepared.</p>
    <p>Thank you for choosing Nana Pastry!</p>
  `
};
```
- Create SMS notification system for ready orders
- Build in-app notification center

## Phase 7: Security & Performance

### 7.1 Security Rules
- Implement Firestore security rules
```javascript
// Example Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User rules
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Product rules
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Order rules
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAdmin() || 
        (isOwner(resource.data.userId) && 
         resource.data.status == 'new' && 
         request.resource.data.status == 'new');
      allow delete: if isAdmin();
    }
    
    // Inventory rules
    match /inventory/{itemId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```
- Create storage access controls
- Set up admin function security with custom claims

### 7.2 Performance Optimization
- Implement caching strategies
```javascript
// Example of loading products with caching
async function getProducts(category = null, lastUpdated = null) {
  // Check if we have fresh cached data
  const cacheKey = `products_${category || 'all'}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  const cachedTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
  
  if (cachedData && cachedTimestamp) {
    const data = JSON.parse(cachedData);
    // If cache is less than 5 minutes old or no newer data is available
    if (
      (Date.now() - parseInt(cachedTimestamp) < 5 * 60 * 1000) || 
      (lastUpdated && new Date(cachedTimestamp) >= new Date(lastUpdated))
    ) {
      return data;
    }
  }
  
  // Otherwise fetch fresh data
  let query = db.collection('products').where('active', '==', true);
  
  if (category) {
    query = query.where('category', '==', category);
  }
  
  const snapshot = await query.get();
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Cache the results
  sessionStorage.setItem(cacheKey, JSON.stringify(products));
  sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
  
  return products;
}
```
- Create data pagination for large collections
- Set up indexes for common queries
- Implement data denormalization where appropriate

### 7.3 Error Handling & Monitoring
- Set up Firebase logging system
- Implement error tracking with Crashlytics
- Create dashboard for system health using Firebase Performance Monitoring

## Phase 8: Testing & Deployment

### 8.1 Testing Strategy
- Implement unit tests for Cloud Functions
```javascript
// Example test for the calculatePrice function
describe('calculatePrice', () => {
  it('should calculate base price correctly', () => {
    const baseProduct = {
      basePrice: 25.00,
      availableSizes: [
        { label: 'Small', price: 25.00 },
        { label: 'Medium', price: 35.00 },
        { label: 'Large', price: 45.00 }
      ]
    };
    
    const customizations = {
      size: 'Small',
      dietaryOption: 'standard',
      addons: []
    };
    
    expect(calculatePrice(baseProduct, customizations)).toBe(25.00);
  });
  
  it('should add dietary option pricing', () => {
    const baseProduct = {
      basePrice: 25.00,
      availableSizes: [
        { label: 'Small', price: 25.00 }
      ]
    };
    
    const customizations = {
      size: 'Small',
      dietaryOption: 'glutenFree',
      addons: []
    };
    
    expect(calculatePrice(baseProduct, customizations)).toBe(30.00); // 25 + 5
  });
  
  // More tests...
});
```
- Create integration test suite
- Build security penetration testing

### 8.2 Deployment Pipeline
- Set up CI/CD for Cloud Functions deployment
```yaml
# example github workflow for deploying Firebase functions
name: Deploy Firebase Functions

on:
  push:
    branches:
      - main
    paths:
      - 'functions/**'

jobs:
  deploy_functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: cd functions && npm ci
        
      - name: Run tests
        run: cd functions && npm test
        
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```
- Create staged deployment process
- Implement rollback procedures

### 8.3 Documentation
- Create API documentation
- Build technical architecture documents
- Develop operation manuals for admin users

## Integration with Frontend

### Authentication Integration
```javascript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  
  async function signup(email, password, name) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      displayName: name,
      role: 'customer',
      created: new Date()
    });
    return result;
  }
  
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  function logout() {
    return signOut(auth);
  }
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            ...docSnap.data()
          });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Cart and Checkout Integration
```javascript
// src/contexts/CartContext.tsx - Modified for Firebase
import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, defaultCartState);
  
  // Load cart from Firebase if user is logged in, otherwise from localStorage
  useEffect(() => {
    async function loadCart() {
      if (currentUser) {
        const cartDocRef = doc(db, 'users', currentUser.uid, 'cart', 'current');
        const cartDoc = await getDoc(cartDocRef);
        
        if (cartDoc.exists()) {
          dispatch({ 
            type: 'LOAD_CART', 
            payload: cartDoc.data() 
          });
        } else {
          // If we have a local cart, save it to Firebase
          const localCart = localStorage.getItem('cart');
          if (localCart) {
            const parsedCart = JSON.parse(localCart);
            await setDoc(cartDocRef, parsedCart);
            dispatch({ 
              type: 'LOAD_CART', 
              payload: parsedCart 
            });
            // Clear localStorage cart
            localStorage.removeItem('cart');
          }
        }
      } else {
        // Load from localStorage if not logged in
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          dispatch({ 
            type: 'LOAD_CART', 
            payload: JSON.parse(savedCart) 
          });
        }
      }
    }
    
    loadCart();
  }, [currentUser]);
  
  // Save cart to Firebase or localStorage on changes
  useEffect(() => {
    async function saveCart() {
      if (currentUser) {
        const cartDocRef = doc(db, 'users', currentUser.uid, 'cart', 'current');
        await setDoc(cartDocRef, state);
      } else {
        localStorage.setItem('cart', JSON.stringify(state));
      }
    }
    
    if (state.items.length > 0) {
      saveCart();
    } else {
      // If cart is empty, remove it
      if (currentUser) {
        const cartDocRef = doc(db, 'users', currentUser.uid, 'cart', 'current');
        deleteDoc(cartDocRef).catch(err => console.error("Error deleting empty cart", err));
      } else {
        localStorage.removeItem('cart');
      }
    }
  }, [state, currentUser]);
  
  // Rest of cart functionality...
}
```

### Order Submission Integration
```javascript
// src/services/orderService.js
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

export async function createOrder(orderData) {
  // Add order to Firestore
  const orderRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    created: new Date(),
    updated: new Date(),
    status: 'new',
    statusHistory: [
      {
        status: 'new',
        timestamp: new Date(),
        note: 'Order created'
      }
    ]
  });
  
  return orderRef.id;
}

export async function processPayment(orderId, paymentMethodId) {
  const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
  
  // Get order details
  const orderDoc = await getDoc(doc(db, 'orders', orderId));
  
  if (!orderDoc.exists()) {
    throw new Error('Order not found');
  }
  
  const order = orderDoc.data();
  
  // Create payment intent
  const result = await createPaymentIntent({
    paymentMethodId,
    orderId,
    amount: Math.round(order.total * 100), // Convert to cents
    currency: 'usd',
    description: `Order #${order.orderNumber}`
  });
  
  // Update order with payment information
  await updateDoc(doc(db, 'orders', orderId), {
    paymentStatus: 'processing',
    paymentIntentId: result.data.paymentIntentId,
    updated: new Date()
  });
  
  return result.data;
}

export async function getUserOrders(userId) {
  const q = query(
    collection(db, 'orders'), 
    where('userId', '==', userId),
    orderBy('created', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

## Conclusion

This roadmap provides a comprehensive approach to building a Firebase backend for the Nana Pastry platform. By following these phases, you can create a scalable, secure, and performant backend that seamlessly integrates with your existing frontend implementation.

Key advantages of this architecture:

1. **Serverless Architecture**: Reduces operational complexity and costs
2. **Real-time Updates**: Enables live order tracking and inventory management
3. **Scalability**: Automatically scales with your business growth
4. **Security**: Fine-grained access controls for customer and admin data
5. **Integration**: Seamless connection with the existing frontend code

As you implement each phase, you'll be able to gradually enhance the functionality of your application while maintaining a solid foundation that can support future growth and feature additions. 