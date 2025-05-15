import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min, IsEnum, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export enum CakeCategory {
  BIRTHDAY = 'birthday',
  WEDDING = 'wedding',
  CELEBRATION = 'celebration',
  CUPCAKES = 'cupcakes',
  SEASONAL = 'seasonal',
  CUSTOM = 'custom',
  OTHER = 'other'
}

export class CakeSizeDto {
  @IsString()
  label: string;

  @IsNumber()
  @Min(1)
  servings: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  priceModifier?: number;
}

export class CreateCakeDto {
  @IsString()
  name: string;

  @IsEnum(CakeCategory)
  category: CakeCategory;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;

  @IsString()
  @IsOptional()
  bakerId?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CakeSizeDto)
  @ArrayMinSize(1)
  @IsOptional()
  sizes?: CakeSizeDto[];
}
