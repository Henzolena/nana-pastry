import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircle, Cake, Calendar, Mail, ShoppingBag, Phone } from 'lucide-react';
import { userApi, UserProfile as UserProfileType } from '@/services/userApi';
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
        const userProfileData = await userApi.getCurrentUserProfile();
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
      
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-rosepink/10 p-3 rounded-full">
              <UserCircle className="h-10 w-10 text-hotpink" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{profileData?.displayName || user.displayName || 'User'}</h3>
              <div className="flex items-center space-x-2 text-gray-500">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {profileData?.phoneNumber && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span>{profileData.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Account Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{memberSince}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Cake className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{profileData?.role || 'User'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="font-medium">{profileData?.orderStats?.totalOrders || 0} orders</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
            {profileData?.address ? (
              <div className="text-sm space-y-1">
                <p>{profileData.address.street}</p>
                <p>{profileData.address.city}, {profileData.address.state} {profileData.address.zipCode}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipping address added yet.</p>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button 
              className="px-4 py-2 bg-hotpink hover:bg-pink-700 text-white text-sm font-medium rounded-md transition-colors"
              onClick={() => window.location.href = '/account/edit-profile'}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
