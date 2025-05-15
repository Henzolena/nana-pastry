import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, CakeSlice, Trash, AlertTriangle, RefreshCw } from 'lucide-react';
import { getUserProfile } from '@/services/userService';
import { getCakeById } from '@/services/firestore';
import { removeFromFavorites } from '@/services/userService';
import { Cake } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function AccountFavorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Enhanced fetchFavorites with better error handling and caching
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get user profile to get favorite product IDs
      const userProfile = await getUserProfile(user.uid);
      
      if (userProfile && userProfile.favoriteProducts && userProfile.favoriteProducts.length > 0) {
        console.log(`Fetching ${userProfile.favoriteProducts.length} favorite cakes`);
        
        // Create a map for tracking potential failures
        const results: { success: Cake[], failed: string[] } = {
          success: [],
          failed: []
        };
        
        // Use Promise.allSettled for more robust handling of multiple promises
        const cakePromises = userProfile.favoriteProducts.map(id => 
          getCakeById(id)
            .then(cake => {
              if (cake) {
                results.success.push(cake);
              } else {
                results.failed.push(id);
              }
            })
            .catch(err => {
              console.error(`Error fetching cake ${id}:`, err);
              results.failed.push(id);
            })
        );
        
        await Promise.allSettled(cakePromises);
        
        // Log any failures for debugging
        if (results.failed.length > 0) {
          console.warn(`Failed to fetch ${results.failed.length} cakes: ${results.failed.join(', ')}`);
          
          // If all cakes failed to load, show an error
          if (results.success.length === 0 && results.failed.length > 0) {
            setError('Unable to load your favorite cakes. This might be a temporary issue or the cakes may have been removed.');
          }
          
          // For development - consider automatic cleanup of invalid favorites
          if (process.env.NODE_ENV === 'development') {
            console.log('In development mode, you might want to clean up invalid favorites');
            // Uncomment to enable automatic cleanup:
            // results.failed.forEach(id => {
            //   removeFromFavorites(user.uid, id).catch(e => 
            //     console.error(`Failed to auto-remove invalid favorite ${id}:`, e)
            //   );
            // });
          }
        }
        
        // Set successfully fetched cakes
        setFavorites(results.success);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load your favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites, refreshTrigger]);

  const handleRemoveFromFavorites = async (cakeId: string) => {
    if (!user) return;
    
    try {
      // Add to processing state for UI feedback
      setProcessingIds(ids => [...ids, cakeId]);
      
      // Optimistic update - remove from UI immediately
      setFavorites(currentFavorites => currentFavorites.filter(cake => cake.id !== cakeId));
      
      // Actually remove in backend
      await removeFromFavorites(user.uid, cakeId);
    } catch (err) {
      console.error('Error removing from favorites:', err);
      
      // Restore the item if the operation failed
      fetchFavorites();
      setError('Failed to remove from favorites. Please try again.');
    } finally {
      // Remove from processing state
      setProcessingIds(ids => ids.filter(id => id !== cakeId));
    }
  };

  const handleViewDetails = (cakeId: string) => {
    navigate(`/products/${cakeId}`);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Placeholder for empty state
  if (!loading && favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Favorites Yet</h3>
        <p className="text-gray-500 mb-6">You haven't added any cakes to your favorites yet.</p>
        <a 
          href="/products" 
          className="inline-flex items-center bg-hotpink hover:bg-hotpink/90 text-white py-2 px-4 rounded transition"
        >
          <CakeSlice className="w-5 h-5 mr-2" />
          Browse Our Cakes
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
        <button
          onClick={handleRefresh}
          className="bg-white px-3 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold mb-0">Your Favorite Cakes</h2>
          <div className="flex items-center text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            Loading favorites...
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold mb-0">Your Favorite Cakes</h2>
        <button 
          onClick={handleRefresh}
          className="flex items-center text-sm text-gray-600 hover:text-hotpink transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((cake) => (
          <div key={cake.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group">
            <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => handleViewDetails(cake.id)}>
              <img 
                src={cake.images[0]} 
                alt={cake.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromFavorites(cake.id);
                }}
                disabled={processingIds.includes(cake.id)}
                className={`absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-full transition ${
                  processingIds.includes(cake.id) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Remove from favorites"
              >
                {processingIds.includes(cake.id) ? (
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <Trash className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
            
            <div 
              className="p-4 cursor-pointer" 
              onClick={() => handleViewDetails(cake.id)}
            >
              <h3 className="font-medium text-gray-900 mb-1">
                {cake.name}
              </h3>
              <p className="text-gray-500 text-sm mb-2">
                {cake.category.charAt(0).toUpperCase() + cake.category.slice(1)} Cake
              </p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  ${cake.price.toFixed(2)}
                </span>
                <button 
                  className="text-sm text-hotpink hover:text-hotpink/80 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(cake.id);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 