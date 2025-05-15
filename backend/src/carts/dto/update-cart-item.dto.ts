import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCartItemDto } from './create-cart-item.dto';

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {
  // Extends all properties from CreateCartItemDto but makes them optional
}
