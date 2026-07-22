require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS — allow all Vercel preview URLs + explicit origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://prep-forge-sand.vercel.app",  // your Vercel URL
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (covers preview deployments too)
    if (origin.endsWith(".vercel.app") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// ============================================
// DATABASE CONNECTION (graceful — works without MongoDB too)
// ============================================

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/placement-prep";
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.warn("⚠️  MongoDB not connected (running in JSON-only mode):", err.message);
  }
};
connectDB();

const isDBConnected = () => mongoose.connection.readyState === 1;

// ============================================
// DYNAMIC SKILL CATEGORIZATION SYSTEM (PRESERVED)
// ============================================
const skillCategories = {
  programming: {
    skills: ["Java", "Python", "DSA", "JavaScript", "React", "Node", "API"],
    description: "Programming Languages & Data Structures",
    weeklyTopics: [
      { week: 1, title: "Fundamentals", content: ["Basics and core concepts", "Setup and tools", "First program", "Basic syntax"] },
      { week: 2, title: "Intermediate Concepts", content: ["Advanced syntax", "Key features", "Best practices", "Common patterns"] },
      { week: 3, title: "Advanced Topics", content: ["Performance optimization", "Advanced features", "Design patterns", "Real-world usage"] },
      { week: 4, title: "Practice & Implementation", content: ["Complex problems", "Project work", "Interview prep", "Mock interviews"] },
    ],
  },
  ai: {
    skills: ["Machine Learning", "Agentic AI", "Generative AI"],
    description: "Artificial Intelligence & Machine Learning",
    weeklyTopics: [
      { week: 1, title: "Basics of AI/ML", content: ["What is AI and ML?", "Supervised vs Unsupervised Learning", "Key concepts", "Applications"] },
      { week: 2, title: "Models and Algorithms", content: ["Common algorithms", "Training models", "Evaluation metrics", "Model selection"] },
      { week: 3, title: "Advanced Techniques", content: ["Neural networks", "Deep learning", "Feature engineering", "Optimization techniques"] },
      { week: 4, title: "Projects and Practice", content: ["Build real projects", "Kaggle competitions", "Portfolio building", "Interview scenarios"] },
    ],
  },
  service: {
    skills: ["Aptitude", "Communication", "HR"],
    description: "Aptitude & Soft Skills",
    weeklyTopics: [
      { week: 1, title: "Quantitative Skills", content: ["Basic arithmetic", "Percentages and ratios", "Speed and time", "Profit and loss"] },
      { week: 2, title: "Logical Reasoning", content: ["Series and patterns", "Analogy", "Puzzles", "Data interpretation"] },
      { week: 3, title: "Communication", content: ["Technical writing", "Group discussion", "Presentation skills", "Self introduction"] },
      { week: 4, title: "Interview & HR Prep", content: ["Behavioral questions", "STAR method", "Company research", "Mock interviews"] },
    ],
  },
  core: {
    skills: ["DBMS", "SQL", "System Design", "OOP"],
    description: "Core Computer Science",
    weeklyTopics: [
      { week: 1, title: "Fundamentals", content: ["Core concepts", "Architecture", "Basic theory", "Key principles"] },
      { week: 2, title: "Advanced Concepts", content: ["Complex scenarios", "Best practices", "Design principles", "Optimization"] },
      { week: 3, title: "Real-World Applications", content: ["Practical use cases", "Performance analysis", "Troubleshooting", "Case studies"] },
      { week: 4, title: "Interview Preparation", content: ["Technical depth", "System design", "Edge cases", "Interview strategies"] },
    ],
  },
};

// ============================================
// LOAD QUESTIONS FROM JSON (PRESERVED)
// ============================================
function loadQuestions() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "questions.json"), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}
const allQuestions = loadQuestions();

// ============================================
// HELPER FUNCTIONS (PRESERVED)
// ============================================
function mapSkillsToCategories(skills) {
  const skillCategoryMap = {};
  const unmappedSkills = [];
  skills.forEach((skill) => {
    let found = false;
    for (const [category, data] of Object.entries(skillCategories)) {
      if (data.skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase().trim())) {
        if (!skillCategoryMap[category]) skillCategoryMap[category] = [];
        skillCategoryMap[category].push(skill);
        found = true;
        break;
      }
    }
    if (!found) unmappedSkills.push(skill);
  });
  return { skillCategoryMap, unmappedSkills };
}

