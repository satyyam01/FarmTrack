// scripts/test-email-connection.js
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Testing Zoho SMTP Connection...');
console.log('📧 Configuration:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  secure: process.env.EMAIL_PORT === '465'
});

async function testConnection() {
  try {
    // Create transporter with different auth methods
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      // Try different authentication methods
      authMethod: 'PLAIN' // or 'LOGIN', 'CRAM-MD5'
    });

    console.log('🔍 Verifying transporter configuration...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Test sending email
    console.log('📤 Testing email send...');
    const info = await transporter.sendMail({
      from: `"FarmTrack Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '🧪 FarmTrack SMTP Test',
      html: '<h1>SMTP Test Successful!</h1><p>Your Zoho email configuration is working.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    
    if (error.code === 'ECONNECTION') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if EMAIL_HOST is correct');
      console.log('2. Check if EMAIL_PORT is correct');
      console.log('3. Check network connectivity');
      console.log('4. Try different port (465 vs 587)');
    } else if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed - Zoho specific solutions:');
      console.log('1. ✅ Check EMAIL_USER and EMAIL_PASS in .env file');
      console.log('2. ✅ Verify you can login to https://mail.zoho.com');
      console.log('3. 🔍 Check if 2FA is enabled on your Zoho account');
      console.log('4. 🔍 If 2FA is enabled, generate an App Password:');
      console.log('   - Go to Zoho Mail → Settings → Security → App Passwords');
      console.log('   - Generate password for "SMTP" or "Mail"');
      console.log('   - Use the App Password instead of your regular password');
      console.log('5. 🔍 Try different authentication methods (LOGIN vs PLAIN)');
      console.log('6. 🔍 Check if your domain is properly verified in Zoho');
      console.log('\n📝 Current credentials being used:');
      console.log(`   User: ${process.env.EMAIL_USER}`);
      console.log(`   Password: ${process.env.EMAIL_PASS ? '***set***' : '***NOT SET***'}`);
    }
  }
}

testConnection(); 