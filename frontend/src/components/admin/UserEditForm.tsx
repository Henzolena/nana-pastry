import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi, UserProfile } from '@/services/userApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

const UserEditForm: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    email: '', // Will be read-only
    phoneNumber: '',
    role: 'user',
    address: { street: '', city: '', state: '', zipCode: '' },
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
        const profile = await userApi.getUserById(userId);
        if (profile) {
          setUserProfile(profile);
          setFormData({
            displayName: profile.displayName || '',
            email: profile.email,
            phoneNumber: profile.phoneNumber || '',
            role: profile.role || 'user',
            address: profile.address ? { ...profile.address } : { street: '', city: '', state: '', zipCode: '' },
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
        ...(prev.address || { street: '', city: '', state: '', zipCode: '' }),
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userProfile || !userId || !adminUser) return;

    // Admin restrictions for role changes
    if (adminUser.uid === userId && formData.role?.toLowerCase() !== 'admin' && formData.role !== userProfile.role) {
      showErrorToast("Admins cannot change their own role.");
      setFormData(prev => ({ ...prev, role: userProfile.role })); // Revert UI to original role
      return;
    }
    
    if (userProfile.role?.toLowerCase() === 'admin' && formData.role?.toLowerCase() !== 'admin' && adminUser.uid !== userId) {
      showErrorToast("Admins cannot change other admins' roles.");
      setFormData(prev => ({ ...prev, role: userProfile.role })); // Revert UI to original role
      return;
    }
    
    try {
      setLoading(true);
      let roleUpdateProcessed = false;
      let generalProfileUpdateProcessed = false;

      // 1. Handle role update separately if it has changed (only for admin editing others)
      if (adminUser.uid !== userId && formData.role && formData.role !== userProfile.role) {
        await userApi.updateUserRole(userId, formData.role as UserProfile['role']);
        roleUpdateProcessed = true;
      }

      // 2. Prepare and send other profile updates (excluding role, and sanitizing address)
      const generalProfileUpdatesPayload: {
        displayName?: string;
        phoneNumber?: string;
        address?: { street: string; city: string; state: string; zipCode: string }; // Address sub-properties are non-optional
      } = {};
      
      let generalChangesMade = false;
      if (formData.displayName !== userProfile.displayName) {
        generalProfileUpdatesPayload.displayName = formData.displayName;
        generalChangesMade = true;
      }
      if (formData.phoneNumber !== userProfile.phoneNumber) {
        generalProfileUpdatesPayload.phoneNumber = formData.phoneNumber;
        generalChangesMade = true;
      }

      const currentAddress = userProfile.address || { street: '', city: '', state: '', zipCode: ''};
      const formAddress = formData.address || { street: '', city: '', state: '', zipCode: ''};
      if (
        formAddress.street !== currentAddress.street ||
        formAddress.city !== currentAddress.city ||
        formAddress.state !== currentAddress.state ||
        formAddress.zipCode !== currentAddress.zipCode
      ) {
        generalProfileUpdatesPayload.address = {
          street: formAddress.street,
          city: formAddress.city,
          state: formAddress.state,
          zipCode: formAddress.zipCode,
        };
        generalChangesMade = true;
      }

      if (generalChangesMade) {
        // Construct the payload to send, ensuring no undefined top-level properties
        const payloadToSend: Partial<UserProfile> = {};
        if (generalProfileUpdatesPayload.displayName !== undefined) {
          payloadToSend.displayName = generalProfileUpdatesPayload.displayName;
        }
        if (generalProfileUpdatesPayload.phoneNumber !== undefined) {
          payloadToSend.phoneNumber = generalProfileUpdatesPayload.phoneNumber;
        }
        // The address object, if present in generalProfileUpdatesPayload, will have all string properties
        // due to its construction, so it's fine to include as is if it's defined.
        if (generalProfileUpdatesPayload.address !== undefined) {
          payloadToSend.address = generalProfileUpdatesPayload.address;
        }

        if (Object.keys(payloadToSend).length > 0) {
          if (adminUser.uid !== userId) {
            await userApi.updateUserById(userId, payloadToSend);
          } else {
            await userApi.updateProfile(payloadToSend);
          }
          generalProfileUpdateProcessed = true;
        }
      }

      if (roleUpdateProcessed || generalProfileUpdateProcessed) {
        showSuccessToast('User profile updated successfully!');
        // Refetch user profile to ensure local state is consistent with backend
        const updatedProfile = await userApi.getUserById(userId);
        setUserProfile(updatedProfile);
        setFormData({ // Reset form data based on the latest profile
            displayName: updatedProfile.displayName || '',
            email: updatedProfile.email,
            phoneNumber: updatedProfile.phoneNumber || '',
            role: updatedProfile.role || 'user',
            address: updatedProfile.address ? { ...updatedProfile.address } : { street: '', city: '', state: '', zipCode: '' },
        });
      } else {
        showSuccessToast('No changes were made to the profile.');
      }
      
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user profile.';
      showErrorToast(String(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userProfile) {
    return <p>User not found.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
            value={formData.displayName}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-body font-medium text-deepbrown/90">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 bg-warmgray-100 cursor-not-allowed sm:text-sm font-body"
          />
          <p className="mt-1 text-xs text-warmgray-500">Email cannot be changed.</p>
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
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-body font-medium text-deepbrown/90">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role || 'user'}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
            disabled={adminUser?.uid === userId || (userProfile.role === 'admin' && adminUser?.uid !== userId)}
          >
            <option value="user">User</option>
            <option value="baker">Baker</option>
            <option value="admin">Admin</option>
          </select>
          {adminUser?.uid === userId && (
            <p className="mt-1 text-xs text-warmgray-500">You cannot change your own role.</p>
          )}
          {userProfile.role === 'admin' && adminUser?.uid !== userId && (
            <p className="mt-1 text-xs text-warmgray-500">You cannot change another admin's role.</p>
          )}
        </div>

        <fieldset className="border border-warmgray-300 rounded-md p-4">
          <legend className="text-sm font-body font-medium text-deepbrown/90 px-2">Address</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="street" className="block text-sm font-body font-medium text-deepbrown/90">
                Street
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.address?.street || ''}
                onChange={handleAddressChange}
                className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-body font-medium text-deepbrown/90">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.address?.city || ''}
                onChange={handleAddressChange}
                className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-body font-medium text-deepbrown/90">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.address?.state || ''}
                onChange={handleAddressChange}
                className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-body font-medium text-deepbrown/90">
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.address?.zipCode || ''}
                onChange={handleAddressChange}
                className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin-portal/user-management')}
            className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warmgray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditForm;
