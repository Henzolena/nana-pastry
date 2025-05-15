import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Request, UsePipes, ValidationPipe, UnauthorizedException, Query, Patch, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateUserAddressDto, UpdateUserPreferencesDto, UpdateUserRoleDto } from './dto/update-user.dto'; 
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { UserData } from './users.service';

@UseGuards(FirebaseAuthGuard) // Protect all routes in this controller
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get current authenticated user's profile
  @Get('profile')
  async getProfile(@Request() req): Promise<any> {
    // req.user is populated by FirebaseAuthGuard with decoded token info (uid, role, etc.)
    return this.usersService.getUser(req.user.uid);
  }

  // Update current authenticated user's profile
  @Put('profile')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateCurrentUserProfile(@Request() req, @Body() updateData: UpdateUserDto): Promise<UserData> {
    // Users can only update their own profile via this route.
    // The service layer should handle partial updates and prevent role changes by non-admins.
    return this.usersService.updateUser(req.user.uid, updateData, { uid: req.user.uid, role: req.user.role });
  }

  // Update current authenticated user's address
  @Put('profile/address')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateCurrentUserAddress(@Request() req, @Body() addressData: UpdateUserAddressDto): Promise<UserData> {
    // Users can only update their own address via this route.
    // The updateUser service method needs to be flexible to handle partial DTOs or a specific service method is needed.
    // For now, assuming updateUser can handle { address: addressData } within UpdateUserDto.
    return this.usersService.updateUser(req.user.uid, { address: addressData } as UpdateUserDto, { uid: req.user.uid, role: req.user.role });
  }

  // Update current authenticated user's preferences
  @Put('profile/preferences')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateCurrentUserPreferences(@Request() req, @Body() preferencesData: UpdateUserPreferencesDto): Promise<UserData> {
    // Users can only update their own preferences via this route.
    // Similar to address, assuming updateUser can handle { preferences: preferencesData }.
    return this.usersService.updateUser(req.user.uid, { preferences: preferencesData } as UpdateUserDto, { uid: req.user.uid, role: req.user.role });
  }

  // Admin: Update a specific user's role
  @Put(':userId/role')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateUserRole(@Param('userId') userId: string, @Body() roleData: UpdateUserRoleDto, @Request() req): Promise<UserData> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only administrators can change user roles.');
    }
    // The service layer (updateUser) must ensure that only 'role' is updated and other fields are not affected,
    // or a specific service method like 'updateUserRole' should be called.
    // Also, the service should validate the role value.
    return this.usersService.updateUser(userId, { role: roleData.role } as UpdateUserDto, { uid: req.user.uid, role: req.user.role });
  }
  
  // Get a specific user's profile (can be self or admin getting others)
  @Get(':userId')
  async getUser(@Param('userId') userId: string, @Request() req): Promise<any> {
    if (req.user.uid !== userId && req.user.role !== 'admin') {
        throw new UnauthorizedException('You can only view your own profile or an administrator can view any profile.');
    }
    return this.usersService.getUser(userId);
  }

  // Admin or self: Update a specific user's profile (general update)
  // This route might become redundant if specific profile update routes are comprehensive
  // Or it can be maintained for admins to perform more general updates.
  @Put(':userId')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateUser(@Param('userId') userId: string, @Body() updateData: UpdateUserDto, @Request() req): Promise<UserData> {
    if (req.user.uid !== userId && req.user.role !== 'admin') {
        throw new UnauthorizedException('You can only update your own profile or an administrator can update any profile.');
    }
    return this.usersService.updateUser(userId, updateData, { uid: req.user.uid, role: req.user.role });
  }

  // Admin: Get all users, with optional role filtering
  @Get()
  async getAllUsers(@Request() req, @Query('role') role?: 'user' | 'baker' | 'admin'): Promise<any[]> {
     if (req.user.role !== 'admin') {
         throw new UnauthorizedException('Only administrators can view all users.');
     }
     // The role parameter from @Query will be validated by its type annotation here.
     // If an invalid role string is passed in the query, it won't match the defined types
     // and 'role' will be undefined or NestJS might handle it based on validation pipes if any are globally applied.
     // For more robust validation, a custom pipe or explicit check could be added.
    return this.usersService.getAllUsers(role); 
  }
}
