import { PartialType } from '@nestjs/mapped-types';
import { CreateCakeDto } from './create-cake.dto';
// import { IsOptional, IsString } from 'class-validator'; // No longer needed for id

export class UpdateCakeDto extends PartialType(CreateCakeDto) {
  // id is typically passed as a URL parameter, not in the body for updates.
  // If it were needed for some reason, it would be re-added here.
}
