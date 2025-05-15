#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}    Nana's Pastry Email Configuration Setup    ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo

# Check if .env file exists
if [ -f .env ]; then
    echo -e "${YELLOW}Existing .env file found.${NC}"
    read -p "Do you want to update email settings in this file? (y/n): " update_existing
    
    if [[ $update_existing != "y" && $update_existing != "Y" ]]; then
        echo -e "${YELLOW}Setup cancelled. Your .env file remains unchanged.${NC}"
        exit 0
    fi
    
    # Make a backup of the existing .env file
    cp .env .env.backup
    echo -e "${GREEN}Created backup of existing .env file as .env.backup${NC}"
else
    # Create a new .env file if it doesn't exist
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}Created new .env file from .env.example${NC}"
    else
        touch .env
        echo -e "${YELLOW}Created new empty .env file${NC}"
    fi
fi

echo
echo -e "${BLUE}Please select your email provider:${NC}"
echo "1) Gmail"
echo "2) SendGrid"
echo "3) Mailgun"
echo "4) Amazon SES"
echo "5) Custom SMTP"
echo "6) Development mode (Ethereal - no real emails sent)"
read -p "Enter your choice (1-6): " provider_choice

echo
echo -e "${BLUE}Configuring email settings...${NC}"

case $provider_choice in
    1) # Gmail
        echo "# Email Settings - Gmail" >> .env.tmp
        echo "NODE_ENV=production" >> .env.tmp
        echo "EMAIL_HOST=smtp.gmail.com" >> .env.tmp
        echo "EMAIL_PORT=587" >> .env.tmp
        echo "EMAIL_SECURE=false" >> .env.tmp
        
        read -p "Enter your Gmail address: " gmail
        echo "EMAIL_USER=$gmail" >> .env.tmp
        
        read -p "Enter your Gmail app password (not your regular password): " gmail_pass
        echo "EMAIL_PASS=$gmail_pass" >> .env.tmp
        
        read -p "Enter sender name (default: Nana's Pastry): " sender_name
        sender_name=${sender_name:-"Nana's Pastry"}
        echo "EMAIL_FROM=\"$sender_name <$gmail>\"" >> .env.tmp
        
        read -p "Enter reply-to email (default: support@nanapastry.com): " reply_to
        reply_to=${reply_to:-"support@nanapastry.com"}
        echo "EMAIL_REPLY_TO=$reply_to" >> .env.tmp
        
        echo -e "${YELLOW}NOTE: For Gmail, you need to:${NC}"
        echo "1. Enable 2-Step Verification in your Google account"
        echo "2. Generate an App Password at https://myaccount.google.com/apppasswords"
        echo "3. Use that App Password instead of your regular Gmail password"
        ;;
        
    2) # SendGrid
        echo "# Email Settings - SendGrid" >> .env.tmp
        echo "NODE_ENV=production" >> .env.tmp
        echo "EMAIL_HOST=smtp.sendgrid.net" >> .env.tmp
        echo "EMAIL_PORT=587" >> .env.tmp
        echo "EMAIL_SECURE=false" >> .env.tmp
        
        echo "EMAIL_USER=apikey" >> .env.tmp
        
        read -p "Enter your SendGrid API key: " sendgrid_key
        echo "EMAIL_PASS=$sendgrid_key" >> .env.tmp
        
        read -p "Enter sender email: " sender_email
        read -p "Enter sender name (default: Nana's Pastry): " sender_name
        sender_name=${sender_name:-"Nana's Pastry"}
        echo "EMAIL_FROM=\"$sender_name <$sender_email>\"" >> .env.tmp
        
        read -p "Enter reply-to email (default: support@nanapastry.com): " reply_to
        reply_to=${reply_to:-"support@nanapastry.com"}
        echo "EMAIL_REPLY_TO=$reply_to" >> .env.tmp
        ;;
        
    3) # Mailgun
        echo "# Email Settings - Mailgun" >> .env.tmp
        echo "NODE_ENV=production" >> .env.tmp
        echo "EMAIL_HOST=smtp.mailgun.org" >> .env.tmp
        echo "EMAIL_PORT=587" >> .env.tmp
        echo "EMAIL_SECURE=false" >> .env.tmp
        
        read -p "Enter your Mailgun SMTP username: " mailgun_user
        echo "EMAIL_USER=$mailgun_user" >> .env.tmp
        
        read -p "Enter your Mailgun SMTP password: " mailgun_pass
        echo "EMAIL_PASS=$mailgun_pass" >> .env.tmp
        
        read -p "Enter sender email: " sender_email
        read -p "Enter sender name (default: Nana's Pastry): " sender_name
        sender_name=${sender_name:-"Nana's Pastry"}
        echo "EMAIL_FROM=\"$sender_name <$sender_email>\"" >> .env.tmp
        
        read -p "Enter reply-to email (default: support@nanapastry.com): " reply_to
        reply_to=${reply_to:-"support@nanapastry.com"}
        echo "EMAIL_REPLY_TO=$reply_to" >> .env.tmp
        ;;
        
    4) # Amazon SES
        echo "# Email Settings - Amazon SES" >> .env.tmp
        echo "NODE_ENV=production" >> .env.tmp
        
        read -p "Enter your AWS region (default: us-east-1): " aws_region
        aws_region=${aws_region:-"us-east-1"}
        echo "EMAIL_HOST=email-smtp.$aws_region.amazonaws.com" >> .env.tmp
        
        echo "EMAIL_PORT=587" >> .env.tmp
        echo "EMAIL_SECURE=false" >> .env.tmp
        
        read -p "Enter your SES SMTP username: " ses_user
        echo "EMAIL_USER=$ses_user" >> .env.tmp
        
        read -p "Enter your SES SMTP password: " ses_pass
        echo "EMAIL_PASS=$ses_pass" >> .env.tmp
        
        read -p "Enter sender email (must be verified in SES): " sender_email
        read -p "Enter sender name (default: Nana's Pastry): " sender_name
        sender_name=${sender_name:-"Nana's Pastry"}
        echo "EMAIL_FROM=\"$sender_name <$sender_email>\"" >> .env.tmp
        
        read -p "Enter reply-to email (default: support@nanapastry.com): " reply_to
        reply_to=${reply_to:-"support@nanapastry.com"}
        echo "EMAIL_REPLY_TO=$reply_to" >> .env.tmp
        ;;
        
    5) # Custom SMTP
        echo "# Email Settings - Custom SMTP" >> .env.tmp
        echo "NODE_ENV=production" >> .env.tmp
        
        read -p "Enter SMTP host (e.g., smtp.yourprovider.com): " smtp_host
        echo "EMAIL_HOST=$smtp_host" >> .env.tmp
        
        read -p "Enter SMTP port (default: 587): " smtp_port
        smtp_port=${smtp_port:-"587"}
        echo "EMAIL_PORT=$smtp_port" >> .env.tmp
        
        read -p "Use secure connection? (true/false, default: false): " smtp_secure
        smtp_secure=${smtp_secure:-"false"}
        echo "EMAIL_SECURE=$smtp_secure" >> .env.tmp
        
        read -p "Enter SMTP username: " smtp_user
        echo "EMAIL_USER=$smtp_user" >> .env.tmp
        
        read -p "Enter SMTP password: " smtp_pass
        echo "EMAIL_PASS=$smtp_pass" >> .env.tmp
        
        read -p "Enter sender email: " sender_email
        read -p "Enter sender name (default: Nana's Pastry): " sender_name
        sender_name=${sender_name:-"Nana's Pastry"}
        echo "EMAIL_FROM=\"$sender_name <$sender_email>\"" >> .env.tmp
        
        read -p "Enter reply-to email (default: support@nanapastry.com): " reply_to
        reply_to=${reply_to:-"support@nanapastry.com"}
        echo "EMAIL_REPLY_TO=$reply_to" >> .env.tmp
        ;;
        
    6) # Development mode (Ethereal)
        echo "# Email Settings - Development Mode (Ethereal)" >> .env.tmp
        echo "NODE_ENV=development" >> .env.tmp
        echo "# No email credentials needed for development mode" >> .env.tmp
        echo "# Emails will be captured by Ethereal and preview URLs will be shown in logs" >> .env.tmp
        ;;
        
    *)
        echo -e "${RED}Invalid choice. Exiting without changes.${NC}"
        rm -f .env.tmp
        exit 1
        ;;
esac

# Merge the temporary file with the existing .env
# We need to preserve other settings in the .env file
if [ -f .env.tmp ]; then
    # Extract existing email settings to replace them
    grep -v "^NODE_ENV=" .env | grep -v "^EMAIL_" > .env.filtered
    
    # Add the new email settings
    echo "" >> .env.filtered
    cat .env.tmp >> .env.filtered
    
    # Replace the original .env file
    mv .env.filtered .env
    rm -f .env.tmp
    
    echo
    echo -e "${GREEN}Email configuration has been updated successfully!${NC}"
    
    # Offer to run the test email script
    if [[ $provider_choice != "6" ]]; then
        echo
        read -p "Do you want to test the email configuration now? (y/n): " run_test
        
        if [[ $run_test == "y" || $run_test == "Y" ]]; then
            echo -e "${BLUE}Running email test...${NC}"
            npm run test:email
        fi
    else
        echo -e "${YELLOW}Development mode configured. No real emails will be sent.${NC}"
        echo -e "When testing, the console will show preview URLs for viewing the emails."
    fi
else
    echo -e "${RED}Failed to update email configuration.${NC}"
    exit 1
fi

echo
echo -e "${GREEN}Setup complete!${NC}"
