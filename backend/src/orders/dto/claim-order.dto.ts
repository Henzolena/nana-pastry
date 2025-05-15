import { IsString, IsNotEmpty } from 'class-validator';

export class ClaimOrderDto {
  @IsString()
  @IsNotEmpty()
  bakerId: string;
}