function getRelatedSkillsForFallback(unknownSkill) {
  const fallbackMappings = [
    { pattern: /(cloud|aws|azure|gcp|kubernetes|docker|deployment)/i, skills: ["System Design", "API"] },
    { pattern: /(vue|svelte|angular|html|css|ui|ux|frontend)/i, skills: ["JavaScript", "React"] },
    { pattern: /(django|flask|fastapi|rails|spring|go|rust|backend)/i, skills: ["Java", "Python", "API"] },
    { pattern: /(mongo|postgres|mysql|redis|nosql|elasticsearch|database)/i, skills: ["DBMS", "SQL"] },
    { pattern: /(kafka|rabbitmq|message|queue|stream|microservice|distributed)/i, skills: ["System Design", "API"] },
    { pattern: /(spark|hadoop|etl|pipeline|data-eng|big-data)/i, skills: ["DSA", "Machine Learning"] },
    { pattern: /(testing|jest|selenium|pytest|qa|automation)/i, skills: ["OOP", "Python"] },
    { pattern: /(devops|ci|cd|jenkins|gitlab|github|container)/i, skills: ["System Design", "API"] },
    { pattern: /(ios|android|flutter|react-native|mobile)/i, skills: ["JavaScript", "OOP"] },
  ];
  for (const mapping of fallbackMappings) {
    if (mapping.pattern.test(unknownSkill)) return mapping.skills;
  }
  return ["DSA", "System Design"];
}

function getQuestionsForSkills(skills) {
  return allQuestions.filter((q) => skills.some((s) => q.skill.toLowerCase() === s.toLowerCase()));
}

function generateWeeklyPlan(categories, weeks = 4) {
  const plan = [];
  for (let week = 1; week <= weeks; week++) {
    const weekPlan = { week, title: `Week ${week}: Preparation Plan`, focusAreas: [], topics: [], categories: [], weekType: "generic" };
    const weeklyTitles = [];
    Object.entries(categories).forEach(([category, skills]) => {
      const categoryData = skillCategories[category];
      if (categoryData?.weeklyTopics) {
        const weeklyTopic = categoryData.weeklyTopics[(week - 1) % categoryData.weeklyTopics.length];
        weekPlan.topics.push(...weeklyTopic.content);
        weeklyTitles.push(weeklyTopic.title);
        if (!weekPlan.categories.includes(category)) weekPlan.categories.push(category);
      }
    });
    weekPlan.focusAreas = weeklyTitles;
    const focusStr = weeklyTitles.join(" ").toLowerCase();
    if (focusStr.includes("fundamentals") || focusStr.includes("basics")) weekPlan.weekType = "fundamentals";
    else if (focusStr.includes("intermediate")) weekPlan.weekType = "practice";
    else if (focusStr.includes("advanced")) weekPlan.weekType = "advanced";
    else if (focusStr.includes("interview") || focusStr.includes("prep")) weekPlan.weekType = "interview";
    weekPlan.topics.push(...["Practice problems from your skills", "Review concepts learned", "Work on mini projects"]);
    plan.push(weekPlan);
  }
  return plan;
}

function generateGenericPlan(skillNames, weeks = 4) {
  const weeklyFocus = [
    { title: "Fundamentals & Basics", weekType: "fundamentals", topics: [`Learn core concepts of ${skillNames[0]}`, "Understand key principles", "Setup and environment configuration", "First program and basic syntax"] },
    { title: "Intermediate Concepts", weekType: "practice", topics: ["Explore advanced features", "Understand best practices", "Solve intermediate-level problems", "Build simple projects"] },
    { title: "Advanced Topics", weekType: "advanced", topics: ["Deep dive into complex scenarios", "Performance optimization", "Industry best practices", "Real-world problem solving"] },
    { title: "Practice & Interview Prep", weekType: "interview", topics: ["Solve challenging problems", "Mock interviews and assessments", "Build portfolio projects", "Interview Q&A practice"] },
  ];
  const plan = [];
  for (let week = 1; week <= weeks; week++) {
    const focus = weeklyFocus[(week - 1) % weeklyFocus.length];
    plan.push({ week, title: `Week ${week}: ${skillNames.join(", ")} - ${focus.title}`, weekType: focus.weekType, topics: focus.topics });
  }
  return plan;
}

