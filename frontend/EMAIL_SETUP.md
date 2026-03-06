# EmailJS Setup Guide

This guide will help you set up EmailJS for sending emails from the appointment and contact forms.

## Prerequisites

1. Create a free account at [EmailJS](https://www.emailjs.com/)
2. Verify your email address

## Step 1: Create an Email Service

1. Go to your EmailJS dashboard
2. Click on "Email Services" in the left sidebar
3. Click "Add New Service"
4. Choose your email provider (Gmail, Outlook, etc.)
5. Follow the setup instructions to connect your email account
6. Note down your **Service ID**

## Step 2: Create Email Templates

You'll need to create 3 email templates:

### Template 1: Appointment Requests
- **Template Name**: `appointment_request`
- **Subject**: `New Appointment Request - {{from_name}}`
- **HTML Body**:
```html
<h2>New Appointment Request</h2>
<p><strong>From:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Preferred Date:</strong> {{preferred_date}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>
```

### Template 2: Contact Form Messages
- **Template Name**: `contact_form`
- **Subject**: `New Contact Form Message - {{subject}}`
- **HTML Body**:
```html
<h2>New Contact Form Message</h2>
<p><strong>From:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Subject:</strong> {{subject}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>
```

### Template 3: Confirmation Replies
- **Template Name**: `confirmation_reply`
- **Subject**: `{{subject}}`
- **HTML Body**:
```html
<h2>{{subject}}</h2>
<p>Dear {{to_name}},</p>
<p>{{message}}</p>
<p>Best regards,<br>E-ivuzeConnect Team<br>Email: E-ivuzeconnect@gmail.com</p>
```

## Step 3: Get Your API Keys

1. Go to "Account" in your EmailJS dashboard
2. Copy your **Public Key**
3. Note down all your **Template IDs** from the templates you created

## Step 4: Configure Your Application

1. Open `frontend/src/services/emailService.js`
2. Replace the placeholder values:

```javascript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'your_actual_service_id',
  TEMPLATE_ID_APPOINTMENT: 'your_appointment_template_id',
  TEMPLATE_ID_CONTACT: 'your_contact_template_id',
  PUBLIC_KEY: 'your_actual_public_key'
}
```

3. For the confirmation template, update the `sendConfirmationReply` function:

```javascript
return emailjs.send(
  EMAILJS_CONFIG.SERVICE_ID,
  'your_confirmation_template_id', // Replace with actual confirmation template ID
  templateParams
)
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Fill out and submit the appointment form or contact form
3. Check your email (E-ivuzeconnect@gmail.com) for the received messages
4. Check the user's email for confirmation replies

## Troubleshooting

- **Emails not sending**: Check your EmailJS dashboard for error messages
- **Template variables not working**: Ensure variable names match exactly between your templates and the code
- **Service quota exceeded**: EmailJS has a free tier limit. Upgrade if needed.

## Security Notes

- Never commit your EmailJS keys to version control
- Consider using environment variables for production deployment
- Monitor your EmailJS usage to avoid hitting free tier limits

## Support

For EmailJS setup issues, visit their [documentation](https://www.emailjs.com/docs/) or contact their support.
