// utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter with fallback options
let transporter;

if (process.env.EMAIL_HOST) {
  // Use custom SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Additional settings for better connection handling
    tls: {
      rejectUnauthorized: false, // For development/testing
      ciphers: 'SSLv3'
    },
    // Connection timeout settings
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000      // 60 seconds
  });
} else {
  // Fallback to Gmail for testing
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'your-email@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
    }
  });
}

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  }
});

async function sendEmail({ to, subject, html, retries = 3 }) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const mailOptions = {
        from: `"FarmTrack Alerts" <${process.env.EMAIL_USER || 'farmtrack@satyyam.site'}>`,
        to,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Email sending error (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        console.error('❌ All email retry attempts failed');
        return { success: false, error: error.message };
      }
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Send email to multiple recipients
async function sendBulkEmail({ recipients, subject, html }) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject,
      html
    });
    results.push({ recipient, ...result });
  }
  
  return results;
}

module.exports = { 
  sendEmail, 
  sendBulkEmail,
  transporter 
};
