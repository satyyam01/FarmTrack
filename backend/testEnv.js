const path = require('path');
const fs = require('fs');

console.log('Current directory:', process.cwd());
console.log('Looking for .env file...');

// Check if .env exists in current directory
const envPath = path.join(process.cwd(), '.env');
console.log('Looking for .env at:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

// Try to load .env
require('dotenv').config();

console.log('\nTesting environment variables:');
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? 'SET' : 'NOT SET');
console.log('PINECONE_INDEX:', process.env.PINECONE_INDEX ? 'SET' : 'NOT SET');
console.log('COHERE_API_KEY:', process.env.COHERE_API_KEY ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET'); 