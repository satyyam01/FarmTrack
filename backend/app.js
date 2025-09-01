const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

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
const farmRoutes = require('./routes/farmRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const settingRoutes = require('./routes/settingRoutes');
const { scheduleNightCheck } = require('./scheduler/nightCheckScheduler');
const verificationRoutes = require('./routes/verificationRoutes');

const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


const app = express();

// Initialize scheduler after MongoDB connection
mongoose.connection.once('open', () => {
  scheduleNightCheck().catch((error) => {
    console.error('❌ Failed to initialize night check scheduler:', error);
  });
});

// Middleware
const allowedOrigins = [
  'https://farmtrack-2dkp.onrender.com',
  'https://farmtrack.satyyam.site',
  'http://localhost:5173',
  'farm-track-git-main-satyyam01s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());

// Add a general request logger to see all incoming requests
app.use((req, res, next) => {
  console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}`);
  next();
});

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many attempts, please try again later.' }
});
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests, please try again later.' }
});

const alertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many alert requests, please try again later.' }
});
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many payment requests, please try again later.' }
});

// Routes
console.log('[App Setup] Mounting /api/auth routes...');
app.use('/api/auth', authRoutes);
console.log('[App Setup] Mounting /api/animals routes...');
app.use('/api/animals', animalRoutes);
console.log('[App Setup] Mounting /api/yields routes...');
app.use('/api/yields', yieldRoutes);
console.log('[App Setup] Mounting /api/medications routes...');
app.use('/api/medications', medicationRoutes);
console.log('[App Setup] Mounting /api/checkups routes...');
app.use('/api/checkups', checkupRoutes);
console.log('[App Setup] Mounting /api/returnlogs routes...');
app.use('/api/returnlogs', returnLogRoutes);
console.log('[App Setup] Mounting /api/farms routes...');
app.use('/api/farms', farmRoutes);
console.log('[App Setup] Mounting /api/notifications routes...');
app.use('/api/notifications', notificationRoutes);
console.log('[App Setup] Mounting /api/alerts routes...');
app.use('/api/alerts', alertRoutes);
console.log('[App Setup] Mounting /api/settings routes...');
app.use('/api/settings', settingRoutes);
console.log('[App Setup] Mounting /api/verify routes...');
app.use('/api/verify', verificationRoutes);

console.log('[App Setup] Mounting /api/dashboard routes...');
app.use('/api/dashboard', dashboardRoutes);
console.log('[App Setup] Mounting /api/payments routes...');
app.use('/api/payments', paymentRoutes);

// Apply rate limiters to sensitive endpoints
console.log('[App Setup] Applying rate limiters...');
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/verification/send-otp', otpLimiter);
app.use('/api/verification/confirm', otpLimiter);
app.use('/api/settings/request-email-change-otp', otpLimiter);
app.use('/api/auth/password/request-otp', otpLimiter);

app.use('/api/alerts/fencing', alertLimiter);
app.use('/api/alerts/barn-check', alertLimiter);
app.use('/api/payments/create-order', paymentLimiter);
app.use('/api/payments/verify', paymentLimiter);

// Health check endpoint for uptime monitoring
app.get('/health', (req, res) => res.send('OK'));

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
        '/api/farms',
        '/api/notifications',
        '/api/alerts',
        '/api/settings',
        '/api/verify',
        '/api/dashboard',
        '/api/payments'
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

// Global error handlers for Render reliability
process.on('unhandledRejection', (reason) => {
  console.error('🔴 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🛑 Uncaught Exception:', err);
  // Optionally: process.exit(1);
});

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server booted on port ${PORT}`);
  });
}

module.exports = app;
