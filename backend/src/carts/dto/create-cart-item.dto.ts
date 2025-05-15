import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CakeSize {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

class Customization {
  @ApiProperty()
  @IsString()
  selectedCakeId: string;

  @ApiProperty()
  @IsString()
  flavor: string;

  @ApiProperty()
  @IsString()
  filling: string;

  @ApiProperty()
  @IsString()
  frosting: string;

  @ApiProperty()
  @IsString()
  shape: string;

  @ApiProperty()
  @IsString()
  dietaryOption: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  addons: string[];

  @ApiProperty()
  @IsString()
  specialInstructions: string;
}

export class CreateCartItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  cakeId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ type: CakeSize })
  @IsObject()
  @ValidateNested()
  @Type(() => CakeSize)
  size: CakeSize;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @ApiProperty({ required: false, type: Customization })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Customization)
  customizations?: Customization;
}
