import { ApiProperty } from '@nestjs/swagger';
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CartItem {
  id: string;
  cakeId: string;
  name: string;
  price: number;
  quantity: number;
  size: {
    label: string;
    price: number;
    description?: string;
  };
  image: string;
  specialInstructions?: string;
  isCustomizable?: boolean;
  customizations?: {
    selectedCakeId: string;
    flavor: string;
    filling: string;
    frosting: string;
    shape: string;
    dietaryOption: string;
    addons: string[];
    specialInstructions: string;
  };
}

class GuestCart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  isOpen: boolean;
}

export class MergeCartDto {
  @ApiProperty({ type: GuestCart })
  @IsObject()
  @ValidateNested()
  @Type(() => GuestCart)
  guestCart: GuestCart;
}
