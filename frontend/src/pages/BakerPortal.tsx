import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, CheckSquare, History, UserCircle, LogOut, CalendarClock, CakeSlice, LayoutDashboard } from 'lucide-react'; // Icons
import { useAuth } from '@/contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

const BakerPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const bakerBasePath = "/baker-portal";

  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Logged out successfully.');
      navigate('/auth');
    } catch (error) {
      console.error("Logout error from Baker Portal:", error);
      showErrorToast('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-warmgray-50"> {/* Consistent page background */}
      {/* Sidebar */}
      <aside className="w-64 bg-deepbrown text-white p-5 flex flex-col justify-between shadow-lg">
        <div> {/* Top section for title and nav */}
          <div className="text-center py-4 border-b border-rosepink/30 mb-6">
            <h2 className="text-2xl font-heading font-semibold text-white">Baker Dashboard</h2>
            {user && (
              <p className="text-sm text-rosepink/80 mt-1">{user.email}</p>
            )}
          </div>
          <nav className="flex flex-col space-y-2">
             {/* Dashboard Link */}
             <Link
              to={bakerBasePath} // Link to the base path for dashboard content
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname === bakerBasePath // Highlight if on the base path
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-body">Dashboard</span>
            </Link>
            <Link
              to={`${bakerBasePath}/available-orders`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${bakerBasePath}/available-orders`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <ClipboardList size={20} />
              <span className="font-body">Available Orders</span>
            </Link>
            <Link
              to={`${bakerBasePath}/my-active-orders`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${bakerBasePath}/my-active-orders`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <CheckSquare size={20} />
              <span className="font-body">My Active Orders</span>
            </Link>
            <Link
              to={`${bakerBasePath}/order-history`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${bakerBasePath}/order-history`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <History size={20} />
              <span className="font-body">Order History</span>
            </Link>
            <Link
              to={`${bakerBasePath}/profile-availability`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${bakerBasePath}/profile-availability`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <UserCircle size={20} /> 
              <span className="font-body">Profile & Availability</span>
            </Link>
            <Link
              to={`${bakerBasePath}/manage-my-cakes`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${bakerBasePath}/manage-my-cakes`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <CakeSlice size={20} />
              <span className="font-body">Manage My Cakes</span>
            </Link>
             {/* <Link
              to={`${bakerBasePath}/my-cakes`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${bakerBasePath}/my-cakes`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <CakeSlice size={20} />
              <span className="font-body">My Cake Portfolio</span>
            </Link> */}
          </nav>
        </div>
        {/* Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white bg-rosepink/50 hover:bg-hotpink hover:shadow-md"
          >
            <LogOut size={20} />
            <span className="font-body">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {location.pathname !== bakerBasePath && <Outlet />}
        {location.pathname === bakerBasePath && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-heading font-bold text-deepbrown mb-6">Welcome, Baker!</h1>
            <p className="text-gray-700 font-body">
              Select an option from the sidebar to view available orders, manage your active orders, or update your profile and availability.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BakerPortal;
