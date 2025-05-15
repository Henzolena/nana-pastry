import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from '../src/email/email.service';

async function testEmailService() {
  console.log('🧪 Testing Email Service');
  
  // Create a test module
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env',
        isGlobal: true,
      }),
    ],
    providers: [EmailService, ConfigService],
  }).compile();

  // Get the email service
  const emailService = moduleRef.get<EmailService>(EmailService);
  
  try {
    // Test verification email
    console.log('📧 Sending test verification email...');
    await emailService.sendVerificationEmail(
      'info@nanapastry.com', // Use your own email for testing
      'https://nanapastry.com/verify?token=test-verification-token-12345'
    );
    console.log('✅ Verification email test passed');
    
    // Test password reset email
    console.log('📧 Sending test password reset email...');
    await emailService.sendPasswordResetEmail(
      'info@nanapastry.com', // Use your own email for testing
      'https://nanapastry.com/reset-password?token=test-reset-token-12345'
    );
    console.log('✅ Password reset email test passed');
    
    // Test order confirmation email
    console.log('📧 Sending test order confirmation email...');
    await emailService.sendOrderConfirmationEmail(
      'info@nanapastry.com', // Use your own email for testing
      {
        orderId: 'ORD-12345',
        orderTotal: 42.99,
        items: [
          { name: 'Chocolate Cake', quantity: 1, price: 24.99 },
          { name: 'Vanilla Cupcakes', quantity: 6, price: 3.00 }
        ],
        deliveryAddress: '123 Main Street\nApt 4B\nNew York, NY 10001',
        deliveryDate: 'May 20, 2025 between 2-4 PM'
      }
    );
    console.log('✅ Order confirmation email test passed');
    
    // Test generic email 
    console.log('📧 Sending test generic email...');
    await emailService.sendEmail({
      to: 'info@nanapastry.com', // Use your own email for testing
      subject: 'Test Email from Nana\'s Pastry',
      text: 'This is a test email from Nana\'s Pastry',
      html: '<p>This is a <strong>test email</strong> from Nana\'s Pastry</p>'
    });
    console.log('✅ Generic email test passed');
    
    console.log('🎉 All email tests passed!');
    console.log('Note: In development mode, check the console logs above for preview URLs');
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Run the test
testEmailService();
