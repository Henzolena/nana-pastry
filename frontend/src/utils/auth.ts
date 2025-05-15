/**
 * Utility functions to handle authentication and authorization in the frontend
 */
import { useAuth } from '@/contexts/AuthContext';

/**
 * Check if the current user has a specific role
 * @param requiredRole The role to check for (e.g., 'admin', 'baker', 'user')
 * @returns Boolean indicating if user has the specified role
 */
export const hasRole = (userRole: string | null, requiredRole: string): boolean => {
  if (!userRole) return false;
  
  // For 'admin' role, only admins can access
  if (requiredRole === 'admin') {
    return userRole === 'admin';
  }
  
  // For 'baker' role, both bakers and admins can access
  if (requiredRole === 'baker') {
    return userRole === 'baker' || userRole === 'admin';
  }
  
  // For 'user' role, any authenticated user can access
  if (requiredRole === 'user') {
    return true; // All authenticated users have at least 'user' role
  }
  
  return false;
};

/**
 * React hook to check if the current user has a specific role
 * @param requiredRole The role to check for (e.g., 'admin', 'baker', 'user')
 * @returns Boolean indicating if current user has the specified role
 */
export const useHasRole = (requiredRole: string): boolean => {
  const { role } = useAuth();
  return hasRole(role, requiredRole);
};

/**
 * Check if the user has access to a specific feature
 * @param userRole The user's role
 * @param feature The feature to check access for
 * @returns Boolean indicating if user has access to the feature
 */
export const hasAccess = (userRole: string | null, feature: string): boolean => {
  if (!userRole) return false;
  
  // Define feature access based on roles
  const featureAccess = {
    'user-management': ['admin'],
    'order-management': ['admin', 'baker'],
    'product-management': ['admin', 'baker'],
    'profile-edit': ['user', 'baker', 'admin'], // Everyone can edit their own profile
    'analytics': ['admin'],
  };
  
  const allowedRoles = featureAccess[feature as keyof typeof featureAccess] || [];
  return allowedRoles.includes(userRole);
};

/**
 * React hook to check if the current user has access to a specific feature
 * @param feature The feature to check access for
 * @returns Boolean indicating if current user has access to the feature
 */
export const useHasAccess = (feature: string): boolean => {
  const { role } = useAuth();
  return hasAccess(role, feature);
};
