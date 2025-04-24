import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addToFavorites, removeFromFavorites, getUserProfile } from '@/services/userService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  buttonStyle?: 'icon-only' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({
  productId,
  className = '',
  buttonStyle = 'icon-only',
  size = 'md',
  onFavoriteChange
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    loading: boolean;
    isFavorite: boolean;
    processing: boolean;
  }>({
    loading: false,
    isFavorite: false,
    processing: false,
  });

  // Check initial favorite status
  useEffect(() => {
    if (!productId || !user) return;
    checkFavoriteStatus();
  }, [productId, user]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const userProfile = await getUserProfile(user.uid);
      
      if (userProfile && userProfile.favoriteProducts) {
        const isFavorite = userProfile.favoriteProducts.includes(productId);
        setStatus({
          loading: false,
          isFavorite,
          processing: false
        });
        
        // Notify parent component if needed
        if (onFavoriteChange) {
          onFavoriteChange(isFavorite);
        }
      } else {
        setStatus({
          loading: false,
          isFavorite: false,
          processing: false
        });
      }
    } catch (error) {
      console.error('Error checking favorites status:', error);
      setStatus({
        loading: false,
        isFavorite: false,
        processing: false
      });
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!productId) return;
    
    // If not logged in, show login prompt
    if (!user) {
      toast.info('Please sign in to save favorites', {
        description: 'Create an account or sign in to save your favorite cakes',
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = '/auth?tab=signin'
        },
        duration: 5000
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, processing: true }));
      
      if (status.isFavorite) {
        await removeFromFavorites(user.uid, productId);
        toast.success('Removed from favorites');
      } else {
        // Before adding to favorites, validate that the cake exists
        try {
          const { getCakeById } = await import('@/services/firestore');
          const cake = await getCakeById(productId);
          
          if (!cake) {
            toast.error('Unable to add to favorites', {
              description: 'This cake is no longer available'
            });
            setStatus(prev => ({ ...prev, processing: false }));
            return;
          }
        } catch (validationError) {
          console.error('Error validating cake before adding to favorites:', validationError);
          // Continue with adding to favorites even if validation fails, to ensure the best user experience
        }
        
        await addToFavorites(user.uid, productId);
        toast.success('Added to favorites');
      }
      
      // Update state
      const newState = !status.isFavorite;
      setStatus(prev => ({
        ...prev,
        isFavorite: newState,
        processing: false
      }));
      
      // Notify parent component
      if (onFavoriteChange) {
        onFavoriteChange(newState);
      }
      
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('Something went wrong', {
        description: 'Please try again later'
      });
      setStatus(prev => ({ ...prev, processing: false }));
    }
  };

  // Size presets
  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  // Heart icon sizes
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  if (buttonStyle === 'icon-only') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleFavorite}
        disabled={status.loading || status.processing}
        className={`rounded-full ${sizeClasses[size]} transition-all ${
          status.processing ? 'opacity-70 cursor-not-allowed' : ''
        } ${
          status.isFavorite ? 'text-hotpink hover:text-red-500' : 'text-gray-500 hover:text-hotpink'
        } ${className}`}
        title={status.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {status.loading || status.processing ? (
          <div className={`border-2 border-gray-300 border-t-hotpink rounded-full animate-spin`} 
               style={{ height: iconSizes[size], width: iconSizes[size] }} />
        ) : (
          <Heart size={iconSizes[size]} className={status.isFavorite ? 'fill-current' : ''} />
        )}
      </motion.button>
    );
  }

  // Pill button style
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={toggleFavorite}
      disabled={status.loading || status.processing}
      className={`rounded-full flex items-center transition-all ${
        status.isFavorite 
          ? 'bg-rose-50 text-hotpink border-rose-200 hover:bg-rose-100' 
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
      } border ${sizeClasses[size]} ${
        status.processing ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
    >
      {status.loading || status.processing ? (
        <div className={`border-2 border-gray-300 border-t-hotpink rounded-full animate-spin mr-2`}
             style={{ height: iconSizes[size], width: iconSizes[size] }} />
      ) : (
        <Heart size={iconSizes[size]} className={`${status.isFavorite ? 'fill-current' : ''} mr-2`} />
      )}
      <span>{status.isFavorite ? 'Saved' : 'Save'}</span>
    </motion.button>
  );
} 