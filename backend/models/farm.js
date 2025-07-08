const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: {
    type: Date
  },
  animalLimit: {
    type: Number,
    default: 10
  },
  allowedRoles: [{
    type: String,
    enum: ['owner', 'vet', 'worker']
  }],
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subscription'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('farm', farmSchema);
