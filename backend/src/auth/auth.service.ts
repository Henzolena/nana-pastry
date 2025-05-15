import { Injectable, Inject, forwardRef } from '@nestjs/common';
import * as admin from 'firebase-admin'; // Import admin namespace
import { firebaseAdmin } from '../firebase-admin.config';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { UserData } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    try {
      const { email, password, displayName } = createUserDto;
      console.log(`Attempting to create user with email: ${email}`);
      
      const userRecord = await firebaseAdmin.auth().createUser({
        email: email,
        password: password,
        displayName: displayName,
        // You might add other properties here like photoURL
      });

      console.log(`User created successfully with UID: ${userRecord.uid}`);

      // Store user data in Firestore using UsersService
      await this.storeUserInFirestore(userRecord);
      console.log(`User profile created in Firestore for: ${userRecord.uid}`);

      // Send email verification immediately after signup
      if (userRecord.email) {
        console.log(`Generating verification link for: ${userRecord.email}`);
        const verificationLink = await firebaseAdmin.auth().generateEmailVerificationLink(userRecord.email);
        
        console.log(`Sending verification email to: ${userRecord.email}`);
        await this.emailService.sendVerificationEmail(userRecord.email, verificationLink);
        console.log(`Verification email sent to ${userRecord.email}`);
      } else {
        console.warn(`User ${userRecord.uid} created without an email, skipping email verification.`);
      }

      // You might want to save additional user data (like roles) to Firestore here
      // await firebaseAdmin.firestore().collection('users').doc(userRecord.uid).set({
      //   role: 'user', // Default role
      //   createdAt: new Date(),
      // });

      return { uid: userRecord.uid, email: userRecord.email, emailVerified: userRecord.emailVerified };
    } catch (error) {
      console.error('Error signing up user:', error);
      
      // Extract Firebase error code and message if available
      if (error?.errorInfo?.code) {
        const errorCode = error.errorInfo.code;
        let errorMessage = error.errorInfo.message || 'Failed to sign up user.';
        
        // Map Firebase error codes to user-friendly messages
        switch (errorCode) {
          case 'auth/email-already-exists':
            errorMessage = 'This email address is already in use. Please try logging in or use a different email.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please provide a valid email address.';
            break;
          case 'auth/invalid-password':
            errorMessage = 'Password must be at least 6 characters long.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          // Add other Firebase error codes as needed
        }
        
        // Throw an object with code and message that can be caught by the controller
        throw { code: errorCode, message: errorMessage };
      }
      
      // For non-Firebase errors, just throw a generic message
      throw new Error('Failed to sign up user.');
    }
  }

  async sendEmailVerification(email: string): Promise<void> {
    try {
      // First, verify the user exists with this email
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      
      // Then generate verification link
      const link = await firebaseAdmin.auth().generateEmailVerificationLink(email);
      
      // Send the email with the verification link
      await this.emailService.sendVerificationEmail(email, link);
      
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email verification:', error);
      
      // Handle specific Firebase errors
      if (error?.errorInfo?.code) {
        const errorCode = error.errorInfo.code;
        let errorMessage = 'Failed to send email verification.';
        
        switch (errorCode) {
          case 'auth/user-not-found':
            errorMessage = 'User with this email does not exist.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is invalid.';
            break;
          case 'auth/internal-error':
            // Check for rate limiting error in the message
            if (error.errorInfo.message && error.errorInfo.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
              errorMessage = 'Too many verification emails sent. Please wait a few minutes before trying again.';
            }
            break;
        }
        
        throw { code: errorCode, message: errorMessage };
      }
      
      // For non-Firebase errors, throw a generic error
      throw new Error('Failed to send email verification.');
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Verify user exists
      await firebaseAdmin.auth().getUserByEmail(email);
      
      // Generate reset link
      const resetLink = await firebaseAdmin.auth().generatePasswordResetLink(email);
      
      // Send the email with the reset link
      await this.emailService.sendPasswordResetEmail(email, resetLink);
      
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      
      // Handle specific Firebase errors
      if (error?.errorInfo?.code) {
        const errorCode = error.errorInfo.code;
        let errorMessage = 'Failed to send password reset email.';
        
        switch (errorCode) {
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email address.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is invalid.';
            break;
          case 'auth/internal-error':
            // Check for rate limiting error in the message
            if (error.errorInfo.message && error.errorInfo.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
              errorMessage = 'Too many password reset emails sent. Please wait a few minutes before trying again.';
            }
            break;
        }
        
        throw { code: errorCode, message: errorMessage };
      }
      
      // For non-Firebase errors, throw a generic error
      throw new Error('Failed to send password reset email.');
    }
  }

  // Method to verify ID token - used by guards
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw new Error('Invalid or expired token.');
    }
  }

  // Method to create user record in Firestore
  private async storeUserInFirestore(userRecord: admin.auth.UserRecord): Promise<void> {
    try {
      // Check if email exists (it should always exist, but to satisfy TypeScript)
      if (!userRecord.email) {
        console.error('User record missing email address. Cannot store in Firestore.');
        return;
      }
      
      // Create a user data object to store in Firestore
      const userData: UserData = {
        userId: userRecord.uid,
        email: userRecord.email, // This is now guaranteed to be a string
        displayName: userRecord.displayName || '',
        role: 'user', // Default role
        createdAt: admin.firestore.Timestamp.now(),
        emailVerified: userRecord.emailVerified,
        phoneNumber: userRecord.phoneNumber || null,
        photoURL: userRecord.photoURL || null,
        lastLoginAt: null,
        lastSignInAt: admin.firestore.Timestamp.now(),
      };
      
      // Use the UsersService to create the user in Firestore
      await this.usersService.createUser(userData);
    } catch (error) {
      console.error('Error storing user data in Firestore:', error);
      // We don't want to fail the signup if Firestore storage fails, so we just log the error
      // In a production system, you might want to implement a retry mechanism or queue
    }
  }

  // Method to check if an email is verified
  async checkEmailVerification(email: string): Promise<{ isVerified: boolean }> {
    try {
      // Get user by email
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      
      console.log(`Checking verification status for email ${email}: ${userRecord.emailVerified}`);
      
      // Return verification status
      return { isVerified: userRecord.emailVerified };
    } catch (error) {
      console.error('Error checking email verification status:', error);
      
      // If there's a specific error code, handle it
      if (error?.errorInfo?.code) {
        const errorCode = error.errorInfo.code;
        let errorMessage = 'Failed to check verification status.';
        
        switch (errorCode) {
          case 'auth/user-not-found':
            errorMessage = 'User with this email does not exist.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is invalid.';
            break;
        }
        
        throw { code: errorCode, message: errorMessage };
      }
      
      // Return false as a default for any other error
      return { isVerified: false };
    }
  }
  
  /**
   * Disable a user account in Firebase Auth.
   * This is a temporary measure that can be reversed.
   */
  async disableUser(uid: string): Promise<void> {
    try {
      await firebaseAdmin.auth().updateUser(uid, { disabled: true });
      console.log(`User ${uid} disabled successfully`);
    } catch (error) {
      console.error('Error disabling user:', error);
      throw new Error('Failed to disable user account.');
    }
  }
  
  /**
   * Re-enable a previously disabled user account.
   */
  async enableUser(uid: string): Promise<void> {
    try {
      await firebaseAdmin.auth().updateUser(uid, { disabled: false });
      console.log(`User ${uid} enabled successfully`);
    } catch (error) {
      console.error('Error enabling user:', error);
      throw new Error('Failed to enable user account.');
    }
  }
  
  /**
   * Permanently delete a user from Firebase Auth.
   * This is typically used in conjunction with the deleteUser method in UsersService.
   */
  async deleteUserAuth(uid: string): Promise<void> {
    try {
      await firebaseAdmin.auth().deleteUser(uid);
      console.log(`User ${uid} deleted from Firebase Auth successfully`);
    } catch (error) {
      console.error('Error deleting user from Firebase Auth:', error);
      
      // Handle the case where the user doesn't exist
      if (error.code === 'auth/user-not-found') {
        console.warn(`User ${uid} not found in Firebase Auth, may have been previously deleted`);
        return; // Continue without throwing, the user is already gone
      }
      
      throw new Error('Failed to delete user from authentication system.');
    }
  }

  // Method to get user data by ID - used by guard to get role
  async getUserDataById(uid: string): Promise<any> {
    try {
      // Use UsersService to get user data
      return await this.usersService.getUser(uid);
    } catch (error) {
      console.error('Error getting user data by ID:', error);
      return null; // Return null instead of throwing to let the guard handle
    }
  }
}
