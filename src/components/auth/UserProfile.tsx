import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircle, Cake, Calendar, Mail, ShoppingBag, Phone } from 'lucide-react';
import { getUserProfile } from '@/services/userService';
import type { UserProfile as UserProfileType } from '@/services/userService';
import { formatDate } from '@/utils/formatters';

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
        const userProfileData = await getUserProfile(user.uid);
        setProfileData(userProfileData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile data. Please refresh the page to try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [user]);

  if (!user) {
    return <div>Loading profile...</div>;
  }
  
  // Get member since date
  const memberSince = profileData?.createdAt 
    ? formatDate(profileData.createdAt, { type: 'date' })
    : formatDate(new Date(), { type: 'date' });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Profile Overview</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotpink"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:w-1/2">
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-rosepink/20 flex items-center justify-center mb-3">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Profile'} 
                    className="w-24 h-24 rounded-full object-cover" 
                  />
                ) : (
                  <UserCircle className="w-16 h-16 text-hotpink" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {profileData?.displayName || user?.displayName || 'Nana Pastry Customer'}
              </h3>
              <p className="text-gray-500 flex items-center text-sm">
                <Mail className="w-4 h-4 mr-1" />
                {profileData?.email || user?.email}
              </p>
              {profileData?.phone && (
                <p className="text-gray-500 flex items-center text-sm mt-1">
                  <Phone className="w-4 h-4 mr-1" />
                  {profileData.phone}
                </p>
              )}
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Member Since
                </div>
                <span className="font-medium">{memberSince}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center text-gray-600">
                  <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                  Orders Placed
                </div>
                <span className="font-medium">{profileData?.orderCount || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center text-gray-600">
                  <Cake className="w-4 h-4 mr-2 text-gray-400" />
                  Favorite Cakes
                </div>
                <span className="font-medium">
                  {profileData?.favoriteProducts?.length || 0}
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:w-1/2">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <a href="/account?tab=orders" className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition flex items-center">
                <ShoppingBag className="w-5 h-5 mr-3 text-hotpink" />
                <span>View Your Order History</span>
              </a>
              
              <a href="/account?tab=settings" className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition flex items-center">
                <UserCircle className="w-5 h-5 mr-3 text-hotpink" />
                <span>Update Personal Information</span>
              </a>
              
              <a href="/products" className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition flex items-center">
                <Cake className="w-5 h-5 mr-3 text-hotpink" />
                <span>Browse Our Cake Selection</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}