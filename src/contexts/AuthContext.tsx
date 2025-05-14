import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification // Import sendEmailVerification
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { db } from '../lib/firebase'; // Import Firestore instance
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions, setDoc, and serverTimestamp
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast'; // Import toast utilities

// Define authentication context type
interface AuthContextType {
  user: User | null;
  role: string | null; // Add role to context type
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // Add role state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Clear any authentication errors
  const clearError = () => {
    setError(null);
  };

  // Set up auth state listener
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError(new Error('Firebase authentication is not initialized'));
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => { // Make the callback async
        setUser(user);
        if (user) {
          // Fetch user role from Firestore
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setRole(userDocSnap.data()?.role || null); // Assuming role is stored in a 'role' field
            } else {
              setRole(null); // User document doesn't exist
            }
          } catch (firestoreError) {
            console.error('Error fetching user role:', firestoreError);
            setRole(null); // Handle error by setting role to null
          }
        } else {
          setRole(null); // Clear role when user logs out
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
      }
    );

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Sign in handler
  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      if (!auth) throw new Error('Firebase authentication is not initialized');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user && !user.emailVerified) {
        // If email is not verified, sign out the user and throw an error
        await signOut(auth);
        throw new Error('Please verify your email address before signing in.');
      }

      // If email is verified, the onAuthStateChanged listener will handle setting the user and role
      showSuccessToast('Signed in successfully!'); // Show success toast

    } catch (err: any) { // Use 'any' for error type to access code property
      console.error('Sign in error:', err);
      let userMessage = 'Failed to sign in. Please try again.';

      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            userMessage = 'Invalid email address format.';
            break;
          case 'auth/user-disabled':
            userMessage = 'Your account has been disabled.';
            break;
          case 'auth/user-not-found':
            userMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            userMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-credential':
            userMessage = 'Invalid credentials. Please check your email and password.';
            break;
          case 'auth/too-many-requests':
            userMessage = 'Too many sign-in attempts. Try again later.';
            break;
          default:
            // For unhandled Firebase errors, use the provided message
            userMessage = err.message || 'An unexpected error occurred during sign in.';
        }
      } else if (err instanceof Error) {
        // For non-Firebase errors, use the error message
        userMessage = err.message;
      }

      showErrorToast(userMessage); // Show human-readable error toast
      // setError(err instanceof Error ? err : new Error(userMessage)); // Removed redundant setError
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const handleSignUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      if (!auth) throw new Error('Firebase authentication is not initialized');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Create user document in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            userId: user.uid,
            email: user.email,
            role: 'user', // Assign a default role, e.g., 'user'
            createdAt: serverTimestamp(), // Add a timestamp
          }, { merge: true }); // Use merge: true to avoid overwriting if doc exists (e.g., from admin creation)
          console.log('User document created in Firestore for', user.email);
        } catch (firestoreError) {
          console.error('Error creating user document in Firestore:', firestoreError);
          showErrorToast('Failed to save user profile.'); // Show error toast for firestore
        }

        // Send email verification
        await sendEmailVerification(user);
        console.log('Email verification sent to', user.email);
        showInfoToast(`Verification email sent to ${user.email}. Please check your inbox.`); // Show info toast

        showSuccessToast('Signed up successfully!'); // Show success toast for signup
      }

    } catch (err: any) { // Use 'any' for error type
      console.error('Sign up error:', err);
      let userMessage = 'Failed to sign up. Please try again.';

      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            userMessage = 'This email address is already in use.';
            break;
          case 'auth/invalid-email':
            userMessage = 'Invalid email address format.';
            break;
          case 'auth/operation-not-allowed':
            userMessage = 'Email/password accounts are not enabled.';
            break;
          case 'auth/weak-password':
            userMessage = 'Password is too weak. Please choose a stronger password.';
            break;
          default:
            // For unhandled Firebase errors, use the provided message
            userMessage = err.message || 'An unexpected error occurred during sign up.';
        }
      } else if (err instanceof Error) {
        // For non-Firebase errors, use the error message
        userMessage = err.message;
      }

      showErrorToast(userMessage); // Show human-readable error toast
      // setError(err instanceof Error ? err : new Error(userMessage)); // Removed redundant setError
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      setLoading(true);
      clearError();

      if (!auth) throw new Error('Firebase authentication is not initialized');

      await signOut(auth);
      showSuccessToast('Logged out successfully!'); // Show success toast
    } catch (err: any) { // Use 'any' for error type
      console.error('Logout error:', err);
      let userMessage = 'Failed to log out. Please try again.';

      if (err.code) {
        // Add specific logout error code mappings if needed
        userMessage = err.message || 'An unexpected error occurred during logout.'; // Fallback to Firebase message
      } else if (err instanceof Error) {
        userMessage = err.message;
      }

      showErrorToast(userMessage); // Show human-readable error toast
      // setError(err instanceof Error ? err : new Error(userMessage)); // Removed redundant setError
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    role, // Include role in the context value
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    logout: handleLogout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
