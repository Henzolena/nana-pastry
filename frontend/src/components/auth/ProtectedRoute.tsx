import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner'; // Import LoadingSpinner using relative path

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Optional role check
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, role, loading: authLoading } = useAuth(); // Get role from context

  // If still loading authentication state or role
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // If user is not authenticated, redirect to home or login
  // If user is not authenticated, redirect to home or login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated but email is not verified, redirect
  if (!user.emailVerified) {
    console.warn(`User ${user.uid} has not verified their email.`);
    // Redirect to a page informing the user to verify their email
    return <Navigate to="/email-verification-required" replace />;
  }

  // If a specific role is required, check if the user has it (case-insensitive)
  if (requiredRole) {
    if (!role || role.toLowerCase() !== requiredRole.toLowerCase()) {
      // User is authenticated and email is verified, but does not have the required role
      console.warn(`User ${user.uid} (role: ${role}) does not have the required role: ${requiredRole}`);
      // Redirect to home or a specific unauthorized page
      return <Navigate to="/" replace />; // Redirect to home for unauthorized role
    }
  }

  // If authenticated, email is verified, and either no role is required or the required role matches, render children
  return <>{children}</>;
};

export default ProtectedRoute;
