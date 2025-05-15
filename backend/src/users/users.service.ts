import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { firebaseAdmin } from '../firebase-admin.config';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';

// Define a basic interface for user data stored in Firestore
export interface UserData {
  userId: string;
  email: string;
  displayName?: string;
  role: 'user' | 'baker' | 'admin'; // Example roles
  createdAt: FirebaseFirestore.Timestamp;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  photoURL?: string | null;
  lastLoginAt?: FirebaseFirestore.Timestamp | null;
  lastSignInAt?: FirebaseFirestore.Timestamp | null;
  // Add other user profile fields as needed
}

@Injectable()
export class UsersService {
  private firestore = firebaseAdmin.firestore();

  constructor(
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
  ) {}

  async getUser(userId: string): Promise<UserData> {
    try {
      const userDoc = await this.firestore.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new NotFoundException(`User with ID "${userId}" not found.`);
      }

      return userDoc.data() as UserData;
    } catch (error) {
      console.error('Error fetching user:', error);
      // Re-throw specific NestJS exceptions, otherwise throw a generic error
      if (error instanceof NotFoundException) {
          throw error;
      }
      throw new Error('Failed to fetch user.');
    }
  }

  async updateUser(userId: string, updateData: UpdateUserDto, requestingUser: { uid: string, role?: string }): Promise<UserData> {
    try {
      const userDocRef = this.firestore.collection('users').doc(userId);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        throw new NotFoundException(`User with ID "${userId}" not found.`);
      }

      const existingUserData = userDoc.data() as UserData;

      // Cast updateData to access potential 'role' property
      const potentialRoleUpdate = (updateData as any).role;

      // Authorization check: Prevent non-admins from changing roles
      if (potentialRoleUpdate !== undefined && potentialRoleUpdate !== existingUserData.role) {
        if (requestingUser.role !== 'admin') {
          throw new BadRequestException('Only administrators can change user roles.');
        }
      }

      // Prepare update data, excluding role if not allowed
      const dataToUpdate: any = { ...updateData };
      if (potentialRoleUpdate !== undefined && requestingUser.role !== 'admin') {
          // This case should ideally not be hit if controller logic is correct,
          // as non-admins shouldn't be able to send 'role' in updateData for themselves.
          // But as a safeguard:
          delete dataToUpdate.role; 
      }


      await userDocRef.update(dataToUpdate);
      console.log(`User with ID "${userId}" updated successfully.`);

      // Fetch and return the updated user data
      const updatedUserDoc = await userDocRef.get();
      if (!updatedUserDoc.exists) {
        // This should ideally not happen if the update was successful and the doc existed before
        throw new NotFoundException(`User with ID "${userId}" not found after update.`);
      }
      return updatedUserDoc.data() as UserData;

    } catch (error) {
      console.error('Error updating user:', error);
       // Re-throw specific NestJS exceptions, otherwise throw a generic error
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
      }
      throw new Error('Failed to update user.');
    }
  }

  async getAllUsers(role?: 'user' | 'baker' | 'admin'): Promise<UserData[]> {
    try {
      let query: FirebaseFirestore.Query = this.firestore.collection('users');
      
      if (role) {
        // Ensure the role is one of the allowed types before querying
        if (!['user', 'baker', 'admin'].includes(role)) {
          throw new BadRequestException('Invalid role specified for filtering.');
        }
        query = query.where('role', '==', role);
      }

      const usersSnapshot = await query.get();
      const users: UserData[] = [];
      usersSnapshot.forEach(doc => {
        users.push(doc.data() as UserData);
      });
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to fetch users.');
    }
  }

  // Create a new user record in the database
  async createUser(userData: UserData): Promise<void> {
    try {
      const { userId } = userData;
      
      // Check if user already exists
      const existingUser = await this.firestore.collection('users').doc(userId).get();
      if (existingUser.exists) {
        console.log(`User with ID ${userId} already exists in Firestore, skipping creation`);
        return;
      }
      
      // Create the user document in Firestore
      await this.firestore.collection('users').doc(userId).set({
        ...userData,
        createdAt: userData.createdAt || firebaseAdmin.firestore.Timestamp.now(),
        updatedAt: firebaseAdmin.firestore.Timestamp.now()
      });
      
      console.log(`User with ID ${userId} successfully created in Firestore`);
      
      // Initialize user-related collections
      await this.initializeUserCollections(userId);
      
    } catch (error) {
      console.error(`Error creating user in Firestore: ${error.message}`);
      throw new Error(`Failed to create user in database: ${error.message}`);
    }
  }
  
  // Delete a user from Firebase Auth and related Firestore records
  async deleteUser(userId: string): Promise<void> {
    try {
      // First check if user exists in Firestore
      const userDoc = await this.firestore.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new NotFoundException(`User with ID "${userId}" not found.`);
      }
      
      // Delete the user from Firebase Auth via the auth service
      await this.authService.deleteUserAuth(userId);
      console.log(`User with ID ${userId} deleted from Firebase Auth`);
      
      // Delete the user document from Firestore
      await this.firestore.collection('users').doc(userId).delete();
      console.log(`User with ID ${userId} deleted from Firestore users collection`);
      
      // Delete or handle related collections
      await this.cleanupUserCollections(userId);
      
      console.log(`User with ID ${userId} successfully deleted`);
    } catch (error) {
      console.error(`Error deleting user: ${error.message}`);
      
      // Re-throw specific NestJS exceptions
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
  
  // Initialize related collections for a new user
  private async initializeUserCollections(userId: string): Promise<void> {
    try {
      // Create an empty cart for the user
      await this.firestore.collection('carts').doc(userId).set({
        userId,
        items: [],
        createdAt: firebaseAdmin.firestore.Timestamp.now(),
        updatedAt: firebaseAdmin.firestore.Timestamp.now()
      });
      
      // Create an empty wishlist for the user
      await this.firestore.collection('wishlists').doc(userId).set({
        userId,
        items: [],
        createdAt: firebaseAdmin.firestore.Timestamp.now()
      });
      
      // Create user preferences with default settings
      await this.firestore.collection('userPreferences').doc(userId).set({
        userId,
        communicationPreferences: {
          orderUpdates: true,
          marketing: false,
          newsletter: false
        },
        displayPreferences: {
          theme: 'light'
        },
        createdAt: firebaseAdmin.firestore.Timestamp.now()
      });
      
      console.log(`Initialized related collections for user ${userId}`);
    } catch (error) {
      console.error(`Error initializing user collections: ${error.message}`);
      // We don't throw here since it's a non-critical operation
      // The user record is already created, we can initialize these later if needed
    }
  }

  // Cleanup user-related collections when deleting a user
  private async cleanupUserCollections(userId: string): Promise<void> {
    try {
      // Delete user's cart
      await this.firestore.collection('carts').doc(userId).delete();
      
      // Delete user's wishlist
      await this.firestore.collection('wishlists').doc(userId).delete();
      
      // Delete user's preferences
      await this.firestore.collection('userPreferences').doc(userId).delete();
      
      // Note: You might want to handle orders differently (e.g., anonymize rather than delete)
      // Instead of deleting orders, you could update them to remove personal information
      
      console.log(`Cleaned up collections for user ${userId}`);
    } catch (error) {
      console.error(`Error cleaning up user collections: ${error.message}`);
      // We don't throw here since it's a non-critical operation that shouldn't block user deletion
    }
  }
}
