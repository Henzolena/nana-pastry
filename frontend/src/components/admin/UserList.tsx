import React, { useEffect, useState } from 'react';
import { userApi, UserProfile } from '@/services/userApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHasRole } from '@/utils/auth';

const UserList: React.FC = () => {
  const { user: currentUser, role } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin role using our utility
  const isAdmin = useHasRole('admin');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Use the role filter in the API call if specified
      const fetchedUsers = await userApi.getAllUsers(roleFilter || undefined);
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      
      if (error.status === 401) {
        showErrorToast(`Authentication error: ${error.message || 'You must be logged in with admin privileges'}. Please log out and log back in.`);
      } else if (error.message && error.message.includes('admin')) {
        showErrorToast(`Authorization error: ${error.message}. Your account doesn't have admin privileges.`);
      } else {
        showErrorToast(`Failed to fetch users: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Log the current user information to debug auth issues
    console.log("Current user from context:", currentUser);
    console.log("Current user role from context:", role);
    
    // Only try to fetch users if the user is an admin
    if (isAdmin) {
      fetchUsers();
    } else {
      setError("You don't have administrator privileges to view this page");
      setLoading(false);
    }
  }, [roleFilter, isAdmin]); // Re-fetch when the role filter or admin status changes

  const handleDeleteUser = async (userId: string, isTargetAdmin: boolean) => {
    // Self-protection check
    if (currentUser?.uid === userId) {
      showErrorToast("You cannot delete your own account.");
      return;
    }
    
    // Admin-protection check
    if (isTargetAdmin) {
      showErrorToast("Admins cannot delete other admin accounts through this interface.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        // Use the backend API to delete the user
        await userApi.deleteUser(userId);
        showSuccessToast('User successfully deleted.');
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error("Error deleting user:", error);
        showErrorToast('Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Apply local search filter (the roleFilter is applied at the API level)
  const filteredUsers = users.filter(user => {
    const matchesSearchTerm = (
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return matchesSearchTerm;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  // If not admin, show permission error
  if (!isAdmin) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
          <p className="font-bold">Access Denied</p>
          <p>You don't have administrator privileges to view this page.</p>
          <p className="mt-2">If you believe this is an error, please try:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Signing out and signing back in</li>
            <li>Contacting the site administrator</li>
            <li>Checking if your account has been assigned admin privileges</li>
          </ul>
        </div>
      </div>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-semibold text-deepbrown">User Management</h2>
        <Link
          to="/admin-portal/users/create"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors"
        >
          Create New User
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by email or name..."
          className="w-full p-3 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink font-body text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full p-3 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink font-body text-sm"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="baker">Baker</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {filteredUsers.length === 0 && !loading ? (
        <p className="text-warmgray-600 font-body text-center py-4">No users found matching your criteria.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-warmgray-200">
            <thead className="bg-warmgray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-body font-medium text-deepbrown/80 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-body font-medium text-deepbrown/80 uppercase tracking-wider">Display Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-body font-medium text-deepbrown/80 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-body font-medium text-deepbrown/80 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-body font-medium text-deepbrown/80 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-warmgray-100">
              {filteredUsers
                .filter(user => {
                  if (!user.userId) {
                    console.warn("User object in UserList is missing a 'userId'. Skipping user:", user);
                    return false;
                  }
                  return true;
                })
                .map((user) => (
                <tr key={user.userId} className={`hover:bg-warmgray-50 transition-colors ${currentUser?.uid === user.userId ? 'bg-rosepink/10' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-deepbrown">
                    {user.email}
                    {currentUser?.uid === user.userId && (
                      <span className="ml-2 px-2 py-0.5 bg-hotpink text-white text-xs font-semibold rounded-full">You</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-warmgray-700">{user.displayName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-warmgray-700 capitalize">{user.role || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-warmgray-700">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-body font-medium">
                    <Link 
                      to={`/admin-portal/users/${user.userId}/edit`} 
                      className="text-hotpink hover:text-pink-700 transition-colors mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.userId, user.role?.toLowerCase() === 'admin')}
                      disabled={currentUser?.uid === user.userId || user.role?.toLowerCase() === 'admin'}
                      className={`text-sm font-body font-medium transition-colors 
                        ${(currentUser?.uid === user.userId || user.role?.toLowerCase() === 'admin') 
                          ? 'text-warmgray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-800'}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
