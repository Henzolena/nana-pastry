import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule
import { EmailModule } from '../email/email.module'; // Import EmailModule

@Module({
  imports: [AuthModule, EmailModule], // Add EmailModule here
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrdersModule {}
