const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  // Connected to MongoDB
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const animalRoutes = require('./routes/animalRoutes');
const yieldRoutes = require('./routes/yieldRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const checkupRoutes = require('./routes/checkupRoutes');
const returnLogRoutes = require('./routes/returnLogRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const farmRoutes = require('./routes/farmRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const settingRoutes = require('./routes/settingRoutes');
const { scheduleNightCheck } = require('./scheduler/nightCheckScheduler');
const verificationRoutes = require('./routes/verificationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');



const app = express();

// Initialize scheduler after MongoDB connection
mongoose.connection.once('open', () => {
  scheduleNightCheck().catch((error) => {
    console.error('❌ Failed to initialize night check scheduler:', error);
  });
});

// Middleware
app.use(cors({
  origin: [
    'https://farmtrack.satyyam.site', // production
    'http://localhost:5173'           // local dev
  ],
  credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/yields', yieldRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/checkups', checkupRoutes);
app.use('/api/returnlogs', returnLogRoutes);
app.use('/api/simulate', simulationRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/chatbot', chatbotRoutes);



// 404 handler for all unmatched routes
app.use((req, res, next) => {
  // Check if it's an API route
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ 
      error: 'API endpoint not found',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
      availableEndpoints: [
        '/api/auth',
        '/api/animals', 
        '/api/yields',
        '/api/medications',
        '/api/checkups',
        '/api/returnlogs',
        '/api/simulate',
        '/api/farms',
        '/api/notifications',
        '/api/alerts',
        '/api/settings'
      ]
    });
  } else {
    res.status(404).json({ 
      error: 'Route not found',
      message: `The requested route ${req.method} ${req.originalUrl} does not exist`,
      note: 'This is a backend API server. For frontend routes, please use the React application.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT);
}

module.exports = app;
