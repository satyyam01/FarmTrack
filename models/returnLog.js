const mongoose = require('mongoose');

const returnLogSchema = new mongoose.Schema({
  animal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, required: true, default: Date.now },
  returned: { type: Boolean, required: true, default: false },
  return_reason: { type: String },
  farm_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'farm',
  required: true
},

}, { timestamps: true });

module.exports = mongoose.model('ReturnLog', returnLogSchema);
