import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6) // Firebase Auth requires minimum 6 characters for password
  password: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;
}
