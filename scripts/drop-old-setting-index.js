const mongoose = require('mongoose');
require('dotenv').config();

async function dropOldIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection('settings');
    const indexes = await collection.indexes();
    const keyIndex = indexes.find(idx => idx.name === 'key_1' && idx.unique);
    if (keyIndex) {
      await collection.dropIndex('key_1');
      console.log('✅ Dropped old unique index on key');
    } else {
      console.log('ℹ️  No old unique index on key found');
    }
  } catch (error) {
    console.error('❌ Error dropping old index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

dropOldIndex(); 