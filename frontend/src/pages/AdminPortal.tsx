import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Users, BarChart2, Settings as SettingsIcon, LogOut, UserCircle, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import { useAuth } from '@/contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

const AdminPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const adminBasePath = "/admin-portal";

  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Logged out successfully.');
      navigate('/auth');
    } catch (error) {
      console.error("Logout error from Admin Portal:", error);
      showErrorToast('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-warmgray-50"> {/* Consistent page background */}
      {/* Sidebar */}
      <aside className="w-64 bg-deepbrown text-white p-5 flex flex-col justify-between shadow-lg">
        <div> {/* Top section for title and nav */}
          <div className="text-center py-4 border-b border-rosepink/30 mb-6">
            <h2 className="text-2xl font-heading font-semibold text-white">Admin Panel</h2>
            {user && (
              <p className="text-sm text-rosepink/80 mt-1">{user.email}</p>
            )}
          </div>
          <nav className="flex flex-col space-y-2">
             {/* Dashboard Link */}
             <Link
              to={adminBasePath} // Link to the base path for dashboard content
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname === adminBasePath // Highlight if on the base path
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-body">Dashboard</span>
            </Link>
            <Link
              to={`${adminBasePath}/user-management`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${adminBasePath}/user-management`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <Users size={20} />
              <span className="font-body">User Management</span>
            </Link>
            <Link
              to={`${adminBasePath}/profile-settings`}
              className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
                location.pathname.startsWith(`${adminBasePath}/profile-settings`)
                  ? 'bg-hotpink shadow-md'
                  : 'hover:text-white'
              }`}
            >
              <UserCircle size={20} /> 
              <span className="font-body">My Profile</span>
            </Link>
            {/* Placeholder for future links */}
            {/* <Link
              to={`${adminBasePath}/analytics`}
            className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
              location.pathname.startsWith(`${adminBasePath}/analytics`)
                ? 'bg-hotpink shadow-md'
                : 'hover:text-white'
            }`}
          >
            <BarChart2 size={20} />
            <span className="font-body">Analytics</span>
          </Link>
          <Link
            to={`${adminBasePath}/settings`}
            className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 ease-in-out text-white hover:bg-rosepink/30 ${
              location.pathname.startsWith(`${adminBasePath}/settings`)
                ? 'bg-hotpink shadow-md'
                : 'hover:text-white'
            }`}
          >
            <SettingsIcon size={20} />
            <span className="font-body">Site Settings</span>
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
        {/* Outlet will render child routes like UserManagement */}
        {/* Render Outlet only if not on the base /admin-portal path to avoid double rendering dashboard content */}
        {location.pathname !== adminBasePath && <Outlet />}
        
        {/* Default content for the base /admin-portal path */}
        {location.pathname === adminBasePath && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-heading font-bold text-deepbrown mb-6">Admin Dashboard</h1>
            <p className="text-gray-700 font-body">
              Welcome to the Admin Portal. Select an option from the sidebar to manage users, view analytics, or configure site settings.
            </p>
            {/* TODO: Add dashboard widgets or summary information here */}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPortal;
