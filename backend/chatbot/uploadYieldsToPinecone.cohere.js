require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const axios = require('axios');
const { Pinecone } = require('@pinecone-database/pinecone');

const Yield = require('../models/yield');
const Animal = require('../models/animal');
const { chunkYieldRecord } = require('../utils/chunker');

const MONGODB_URI = process.env.MONGODB_URI;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

async function getCohereEmbedding(text) {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.embeddings[0];
  } catch (error) {
    console.error('❌ Cohere embedding error:', error?.response?.data || error.message);
    return null;
  }
}

async function uploadYieldsToPinecone(farmId) {
  try {
    await mongoose.connect(MONGODB_URI);

    const yields = await Yield.find({ farm_id: farmId }).populate('animal_id');
    if (!yields.length) {
      console.log(`⚠️ No yields found for farm ${farmId}`);
      return;
    }

    const index = pinecone.index(PINECONE_INDEX);
    const namespace = `farm_${farmId}`;
    const vectors = [];

    for (const y of yields) {
      const chunk = chunkYieldRecord(y);
      if (!chunk) continue;

      const embedding = await getCohereEmbedding(chunk);
      if (!embedding) continue;

      vectors.push({
        id: y._id.toString(),
        values: embedding,
        metadata: {
          text: chunk,
          date: y.date,
          unit_type: y.unit_type,
          quantity: y.quantity,
          animal_name: y.animal_id?.name || '',
          tag_number: y.animal_id?.tag_number || '',
        },
      });
    }

    if (!vectors.length) {
      console.log('⚠️ No valid vectors to upload.');
      return;
    }

    await index.namespace(namespace).upsert(vectors);
    console.log(`✅ Uploaded ${vectors.length} vectors to Pinecone [${namespace}]`);
  } catch (error) {
    console.error('❌ Upload failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run: node uploadYieldsToPinecone.cohere.js <farm_id>
const farmId = process.argv[2];
if (!farmId) {
  console.error('⚠️ Please provide a farm ID: node uploadYieldsToPinecone.cohere.js <farm_id>');
  process.exit(1);
}

uploadYieldsToPinecone(farmId);
