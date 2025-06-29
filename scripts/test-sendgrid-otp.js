require('dotenv').config();
const { sendOTP, verifyOTP } = require('../utils/sendgridOTP');

console.log('🧪 Testing SendGrid OTP System');
console.log('');

// Check environment variables
console.log('📝 Environment Check:');
console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   SENDER_EMAIL: ${process.env.SENDER_EMAIL || 'Using EMAIL_USER'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ Not set'}`);
console.log('');

if (!process.env.SENDGRID_API_KEY) {
  console.log('❌ SENDGRID_API_KEY is required in .env file');
  console.log('💡 Add: SENDGRID_API_KEY=your_sendgrid_api_key');
  process.exit(1);
}

async function testOTPSystem() {
  const testEmail = process.env.EMAIL_USER || 'test@example.com';
  
  console.log(`🧪 Testing with email: ${testEmail}`);
  console.log('');

  try {
    // Test 1: Send OTP
    console.log('📤 Step 1: Sending OTP...');
    await sendOTP(testEmail);
    console.log('✅ OTP sent successfully!');
    console.log('');

    // Test 2: Verify with correct OTP (we need to get it from the store)
    console.log('🔍 Step 2: Testing OTP verification...');
    console.log('💡 Check your email for the OTP code and enter it below:');
    
    // In a real scenario, you'd get the OTP from the email
    // For testing, we'll simulate the verification
    console.log('📧 Please check your email and run this test with the actual OTP');
    console.log('');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('📊 SendGrid Response:', error.response.body);
    }
    
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Check if SENDGRID_API_KEY is valid');
    console.log('2. Verify sender email is verified in SendGrid');
    console.log('3. Check SendGrid account status');
  }
}

testOTPSystem().catch(console.error); 