import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/services/apiService';
import { useState, useEffect } from 'react';

/**
 * Custom hook to check authentication status with the backend
 * @returns Authentication status and user data from the backend
 */
export function useAuthCheck() {
  const { user } = useAuth();
  const [backendAuthStatus, setBackendAuthStatus] = useState<'loading' | 'success' | 'error' | 'not-authenticated'>('not-authenticated');
  const [backendUserData, setBackendUserData] = useState<any>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBackendAuthStatus('not-authenticated');
      setBackendUserData(null);
      return;
    }

    const verifyAuthWithBackend = async () => {
      setBackendAuthStatus('loading');
      setBackendError(null);
      
      try {
        // Call the backend authentication check endpoint
        const response = await apiGet('/auth/check-auth');
        
        // Verify the response has the expected structure
        if (response && typeof response === 'object' && 'user' in response) {
          setBackendAuthStatus('success');
          setBackendUserData((response as { user: any }).user);
        } else {
          throw new Error('Invalid response structure from server');
        }
      } catch (error) {
        setBackendAuthStatus('error');
        setBackendError(error instanceof Error ? error.message : String(error));
        console.error('Backend authentication check failed:', error);
      }
    };

    verifyAuthWithBackend();
  }, [user]);

  return { backendAuthStatus, backendUserData, backendError };
}

/**
 * Custom hook for API-protected operations
 * @returns Functions for checking auth status before making authenticated API requests
 */
export function useAuthProtectedApi() {
  const { backendAuthStatus, backendError } = useAuthCheck();
  
  /**
   * Executes an API call only if the user is authenticated
   * @param callback The API call to execute
   * @param onError Optional error handler
   */
  const executeIfAuthenticated = async <T,>(
    callback: () => Promise<T>,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    if (backendAuthStatus !== 'success') {
      const error = backendAuthStatus === 'error' 
        ? backendError || 'Authentication error with backend' 
        : 'Not authenticated with backend';
      
      if (onError) {
        onError(new Error(error));
      }
      return null;
    }
    
    try {
      return await callback();
    } catch (error) {
      if (onError) {
        onError(error);
      }
      return null;
    }
  };

  return {
    backendAuthStatus,
    executeIfAuthenticated
  };
}
