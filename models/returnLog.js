const mongoose = require('mongoose');

const returnLogSchema = new mongoose.Schema({
  animal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, required: true, default: Date.now },
  returned: { type: Boolean, required: true, default: false },
  return_reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReturnLog', returnLogSchema);