function generatePreparationPlan(skills, weeks = 4) {
  const { skillCategoryMap, unmappedSkills } = mapSkillsToCategories(skills);
  const result = { recognized: [], unrecognized: unmappedSkills, weeklyPlan: [] };
  if (Object.keys(skillCategoryMap).length > 0) {
    result.recognized = Object.values(skillCategoryMap).flat();
    result.weeklyPlan = generateWeeklyPlan(skillCategoryMap, weeks);
  }
  if (unmappedSkills.length > 0) {
    const genericPlan = generateGenericPlan(unmappedSkills, weeks);
    if (result.weeklyPlan.length === 0) result.weeklyPlan = genericPlan;
    else result.weeklyPlan.forEach((week, i) => { if (genericPlan[i]) week.topics.push(...genericPlan[i].topics); });
  }
  return result;
}

// ============================================
// LEGACY API ENDPOINTS (FULLY PRESERVED)
// ============================================
app.post("/api/data", (req, res) => {
  const { skills = [], weeks = 4 } = req.body;
  if (!skills || skills.length === 0) {
    return res.status(400).json({ error: "Skills array is required", example: ["Java", "DSA", "Machine Learning"] });
  }
  const preparationPlan = generatePreparationPlan(skills, weeks);
  const technicalQuestions = getQuestionsForSkills(preparationPlan.recognized);
  let fallbackQuestions = [];
  if (preparationPlan.unrecognized.length > 0) {
    const relatedSkillsSet = new Set();
    preparationPlan.unrecognized.forEach((s) => getRelatedSkillsForFallback(s).forEach((r) => relatedSkillsSet.add(r)));
    const techIds = new Set(technicalQuestions.map((q) => q.id));
    fallbackQuestions = getQuestionsForSkills(Array.from(relatedSkillsSet)).filter((q) => !techIds.has(q.id));
  }
  const hrQuestions = allQuestions.filter((q) => q.skill.toLowerCase() === "hr");
  const filteredQuestions = [...technicalQuestions, ...fallbackQuestions, ...hrQuestions];
  const questionsBySkill = {};
  filteredQuestions.forEach((q) => { if (!questionsBySkill[q.skill]) questionsBySkill[q.skill] = []; questionsBySkill[q.skill].push(q.question); });
  res.json({
    plan: preparationPlan.weeklyPlan,
    recognizedSkills: preparationPlan.recognized,
    unrecognizedSkills: preparationPlan.unrecognized,
    questions: {
      bySkill: questionsBySkill,
      byDifficulty: { basic: filteredQuestions.filter((q) => q.difficulty === "basic"), intermediate: filteredQuestions.filter((q) => q.difficulty === "intermediate"), advanced: filteredQuestions.filter((q) => q.difficulty === "advanced") },
      all: filteredQuestions,
    },
    resources: [
      { name: "DSA Practice", desc: "LeetCode, HackerRank, CodeStudio" },
      { name: "System Design", desc: "System Design Interview, Grokking" },
      { name: "Core CS", desc: "DBMS, OS, CN short notes on GeeksforGeeks" },
      { name: "Interview Tips", desc: "Read STAR method, practice mock interviews" },
      { name: "Resume Building", desc: "ATS-friendly resume format on Indeed" },
      { name: "Coding Platforms", desc: "LeetCode, HackerRank, Codechef" },
    ],
    summary: {
      totalQuestions: filteredQuestions.length,
      skillsToLearn: preparationPlan.recognized.length,
      weeksOfPreparation: weeks,
      message: preparationPlan.unrecognized.length > 0
        ? `✅ Mapped ${preparationPlan.recognized.length} skills. ${preparationPlan.unrecognized.length} unmapped — using generic plan.`
        : `✅ Successfully mapped all ${preparationPlan.recognized.length} skills!`,
    },
  });
});

app.get("/api/categories", (req, res) => {
  const categories = {};
  Object.entries(skillCategories).forEach(([key, data]) => { categories[key] = { description: data.description, skills: data.skills }; });
  res.json(categories);
});

app.get("/api/questions", (req, res) => {
  const { skill, category, difficulty } = req.query;
  let filtered = allQuestions;
  if (skill) filtered = filtered.filter((q) => q.skill.toLowerCase() === skill.toLowerCase());
  if (category) filtered = filtered.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
  res.json({ count: filtered.length, questions: filtered });
});

app.get("/api/skills", (req, res) => {
  const allSkills = {};
  Object.entries(skillCategories).forEach(([cat, data]) => { allSkills[cat] = data.skills; });
  res.json(allSkills);
});

