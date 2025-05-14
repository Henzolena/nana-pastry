import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UserProfile, saveUserProfile, getUserProfile } from '@/services/firestore'; // Assuming getUserProfile can fetch full profile

// Define more specific types for availability and specializations if needed
// For now, using simple examples
interface Availability {
  daysOff: string[]; // e.g., ['saturday', 'sunday']
  workingHours: { start: string; end: string }; // e.g., { start: '09:00', end: '17:00' }
}

const BakerProfileSettings: React.FC = () => {
  const { user: bakerAuthUser, role: bakerRole, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Partial<UserProfile> & { availability?: Availability; specializations?: string[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bakerAuthUser) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const fetchedProfile = await getUserProfile(bakerAuthUser.uid);
          if (fetchedProfile) {
            setProfileData({
              displayName: fetchedProfile.displayName || '',
              phoneNumber: fetchedProfile.phoneNumber || '',
              // Assuming availability and specializations are stored in UserProfile
              availability: (fetchedProfile as any).availability || { daysOff: [], workingHours: { start: '09:00', end: '17:00' } },
              specializations: (fetchedProfile as any).specializations || [],
            });
          }
        } catch (error) {
          console.error("Error fetching baker profile:", error);
          showErrorToast("Failed to load your profile data.");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else if (!authLoading) {
      // If not loading and no user, redirect
      navigate('/auth');
    }
  }, [bakerAuthUser, authLoading, navigate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  // TODO: Implement more specific handlers for availability and specializations if complex objects

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bakerAuthUser) return;

    setLoading(true);
    try {
      // Construct the UserProfile object to save
      // This assumes saveUserProfile can handle these new fields or we adapt it.
      const profileToSave: UserProfile = {
        userId: bakerAuthUser.uid,
        email: bakerAuthUser.email || '', // Email shouldn't change here
        displayName: profileData.displayName || null,
        phoneNumber: profileData.phoneNumber || null,
        role: bakerRole, // Role shouldn't change here
        // Add new fields, ensuring they are part of UserProfile or cast appropriately
        ...(profileData.availability && { availability: profileData.availability }),
        ...(profileData.specializations && { specializations: profileData.specializations }),
        createdAt: new Date(), // This might overwrite existing, ideally get from fetched profile
        // photoURL and address would need to be handled if they are part of this form
      } as UserProfile; // Cast to UserProfile, ensure all required fields are present

      // Using the existing saveUserProfile signature with a workaround.
      await saveUserProfile(
        { userId: bakerAuthUser.uid, displayName: profileToSave.displayName || '', photoURL: bakerAuthUser.photoURL || '', email: bakerAuthUser.email || '', phoneNumber: profileToSave.phoneNumber || '', address: '' }, // Dummy _p0
        false, // Dummy _p1
        profileToSave
      );
      showSuccessToast('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Logged out successfully.');
      navigate('/auth');
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast('Failed to log out. Please try again.');
    }
  };

  if (authLoading || loading || !bakerAuthUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">My Profile & Availability</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-body text-warmgray-600">Email:</p>
          <p className="text-md font-body text-deepbrown mt-1">{bakerAuthUser.email}</p>
        </div>
        <div>
          <label htmlFor="displayName" className="block text-sm font-body font-medium text-deepbrown/90">Display Name</label>
          <input type="text" name="displayName" id="displayName" value={profileData.displayName || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-body font-medium text-deepbrown/90">Phone Number</label>
          <input type="tel" name="phoneNumber" id="phoneNumber" value={profileData.phoneNumber || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
        </div>

        {/* Placeholder for Availability Management */}
        <fieldset className="space-y-2 border p-4 rounded-md border-warmgray-300">
          <legend className="text-lg font-heading font-semibold text-deepbrown/90 px-1">Availability</legend>
          <p className="text-sm font-body text-warmgray-500">Availability management (days off, working hours) will be implemented here.</p>
          {/* Example:
          <div>Days Off: {profileData.availability?.daysOff.join(', ') || 'None'}</div>
          <div>Working Hours: {profileData.availability?.workingHours.start} - {profileData.availability?.workingHours.end}</div>
          */}
        </fieldset>

        {/* Placeholder for Cake Specializations */}
        <fieldset className="space-y-2 border p-4 rounded-md border-warmgray-300">
          <legend className="text-lg font-heading font-semibold text-deepbrown/90 px-1">Cake Specializations</legend>
          <p className="text-sm font-body text-warmgray-500">Cake specialization management will be implemented here.</p>
          {/* Example:
          <div>Specializations: {profileData.specializations?.join(', ') || 'None specified'}</div>
          */}
        </fieldset>

        <div className="flex items-center justify-between pt-4 border-t border-warmgray-200 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default BakerProfileSettings;
