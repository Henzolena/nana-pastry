import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase';

// Define authentication context type
interface AuthContextType {
  user: User | null;
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
      (user) => {
        setUser(user);
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
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
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
      
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
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
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Failed to log out'));
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
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