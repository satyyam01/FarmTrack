const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { askYieldQuestion } = require('../controllers/chatbotController');

// POST /api/chatbot/ask
router.post('/ask', authenticate, askYieldQuestion);

module.exports = router;
