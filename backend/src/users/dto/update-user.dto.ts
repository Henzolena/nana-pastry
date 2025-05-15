import { IsString, IsOptional, IsIn, IsNotEmpty, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for updating user's address
export class UpdateUserAddressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  street?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  zipCode?: string;
}

// DTO for updating user's preferences
export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsBoolean()
  allowMarketingEmails?: boolean;
}

// DTO for updating user's role (typically by an admin)
export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsIn(['user', 'baker', 'admin'])
  role: 'user' | 'baker' | 'admin';
}

// Main DTO for updating user profile, can include nested DTOs
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserAddressDto)
  address?: UpdateUserAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserPreferencesDto)
  preferences?: UpdateUserPreferencesDto;
  
  // Role is intentionally left out here to encourage using UpdateUserRoleDto for role changes,
  // especially for admin-controlled updates. If a user updates their own profile,
  // their role should not be updatable by themselves through this general DTO.
  // If role needs to be part of general update (e.g. by admin), it can be added here.
  // For now, the controller handles role updates via a specific route and DTO.
  // @IsOptional()
  // @IsIn(['user', 'baker', 'admin'])
  // role?: 'user' | 'baker' | 'admin';

  // Add other optional fields for user profile updates as needed
  // @IsOptional()
  // @IsString()
  // photoURL?: string;
}
