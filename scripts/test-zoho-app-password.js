const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔐 Testing Zoho Authentication Methods...');

// Test different authentication configurations
const configs = [
  {
    name: 'Port 587 with PLAIN auth',
    config: {
      host: 'smtp.zoho.in',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      authMethod: 'PLAIN'
    }
  },
  {
    name: 'Port 587 with LOGIN auth',
    config: {
      host: 'smtp.zoho.in',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      authMethod: 'LOGIN'
    }
  },
  {
    name: 'Port 465 with SSL',
    config: {
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  {
    name: 'Port 465 with SSL and LOGIN auth',
    config: {
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      authMethod: 'LOGIN'
    }
  }
];

async function testConfig(config, name) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`📧 Host: ${config.host}:${config.port} (secure: ${config.secure})`);
  
  try {
    const transporter = nodemailer.createTransport(config);
    
    // Test connection
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    // Test sending
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Test: ${name}`,
      html: '<h1>Authentication Test Successful!</h1>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    return true;
    
  } catch (error) {
    console.log('❌ Failed:', error.message);
    if (error.code === 'EAUTH') {
      console.log('   🔍 Authentication failed - check credentials');
    }
    return false;
  }
}

async function runTests() {
  console.log('📝 Current credentials:');
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Password: ${process.env.EMAIL_PASS ? '***set***' : '***NOT SET***'}`);
  
  let successCount = 0;
  
  for (const test of configs) {
    const success = await testConfig(test.config, test.name);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Results: ${successCount}/${configs.length} configurations worked`);
  
  if (successCount === 0) {
    console.log('\n💡 All tests failed. Possible solutions:');
    console.log('1. 🔍 Check if you can login to https://mail.zoho.com');
    console.log('2. 🔍 Verify your password is correct');
    console.log('3. 🔍 Check if 2FA is enabled (use App Password)');
    console.log('4. 🔍 Generate App Password: Zoho Mail → Settings → Security → App Passwords');
    console.log('5. 🔍 Make sure your domain is verified in Zoho');
  }
}

runTests(); 