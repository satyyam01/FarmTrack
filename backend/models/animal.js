const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    tag_number: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Cow", "Hen", "Horse", "Sheep", "Goat"],
      required: true,
    },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    is_producing_yield: { type: Boolean, default: false },
    under_treatment: { type: Boolean, default: false },
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "farm",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index for tag_number within each farm
animalSchema.index({ tag_number: 1, farm_id: 1 }, { unique: true });

// 🔁 Virtual populate for yields
animalSchema.virtual("yields", {
  ref: "Yield",
  localField: "_id",
  foreignField: "animal_id",
});

animalSchema.virtual("medications", {
  ref: "Medication",
  localField: "_id",
  foreignField: "animal_id",
});

animalSchema.virtual("checkups", {
  ref: "Checkup",
  localField: "_id",
  foreignField: "animal_id",
});

animalSchema.virtual("return_logs", {
  ref: "ReturnLog",
  localField: "_id",
  foreignField: "animal_id",
});

module.exports = mongoose.model("Animal", animalSchema);
