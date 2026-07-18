const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    college: { type: String, default: "" },
    graduationYear: { type: Number },
    skills: [{ type: String }],
    targetCompanies: [{ type: String }],
    // Progress tracking
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    totalPoints: { type: Number, default: 0 },
    // Bookmarks
    bookmarkedQuestions: [{ type: Number }], // question IDs
    // Notes
    notes: [
      {
        title: String,
        content: String,
        tags: [String],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    // Flashcards
    flashcards: [
      {
        question: String,
        answer: String,
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
        nextReview: { type: Date, default: Date.now },
        reviewCount: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Achievements / Badges
    badges: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    // Checklist progress per week
    checklistProgress: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    // Current preparation plan
    currentPlan: {
      skills: [String],
      weeks: Number,
      startDate: Date,
      companyType: String,
    },
    // Mock interview sessions
    mockInterviews: [
      {
        date: { type: Date, default: Date.now },
        score: Number,
        totalQuestions: Number,
        timeTaken: Number,
        skillTested: String,
        difficulty: String,
      },
    ],
    // Dark mode preference
    darkMode: { type: Boolean, default: true },
    theme: { type: String, default: "dark" },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update streak — call before save
userSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastActive = new Date(this.lastActive);
  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    this.streak += 1;
  } else if (diffDays > 1) {
    this.streak = 1;
  }
  // streak stays same if diffDays === 0 (same day login)
  this.lastActive = today;
};

module.exports = mongoose.model("User", userSchema);
