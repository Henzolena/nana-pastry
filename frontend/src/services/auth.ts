import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Convert Firebase user to our app's user model
const formatUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
};

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName?: string): Promise<AuthUser> => {
  try {
    // Check if auth is properly initialized
    if (!auth || !auth.currentUser) {
      console.warn("Auth not initialized properly");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    return formatUser(user);
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return formatUser(userCredential.user);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Subscribe to auth state changes - with error handling
export const subscribeToAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) => {
  try {
    // Check if onAuthStateChanged is available
    if (typeof firebaseOnAuthStateChanged !== 'function') {
      console.error('Firebase auth.onAuthStateChanged is not a function');
      // Return a noop unsubscribe function
      return () => {};
    }
    
    return firebaseOnAuthStateChanged(auth, (user) => {
      callback(user ? formatUser(user) : null);
    });
  } catch (error) {
    console.error('Error subscribing to auth changes:', error);
    // Return a noop unsubscribe function
    return () => {};
  }
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  try {
    const user = auth.currentUser;
    return user ? formatUser(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}; 