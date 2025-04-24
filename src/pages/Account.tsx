import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Cake, ShoppingBag, Settings, Heart, Clock } from 'lucide-react';
import UserProfile from '@/components/auth/UserProfile';
import AccountOrders from '@/components/account/AccountOrders';
import AccountSettings from '@/components/account/AccountSettings';
import AccountFavorites from '@/components/account/AccountFavorites';

// Tab type definition
type TabType = 'profile' | 'orders' | 'settings' | 'favorites';

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Parse the tab from the URL if available (e.g., /account?tab=orders)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'settings', 'favorites'].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [location]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/account?tab=${tab}`);
  };

  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="text-3xl font-bold mb-8 text-center text-deepbrown">Your Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar/Tabs */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-3 p-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-rosepink/20 flex items-center justify-center">
                <span className="text-xl font-semibold text-hotpink">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.displayName || 'Customer'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <nav className="flex flex-col">
              <button 
                onClick={() => handleTabChange('profile')}
                className={`flex items-center space-x-3 p-3 rounded-md transition ${
                  activeTab === 'profile' 
                    ? 'bg-hotpink text-white' 
                    : 'hover:bg-rosepink/10 text-gray-700'
                }`}
              >
                <Cake className="w-5 h-5" />
                <span>Profile</span>
              </button>
              
              <button 
                onClick={() => handleTabChange('orders')}
                className={`flex items-center space-x-3 p-3 rounded-md transition ${
                  activeTab === 'orders' 
                    ? 'bg-hotpink text-white' 
                    : 'hover:bg-rosepink/10 text-gray-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Order History</span>
              </button>
              
              <button 
                onClick={() => handleTabChange('favorites')}
                className={`flex items-center space-x-3 p-3 rounded-md transition ${
                  activeTab === 'favorites' 
                    ? 'bg-hotpink text-white' 
                    : 'hover:bg-rosepink/10 text-gray-700'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>Favorites</span>
              </button>
              
              <button 
                onClick={() => handleTabChange('settings')}
                className={`flex items-center space-x-3 p-3 rounded-md transition ${
                  activeTab === 'settings' 
                    ? 'bg-hotpink text-white' 
                    : 'hover:bg-rosepink/10 text-gray-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Account Settings</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'orders' && <AccountOrders />}
            {activeTab === 'settings' && <AccountSettings />}
            {activeTab === 'favorites' && <AccountFavorites />}
          </div>
        </div>
      </div>
    </div>
  );
} 