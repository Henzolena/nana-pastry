import React, { useEffect, useState } from 'react';
import { getAllUsers, UserProfile } from '@/services/firestore';
import { deleteDoc, doc } from 'firebase/firestore'; // Import deleteDoc and doc from firebase/firestore
import { db } from '@/lib/firebase'; // Import db for deleteDoc
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// TODO: Consider a proper Modal component for confirmation instead of window.confirm

const UserList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showErrorToast('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userIdToDelete: string, isTargetAdmin: boolean) => {
    if (currentUser?.uid === userIdToDelete) {
      showErrorToast("You cannot delete your own account.");
      return;
    }
    if (isTargetAdmin) {
      showErrorToast("Admins cannot delete other admin accounts through this interface.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user ${userIdToDelete}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        // Step 1: Delete user document from Firestore
        const userDocRef = doc(db, 'users', userIdToDelete);
        await deleteDoc(userDocRef);

        // TODO: Step 2: Delete user from Firebase Authentication.
        console.warn(`User ${userIdToDelete} deleted from Firestore. Implement Firebase Auth deletion.`);
        showInfoToast("User deleted from database. Auth deletion needs backend implementation.");

        showSuccessToast('User successfully deleted from Firestore.');
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error("Error deleting user:", error);
        showErrorToast('Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Apply filters and search to the users list (case-insensitive role comparison)
  const filteredUsers = users.filter(user => {
    const matchesSearchTerm = (
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    // Case-insensitive role comparison for filtering
    const matchesRoleFilter = roleFilter ? user.role?.toLowerCase() === roleFilter.toLowerCase() : true;
    return matchesSearchTerm && matchesRoleFilter;
  });

  if (loading) {
    return <LoadingSpinner />;
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
              {filteredUsers.map((user) => (
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
                    <Link to={`/admin-portal/users/${user.userId}/edit`} className="text-hotpink hover:text-pink-700 transition-colors mr-3">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.userId, user.role?.toLowerCase() === 'admin')} // Case-insensitive check for admin role
                      disabled={currentUser?.uid === user.userId || user.role?.toLowerCase() === 'admin'} // Disable if it's self or another admin (case-insensitive)
                      className={`text-sm font-body font-medium transition-colors 
                        ${(currentUser?.uid === user.userId || user.role?.toLowerCase() === 'admin') 
                          ? 'text-warmgray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-800'}`}
                    >
                      Delete
                    </button>
                    {/* TODO: Add Disable/Enable functionality */}
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
