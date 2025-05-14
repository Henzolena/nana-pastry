import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const RoleBasedRedirect: React.FC = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait until auth state and role are loaded
    if (loading) {
      return;
    }

    const currentPath = location.pathname;
    // Check for the state parameter from any public link
    const fromPublicLink = location.state?.fromPublicLink; // Check for the new state parameter

    // Define the target landing page based on role (case-insensitive comparison)
    let targetPath = null;
    if (user && user.emailVerified) {
      if (role?.toLowerCase() === 'admin') {
        targetPath = '/admin-portal';
      } else if (role?.toLowerCase() === 'baker') {
        targetPath = '/baker-portal';
      } else {
        // Default landing for regular users
        targetPath = '/account';
      }

      // Determine if redirection is needed
      // Redirect if on a public path OR if current path is not the target path (and not a child of target)
      // BUT, do NOT redirect if the navigation came specifically from a public link OR if on a checkout-related path
      const isPublicPath = currentPath === '/' || currentPath === '/auth';
      const isCheckoutPath = currentPath === '/checkout' || 
                             currentPath.startsWith('/checkout/') || 
                             currentPath === '/cart' || 
                             currentPath.startsWith('/cart/');
      // Add check for order details path
      const isOrderDetailsPath = currentPath.startsWith('/orders/');

      const isNotTargetOrChild = targetPath !== null && currentPath !== targetPath && !(currentPath.startsWith(targetPath + '/') && targetPath !== '/');

      // Exclude checkout and order details paths from redirection
      if ((isPublicPath || isNotTargetOrChild) && !fromPublicLink && !isCheckoutPath && !isOrderDetailsPath) {
         // Prevent redirecting if already on the correct target path
        if (currentPath !== targetPath && !(currentPath.startsWith(targetPath + '/') && targetPath !== '/')) {
             navigate(targetPath, { replace: true });
        }
      }
      // If logged in, verified, and on the correct target path or a child path, do nothing.
      // If on the email verification page, let them stay.
      // If fromPublicLink is true, allow navigation to the public page.
      // If on a checkout or order details path, allow navigation.

    } else if (user && !user.emailVerified) {
      // If logged in but email is not verified, redirect to verification page, unless already there
      if (currentPath !== '/email-verification-required') {
        navigate('/email-verification-required', { replace: true });
      }
    }
    // If not logged in, allow access to public routes. ProtectedRoute handles protected routes.

  }, [user, role, loading, navigate, location]);

  // This component doesn't render anything itself, it just handles redirection
  // Show a spinner only if loading and on a path that might redirect
  if (loading && (location.pathname === '/' || location.pathname === '/auth' || location.pathname.startsWith('/admin-portal') || location.pathname.startsWith('/baker-portal'))) {
     return <LoadingSpinner />;
  }


  return null; // This component only handles side effects (navigation)
};

export default RoleBasedRedirect;
