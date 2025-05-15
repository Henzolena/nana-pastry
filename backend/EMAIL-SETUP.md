# Email Service Setup Guide

The Nana's Pastry application uses Nodemailer for sending emails, including:
- Email verification links
- Order confirmations
- Password reset links
- General notifications

## Quick Setup

We've provided an interactive setup script to help you configure your email settings:

```bash
# Navigate to the backend directory
cd backend

# Run the setup script
npm run setup:email
```

The script will:
1. Guide you through selecting an email provider
2. Help you enter the required credentials
3. Create or update your .env file
4. Offer to test your configuration

## Development vs. Production Mode

The email service automatically switches between development and production modes:

- **Development Mode**: Uses [Ethereal Email](https://ethereal.email/) which is a fake SMTP service that captures emails without actually sending them. This is perfect for testing and development.

- **Production Mode**: Uses a real SMTP provider like Gmail, SendGrid, Mailgun, etc., to actually send emails to users.

## Configuration

### 1. Development Mode

In development mode (default), you don't need to set up any email configuration. The system automatically:
- Creates a temporary Ethereal account
- Configures the transporter
- Logs a preview URL in the console when emails are sent

You can view these "sent" emails by copying the preview URL from the console and opening it in your browser.

### 2. Production Mode

For production, you need to set up real email credentials. Create a `.env` file in the `/backend` directory (copy from `.env.example`) with:

```
NODE_ENV=production
EMAIL_HOST=your-smtp-server
EMAIL_PORT=587
EMAIL_SECURE=false  # true for 465 port, false for other ports
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
EMAIL_FROM="Nana's Pastry <info@nanapastry.com>"
EMAIL_REPLY_TO=support@nanapastry.com
```

## Using Gmail SMTP

To use Gmail SMTP for sending production emails:

1. Use a Gmail account (preferably a dedicated one for your app)
2. Enable 2-Factor Authentication on the account
3. Generate an app password at https://myaccount.google.com/apppasswords
4. Use these settings in your `.env` file:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

**Important**: Do not use your regular Gmail password - it won't work if 2FA is enabled. Always use an app password.

## Alternative Email Providers

You can also use other email service providers:

### IONOS (Recommended)
```
EMAIL_HOST=smtp.ionos.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
EMAIL_FROM="Your Business <info@yourdomain.com>"
EMAIL_REPLY_TO=info@yourdomain.com
```

### SendGrid
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Mailgun
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

### Amazon SES
```
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASS=your-ses-smtp-password
```

## Troubleshooting

If emails aren't being sent:

1. Check the server logs for detailed error messages
2. Verify your SMTP credentials are correct
3. Make sure your email provider isn't blocking the connection
4. For Gmail, ensure you're using an app password (not your regular password)
5. Some hosting providers block outgoing SMTP - use a dedicated email service instead
