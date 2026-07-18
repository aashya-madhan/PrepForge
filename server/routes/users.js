const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Guard: reject immediately if MongoDB is not connected
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database not connected. Please start MongoDB to use this feature.",
    });
  }
  next();
};

// GET /api/users/bookmarks
router.get("/bookmarks", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id).select("bookmarkedQuestions");
  res.json({ bookmarks: user.bookmarkedQuestions || [] });
});

// POST /api/users/bookmarks/:questionId
router.post("/bookmarks/:questionId", protect, requireDB, async (req, res) => {
  const qId = parseInt(req.params.questionId);
  const user = await User.findById(req.user._id);
  const idx = user.bookmarkedQuestions.indexOf(qId);
  if (idx > -1) {
    user.bookmarkedQuestions.splice(idx, 1);
    await user.save();
    return res.json({ bookmarked: false, bookmarks: user.bookmarkedQuestions });
  }
  user.bookmarkedQuestions.push(qId);
  await user.save();
  res.json({ bookmarked: true, bookmarks: user.bookmarkedQuestions });
});

// GET /api/users/notes
router.get("/notes", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id).select("notes");
  res.json(user.notes || []);
});

// POST /api/users/notes
router.post("/notes", protect, requireDB, async (req, res) => {
  const { title, content, tags } = req.body;
  const user = await User.findById(req.user._id);
  user.notes.push({ title, content, tags: tags || [] });
  await user.save();
  res.status(201).json(user.notes);
});

// PUT /api/users/notes/:noteId
router.put("/notes/:noteId", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id);
  const note = user.notes.id(req.params.noteId);
  if (!note) return res.status(404).json({ error: "Note not found" });
  Object.assign(note, req.body, { updatedAt: new Date() });
  await user.save();
  res.json(note);
});

// DELETE /api/users/notes/:noteId
router.delete("/notes/:noteId", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.notes = user.notes.filter((n) => n._id.toString() !== req.params.noteId);
  await user.save();
  res.json({ message: "Note deleted" });
});

// GET /api/users/flashcards
router.get("/flashcards", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id).select("flashcards");
  res.json(user.flashcards || []);
});

// POST /api/users/flashcards
router.post("/flashcards", protect, requireDB, async (req, res) => {
  const { question, answer, difficulty } = req.body;
  const user = await User.findById(req.user._id);
  user.flashcards.push({ question, answer, difficulty: difficulty || "medium" });
  await user.save();
  res.status(201).json(user.flashcards);
});

// DELETE /api/users/flashcards/:id
router.delete("/flashcards/:id", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.flashcards = user.flashcards.filter((f) => f._id.toString() !== req.params.id);
  await user.save();
  res.json({ message: "Flashcard deleted" });
});

// GET /api/users/checklist
router.get("/checklist", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id).select("checklistProgress");
  res.json(Object.fromEntries(user.checklistProgress || new Map()));
});

// PUT /api/users/checklist
router.put("/checklist", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { weekKey, items } = req.body;
  if (!user.checklistProgress) user.checklistProgress = new Map();
  user.checklistProgress.set(weekKey, items);
  user.markModified("checklistProgress");
  await user.save();
  res.json({ message: "Checklist saved" });
});

// POST /api/users/mock-interview
router.post("/mock-interview", protect, requireDB, async (req, res) => {
  const { score, totalQuestions, timeTaken, skillTested, difficulty } = req.body;
  const user = await User.findById(req.user._id);
  user.mockInterviews.push({ score, totalQuestions, timeTaken, skillTested, difficulty });
  user.totalPoints += score;
  await user.save();
  res.json({ message: "Session saved", totalPoints: user.totalPoints });
});

// GET /api/users/analytics
router.get("/analytics", protect, requireDB, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  const checklistMap = Object.fromEntries(user.checklistProgress || new Map());

  let totalItems = 0;
  let doneItems = 0;
  Object.values(checklistMap).forEach((items) => {
    if (Array.isArray(items)) {
      totalItems += items.length;
      doneItems += items.filter((i) => i.done).length;
    }
  });

  const mockStats = user.mockInterviews.length
    ? {
        sessions: user.mockInterviews.length,
        avgScore: Math.round(
          user.mockInterviews.reduce((s, m) => s + m.score, 0) / user.mockInterviews.length
        ),
        bestScore: Math.max(...user.mockInterviews.map((m) => m.score)),
        recentSessions: user.mockInterviews.slice(-5),
      }
    : { sessions: 0, avgScore: 0, bestScore: 0, recentSessions: [] };

  res.json({
    streak: user.streak,
    totalPoints: user.totalPoints,
    badges: user.badges,
    checklistProgress: {
      total: totalItems,
      done: doneItems,
      percent: totalItems ? Math.round((doneItems / totalItems) * 100) : 0,
    },
    mockInterviews: mockStats,
    notesCount: user.notes.length,
    flashcardsCount: user.flashcards.length,
    bookmarksCount: user.bookmarkedQuestions.length,
  });
});

// Admin: GET /api/users
router.get("/", protect, adminOnly, requireDB, async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res.json(users);
});

module.exports = router;
