const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true
  },
  value: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  farm_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  }
}, { 
  timestamps: true 
});

// Create compound unique index on key and farm_id
settingSchema.index({ key: 1, farm_id: 1 }, { unique: true });

module.exports = mongoose.model('Setting', settingSchema); 