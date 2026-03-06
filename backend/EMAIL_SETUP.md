# Backend Email Configuration Guide

This guide will help you configure email functionality for the E-ivuzeConnect backend.

## Prerequisites

You need an SMTP email service provider. Popular options include:
- Gmail (with app password)
- Outlook/Hotmail
- SendGrid
- Mailgun
- AWS SES
- Any SMTP provider

## Environment Variables Setup

Add these environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Alternative naming (also supported)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
```

## Gmail Setup (Most Common)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this 16-character password as `EMAIL_PASS`

3. **Configure environment variables**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

## Outlook/Hotmail Setup

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=your-email@outlook.com
```

## SendGrid Setup

1. Create a SendGrid account
2. Get your API key
3. Use SendGrid's SMTP settings:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=your-verified-sender@yourdomain.com
```

## Testing Email Configuration

Run the email configuration checker:

```bash
cd backend
node utils/emailConfigChecker.js
```

Or run the manual email test:

```bash
cd backend
node test_email_manual.js
```

## Email Features

The backend now automatically sends emails for:

### 1. Appointment Requests
- **To**: `E-ivuzeconnect@gmail.com`
- **Subject**: `New Appointment Request from [User Name]`
- **Content**: Name, email, phone, preferred date, message
- **User Confirmation**: Automatic reply to user with confirmation

### 2. Contact Form Messages
- **To**: `E-ivuzeconnect@gmail.com`
- **Subject**: `New Contact Form Message: [Subject]`
- **Content**: Name, email, phone, subject, message
- **User Confirmation**: Automatic reply to user

### 3. Pharmacy Invitations
- **Templates**: Available in English and Kinyarwanda
- **Includes**: Password and registration link

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check your email credentials
   - For Gmail, ensure you're using an App Password, not your regular password

2. **Connection Timeout**
   - Some hosting providers block SMTP ports
   - Try using port 443 or 80 if available
   - Consider using a transactional email service

3. **Emails Not Sending**
   - Check server logs for error messages
   - Verify environment variables are loaded correctly
   - Test with the email configuration checker

4. **Emails Going to Spam**
   - Set up SPF/DKIM records for your domain
   - Use a reputable email service provider
   - Avoid spam trigger words in subject/content

### Debug Commands

```bash
# Check email configuration
node utils/emailConfigChecker.js

# Test email sending
node test_email_manual.js

# Check environment variables
echo $EMAIL_HOST
echo $EMAIL_USER
```

## Security Best Practices

1. **Never commit email credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate passwords regularly**
4. **Use app passwords** instead of main account passwords
5. **Monitor email sending** for abuse

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for form submissions
2. **Email Templates**: Customize email templates for your brand
3. **Monitoring**: Set up monitoring for email delivery failures
4. **Backup**: Have backup email providers ready
5. **Legal**: Ensure compliance with email regulations (CAN-SPAM, GDPR, etc.)

## Support

For email configuration issues:
1. Check the server logs for detailed error messages
2. Test with the provided debug scripts
3. Verify your SMTP provider's documentation
4. Consider using a managed email service for production
