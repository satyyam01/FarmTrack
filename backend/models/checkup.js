const mongoose = require("mongoose");

const checkupSchema = new mongoose.Schema(
  {
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    vet_name: { type: String, required: true },
    notes: { type: String },
    diagnosis: { type: String },
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "farm",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkup", checkupSchema);
