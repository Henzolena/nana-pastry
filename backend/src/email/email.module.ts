import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService], // Export the service so it can be used in other modules
})
export class EmailModule {}
