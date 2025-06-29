require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔧 SendGrid OTP Setup Helper');
console.log('');

const envPath = path.join(__dirname, '..', '.env');

// Check current configuration
console.log('📝 Current Configuration:');
console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   SENDER_EMAIL: ${process.env.SENDER_EMAIL || 'Using EMAIL_USER'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ Not set'}`);
console.log('');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('💡 Create a .env file in the root directory');
  process.exit(1);
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

// Check for SendGrid configuration
const hasSendGridKey = lines.some(line => line.startsWith('SENDGRID_API_KEY='));
const hasSenderEmail = lines.some(line => line.startsWith('SENDER_EMAIL='));

console.log('🔍 Environment File Analysis:');
console.log(`   SENDGRID_API_KEY configured: ${hasSendGridKey ? '✅ Yes' : '❌ No'}`);
console.log(`   SENDER_EMAIL configured: ${hasSenderEmail ? '✅ Yes' : '❌ No'}`);
console.log('');

if (!hasSendGridKey) {
  console.log('📝 Add to your .env file:');
  console.log('   SENDGRID_API_KEY=your_sendgrid_api_key_here');
  console.log('');
  console.log('🔗 Get your API key from: https://app.sendgrid.com/settings/api_keys');
  console.log('');
}

if (!hasSenderEmail) {
  console.log('📝 Optional: Add to your .env file:');
  console.log('   SENDER_EMAIL=farmtrack@satyyam.site');
  console.log('   (Will default to EMAIL_USER if not set)');
  console.log('');
}

console.log('📋 Setup Checklist:');
console.log('');
console.log('1. ✅ Create SendGrid account at https://sendgrid.com');
console.log('2. ✅ Generate API key with "Mail Send" permissions');
console.log('3. ✅ Verify sender email in SendGrid dashboard');
console.log('4. ✅ Add SENDGRID_API_KEY to .env file');
console.log('5. ✅ Test the system: node scripts/test-sendgrid-otp.js');
console.log('');

console.log('🚀 Next Steps:');
console.log('1. Get your SendGrid API key');
console.log('2. Add it to your .env file');
console.log('3. Run: node scripts/test-sendgrid-otp.js');
console.log('4. Test registration flow in your app');
console.log('');

console.log('📚 For detailed instructions, see: SENDGRID_OTP_SETUP.md'); 