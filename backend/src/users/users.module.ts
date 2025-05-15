import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [forwardRef(() => AuthModule)], // Handle circular dependency
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Export UsersService for use in AuthModule
})
export class UsersModule {}
