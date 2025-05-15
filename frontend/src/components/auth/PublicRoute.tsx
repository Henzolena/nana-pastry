import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute component ensures routes are accessible to both authenticated and unauthenticated users.
 * Unlike ProtectedRoute, it doesn't redirect based on authentication status.
 * It only shows a loading spinner while auth state is being determined.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { loading: authLoading } = useAuth();

  // If still loading authentication state
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Always render children for public routes, regardless of authentication status
  return <>{children}</>;
};

export default PublicRoute;
