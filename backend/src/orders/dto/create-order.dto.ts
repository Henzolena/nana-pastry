import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsBoolean, IsIn, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItem } from '../orders.service'; // Import the interface from the service

// DTO for OrderItem (nested within CreateOrderDto)
class CreateOrderItemDto implements OrderItem {
  @IsNotEmpty()
  @IsString()
  cakeId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  customizations?: {
    size?: string;
    flavors?: string[];
    fillings?: string[];
    frostings?: string[];
    shape?: string;
    addons?: string[];
    specialInstructions?: string;
  };
}

// DTO for CustomerInfo (nested within CreateOrderDto)
class CustomerInfo {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}

// DTO for DeliveryInfo (nested within CreateOrderDto)
class DeliveryInfo {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString() // Assuming date comes as a string initially
  deliveryDate?: string;

  @IsNotEmpty()
  @IsString()
  deliveryTime: string;

  @IsNotEmpty()
  @IsNumber()
  deliveryFee: number;
}

// DTO for PickupInfo (nested within CreateOrderDto)
class PickupInfo {
  @IsNotEmpty()
  @IsString() // Assuming date comes as a string initially
  pickupDate: string;

  @IsNotEmpty()
  @IsString()
  pickupTime: string;

  @IsOptional()
  @IsString()
  storeLocation?: string;
}


export class CreateOrderDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNotEmpty()
  @IsNumber()
  subtotal: number;

  @IsNotEmpty()
  @IsNumber()
  tax: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  // Status and paymentStatus are set by the backend, not provided by frontend on creation
  // @IsNotEmpty()
  // @IsIn(['pending']) // Should only be 'pending' on creation
  // status: OrderStatus;

  // @IsNotEmpty()
  // @IsIn(['unpaid']) // Should only be 'unpaid' on creation
  // paymentStatus: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsNotEmpty()
  @IsIn(['pickup', 'delivery'])
  deliveryMethod: 'pickup' | 'delivery';

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CustomerInfo)
  customerInfo: CustomerInfo;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryInfo)
  deliveryInfo?: DeliveryInfo;

  @IsOptional()
  @ValidateNested()
  @Type(() => PickupInfo)
  pickupInfo?: PickupInfo;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsNotEmpty()
  @IsBoolean()
  isCustomOrder: boolean;

  @IsOptional()
  customOrderDetails?: {
    consultationDate?: string; // Assuming date comes as string
    consultationTime?: string;
    designNotes?: string;
    referenceImages?: string[];
    depositAmount?: number;
  };

  @IsOptional()
  @IsString()
  idempotencyKey?: string; // Optional, but recommended for preventing duplicates
}
