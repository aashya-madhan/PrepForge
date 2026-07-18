const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, index: true }, // Preserve original JSON IDs
    skill: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["programming", "ai", "service", "core", "aptitude", "hr", "system-design"],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["basic", "intermediate", "advanced"],
    },
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    hints: [String],
    tags: [String],
    companies: [String], // Which companies ask this question
    frequency: { type: Number, default: 1 }, // How often asked
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

questionSchema.index({ skill: 1, difficulty: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ companies: 1 });

module.exports = mongoose.model("Question", questionSchema);
