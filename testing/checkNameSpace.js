// checkNamespaceStats.js
require('dotenv').config({ path: '../backend/.env' });
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pinecone.index(process.env.PINECONE_INDEX);

const namespace = process.argv[2]; // pass your namespace as CLI arg

if (!namespace) {
  console.error('⚠️ Please provide a namespace: node checkNamespaceStats.js <namespace>');
  process.exit(1);
}

(async () => {
  try {
    const stats = await index.describeIndexStats({ namespace });
    console.log(`📊 Vector stats for namespace "${namespace}":`);
    console.dir(stats, { depth: null });
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error);
  }
})();
