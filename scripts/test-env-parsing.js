require('dotenv').config();

console.log('🔍 Testing .env file parsing...');
console.log('');

console.log('📧 Email Configuration:');
console.log(`   EMAIL_HOST: "${process.env.EMAIL_HOST}"`);
console.log(`   EMAIL_PORT: "${process.env.EMAIL_PORT}"`);
console.log(`   EMAIL_USER: "${process.env.EMAIL_USER}"`);
console.log(`   EMAIL_PASS: "${process.env.EMAIL_PASS}"`);
console.log('');

console.log('📏 Password Analysis:');
if (process.env.EMAIL_PASS) {
  console.log(`   Length: ${process.env.EMAIL_PASS.length} characters`);
  console.log(`   Ends with semicolon: ${process.env.EMAIL_PASS.endsWith(';')}`);
  console.log(`   Contains semicolon: ${process.env.EMAIL_PASS.includes(';')}`);
  console.log(`   Last character: "${process.env.EMAIL_PASS.slice(-1)}"`);
  console.log(`   Last 3 characters: "${process.env.EMAIL_PASS.slice(-3)}"`);
} else {
  console.log('   ❌ EMAIL_PASS is not set or empty');
}

console.log('');
console.log('💡 If password is not reading correctly, try these .env formats:');
console.log('');
console.log('Option A (with quotes):');
console.log('EMAIL_PASS="your-password-with-semicolon;"');
console.log('');
console.log('Option B (escaped semicolon):');
console.log('EMAIL_PASS=your-password-with-semicolon\\;');
console.log('');
console.log('Option C (without semicolon):');
console.log('EMAIL_PASS=your-password-without-semicolon'); 