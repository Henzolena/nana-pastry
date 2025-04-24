import { User } from 'firebase/auth';
import { where, orderBy, limit } from 'firebase/firestore';
import { FirestoreDocument, getDocumentById, getDocuments, setDocument, updateDocument, deleteDocument } from '../lib/firestore';
import { auth } from '../lib/firebase';

// User profile interface
export interface UserProfile extends FirestoreDocument {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'customer';
  phone?: string;
  addresses?: Address[];
  favoriteProducts?: string[];
  orderCount?: number;
  totalSpent?: number;
}

// Address interface
export interface Address {
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

// Collection name
const COLLECTION_NAME = 'users';

// Get user profile by Firebase UID
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  return getDocumentById<UserProfile>(COLLECTION_NAME, uid);
}

// Create or update user profile
export async function createUserProfile(user: User, role: 'admin' | 'customer' = 'customer'): Promise<void> {
  const userData = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    role,
    orderCount: 0,
    totalSpent: 0,
  };
  
  await setDocument(COLLECTION_NAME, user.uid, userData);
}

// Update user profile
export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfile, 'uid' | 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  try {
    // First check if the document exists
    const userProfile = await getUserProfile(uid);
    
    // Try to get Firebase auth user data
    const authUser = auth.currentUser;
    
    if (userProfile) {
      // Document exists, update it
      await updateDocument(COLLECTION_NAME, uid, data);
    } else {
      // Document doesn't exist, create it
      const newUserData = {
        uid,
        email: authUser?.email || '',
        displayName: authUser?.displayName || data.displayName || '',
        role: 'customer',
        ...data,
      };
      await setDocument(COLLECTION_NAME, uid, newUserData);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Add address to user profile
export async function addUserAddress(uid: string, address: Address): Promise<void> {
  try {
    // Get user profile
    let user = await getUserProfile(uid);
    
    if (!user) {
      // Create user document if it doesn't exist
      const newUserData = {
        uid,
        email: '',
        displayName: '',
        role: 'customer',
        addresses: [address],
      };
      await setDocument(COLLECTION_NAME, uid, newUserData);
      return;
    }
    
    const addresses = user.addresses || [];
    
    // If this is the first address or it's marked as default, set all others to non-default
    if (address.isDefault || addresses.length === 0) {
      addresses.forEach(addr => {
        if (addr.type === address.type) {
          addr.isDefault = false;
        }
      });
      
      // Ensure the new address is default if it's the first of its type
      address.isDefault = true;
    }
    
    addresses.push(address);
    
    await updateUserProfile(uid, { addresses });
  } catch (error) {
    console.error('Error adding user address:', error);
    throw error;
  }
}

// Update address in user profile
export async function updateUserAddress(uid: string, index: number, address: Address): Promise<void> {
  const user = await getUserProfile(uid);
  
  if (!user || !user.addresses || index >= user.addresses.length) {
    throw new Error(`User with ID ${uid} not found or address index invalid`);
  }
  
  const addresses = [...user.addresses];
  
  // If this address is being set as default, update others of the same type
  if (address.isDefault) {
    addresses.forEach((addr, i) => {
      if (i !== index && addr.type === address.type) {
        addr.isDefault = false;
      }
    });
  }
  
  addresses[index] = address;
  
  await updateUserProfile(uid, { addresses });
}

// Delete address from user profile
export async function deleteUserAddress(uid: string, index: number): Promise<void> {
  const user = await getUserProfile(uid);
  
  if (!user || !user.addresses || index >= user.addresses.length) {
    throw new Error(`User with ID ${uid} not found or address index invalid`);
  }
  
  const addresses = user.addresses.filter((_, i) => i !== index);
  
  // If we deleted a default address, set a new default if possible
  const deletedAddress = user.addresses[index];
  if (deletedAddress.isDefault) {
    const sameTypeAddress = addresses.find(addr => addr.type === deletedAddress.type);
    if (sameTypeAddress) {
      sameTypeAddress.isDefault = true;
    }
  }
  
  await updateUserProfile(uid, { addresses });
}

// Add product to favorites
export async function addToFavorites(uid: string, productId: string): Promise<void> {
  const user = await getUserProfile(uid);
  
  if (!user) {
    throw new Error(`User with ID ${uid} not found`);
  }
  
  const favorites = user.favoriteProducts || [];
  
  if (!favorites.includes(productId)) {
    favorites.push(productId);
    await updateUserProfile(uid, { favoriteProducts: favorites });
  }
}

// Remove product from favorites
export async function removeFromFavorites(uid: string, productId: string): Promise<void> {
  const user = await getUserProfile(uid);
  
  if (!user) {
    throw new Error(`User with ID ${uid} not found`);
  }
  
  const favorites = user.favoriteProducts || [];
  
  if (favorites.includes(productId)) {
    await updateUserProfile(uid, { 
      favoriteProducts: favorites.filter(id => id !== productId) 
    });
  }
}

// Update order statistics for user
export async function updateOrderStats(uid: string, orderAmount: number): Promise<void> {
  const user = await getUserProfile(uid);
  
  if (!user) {
    throw new Error(`User with ID ${uid} not found`);
  }
  
  await updateUserProfile(uid, {
    orderCount: (user.orderCount || 0) + 1,
    totalSpent: (user.totalSpent || 0) + orderAmount
  });
}

// Delete user profile
export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, uid);
} 