// ============================================
// NEW API ROUTES
// ============================================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// Company profiles endpoint
app.get("/api/companies", (req, res) => {
  const companies = [
    // FAANG / Top Product
    { id: "google",    name: "Google",     logo: "🔍", type: "product", difficulty: "Very Hard", skills: ["DSA", "System Design", "Python", "OOP"],          description: "World-class DSA, scalable system design, and culture fit ('Googliness'). Expect 5-6 rounds." },
    { id: "amazon",    name: "Amazon",     logo: "🛒", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "OOP", "Java"],             description: "Leadership Principles are as important as coding. Every answer should tie to an LP." },
    { id: "microsoft", name: "Microsoft",  logo: "🪟", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "OOP", "JavaScript"],       description: "Problem-solving, behavioral rounds, and system design. Growth mindset is key." },
    { id: "meta",      name: "Meta",       logo: "🔵", type: "product", difficulty: "Very Hard", skills: ["DSA", "System Design", "Python", "JavaScript"],    description: "Heavy DSA (graphs, DP), behavioral with STAR method, and product design rounds." },
    { id: "apple",     name: "Apple",      logo: "🍎", type: "product", difficulty: "Very Hard", skills: ["DSA", "System Design", "OOP", "Python"],           description: "Deep technical interviews, iOS/macOS ecosystem knowledge, and design sensibility valued." },
    // Indian Unicorns / Product
    { id: "flipkart",  name: "Flipkart",   logo: "🛍️", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "Java", "OOP"],             description: "Competitive DSA, machine coding rounds, and system design for e-commerce scale." },
    { id: "swiggy",    name: "Swiggy",     logo: "🍔", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "Python", "API"],           description: "Focus on backend systems, real-time order management, and data pipelines." },
    { id: "zomato",    name: "Zomato",     logo: "🍕", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "Java", "OOP"],             description: "Logistics and geo-distributed systems. DSA and backend design are primary focus." },
    { id: "paytm",     name: "Paytm",      logo: "💳", type: "product", difficulty: "Medium",    skills: ["DSA", "Java", "System Design", "SQL"],             description: "Fintech-focused: transactions, payment systems, and backend service design." },
    { id: "uber",      name: "Uber",       logo: "🚗", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "Python", "API"],           description: "Distributed systems at scale, real-time matching algorithms, and geospatial problems." },
    { id: "adobe",     name: "Adobe",      logo: "🎨", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "OOP", "Java"],             description: "Strong OOP design, DSA, and LLD (Low Level Design) rounds." },
    { id: "oracle",    name: "Oracle",     logo: "🔶", type: "product", difficulty: "Medium",    skills: ["DSA", "SQL", "Java", "System Design"],             description: "Database internals, SQL optimization, and Java/OOP design patterns." },
    { id: "linkedin",  name: "LinkedIn",   logo: "💼", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "Java", "Python"],          description: "Graph algorithms (social network), system design for feed/search, and behavioral." },
    { id: "atlassian", name: "Atlassian",  logo: "⚡", type: "product", difficulty: "Hard",      skills: ["DSA", "System Design", "Java", "OOP"],             description: "LLD, HLD, and values-based behavioral questions. Known for thorough process." },
    // Service Based (Indian)
    { id: "tcs",       name: "TCS",        logo: "🏢", type: "service", difficulty: "Easy",      skills: ["Java", "SQL", "Aptitude", "HR"],                   description: "NQT: aptitude (verbal, reasoning, coding) + HR. Focus on speed and accuracy." },
    { id: "infosys",   name: "Infosys",    logo: "ℹ️", type: "service", difficulty: "Easy",      skills: ["Java", "SQL", "Aptitude", "HR", "Communication"], description: "Hackwithinfy (coding) or InfyTQ + HR. Java and basic DSA are sufficient." },
    { id: "accenture", name: "Accenture",  logo: "🅰️", type: "service", difficulty: "Easy",      skills: ["Java", "SQL", "Aptitude", "HR"],                   description: "Cognitive + Coding Assessment, then communication and behavioral rounds." },
    { id: "wipro",     name: "Wipro",      logo: "🔷", type: "service", difficulty: "Easy",      skills: ["Java", "Python", "Aptitude", "HR"],                description: "NLTH: online test (aptitude + coding) + tech interview + HR. Basic programming needed." },
    { id: "cognizant", name: "Cognizant",  logo: "🌐", type: "service", difficulty: "Medium",    skills: ["Java", "SQL", "Aptitude", "HR"],                   description: "GenC/GenC Next/GenC Elevate tracks. Higher track = harder DSA requirement." },
    { id: "capgemini", name: "Capgemini",  logo: "🟦", type: "service", difficulty: "Easy",      skills: ["Java", "SQL", "Aptitude", "Communication"],        description: "English, Analytical, and Behavioral + Pseudocode test. Very communication-heavy." },
    { id: "hcl",       name: "HCL Tech",   logo: "🟩", type: "service", difficulty: "Easy",      skills: ["Java", "SQL", "Aptitude", "HR"],                   description: "Graduate Engineer Trainee: aptitude + basic coding + HR. Similar to TCS pattern." },
    { id: "mphasis",   name: "Mphasis",    logo: "🔵", type: "service", difficulty: "Medium",    skills: ["Java", "Python", "SQL", "Aptitude"],               description: "Written test: Verbal, Quant, Reasoning + Technical + HR. Moderate DSA." },
    { id: "hexaware",  name: "Hexaware",   logo: "⬡",  type: "service", difficulty: "Easy",      skills: ["Java", "SQL", "Aptitude", "Communication"],        description: "Aptitude (IndiaBix level) + basic Java coding + personal interview." },
    { id: "ltimindtree", name: "LTIMindtree", logo: "🌿", type: "service", difficulty: "Medium", skills: ["Java", "SQL", "DSA", "Aptitude"],                  description: "MindTree: moderate DSA + SQL. LTI: system/network knowledge valued." },
    { id: "persistent", name: "Persistent", logo: "🔵", type: "service", difficulty: "Medium",   skills: ["Java", "DSA", "SQL", "OOP"],                       description: "Known for tougher coding rounds than typical service companies. OOP and DSA needed." },
  ];
  res.json(companies);
});

