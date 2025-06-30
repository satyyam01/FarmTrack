# Email Configuration Guide

## Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=mail.satyyam.site
EMAIL_PORT=465
EMAIL_USER=farmtrack@satyyam.site
EMAIL_PASS=your_email_password_here
```

## Features Implemented

### 1. **Email Service (`utils/emailService.js`)**
- ✅ Nodemailer configuration with environment variables
- ✅ Retry logic with exponential backoff (3 attempts)
- ✅ Bulk email support
- ✅ Transporter verification on startup
- ✅ Improved error handling and logging

### 2. **Email Templates (`utils/emailTemplates.js`)**
- ✅ Fixed variable replacement (no more `{{title}}` placeholders)
- ✅ Alert-specific styling (fencing, night-return, barn-check)
- ✅ Responsive HTML design
- ✅ Professional branding

### 3. **Alert Controller (`controllers/alertController.js`)**
- ✅ Fencing alerts with email notifications
- ✅ Barn check alerts with email notifications
- ✅ Improved error handling for email failures
- ✅ Uses specific email templates

### 4. **Night Check Logic (`utils/nightCheckLogic.js`)**
- ✅ Automated night return checks via cron
- ✅ Email notifications for missing animals
- ✅ Farm-specific scheduling
- ✅ Improved logging and error handling

### 5. **Cron Scheduler (`scheduler/nightCheckScheduler.js`)**
- ✅ Farm-specific night check schedules
- ✅ Dynamic schedule updates
- ✅ Fallback to default 9 PM schedule
- ✅ Manual testing capabilities

## Alert Types

### 1. **Fencing Alerts**
- Triggered manually by admin
- Red-styled email template
- Immediate notification for boundary breaches

### 2. **Night Return Alerts**
- Automated via cron job
- Blue-styled email template
- Daily check for animals not returning to barn

### 3. **Barn Check Alerts**
- Manual or automated barn checks
- Yellow-styled email template
- Daily verification of animal returns

## Testing

### Manual Testing
```javascript
// Test night check manually
const { testNightCheck } = require('./scheduler/nightCheckScheduler');
await testNightCheck('farm_id_here');
```

### Email Testing
```javascript
// Test email service
const { sendEmail } = require('./utils/emailService');
const result = await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>'
});
console.log(result);
```

## Monitoring

- Email service logs: `📨 Email sent successfully` / `❌ Email sending error`
- Night check logs: `🔔 Running scheduled night return check`
- Alert creation logs: `📢 Created night return alert`

## Security Notes

- Email credentials are now environment variables
- Retry logic prevents spam on temporary failures
- Email failures don't break the main application flow 