import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
// Assuming OrderStatus will be defined in a central types file, e.g., '../types/order.types'
// For now, let's keep the direct import if it resolves, or prepare to change it.
// The error "Cannot find module '../types/order.types'" suggests this path is wrong or file doesn't exist.
// Let's assume OrderStatus will be defined in `backend/src/types/order.types.ts`
import { OrderStatus } from '../../types/order.types';


export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsIn([
    'pending',
    'approved',
    'processing',
    'ready',
    'delivered',
    'picked-up',
    'completed',
    'cancelled',
  ])
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
