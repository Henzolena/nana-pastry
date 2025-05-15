import { apiGet, apiPut, apiPost, apiDelete } from './apiService';

/**
 * User profile data interface
 */
export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  role: 'user' | 'baker' | 'admin';
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences?: {
    favoriteCategories?: string[];
    dietaryRestrictions?: string[];
    allowMarketingEmails?: boolean;
  };
  orderStats?: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for user-related API operations
 */
export const userApi = {
  /**
   * Get the current user's profile
   * @returns User profile data
   */
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    try {
      return await apiGet<UserProfile>('/users/profile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update the current user's profile
   * @param profileData Data to update
   * @returns Updated user profile
   */
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      return await apiPut<UserProfile>('/users/profile', profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Update user address
   * @param address New address details
   * @returns Updated user profile
   */
  updateAddress: async (address: UserProfile['address']): Promise<UserProfile> => {
    try {
      return await apiPut<UserProfile>('/users/profile/address', address);
    } catch (error) {
      console.error('Error updating user address:', error);
      throw error;
    }
  },

  /**
   * Update user preferences
   * @param preferences New preferences
   * @returns Updated user profile
   */
  updatePreferences: async (preferences: UserProfile['preferences']): Promise<UserProfile> => {
    try {
      return await apiPut<UserProfile>('/users/profile/preferences', preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  /**
   * For admin: Get all users
   * @param role Optional role filter
   * @returns Array of user profiles
   */
  getAllUsers: async (role?: string): Promise<UserProfile[]> => {
    try {
      const queryParams = role ? `?role=${role}` : '';
      return await apiGet<UserProfile[]>(`/users${queryParams}`);
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  /**
   * For admin: Get a specific user by ID
   * @param userId User ID
   * @returns User profile
   */
  getUserById: async (userId: string): Promise<UserProfile> => {
    try {
      return await apiGet<UserProfile>(`/users/${userId}`);
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * For admin: Update a user's role
   * @param userId User ID
   * @param newRole New role
   * @returns Updated user profile
   */
  updateUserRole: async (userId: string, newRole: UserProfile['role']): Promise<UserProfile> => {
    try {
      return await apiPut<UserProfile>(`/users/${userId}/role`, { role: newRole });
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * For admin: Update a specific user by ID (can update any field except email)
   * @param userId User ID
   * @param userData User data to update
   * @returns Updated user profile
   */
  updateUserById: async (userId: string, userData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      return await apiPut<UserProfile>(`/users/${userId}`, userData);
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * For admin: Disable a user account
   * @param userId User ID to disable
   */
  disableUser: async (userId: string): Promise<void> => {
    try {
      await apiPost(`/auth/disable-user/${userId}`, {});
      console.log(`User ${userId} successfully disabled`);
    } catch (error) {
      console.error(`Error disabling user ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * For admin: Enable a previously disabled user account
   * @param userId User ID to enable
   */
  enableUser: async (userId: string): Promise<void> => {
    try {
      await apiPost(`/auth/enable-user/${userId}`, {});
      console.log(`User ${userId} successfully enabled`);
    } catch (error) {
      console.error(`Error enabling user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * For admin: Delete a user
   * @param userId User ID to be deleted
   */
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await apiDelete(`/users/${userId}`);
      console.log(`User ${userId} successfully deleted`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
};
