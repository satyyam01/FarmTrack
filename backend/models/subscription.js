const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  planType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['created', 'active', 'expired', 'cancelled', 'failed'],
    default: 'created'
  },
  amount: {
    type: Number
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('subscription', subscriptionSchema); 