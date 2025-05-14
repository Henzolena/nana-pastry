import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/services/firebase'; // Assuming this is the main auth instance
import { db } from '@/lib/firebase'; // Assuming this is the main Firestore instance
import { showErrorToast, showSuccessToast, showInfoToast } from '@/utils/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

const UserCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const { user: adminAuthUser, role: adminUserRole } = useAuth(); // Get auth user and custom role
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'user', // Default role
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showErrorToast("Passwords do not match.");
      return;
    }
    // Check using the custom role from AuthContext
    if (formData.role === 'admin' && adminUserRole !== 'admin') {
        showErrorToast("You do not have permission to create admin users.");
        return;
    }


    setLoading(true);
    try {
      // Step 1: Create user in Firebase Authentication
      // We need a separate auth instance for admin actions if not using cloud functions.
      // For now, this will create a user as if they signed up themselves.
      // A more robust solution for admin creation might involve a Cloud Function.
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      if (newUser) {
        // Step 2: Create user document in Firestore
        const userDocRef = doc(db, 'users', newUser.uid);
        await setDoc(userDocRef, {
          userId: newUser.uid,
          email: newUser.email,
          displayName: formData.displayName || null,
          role: formData.role,
          createdAt: serverTimestamp(),
          emailVerified: false, // Initially false, user needs to verify
        });

        // Step 3: Send verification email
        await sendEmailVerification(newUser);
        showInfoToast(`Verification email sent to ${newUser.email}.`);
        
        showSuccessToast(`User ${newUser.email} created successfully!`);
        navigate('/admin-portal/user-management');
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      let userMessage = 'Failed to create user.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            userMessage = 'This email address is already in use.';
            break;
          case 'auth/invalid-email':
            userMessage = 'Invalid email address format.';
            break;
          case 'auth/weak-password':
            userMessage = `Password is too weak. ${error.message}`;
            break;
          default:
            userMessage = error.message || 'An unexpected error occurred.';
        }
      }
      showErrorToast(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-body font-medium text-deepbrown/90">Email Address</label>
          <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-body font-medium text-deepbrown/90">Password</label>
          <input type="password" name="password" id="password" required value={formData.password} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-body font-medium text-deepbrown/90">Confirm Password</label>
          <input type="password" name="confirmPassword" id="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
        </div>
        <div>
          <label htmlFor="displayName" className="block text-sm font-body font-medium text-deepbrown/90">Display Name (Optional)</label>
          <input type="text" name="displayName" id="displayName" value={formData.displayName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-warmgray-300 rounded-md shadow-sm focus:ring-hotpink focus:border-hotpink sm:text-sm font-body" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-body font-medium text-deepbrown/90">Role</label>
          <select name="role" id="role" value={formData.role} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-warmgray-300 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm rounded-md font-body">
            <option value="user">User</option>
            <option value="baker">Baker</option>
            {/* Check using the custom role from AuthContext (case-insensitive) */}
            {adminUserRole?.toLowerCase() === 'admin' && <option value="admin">Admin</option>}
          </select>
        </div>
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button type="button" onClick={() => navigate('/admin-portal/user-management')} className="px-4 py-2 border border-warmgray-300 rounded-md shadow-sm text-sm font-medium font-body text-deepbrown bg-white hover:bg-warmgray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium font-body text-white bg-hotpink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink disabled:opacity-50 transition-colors">
            {loading ? <LoadingSpinner /> : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreateForm;
