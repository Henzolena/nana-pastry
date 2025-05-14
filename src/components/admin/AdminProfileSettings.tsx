import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AdminProfileSettings: React.FC = () => {
  const { user: adminUser, role: adminRole, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Logged out successfully.');
      navigate('/auth'); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast('Failed to log out. Please try again.');
    }
  };

  if (loading || !adminUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">Admin Profile & Settings</h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <p className="text-sm font-body text-warmgray-600">Email:</p>
          <p className="text-md font-body text-deepbrown">{adminUser.email}</p>
        </div>
        <div>
          <p className="text-sm font-body text-warmgray-600">Display Name:</p>
          <p className="text-md font-body text-deepbrown">{adminUser.displayName || 'Not Set'}</p>
        </div>
        <div>
          <p className="text-sm font-body text-warmgray-600">Role:</p>
          <p className="text-md font-body text-deepbrown capitalize">{adminRole || 'N/A'}</p>
        </div>
      </div>

      {/* Placeholder for future settings */}
      <div className="mb-8">
        <h3 className="text-lg font-heading font-semibold text-deepbrown mb-3">Admin Settings</h3>
        <p className="text-warmgray-500 font-body">Future admin-specific settings will appear here (e.g., notification preferences, API key management, etc.).</p>
        {/* Example:
        <div className="mt-4">
          <button className="btn btn-outline btn-sm">Change Admin Password</button>
        </div> 
        */}
      </div>

      <div className="mt-8 border-t border-warmgray-200 pt-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-rosepink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminProfileSettings;
