import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Cake, CakeCategory } from '../types';
import { cakes as localCakes } from '../utils/data';

// Firestore collection names
const COLLECTIONS = {
  USERS: 'users',
  CAKES: 'cakes',
  ORDERS: 'orders',
  TESTIMONIALS: 'testimonials',
  FAQS: 'faqs'
};

// User profile types
export interface UserProfile {
  userId: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  createdAt: Date;
  updatedAt?: Date;
  orderHistory?: string[]; // Array of order IDs
}

// Or define the Order type if not available in types
export interface Order {
  id: string;
  userId?: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  deliveryMethod: 'pickup' | 'delivery';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryInfo?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryDate?: Date;
    deliveryFee: number;
  };
  pickupInfo?: {
    pickupDate: Date;
    pickupTime: string;
    storeLocation?: string;
  };
  specialInstructions?: string;
  isCustomOrder: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  [key: string]: any;
}

/**
 * Save user profile to Firestore
 * @param userProfile User profile data
 * @returns Promise with user ID
 */
export const saveUserProfile = async (p0: { userId: string; displayName: string; photoURL: string; email: string; phoneNumber: string; address: string; }, p1: boolean, userProfile: UserProfile): Promise<string> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userProfile.userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...userProfile,
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        ...userProfile,
        createdAt: serverTimestamp()
      });
    }
    
    return userProfile.userId;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param userId User ID
 * @returns User profile or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
        createdAt: Timestamp;
        updatedAt?: Timestamp;
      };
      
      return {
        ...userData,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt?.toDate(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Add a new cake to Firestore
 * @param cake Cake data
 * @returns Promise with cake ID
 */
export const addCake = async (cake: Omit<Cake, 'id'>): Promise<string> => {
  try {
    const cakesCollection = collection(db, COLLECTIONS.CAKES);
    const docRef = await addDoc(cakesCollection, {
      ...cake,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding cake:', error);
    throw error;
  }
};

/**
 * Get a cake by ID
 * @param cakeId Cake ID
 * @returns Cake data or null if not found
 */
export const getCakeById = async (cakeId: string): Promise<Cake | null> => {
  try {
    // Try to fetch from Firestore first
    const cakeRef = doc(db, COLLECTIONS.CAKES, cakeId);
    const cakeDoc = await getDoc(cakeRef);
    
    if (cakeDoc.exists()) {
      return { id: cakeDoc.id, ...cakeDoc.data() } as Cake;
    }
    
    // If not found in Firestore, try to get from local data
    const localCake = localCakes.find(cake => cake.id === cakeId);
    
    if (localCake) {
      console.log(`Cake ${cakeId} found in local data`);
      return localCake;
    }
    
    console.log(`Cake ${cakeId} not found in Firestore or local data`);
    return null;
  } catch (error) {
    console.error('Error getting cake:', error);
    
    // Attempt to fallback to local data in case of error
    try {
      const localCake = localCakes.find(cake => cake.id === cakeId);
      
      if (localCake) {
        console.log(`Cake ${cakeId} found in local data after Firestore error`);
        return localCake;
      }
    } catch (localError) {
      console.error('Error getting cake from local data:', localError);
    }
    
    throw error;
  }
};

/**
 * Update a cake
 * @param cakeId Cake ID
 * @param cakeData Updated cake data
 * @returns Promise indicating success
 */
export const updateCake = async (
  cakeId: string,
  cakeData: Partial<Cake>
): Promise<void> => {
  try {
    const cakeRef = doc(db, COLLECTIONS.CAKES, cakeId);
    await updateDoc(cakeRef, {
      ...cakeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating cake:', error);
    throw error;
  }
};

/**
 * Delete a cake
 * @param cakeId Cake ID
 * @returns Promise indicating success
 */
export const deleteCake = async (cakeId: string): Promise<void> => {
  try {
    const cakeRef = doc(db, COLLECTIONS.CAKES, cakeId);
    await deleteDoc(cakeRef);
  } catch (error) {
    console.error('Error deleting cake:', error);
    throw error;
  }
};

/**
 * Get all cakes
 * @returns Array of cakes
 */
export const getAllCakes = async (): Promise<Cake[]> => {
  try {
    const cakesCollection = collection(db, COLLECTIONS.CAKES);
    const cakesSnapshot = await getDocs(cakesCollection);
    
    return cakesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Cake[];
  } catch (error) {
    console.error('Error getting all cakes:', error);
    throw error;
  }
};

/**
 * Get cakes by category
 * @param category Cake category
 * @returns Array of cakes
 */
export const getCakesByCategory = async (category: CakeCategory): Promise<Cake[]> => {
  try {
    const cakesCollection = collection(db, COLLECTIONS.CAKES);
    const q = query(cakesCollection, where('category', '==', category));
    const cakesSnapshot = await getDocs(q);
    
    return cakesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Cake[];
  } catch (error) {
    console.error('Error getting cakes by category:', error);
    throw error;
  }
};

/**
 * Get featured cakes
 * @param maxCakes Maximum number of cakes to return
 * @returns Array of featured cakes
 */
export const getFeaturedCakes = async (maxCakes: number = 6): Promise<Cake[]> => {
  try {
    const cakesCollection = collection(db, COLLECTIONS.CAKES);
    const q = query(
      cakesCollection,
      where('featured', '==', true),
      limit(maxCakes)
    );
    const cakesSnapshot = await getDocs(q);
    
    return cakesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Cake[];
  } catch (error) {
    console.error('Error getting featured cakes:', error);
    throw error;
  }
};

/**
 * Add a new order
 * @param order Order data
 * @returns Promise with order ID
 */
export const createOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
  try {
    const ordersCollection = collection(db, COLLECTIONS.ORDERS);
    const docRef = await addDoc(ordersCollection, {
      ...order,
      createdAt: serverTimestamp(),
      status: order.status || 'pending'
    });
    
    // Add order ID to user's order history
    if (order.userId) {
      const userRef = doc(db, COLLECTIONS.USERS, order.userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const orderHistory = userData.orderHistory || [];
        
        await updateDoc(userRef, {
          orderHistory: [...orderHistory, docRef.id]
        });
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get an order by ID
 * @param orderId Order ID
 * @returns Order data or null if not found
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      return {
        id: orderDoc.id,
        ...orderData,
        createdAt: orderData.createdAt?.toDate(),
        updatedAt: orderData.updatedAt?.toDate()
      } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

/**
 * Update an order
 * @param orderId Order ID
 * @param orderData Updated order data
 * @returns Promise indicating success
 */
export const updateOrder = async (
  orderId: string,
  orderData: Partial<Order>
): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, {
      ...orderData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Get user's orders
 * @param userId User ID
 * @returns Array of orders
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersCollection = collection(db, COLLECTIONS.ORDERS);
    const q = query(
      ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const ordersSnapshot = await getDocs(q);
    
    return ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Order;
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

/**
 * Get all orders with pagination
 * @param pageSize Number of orders per page
 * @param lastVisible Last visible document for pagination
 * @returns Orders and last visible document
 */
export const getAllOrders = async (
  pageSize: number = 20,
  lastVisible?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  orders: Order[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    const ordersCollection = collection(db, COLLECTIONS.ORDERS);
    let q = query(ordersCollection, orderBy('createdAt', 'desc'), limit(pageSize));
    
    if (lastVisible) {
      q = query(
        ordersCollection,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }
    
    const ordersSnapshot = await getDocs(q);
    const orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Order;
    });
    
    const newLastVisible = ordersSnapshot.docs.length > 0
      ? ordersSnapshot.docs[ordersSnapshot.docs.length - 1]
      : null;
    
    return {
      orders,
      lastVisible: newLastVisible
    };
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
}; 