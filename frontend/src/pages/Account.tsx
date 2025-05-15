import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Cake, ShoppingBag, Settings, Heart } from 'lucide-react';
import UserProfile from '@/components/auth/UserProfile';
import AccountOrders from '@/components/account/AccountOrders';
import AccountSettings from '@/components/account/AccountSettings';
import AccountFavorites from '@/components/account/AccountFavorites';
import AccountDashboard from '@/components/account/AccountDashboard'; // Import AccountDashboard
import { LayoutDashboard } from 'lucide-react'; // Import icon

// Tab type definition
type TabType = 'dashboard' | 'profile' | 'orders' | 'settings' | 'favorites'; // Add 'dashboard' tab

export default function Account() {
  const { user, role } = useAuth(); // Get role from useAuth
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard'); // Default to 'dashboard'

  // Parse the tab from the URL if available (e.g., /account?tab=orders)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    // Include 'dashboard' in the valid tabs check
    if (tab && ['dashboard', 'profile', 'orders', 'settings', 'favorites'].includes(tab)) {
      setActiveTab(tab as TabType);
    } else if (!tab) {
        // If no tab parameter, default to dashboard
        setActiveTab('dashboard');
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
                {role && <p className="text-sm text-gray-500 capitalize">Role: {role}</p>} {/* Display role */}
              </div>
            </div>
            
            <nav className="flex flex-col">
               {/* Dashboard Link */}
              <button 
                onClick={() => handleTabChange('dashboard')}
                className={`flex items-center space-x-3 p-3 rounded-md transition ${
                  activeTab === 'dashboard' 
                    ? 'bg-hotpink text-white' 
                    : 'hover:bg-rosepink/10 text-gray-700'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              {/* Profile Link */}
              <button 
                onClick={() => handleTabChange('profile')}
                className={`flex items-center space-x-3 p-3 rounded-md transition ${
                  activeTab === 'profile' 
                    ? 'bg-hotpink text-white' 
                    : 'hover:bg-rosepink/10 text-gray-700'
                }`}
              >
                <Cake className="w-5 h-5" /> {/* Using Cake icon for Profile, maybe change? */}
                <span>Profile</span>
              </button>
              {/* Order History Link */}
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
              {/* Favorites Link */}
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
              {/* Account Settings Link */}
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
            {/* Render content based on activeTab */}
            {activeTab === 'dashboard' && <AccountDashboard />}
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
