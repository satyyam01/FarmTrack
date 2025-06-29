require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔧 Email Configuration Test');
console.log('');

// Check current configuration
console.log('📝 Current .env Configuration:');
console.log(`   EMAIL_HOST: "${process.env.EMAIL_HOST}"`);
console.log(`   EMAIL_PORT: "${process.env.EMAIL_PORT}"`);
console.log(`   EMAIL_USER: "${process.env.EMAIL_USER}"`);
console.log(`   EMAIL_PASS: "${process.env.EMAIL_PASS}"`);
console.log('');

// Test different configurations
const configs = [
  {
    name: 'Zoho India (Port 587)',
    host: 'smtp.zoho.in',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  {
    name: 'Zoho India (Port 465)',
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  {
    name: 'Zoho Global (Port 587)',
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  {
    name: 'Zoho Global (Port 465)',
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
];

async function testConfig(config) {
  console.log(`🧪 Testing: ${config.name}`);
  console.log(`📧 Host: ${config.host}:${config.port} (secure: ${config.secure})`);
  
  try {
    const transporter = nodemailer.createTransporter(config);
    
    // Test connection
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    // Test sending
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from FarmTrack'
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.log('   🔍 Authentication failed - check credentials');
    } else if (error.code === 'ECONNECTION') {
      console.log('   🔍 Connection failed - check host/port');
    }
    return false;
  }
  console.log('');
}

async function runTests() {
  console.log('🚀 Starting email configuration tests...\n');
  
  let successCount = 0;
  
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) successCount++;
    console.log('');
  }
  
  console.log(`📊 Results: ${successCount}/${configs.length} configurations worked`);
  
  if (successCount === 0) {
    console.log('');
    console.log('💡 All tests failed. Troubleshooting steps:');
    console.log('');
    console.log('1. 🔍 Check your .env file format:');
    console.log('   EMAIL_HOST=smtp.zoho.in');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=farmtrack@satyyam.site');
    console.log('   EMAIL_PASS=your-password-without-semicolon');
    console.log('');
    console.log('2. 🔍 Verify you can login to https://mail.zoho.com');
    console.log('');
    console.log('3. 🔍 Check if 2FA is enabled:');
    console.log('   - If yes, generate App Password');
    console.log('   - Zoho Mail → Settings → Security → App Passwords');
    console.log('');
    console.log('4. 🔍 Make sure your domain is verified in Zoho');
    console.log('');
    console.log('5. 🔍 Try using Gmail SMTP for testing:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=your-gmail@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
  }
}

runTests().catch(console.error); 