// Resources endpoint
app.get("/api/resources", (req, res) => {
  const resources = [
    { id: 1, category: "DSA", title: "LeetCode", url: "https://leetcode.com", description: "Best platform for DSA practice with 2000+ problems", type: "practice", free: false },
    { id: 2, category: "DSA", title: "HackerRank", url: "https://hackerrank.com", description: "Coding challenges and interview prep", type: "practice", free: true },
    { id: 3, category: "System Design", title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", description: "Comprehensive system design guide on GitHub", type: "guide", free: true },
    { id: 4, category: "System Design", title: "Grokking System Design", url: "https://educative.io", description: "Interactive system design course", type: "course", free: false },
    { id: 5, category: "Core CS", title: "GeeksforGeeks", url: "https://geeksforgeeks.org", description: "DBMS, OS, CN notes and practice", type: "guide", free: true },
    { id: 6, category: "Interview", title: "InterviewBit", url: "https://interviewbit.com", description: "Structured interview preparation", type: "practice", free: true },
    { id: 7, category: "Resume", title: "Resume Worded", url: "https://resumeworded.com", description: "ATS-friendly resume checker and builder", type: "tool", free: false },
    { id: 8, category: "Aptitude", title: "IndiaBix", url: "https://indiabix.com", description: "Quantitative aptitude, verbal, logical reasoning", type: "practice", free: true },
    { id: 9, category: "DSA", title: "Striver's DSA Sheet", url: "https://takeuforward.org", description: "Top 180 DSA problems curated by Striver", type: "guide", free: true },
    { id: 10, category: "Behavioral", title: "STAR Method Guide", url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique", description: "Master behavioral interview questions", type: "guide", free: true },
  ];
  res.json(resources);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    questions: allQuestions.length,
  });
});

// ============================================
// SERVER START
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✨ Server running on http://localhost:${PORT}`);
  console.log(`📚 Loaded ${allQuestions.length} questions from JSON`);
  console.log("🎯 Categories:", Object.keys(skillCategories).join(", "));
  console.log("\n📖 API Endpoints:");
  console.log("  POST /api/data           - Generate prep plan (legacy + new)");
  console.log("  GET  /api/questions      - Question bank with filters");
  console.log("  GET  /api/categories     - Skill categories");
  console.log("  GET  /api/skills         - All skills");
  console.log("  GET  /api/companies      - Company profiles");
  console.log("  GET  /api/resources      - Resource library");
  console.log("  POST /api/auth/register  - Register user");
  console.log("  POST /api/auth/login     - Login user");
  console.log("  GET  /api/auth/me        - Get current user");
  console.log("  GET  /api/users/...      - User features (auth required)");
});
