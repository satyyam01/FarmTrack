const axios = require('axios');
const { Pinecone } = require('@pinecone-database/pinecone');

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX;

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

async function getCohereEmbedding(text) {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_query',
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

async function askUsingRAG(question, farmId) {
  // 1. Embed the question
  const embedding = await getCohereEmbedding(question);
  if (!embedding) return "Sorry, I couldn't process your question.";

  // 2. Query Pinecone for similar vectors (increase topK for multi-entity)
  const index = pinecone.index(PINECONE_INDEX);
  const namespace = `farm_${farmId}`;
  let queryResult;
  try {
    queryResult = await index.namespace(namespace).query({
      topK: 10, // Increased from 5 to 10
      vector: embedding,
      includeMetadata: true,
    });
  } catch (err) {
    console.error('❌ Pinecone query error:', err?.response?.data || err.message);
    return "Sorry, I couldn't retrieve relevant information.";
  }

  // 3. Merge all unique context chunks
  const seen = new Set();
  const contexts = (queryResult.matches || [])
    .map(match => match.metadata?.text)
    .filter(Boolean)
    .filter(text => {
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    })
    .join('\n---\n'); // Use separator for clarity

  if (!contexts) return "Sorry, I couldn't find relevant information.";

  // 4. Enhanced prompt for detailed and concise summaries, and template for average milk production
  const isOpenEnded = /performance|trend|summary|overview|how is|how was|recent|lately|overall/i.test(question);
  const isAvgMilk = /average.*milk|milk.*average|mean.*milk|milk.*mean/i.test(question);
  let prompt;
  if (isAvgMilk) {
    prompt = `Below is information about animal yields and farm records. If the question is about average milk production, answer using the following template:

Farm Average Milk Production:
- Daily: <value> liters
- Weekly: <value> liters
- Monthly: <value> liters

If specific animals are mentioned, also provide:
Average Milk Production per Animal:
- <Animal Name>:
    - Daily: <value> liters
    - Weekly: <value> liters
    - Monthly: <value> liters

For any time period like 'last week', always calculate the week as Monday to Sunday based on the current date, and use standardized logic for all date calculations. Ignore any conflicting or ambiguous date ranges in the context and always use explicit date ranges in your answer.
If possible, add a brief summary or highlight any trends.

Context:
${contexts}

Question: ${question}
Answer:`;
  } else {
    prompt = `Below is information about animal yields and farm records. If the question mentions multiple animals or dates, answer for each using all the information below.

${isOpenEnded ? `If the question is about performance, trend, or summary, provide a detailed summary including trends, averages, and specific highlights. Then, also provide a brief summary or key statistics at the end.` : 'Be concise and data-driven.'}
For any time period like 'last week', always calculate the week as Monday to Sunday based on the current date, and use standardized logic for all date calculations. Ignore any conflicting or ambiguous date ranges in the context and always use explicit date ranges in your answer.

Context:
${contexts}

Question: ${question}
Answer:`;
  }

  let response;
  try {
    response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt,
        max_tokens: 200,
        temperature: 0.3,
        stop_sequences: ["\n"],
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('❌ Cohere generate error:', err?.response?.data || err.message);
    return "Sorry, I couldn't generate an answer.";
  }

  return response.data.generations?.[0]?.text?.trim() || "Sorry, I couldn't generate an answer.";
}

module.exports = { askUsingRAG }; 