import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    EmailModule,
    forwardRef(() => UsersModule), // Handle circular dependency
  ],
  providers: [AuthService, FirebaseAuthGuard], // Add FirebaseAuthGuard to providers
  controllers: [AuthController],
  exports: [AuthService, FirebaseAuthGuard] // Export both AuthService and FirebaseAuthGuard
})
export class AuthModule {}
