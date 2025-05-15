import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found.');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format. Expected "Bearer <token>".');
    }

    try {
      // Verify token first
      const decodedToken = await this.authService.verifyIdToken(token);
      
      // Get user data from Firestore to get role
      try {
        const userData = await this.authService.getUserDataById(decodedToken.uid);
        // If we have user data, combine it with decoded token
        if (userData) {
          // Add role to the request.user object
          request.user = {
            ...decodedToken,
            role: userData.role || 'user', // Default to 'user' if no role found
          };
          
          // Log successful auth with role information
          console.log(`User ${decodedToken.uid} authenticated with role: ${request.user.role}`);
          
          return true; // User is authenticated with role
        } else {
          // User found in Auth but not in Firestore - can happen during new account creation
          console.warn(`User ${decodedToken.uid} found in Auth but not in Firestore`);
          request.user = {
            ...decodedToken,
            role: 'user', // Default role if not found in database
          };
          return true;
        }
      } catch (firestoreError) {
        console.error(`Error fetching user data for ${decodedToken.uid}:`, firestoreError);
        // Fall back to basic token data if Firestore lookup fails
        request.user = decodedToken;
        return true;
      }
    } catch (error) {
      // Handle token verification errors (e.g., expired, invalid)
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }
}
