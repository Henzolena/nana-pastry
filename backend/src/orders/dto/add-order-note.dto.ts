import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class AddOrderNoteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Note content is too short' })
  @MaxLength(1000, { message: 'Note content must be less than 1000 characters' })
  content: string;
}
