const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },
    medicine_name: { type: String, required: true },
    dosage: { type: String, required: true },
    start_date: { type: Date, required: true, default: Date.now },
    end_date: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.start_date;
        },
        message: "End date must be after start date",
      },
    },
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "farm",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
