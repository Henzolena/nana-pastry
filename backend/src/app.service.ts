import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email/email.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    // Check if we're in production mode
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    if (isProduction) {
      this.logger.log('Application starting in PRODUCTION mode');
      
      // Validate email configuration in production
      try {
        await this.emailService.checkEmailConfig();
        this.logger.log('Email service is properly configured');
      } catch (error) {
        this.logger.error(`Email service configuration error: ${error.message}`);
        this.logger.warn('The application will continue to run, but emails will not be sent properly.');
        this.logger.warn('Please check your email configuration in the .env file.');
      }
    } else {
      this.logger.log('Application starting in DEVELOPMENT mode');
      this.logger.log('Using Ethereal for email testing. Check logs for preview URLs.');
    }
  }

  getHello(): string {
    return 'Welcome to Nana\'s Pastry API!';
  }
}
