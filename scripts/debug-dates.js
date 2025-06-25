// Debug script to test date formatting
console.log('=== Date Formatting Debug ===');

// Test the old method (UTC)
const testDate = new Date('2025-06-26');
console.log('Original date:', testDate);
console.log('Old method (UTC):', testDate.toISOString().split('T')[0]);

// Test the new method (local)
const year = testDate.getFullYear();
const month = String(testDate.getMonth() + 1).padStart(2, '0');
const day = String(testDate.getDate()).padStart(2, '0');
const localDate = `${year}-${month}-${day}`;
console.log('New method (local):', localDate);

// Test with different timezones
console.log('\n=== Timezone Test ===');
const now = new Date();
console.log('Current date:', now);
console.log('Current date (local):', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
console.log('Current date (UTC):', now.toISOString().split('T')[0]);

// Test what happens when we create a date from a string
console.log('\n=== String to Date Test ===');
const dateString = '2025-06-26';
const dateFromString = new Date(dateString);
console.log('Date from string "2025-06-26":', dateFromString);
console.log('Local format:', `${dateFromString.getFullYear()}-${String(dateFromString.getMonth() + 1).padStart(2, '0')}-${String(dateFromString.getDate()).padStart(2, '0')}`);
console.log('UTC format:', dateFromString.toISOString().split('T')[0]); 