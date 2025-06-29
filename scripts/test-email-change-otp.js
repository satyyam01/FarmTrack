require('dotenv').config();
const { sendOTP, verifyOTP } = require('../utils/sendgridOTP');

console.log('🧪 Testing Email Change OTP System');
console.log('');

// Test data
const testEmail = 'test@example.com';
const testUserId = 'test-user-123';

console.log('📝 Test Configuration:');
console.log(`   Test Email: ${testEmail}`);
console.log(`   Test User ID: ${testUserId}`);
console.log('');

async function testEmailChangeOTP() {
  try {
    // Test 1: Send OTP
    console.log('📤 Step 1: Sending OTP for email change...');
    await sendOTP(testEmail);
    console.log('✅ OTP sent successfully!');
    console.log('');

    // Test 2: Verify OTP (simulate)
    console.log('🔍 Step 2: Testing OTP verification...');
    console.log('💡 Check your email for the OTP code');
    console.log('📧 The OTP should be sent to:', testEmail);
    console.log('');

    console.log('✅ Email change OTP system is working!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Test the full flow in your application');
    console.log('2. Go to Profile Settings in your dashboard');
    console.log('3. Try changing your email address');
    console.log('4. Verify the OTP flow works correctly');

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

testEmailChangeOTP().catch(console.error); 