const express = require("express");
const fs = require("fs");
const path = require("path");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Load questions from JSON (same as legacy system — preserved)
function loadQuestions() {
  try {
    const questionsPath = path.join(__dirname, "../questions.json");
    const data = fs.readFileSync(questionsPath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

const allQuestions = loadQuestions();

// GET /api/questions - with filters
router.get("/", (req, res) => {
  const { skill, category, difficulty, company, search, page = 1, limit = 50, bookmarks } = req.query;
  let filtered = [...allQuestions];

  if (skill) filtered = filtered.filter((q) => q.skill.toLowerCase() === skill.toLowerCase());
  if (category) filtered = filtered.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
  if (search) filtered = filtered.filter((q) => q.question.toLowerCase().includes(search.toLowerCase()));
  if (company) {
    const companySkillMap = {
      amazon: ["DSA", "System Design", "OOP", "Java"],
      microsoft: ["DSA", "System Design", "OOP", "JavaScript"],
      google: ["DSA", "System Design", "Python"],
      tcs: ["Java", "SQL", "Aptitude", "HR"],
      infosys: ["Java", "SQL", "Aptitude", "HR", "Communication"],
      accenture: ["Java", "SQL", "Aptitude", "HR"],
      wipro: ["Java", "Python", "Aptitude", "HR"],
      cognizant: ["Java", "SQL", "Aptitude", "HR"],
    };
    const skills = companySkillMap[company.toLowerCase()] || [];
    if (skills.length > 0) {
      filtered = filtered.filter((q) => skills.includes(q.skill));
    }
  }

  // Pagination
  const total = filtered.length;
  const startIdx = (parseInt(page) - 1) * parseInt(limit);
  const paginated = filtered.slice(startIdx, startIdx + parseInt(limit));

  res.json({
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
    questions: paginated,
  });
});

// GET /api/questions/stats
router.get("/stats", (req, res) => {
  const skillCounts = {};
  const difficultyCounts = { basic: 0, intermediate: 0, advanced: 0 };
  const categoryCounts = {};

  allQuestions.forEach((q) => {
    skillCounts[q.skill] = (skillCounts[q.skill] || 0) + 1;
    difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });

  res.json({ total: allQuestions.length, bySkill: skillCounts, byDifficulty: difficultyCounts, byCategory: categoryCounts });
});

// GET /api/questions/:id
router.get("/:id", (req, res) => {
  const question = allQuestions.find((q) => q.id === parseInt(req.params.id));
  if (!question) return res.status(404).json({ error: "Question not found" });
  res.json(question);
});

module.exports = router;
