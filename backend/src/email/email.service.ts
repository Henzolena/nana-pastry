import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
    this.setupTransporter();
  }

  private async setupTransporter() {
    try {
      // Check if we're in development or production mode
      if (this.isDevelopment) {
        // For development, use Ethereal which is a fake SMTP service
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        console.log('Email service initialized with Ethereal test account');
      } else {
        // For production, use real SMTP credentials from environment variables
        const host = this.configService.get('EMAIL_HOST');
        const port = this.configService.get('EMAIL_PORT');
        const secure = this.configService.get('EMAIL_SECURE') === 'true';
        const user = this.configService.get('EMAIL_USER');
        const pass = this.configService.get('EMAIL_PASS');
        
        if (!host || !user || !pass) {
          throw new Error('Missing email configuration. Please check your environment variables.');
        }

        this.transporter = nodemailer.createTransport({
          host,
          port: parseInt(port || '587', 10),
          secure, // true for 465, false for other ports
          auth: {
            user,
            pass,
          },
        });

        console.log('Email service initialized with production settings');
      }
    } catch (error) {
      console.error('Failed to set up email transporter:', error);
      throw new Error(`Email service initialization failed: ${error.message}`);
    }
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    try {
      if (!this.transporter) {
        console.log('Transporter not initialized, setting up now...');
        await this.setupTransporter();
      }

      console.log(`Attempting to send verification email to: ${email}`);

      // Get email configuration
      const fromEmail = this.configService.get('EMAIL_FROM') || '"Nana\'s Pastry" <verification@nanapastry.com>';
      const replyTo = this.configService.get('EMAIL_REPLY_TO') || 'support@nanapastry.com';

      // Send mail with defined transport object
      const info = await this.transporter.sendMail({
        from: fromEmail,
        to: email,
        replyTo: replyTo,
        subject: 'Verify Your Email - Nana\'s Pastry',
        text: `Please verify your email address by clicking the following link: ${verificationLink}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">Welcome to Nana's Pastry!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, you can also click on this link or copy it to your browser:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account with Nana's Pastry, please ignore this email.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
              <p>© ${new Date().getFullYear()} Nana's Pastry. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log('Verification email sent: %s', info.messageId);
      
      // Only show preview URL in development
      if (this.isDevelopment) {
        // For development, get the URL to preview the email in Ethereal
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL: %s', previewUrl);
        
        // Add a more visible log for easy copy-pasting of the preview URL
        console.log('===========================================================');
        console.log('EMAIL PREVIEW URL (copy and paste this in your browser):');
        console.log(previewUrl);
        console.log('===========================================================');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error(`Failed to send verification email: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Send a generic email
   * @param options Email options including recipient, subject, and content
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
      filename: string;
      content: string | Buffer;
      contentType?: string;
    }>;
  }): Promise<void> {
    try {
      if (!this.transporter) {
        console.log('Transporter not initialized, setting up now...');
        await this.setupTransporter();
      }

      console.log(`Attempting to send email to: ${options.to}`);

      // Get email configuration
      const fromEmail = this.configService.get('EMAIL_FROM') || '"Nana\'s Pastry" <info@nanapastry.com>';
      const replyTo = this.configService.get('EMAIL_REPLY_TO') || 'support@nanapastry.com';

      // Send mail with defined transport object
      const info = await this.transporter.sendMail({
        from: fromEmail,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      console.log('Email sent: %s', info.messageId);
      
      // Only show preview URL in development
      if (this.isDevelopment) {
        // For development, get the URL to preview the email in Ethereal
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL: %s', previewUrl);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Send order confirmation email
   * @param email Recipient email address
   * @param orderDetails Order details including items, total, and delivery information
   */
  async sendOrderConfirmationEmail(email: string, orderDetails: {
    orderId: string;
    orderTotal: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    deliveryAddress?: string;
    deliveryDate?: string;
  }): Promise<void> {
    // Format order items into HTML
    const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Create HTML email template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e91e63;">Order Confirmation - Nana's Pastry</h2>
        <p>Thank you for your order! We're preparing your delicious pastries.</p>
        
        <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order #${orderDetails.orderId}</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">$${orderDetails.orderTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          ${orderDetails.deliveryAddress ? `
            <div style="margin-top: 20px;">
              <h4 style="margin-bottom: 5px;">Delivery Address:</h4>
              <p style="margin-top: 0;">${orderDetails.deliveryAddress.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}
          
          ${orderDetails.deliveryDate ? `
            <div style="margin-top: 20px;">
              <h4 style="margin-bottom: 5px;">Expected Delivery:</h4>
              <p style="margin-top: 0;">${orderDetails.deliveryDate}</p>
            </div>
          ` : ''}
        </div>
        
        <p>If you have any questions about your order, please contact us at support@nanapastry.com.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>© ${new Date().getFullYear()} Nana's Pastry. All rights reserved.</p>
        </div>
      </div>
    `;

    // Create text-only version
    const text = `
      Order Confirmation - Nana's Pastry
      
      Thank you for your order! We're preparing your delicious pastries.
      
      Order #${orderDetails.orderId}
      
      ${orderDetails.items.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
      
      Total: $${orderDetails.orderTotal.toFixed(2)}
      
      ${orderDetails.deliveryAddress ? `Delivery Address:\n${orderDetails.deliveryAddress}` : ''}
      ${orderDetails.deliveryDate ? `Expected Delivery: ${orderDetails.deliveryDate}` : ''}
      
      If you have any questions about your order, please contact us at support@nanapastry.com.
    `;

    // Send the email
    await this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderDetails.orderId} - Nana's Pastry`,
      text,
      html,
    });
  }

  async sendNewOrderNotificationToBaker(orderDetails: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    orderTotal: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryAddress?: string;
    deliveryDate?: string; // Formatted date string
    pickupDate?: string; // Formatted date string
    pickupTime?: string;
    specialInstructions?: string;
  }): Promise<void> {
    const bakerEmail = this.configService.get('BAKER_NOTIFICATION_EMAIL') || 'info@nanapastry.com';
    
    const itemsSummary = orderDetails.items.map(item => 
      `- ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const subject = `New Order Received: #${orderDetails.orderId} from ${orderDetails.customerName}`;
    
    let deliveryDetailsHtml = '';
    if (orderDetails.deliveryMethod === 'delivery') {
      deliveryDetailsHtml = `
        <p><strong>Delivery Address:</strong><br>${orderDetails.deliveryAddress?.replace(/\n/g, '<br>') || 'N/A'}</p>
        <p><strong>Requested Delivery Date:</strong> ${orderDetails.deliveryDate || 'N/A'}</p>
      `;
    } else if (orderDetails.deliveryMethod === 'pickup') {
      deliveryDetailsHtml = `
        <p><strong>Pickup Date:</strong> ${orderDetails.pickupDate || 'N/A'}</p>
        <p><strong>Pickup Time:</strong> ${orderDetails.pickupTime || 'N/A'}</p>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e91e63;">New Order Notification!</h2>
        <p>A new order has been placed on Nana's Pastry.</p>
        
        <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details: #${orderDetails.orderId}</h3>
          <p><strong>Customer:</strong> ${orderDetails.customerName} (${orderDetails.customerEmail})</p>
          <p><strong>Order Total:</strong> $${orderDetails.orderTotal.toFixed(2)}</p>
          <p><strong>Delivery Method:</strong> ${orderDetails.deliveryMethod.charAt(0).toUpperCase() + orderDetails.deliveryMethod.slice(1)}</p>
          ${deliveryDetailsHtml}
          ${orderDetails.specialInstructions ? `<p><strong>Special Instructions:</strong> ${orderDetails.specialInstructions}</p>` : ''}
          
          <h4>Items:</h4>
          <ul style="list-style-type: none; padding-left: 0;">
            ${orderDetails.items.map(item => `<li>- ${item.name} (Qty: ${item.quantity}) @ $${item.price.toFixed(2)} each</li>`).join('')}
          </ul>
        </div>
        
        <p>Please log in to the admin/baker portal to view the full order details and manage this order.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>This is an automated notification from Nana's Pastry System.</p>
        </div>
      </div>
    `;

    const text = `
      New Order Notification!
      Order ID: #${orderDetails.orderId}
      Customer: ${orderDetails.customerName} (${orderDetails.customerEmail})
      Total: $${orderDetails.orderTotal.toFixed(2)}
      Delivery Method: ${orderDetails.deliveryMethod}
      ${orderDetails.deliveryMethod === 'delivery' ? `Delivery Address: ${orderDetails.deliveryAddress || 'N/A'}\nRequested Delivery Date: ${orderDetails.deliveryDate || 'N/A'}` : ''}
      ${orderDetails.deliveryMethod === 'pickup' ? `Pickup Date: ${orderDetails.pickupDate || 'N/A'}\nPickup Time: ${orderDetails.pickupTime || 'N/A'}` : ''}
      ${orderDetails.specialInstructions ? `Special Instructions: ${orderDetails.specialInstructions}\n` : ''}
      Items:
      ${itemsSummary}
      
      Please log in to the admin/baker portal to manage this order.
    `;

    await this.sendEmail({
      to: bakerEmail,
      subject,
      text,
      html,
    });
    console.log(`New order notification sent to baker (${bakerEmail}) for order ${orderDetails.orderId}`);
  }

  /**
   * Send a password reset email
   * @param email Recipient's email address
   * @param resetLink Password reset link
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
      if (!this.transporter) {
        console.log('Transporter not initialized, setting up now...');
        await this.setupTransporter();
      }

      console.log(`Attempting to send password reset email to: ${email}`);

      // Get email configuration
      const fromEmail = this.configService.get('EMAIL_FROM') || '"Nana\'s Pastry" <noreply@nanapastry.com>';
      const replyTo = this.configService.get('EMAIL_REPLY_TO') || 'support@nanapastry.com';

      // Send mail with defined transport object
      const info = await this.transporter.sendMail({
        from: fromEmail,
        to: email,
        replyTo: replyTo,
        subject: 'Reset Your Password - Nana\'s Pastry',
        text: `You requested to reset your password. Please click the following link to reset your password: ${resetLink}\n\nIf you did not request a password reset, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">Reset Your Password</h2>
            <p>You requested to reset your password for your Nana's Pastry account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, you can also click on this link or copy it to your browser:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
              <p>© ${new Date().getFullYear()} Nana's Pastry. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log('Password reset email sent: %s', info.messageId);
      
      // Only show preview URL in development
      if (this.isDevelopment) {
        // For development, get the URL to preview the email in Ethereal
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL: %s', previewUrl);
        
        // Add a more visible log for easy copy-pasting of the preview URL
        console.log('===========================================================');
        console.log('PASSWORD RESET EMAIL PREVIEW URL (copy and paste this in your browser):');
        console.log(previewUrl);
        console.log('===========================================================');
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if the email configuration is valid
   * @returns true if valid, throws error if invalid
   */
  async checkEmailConfig(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.setupTransporter();
      }
      
      // Verify the connection configuration
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email configuration check failed:', error);
      throw new Error(`Invalid email configuration: ${error.message}`);
    }
  }
}
