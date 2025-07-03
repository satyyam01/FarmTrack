require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const chrono = require('chrono-node');
const { Pinecone } = require('@pinecone-database/pinecone');
const Yield = require('../models/yield');
const Animal = require('../models/animal');
const { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } = require('date-fns');
const { askUsingRAG } = require('../utils/ragAnswer');

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX;

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Add month name regex and mapping
const monthNameToNumber = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};
const monthNameRegex = new RegExp(Object.keys(monthNameToNumber).join('|'), 'i');

// 🧠 Utility: Normalize dates in questions
function normalizeQuestionDates(question) {
  // Use chrono-node to parse the first date in the question
  const results = chrono.parse(question);
  if (results.length > 0) {
    let parsedDate = results[0].start.date();
    // If year is missing, default to current year
    if (!results[0].start.isCertain('year')) {
      parsedDate.setFullYear(new Date().getFullYear());
    }
    const isoDate = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    // Replace the detected date phrase with the ISO date
    const textToReplace = results[0].text;
    return question.replace(textToReplace, isoDate);
  }
  return question;
}

// Controller: Ask yield-based question
exports.askYieldQuestion = async (req, res) => {
  const { question } = req.body;
  const farmId = req.user?.farm_id;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'A valid question is required.' });
  }
  if (!farmId) {
    return res.status(400).json({ error: 'Farm ID is missing or invalid.' });
  }

  try {
    // Hybrid logic: Use Mongoose for totals/averages, RAG for others
    const totalRegex = /total (milk|egg|yield|production|output)/i;
    const avgRegex = /average (milk|egg|yield|production|output)|mean (milk|egg|yield|production|output)/i;
    const weekRegex = /last week|this week|past week|previous week/i;
    const monthRegex = /last month|this month|past month|previous month/i;
    const dayRegex = /yesterday|today|on \d{4}-\d{2}-\d{2}/i;
    const milkRegex = /milk/i;
    const eggRegex = /egg/i;

    // If question is about total or average yield
    if (totalRegex.test(question) || avgRegex.test(question)) {
      // Determine unit
      let unit = null;
      if (milkRegex.test(question)) unit = 'milk';
      if (eggRegex.test(question)) unit = 'egg';
      // Determine date range
      let startDate, endDate;
      const now = new Date();
      if (weekRegex.test(question)) {
        // Last week: previous Monday to previous Sunday
        const day = now.getDay();
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - day - 6);
        lastMonday.setHours(0,0,0,0);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        lastSunday.setHours(23,59,59,999);
        startDate = lastMonday;
        endDate = lastSunday;
      } else if (monthRegex.test(question)) {
        // Last month
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (dayRegex.test(question)) {
        // Yesterday or today
        if (/yesterday/i.test(question)) {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          startDate = new Date(yesterday.setHours(0,0,0,0));
          endDate = new Date(yesterday.setHours(23,59,59,999));
        } else {
          startDate = new Date(now.setHours(0,0,0,0));
          endDate = new Date(now.setHours(23,59,59,999));
        }
      }
      // Default: all time
      if (!startDate || !endDate) {
        startDate = new Date(0);
        endDate = new Date();
      }
      // Query yields
      const query = { farm_id: farmId, date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] } };
      if (unit) query.unit_type = unit;
      const yields = await Yield.find(query);
      if (!yields.length) {
        return res.json({ answer: 'No yield records found for your query.' });
      }
      const total = yields.reduce((sum, y) => sum + y.quantity, 0);
      if (totalRegex.test(question)) {
        return res.json({ answer: `The total ${unit || 'yield'} for the period from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} is ${total} ${unit || ''}.` });
      } else {
        // Average
        let avg = 0;
        if (weekRegex.test(question)) avg = (total / 7).toFixed(2);
        else if (monthRegex.test(question)) {
          const daysInMonth = (endDate.getDate() - startDate.getDate() + 1);
          avg = (total / daysInMonth).toFixed(2);
        } else if (dayRegex.test(question)) avg = total;
        else avg = (total / yields.length).toFixed(2);
        return res.json({ answer: `The average ${unit || 'yield'} for the period from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} is ${avg} ${unit || ''} per day.` });
      }
    }
    // Otherwise, use RAG
    const ragAnswer = await askUsingRAG(question, farmId);
    return res.json({ answer: ragAnswer });
  } catch (error) {
    console.error('❌ askYieldQuestion error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Unexpected error. Please try again later.' });
  }
};

// Utility: Get embedding for a question
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
  } catch (err) {
    console.error('❌ Embedding error:', err?.response?.data || err.message || err);
    return null;
  }
}