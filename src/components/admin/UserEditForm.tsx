import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, UserProfile, saveUserProfile } from '@/services/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const UserEditForm: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth(); // Get current admin user for restrictions
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // To store the original fetched profile
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    email: '', // Will be read-only
    phoneNumber: '',
    role: 'user',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      showErrorToast('User ID is missing.');
      navigate('/admin-portal/user-management');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(userId);
        if (profile) {
          setUserProfile(profile);
          setFormData({ // Initialize formData with fetched profile data
            displayName: profile.displayName || '',
            email: profile.email,
            phoneNumber: profile.phoneNumber || '',
            role: profile.role || 'user',
            address: profile.address ? { ...profile.address } : { street: '', city: '', state: '', zipCode: '', country: '' },
          });
        } else {
          showErrorToast('User not found.');
          navigate('/admin-portal/user-management');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        showErrorToast('Failed to fetch user profile.');
        navigate('/admin-portal/user-management');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId, navigate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userProfile || !userId) return;

    event.preventDefault();
    if (!userProfile || !userId || !adminUser) return;

    // Admin restrictions (case-insensitive role comparison)
    if (adminUser.uid === userId && formData.role?.toLowerCase() !== 'admin') {
      showErrorToast("Admins cannot change their own role.");
      setFormData(prev => ({ ...prev, role: 'admin' })); // Revert role change
      return;
    }
    if (userProfile.role?.toLowerCase() === 'admin' && formData.role?.toLowerCase() !== 'admin' && adminUser.uid !== userId) {
      showErrorToast("Admins cannot change other admins' roles.");
      setFormData(prev => ({ ...prev, role: userProfile.role })); // Revert role change
      return;
    }
    // Note: Deleting admins is not handled here, would be in a delete function.
    
    try {
      setLoading(true);
      
      const profileToSave: UserProfile = {
        ...userProfile, // Spread existing profile to keep fields not in form (like photoURL, orderHistory)
        displayName: formData.displayName || null,
        phoneNumber: formData.phoneNumber || null,
        role: formData.role || 'user', // Use formData.role
        address: formData.address || null,
        // userId and email are from userProfile and should not change here
        // createdAt should also remain from original userProfile
        updatedAt: new Date(), // Set/update the updatedAt timestamp
      };
      
      // Using the existing saveUserProfile signature with a workaround.
      // Ideally, this would be a more specific update function.
      // It expects: (_p0: { userId: string; ... }, _p1: boolean, userProfile: UserProfile)
      // This needs to be reconciled. For now, I'll adapt to the existing signature
      // by providing dummy values for the first two parameters.
      // THIS IS A TEMPORARY WORKAROUND and should be fixed by either:
      // 1. Changing saveUserProfile to accept Partial<UserProfile> and userId
      // 2. Creating a dedicated updateUserRole(userId: string, role: string) function.
      await saveUserProfile(
        { userId: userProfile.userId, displayName: userProfile.displayName || '', photoURL: userProfile.photoURL || '', email: userProfile.email, phoneNumber: userProfile.phoneNumber || '', address: '' }, // Dummy _p0
        false, // Dummy _p1
        profileToSave 
      );

      showSuccessToast('User role updated successfully!');
      setUserProfile(profileToSave); // Update local state
      // navigate('/admin-portal/user-management'); // Optionally navigate back
    } catch (error) {
      console.error("Error updating user role:", error);
      showErrorToast('Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userProfile) {
    return <p>User not found.</p>; // Should have been redirected already
  }

  return (
    // Consistent card styling
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Consistent heading styling */}
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">Edit User: {userProfile.email}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-body font-medium text-deepbrown/90">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName || ''}
            onChange={handleInputChange}
            // Consistent input styling
            className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-body font-medium text-deepbrown/90">
            Email (Read-only)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''} // Display from formData, but it's not meant to be changed by admin
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm bg-warmgray-100 sm:text-sm font-body text-warmgray-700"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-body font-medium text-deepbrown/90">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          />
        </div>

        {/* Address Fields */}
        <fieldset className="space-y-2 border p-4 rounded-md border-warmgray-300">
          <legend className="text-sm font-body font-medium text-deepbrown/90 px-1">Address</legend>
          <div>
            <label htmlFor="street" className="block text-xs font-body font-medium text-warmgray-700">Street</label>
            <input type="text" name="street" id="street" value={formData.address?.street || ''} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
          </div>
          <div>
            <label htmlFor="city" className="block text-xs font-body font-medium text-warmgray-700">City</label>
            <input type="text" name="city" id="city" value={formData.address?.city || ''} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="state" className="block text-xs font-body font-medium text-warmgray-700">State</label>
              <input type="text" name="state" id="state" value={formData.address?.state || ''} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-xs font-body font-medium text-warmgray-700">Zip Code</label>
              <input type="text" name="zipCode" id="zipCode" value={formData.address?.zipCode || ''} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
            </div>
            <div>
              <label htmlFor="country" className="block text-xs font-body font-medium text-warmgray-700">Country</label>
              <input type="text" name="country" id="country" value={formData.address?.country || ''} onChange={handleAddressChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
            </div>
          </div>
        </fieldset>

        <div>
          <label htmlFor="role" className="block text-sm font-body font-medium text-deepbrown/90">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role || 'user'} // Use formData.role
            onChange={handleInputChange} // Use handleInputChange
            // Consistent select styling
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-warmgray-300 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm rounded-md font-body"
          >
            <option value="user">User</option>
            <option value="baker">Baker</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin-portal/user-management')}
            // Consistent secondary button styling
            className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            // Consistent primary button styling
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditForm;
