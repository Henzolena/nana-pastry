import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // Removed sendEmailVerification as it's now backend responsibility
} from 'firebase/auth';
import { auth, db } from '../lib/firebase'; // Updated to use from lib
// import { db } from '../lib/firebase'; // db is already imported from lib/firebase with auth
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast'; // Import toast utilities
import { apiPost } from '@/services/apiService'; // Import apiService functions

// Define authentication context type
interface AuthContextType {
  user: User | null;
  role: string | null; // Add role to context type
  loading: boolean;
  error: string | null; // Change error type to string for simpler API error messages
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>; // Added displayName
  logout: () => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>; // Added backend call for verification
  sendPasswordResetEmail: (email: string) => Promise<void>; // Added backend call for password reset
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // Add role state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Changed error state type

  // Clear any authentication errors
  const clearError = () => {
    setError(null);
  };

  // Set up auth state listener
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError('Firebase authentication is not initialized');
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => { // Make the callback async
        setUser(user);
        if (user) {
          console.log("Auth state changed: User is signed in", user.uid);
          
          // Force token refresh to make sure we have the latest custom claims
          try {
            await user.getIdToken(true);
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
          }
          
          // Fetch user role from Firestore
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              const userRole = userData?.role || null;
              console.log(`User ${user.uid} role from Firestore:`, userRole);
              setRole(userRole);
              
              // Make the role available on the user object for easier access
              (user as any).role = userRole;
            } else {
              console.warn(`User document for ${user.uid} doesn't exist in Firestore`);
              setRole(null);
            }
          } catch (firestoreError: any) {
            console.error('Error fetching user role:', firestoreError);
            setRole(null);
          }
        } else {
          console.log("Auth state changed: User is signed out");
          setRole(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error.message || 'An authentication error occurred.');
        setLoading(false);
      }
    );

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Sign in handler (remains client-side using Firebase SDK)
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
      setError(userMessage); // Set error state as string
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler (calls backend API)
  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      clearError();

      // Use apiService instead of direct fetch
      const data = await apiPost('/auth/signup', { 
        email, 
        password, 
        displayName 
      });

      console.log('Backend signup successful:', data);
      showSuccessToast('Signed up successfully! Please check your email for verification.');
      // Note: User is NOT automatically signed in after backend signup.
      // They need to use the signIn function after verifying their email.

    } catch (err: any) {
      console.error('Sign up error:', err);
      const userMessage = err.message || 'Failed to sign up. Please try again.';
      showErrorToast(userMessage);
      setError(userMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler (remains client-side using Firebase SDK)
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
      setError(userMessage); // Set error state as string
    } finally {
      setLoading(false);
    }
  };

  // Send Email Verification handler (calls backend API)
  const handleSendEmailVerification = async (email: string) => {
    try {
      setLoading(true);
      clearError();

      // Use apiService instead of direct fetch
      await apiPost('/auth/send-verification-email', { email });
      
      console.log('Verification email sent successfully via backend');
      showInfoToast(`Verification email sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      console.error('Send verification email error:', err);
      const userMessage = err.message || 'Failed to send verification email. Please try again.';
      showErrorToast(userMessage);
      setError(userMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send Password Reset Email handler (calls backend API)
  const handleSendPasswordResetEmail = async (email: string) => {
    try {
      setLoading(true);
      clearError();

      // Use apiService instead of direct fetch
      await apiPost('/auth/send-password-reset', { email });
      
      console.log('Password reset email sent successfully via backend');
      showInfoToast(`Password reset email sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      console.error('Send password reset email error:', err);
      const userMessage = err.message || 'Failed to send password reset email. Please try again.';
      showErrorToast(userMessage);
      setError(userMessage);
      throw err;
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
    sendEmailVerification: handleSendEmailVerification, // Include new function
    sendPasswordResetEmail: handleSendPasswordResetEmail, // Include new function
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
