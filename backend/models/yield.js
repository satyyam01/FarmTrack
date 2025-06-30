const mongoose = require("mongoose");

const yieldSchema = new mongoose.Schema(
  {
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },
    date: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit_type: { type: String, enum: ["milk", "egg"], required: true },
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "farm",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Yield", yieldSchema);
