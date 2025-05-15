import { Module } from '@nestjs/common';
import { CakesController } from './cakes.controller';
import { CakesService } from './cakes.service';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [AuthModule], // Add AuthModule here
  controllers: [CakesController],
  providers: [CakesService],
  exports: [CakesService],
})
export class CakesModule {}
