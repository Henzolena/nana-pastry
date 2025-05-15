import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '@/services/apiService';
import { userApi } from '@/services/userApi';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

const UserCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const { role: adminUserRole } = useAuth();
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
    
    // Form validation
    if (formData.password !== formData.confirmPassword) {
      showErrorToast("Passwords do not match.");
      return;
    }
    
    // Role permission check
    if (formData.role === 'admin' && adminUserRole !== 'admin') {
      showErrorToast("You do not have permission to create admin users.");
      return;
    }

    // Password strength check
    if (formData.password.length < 6) {
      showErrorToast("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      // Create user via backend API
      await apiPost('/auth/signup', {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        role: formData.role // Include role in the signup request
      });

      showSuccessToast('User created successfully! Verification email has been sent.');
      navigate('/admin-portal/user-management');
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage = error.message || 'Failed to create user. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-heading font-semibold text-deepbrown mb-6">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-body font-medium text-deepbrown/90">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          />
        </div>

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
            required
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-body font-medium text-deepbrown/90">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          />
          <p className="mt-1 text-xs text-warmgray-500">Password must be at least 6 characters long.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-body font-medium text-deepbrown/90">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            minLength={6}
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
            value={formData.role}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-warmgray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-hotpink focus:border-hotpink sm:text-sm font-body"
          >
            <option value="user">User</option>
            <option value="baker">Baker</option>
            {adminUserRole === 'admin' && <option value="admin">Admin</option>}
          </select>
          {adminUserRole !== 'admin' && (
            <p className="mt-1 text-xs text-warmgray-500">Only administrators can create admin users.</p>
          )}
        </div>

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
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreateForm;
