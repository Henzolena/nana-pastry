import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, CakeSlice, Trash } from 'lucide-react';
import { getUserProfile } from '@/services/userService';
import { getCakeById } from '@/services/firestore';
import { removeFromFavorites } from '@/services/userService';
import { Cake } from '@/types';

export default function AccountFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user profile to get favorite product IDs
        const userProfile = await getUserProfile(user.uid);
        
        if (userProfile && userProfile.favoriteProducts && userProfile.favoriteProducts.length > 0) {
          // Fetch each cake by ID
          const cakePromises = userProfile.favoriteProducts.map(id => 
            getCakeById(id).catch(err => {
              console.error(`Error fetching cake ${id}:`, err);
              return null;
            })
          );
          
          const cakes = await Promise.all(cakePromises);
          setFavorites(cakes.filter(cake => cake !== null) as Cake[]);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load your favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFavorites();
  }, [user]);

  const handleRemoveFromFavorites = async (cakeId: string) => {
    if (!user) return;
    
    try {
      await removeFromFavorites(user.uid, cakeId);
      
      // Update UI
      setFavorites(favorites.filter(cake => cake.id !== cakeId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove from favorites. Please try again.');
    }
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotpink"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Your Favorite Cakes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((cake) => (
          <div key={cake.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group">
            <div className="relative h-40 overflow-hidden">
              <img 
                src={cake.images[0]} 
                alt={cake.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => handleRemoveFromFavorites(cake.id)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-full transition"
                aria-label="Remove from favorites"
              >
                <Trash className="w-4 h-4 text-red-500" />
              </button>
            </div>
            
            <div className="p-4">
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
                <a 
                  href={`/products/${cake.id}`}
                  className="text-sm text-hotpink hover:text-hotpink/80 font-medium"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 