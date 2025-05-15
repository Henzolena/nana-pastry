import { Controller, Post, Body, UsePipes, ValidationPipe, Get, UseGuards, Request, HttpException, HttpStatus, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe()) // Apply validation pipe to validate the request body
  async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      return await this.authService.signUp(createUserDto);
    } catch (error) {
      // Check if this is a structured error from our service
      if (error.code && error.message) {
        // Map Firebase error codes to HTTP status codes
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        
        if (error.code === 'auth/email-already-exists') {
          statusCode = HttpStatus.CONFLICT; // 409
        } else if (['auth/invalid-email', 'auth/invalid-password', 'auth/weak-password'].includes(error.code)) {
          statusCode = HttpStatus.BAD_REQUEST; // 400
        }
        
        throw new HttpException(
          { 
            statusCode: statusCode,
            message: error.message,
            code: error.code
          }, 
          statusCode
        );
      }
      
      // For any other errors
      throw new HttpException(
        error.message || 'Failed to sign up user', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('send-verification-email')
  async sendVerificationEmail(@Body('email') email: string): Promise<{ success: boolean; message: string }> {
    // Basic validation for email presence
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      await this.authService.sendEmailVerification(email);
      return { 
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Controller error sending verification email:', error);
      
      // Handle structured errors from the service
      if (error.code && error.message) {
        // Map error codes to appropriate HTTP status codes
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
          statusCode = HttpStatus.BAD_REQUEST;
        } else if (error.message.includes('Too many')) {
          statusCode = HttpStatus.TOO_MANY_REQUESTS;
        }
        
        throw new HttpException(
          { 
            statusCode: statusCode,
            message: error.message,
            code: error.code
          },
          statusCode
        );
      }
      
      // For other types of errors
      throw new HttpException(
        error.message || 'Failed to send verification email', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('send-password-reset')
  async sendPasswordReset(@Body('email') email: string): Promise<{ success: boolean; message: string }> {
    // Basic validation for email presence
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      await this.authService.sendPasswordResetEmail(email);
      return { 
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Controller error sending password reset email:', error);
      
      // Handle structured errors from the service
      if (error.code && error.message) {
        // Map error codes to appropriate HTTP status codes
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
          statusCode = HttpStatus.BAD_REQUEST;
        } else if (error.message.includes('Too many')) {
          statusCode = HttpStatus.TOO_MANY_REQUESTS;
        }
        
        throw new HttpException(
          { 
            statusCode: statusCode,
            message: error.message,
            code: error.code
          },
          statusCode
        );
      }
      
      // For other types of errors
      throw new HttpException(
        error.message || 'Failed to send password reset email', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  // New endpoint that requires authentication
  @Get('check-auth')
  @UseGuards(FirebaseAuthGuard)
  async checkAuth(@Request() req): Promise<{ authenticated: boolean; user: any }> {
    // If the guard passes, the user is authenticated
    return { 
      authenticated: true, 
      user: {
        uid: req.user.uid,
        email: req.user.email,
        emailVerified: req.user.email_verified,
        displayName: req.user.name || null,
      } 
    };
  }

  @Post('check-email-verification')
  async checkEmailVerification(@Body('email') email: string): Promise<{ isVerified: boolean }> {
    // Basic validation for email presence
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const result = await this.authService.checkEmailVerification(email);
      return result;
    } catch (error) {
      console.error('Controller error checking email verification:', error);
      
      // Handle structured errors from the service
      if (error.code && error.message) {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
          statusCode = HttpStatus.BAD_REQUEST;
        }
        
        throw new HttpException(
          {
            statusCode: statusCode,
            message: error.message,
            code: error.code
          },
          statusCode
        );
      }
      
      throw new HttpException(
        error.message || 'Failed to check verification status', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('disable-user/:userId')
  async disableUser(@Param('userId') userId: string, @Request() req): Promise<any> {
    // Only allow admins to disable users
    if (req.user.role !== 'admin') {
      throw new HttpException(
        { message: 'Only administrators can disable user accounts', code: 'auth/permission-denied' },
        HttpStatus.FORBIDDEN
      );
    }
    
    // Don't allow admins to disable themselves
    if (req.user.uid === userId) {
      throw new HttpException(
        { message: 'Administrators cannot disable their own accounts', code: 'auth/self-disable-denied' },
        HttpStatus.BAD_REQUEST
      );
    }
    
    try {
      await this.authService.disableUser(userId);
      return { success: true, message: 'User account disabled successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to disable user account',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  @UseGuards(FirebaseAuthGuard)
  @Post('enable-user/:userId')
  async enableUser(@Param('userId') userId: string, @Request() req): Promise<any> {
    // Only allow admins to enable users
    if (req.user.role !== 'admin') {
      throw new HttpException(
        { message: 'Only administrators can enable user accounts', code: 'auth/permission-denied' },
        HttpStatus.FORBIDDEN
      );
    }
    
    try {
      await this.authService.enableUser(userId);
      return { success: true, message: 'User account enabled successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to enable user account',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
