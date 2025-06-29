const fs = require('fs');
const path = require('path');

console.log('🔧 Email Password Fix Tool');
console.log('');

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log('📝 Current EMAIL_PASS line:');
const emailPassLine = lines.find(line => line.startsWith('EMAIL_PASS='));
if (emailPassLine) {
  console.log(`   ${emailPassLine}`);
} else {
  console.log('   ❌ EMAIL_PASS not found in .env');
  process.exit(1);
}

console.log('');
console.log('🔍 Analysis:');
console.log('   The password appears to have an escaped semicolon (\\;)');
console.log('   This is causing authentication failures with Zoho');
console.log('');

console.log('💡 Recommended fixes:');
console.log('');
console.log('Option 1 (Remove semicolon):');
console.log('   EMAIL_PASS=Farmtrackpass@2608');
console.log('');
console.log('Option 2 (Use quotes):');
console.log('   EMAIL_PASS="Farmtrackpass@2608;"');
console.log('');
console.log('Option 3 (Keep semicolon without escape):');
console.log('   EMAIL_PASS=Farmtrackpass@2608;');
console.log('');

console.log('⚠️  Please manually edit your .env file and choose one of the above options.');
console.log('   After editing, run: node scripts/test-zoho-app-password.js');
console.log('');
console.log('🔗 For Zoho App Passwords:');
console.log('   1. Go to https://mail.zoho.com');
console.log('   2. Settings → Security → App Passwords');
console.log('   3. Generate a new app password');
console.log('   4. Use that password instead of your regular password'); 