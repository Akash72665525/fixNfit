# Email OTP Setup Guide

## How to Send OTP Emails

The registration now requires email and phone verification using OTPs. Follow these steps to enable email OTP sending:

### Step 1: Enable Gmail 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification" and follow the prompts
3. Complete the 2-Step Verification setup

### Step 2: Generate Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Copy the 16-character password that appears

### Step 3: Add Credentials to .env

In `backend/.env`, update:

```env
EMAIL_USER=araheja022@gmail.com
EMAIL_PASSWORD=your_16_char_app_password_here
```

**Important**: The password is the 16-character app password from Step 2, NOT your Gmail password.

### Step 4: Install Nodemailer (if not already installed)

```bash
cd backend
npm install nodemailer
```

### Step 5: Restart Backend

```bash
npm start
```

## Testing Email OTP

1. Go to the registration page
2. Enter your email (e.g., araheja022@gmail.com)
3. Click "Send OTP"
4. Check your email inbox - you should receive an OTP email within seconds
5. Copy the OTP from the email and paste it into the verification field
6. Click "Verify"

## How OTP Works

- **Email OTP**: Sent to user's registered email
- **Phone OTP**: Currently logged to console (ready for SMS integration with Twilio)
- **Valid Duration**: 10 minutes
- **Max Attempts**: 3 failed attempts per OTP
- **Auto-expire**: OTP automatically expires after successful verification

## Email Content

The OTP email includes:
- Company branding (FixNFit header)
- Large, easy-to-read 6-digit OTP
- 10-minute expiry notice
- Professional formatting

## Troubleshooting

### Email not sending?
1. Verify EMAIL_USER and EMAIL_PASSWORD are correct in .env
2. Check that 2FA is enabled on Gmail account
3. Confirm app password was generated correctly (16 chars)
4. Check backend console for error messages

### Getting "Invalid credentials" error?
- Make sure you're using the 16-character app password, not your Gmail password
- Regenerate the app password and try again

### Getting "Email already registered"?
- The system checked the database and found this email already has an account
- Use a different email address

## For Production

Replace the email service with a dedicated email provider:
- **Sendgrid**: npm install @sendgrid/mail
- **AWS SES**: npm install aws-sdk
- **Mailgun**: npm install mailgun.js
- **Postmark**: npm install postmark

Update `backend/services/emailService.js` to use your chosen provider.

## Phone OTP (Future)

Phone OTP sending is a placeholder ready for SMS integration using:
- **Twilio**: npm install twilio
- **AWS SNS**: npm install aws-sdk
- **Vonage (Nexmo)**: npm install @vonage/server-sdk

The structure is ready - just implement the actual SMS sending in the service.
