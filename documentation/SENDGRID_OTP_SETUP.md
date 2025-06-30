# SendGrid OTP System Setup

## Overview
FarmTrack now uses SendGrid for OTP (One-Time Password) verification instead of Twilio. This provides a more reliable and cost-effective email-based verification system.

## Environment Variables Required

Add these to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDER_EMAIL=farmtrack@satyyam.site  # Optional, defaults to EMAIL_USER

# Existing Email Configuration (for other emails)
EMAIL_HOST=smtp.zoho.in
EMAIL_PORT=587
EMAIL_USER=farmtrack@satyyam.site
EMAIL_PASS=your_password
```

## SendGrid Setup Steps

### 1. Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your account

### 2. Get API Key
1. Navigate to Settings → API Keys
2. Create a new API Key
3. Choose "Restricted Access" → "Mail Send"
4. Copy the API key

### 3. Verify Sender Email
1. Go to Settings → Sender Authentication
2. Verify your domain or single sender email
3. For single sender: Add `farmtrack@satyyam.site`
4. Check your email and click the verification link

### 4. Test the System
Run the test script:
```bash
node scripts/test-sendgrid-otp.js
```

## How It Works

### OTP Generation
- 6-digit numeric code (100000-999999)
- Stored in memory with 10-minute expiry
- Automatically deleted after verification or expiry

### Email Template
- Professional HTML email template
- FarmTrack branding with green color scheme
- Clear OTP display with large, readable font
- Security warnings and expiry information

### Verification Flow
1. User submits registration form
2. System generates OTP and sends via SendGrid
3. User receives email with verification code
4. User enters OTP in frontend
5. System verifies OTP and creates user account

## Files Modified

### Backend Changes
- `controllers/verificationController.js` - Updated to use SendGrid OTP
- `utils/sendgridOTP.js` - New SendGrid OTP utility
- `models/user.js` - Updated comments (no functional changes)

### Frontend Changes
- No changes required - frontend API calls remain the same

## Benefits of SendGrid Over Twilio

1. **Cost Effective**: Free tier includes 100 emails/day
2. **Reliable**: Better email delivery rates
3. **Professional**: Better email templates and branding
4. **Simple**: No complex service setup required
5. **Scalable**: Easy to upgrade for higher volumes

## Troubleshooting

### Common Issues

1. **"SENDGRID_API_KEY not set"**
   - Add SENDGRID_API_KEY to your .env file

2. **"Sender not verified"**
   - Verify your sender email in SendGrid dashboard

3. **"Authentication failed"**
   - Check if API key is correct and has "Mail Send" permissions

4. **"Email not received"**
   - Check spam folder
   - Verify sender email is properly configured

### Testing
```bash
# Test SendGrid OTP system
node scripts/test-sendgrid-otp.js

# Test full registration flow
# 1. Start your server
# 2. Go to registration page
# 3. Submit registration form
# 4. Check email for OTP
# 5. Enter OTP to complete registration
```

## Migration from Twilio

The migration is complete and transparent to users:
- No changes to frontend code required
- Same API endpoints and response format
- Improved email delivery and reliability
- Better user experience with professional email templates 