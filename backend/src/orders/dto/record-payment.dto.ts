import { IsNotEmpty, IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class RecordPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsIn(['credit-card', 'cash', 'cash-app'])
  method: 'credit-card' | 'cash' | 'cash-app';

  @IsOptional()
  @IsString() // Assuming date comes as a string initially
  date?: string;

  @IsOptional()
  @IsString()
  confirmationId?: string;

  @IsOptional()
  cashAppDetails?: {
    confirmationId?: string;
    lastUpdated?: string; // Assuming date comes as string
  };

  @IsOptional()
  cardDetails?: {
    last4?: string;
    brand?: string;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}
