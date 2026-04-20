const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// DYNAMIC SKILL CATEGORIZATION SYSTEM
// ============================================

const skillCategories = {
  programming: {
    skills: ["Java", "Python", "DSA", "JavaScript", "React", "Node", "API"],
    description: "Programming Languages & Data Structures",
    weeklyTopics: [
      { week: 1, title: "Fundamentals", content: ["Basics and core concepts", "Setup and tools", "First program", "Basic syntax"] },
      { week: 2, title: "Intermediate Concepts", content: ["Advanced syntax", "Key features", "Best practices", "Common patterns"] },
      { week: 3, title: "Advanced Topics", content: ["Performance optimization", "Advanced features", "Design patterns", "Real-world usage"] },
      { week: 4, title: "Practice & Implementation", content: ["Complex problems", "Project work", "Interview prep", "Mock interviews"] }
    ]
  },
  ai: {
    skills: ["Machine Learning", "Agentic AI", "Generative AI"],
    description: "Artificial Intelligence & Machine Learning",
    weeklyTopics: [
      { week: 1, title: "Basics of AI/ML", content: ["What is AI and ML?", "Supervised vs Unsupervised Learning", "Key concepts", "Applications"] },
      { week: 2, title: "Models and Algorithms", content: ["Common algorithms", "Training models", "Evaluation metrics", "Model selection"] },
      { week: 3, title: "Advanced Techniques", content: ["Neural networks", "Deep learning", "Feature engineering", "Optimization techniques"] },
      { week: 4, title: "Projects and Practice", content: ["Build real projects", "Kaggle competitions", "Portfolio building", "Interview scenarios"] }
    ]
  },
  service: {
    skills: ["Aptitude", "Communication", "HR"],
    description: "Aptitude & Soft Skills",
    weeklyTopics: [
      { week: 1, title: "Quantitative Skills", content: ["Basic arithmetic", "Percentages and ratios", "Speed and time", "Profit and loss"] },
      { week: 2, title: "Logical Reasoning", content: ["Series and patterns", "Analogy", "Puzzles", "Data interpretation"] },
      { week: 3, title: "Communication", content: ["Technical writing", "Group discussion", "Presentation skills", "Self introduction"] },
      { week: 4, title: "Interview & HR Prep", content: ["Behavioral questions", "STAR method", "Company research", "Mock interviews"] }
    ]
  },
  core: {
    skills: ["DBMS", "SQL", "System Design", "OOP"],
    description: "Core Computer Science",
    weeklyTopics: [
      { week: 1, title: "Fundamentals", content: ["Core concepts", "Architecture", "Basic theory", "Key principles"] },
      { week: 2, title: "Advanced Concepts", content: ["Complex scenarios", "Best practices", "Design principles", "Optimization"] },
      { week: 3, title: "Real-World Applications", content: ["Practical use cases", "Performance analysis", "Troubleshooting", "Case studies"] },
      { week: 4, title: "Interview Preparation", content: ["Technical depth", "System design", "Edge cases", "Interview strategies"] }
    ]
  }
};

// ============================================
// LOAD QUESTIONS FROM JSON FILE
// ============================================

function loadQuestions() {
  try {
    const questionsPath = path.join(__dirname, "questions.json");
    const data = fs.readFileSync(questionsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading questions.json:", error);
    return [];
  }
}

const allQuestions = loadQuestions();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map user skills to categories dynamically
 */
function mapSkillsToCategories(skills) {
  const skillCategoryMap = {};
  const unmappedSkills = [];

  skills.forEach((skill) => {
    let found = false;
    for (const [category, data] of Object.entries(skillCategories)) {
      const normalizedSkill = skill.toLowerCase().trim();
      const categorySkills = data.skills.map((s) => s.toLowerCase());
      if (categorySkills.includes(normalizedSkill)) {
        if (!skillCategoryMap[category]) {
          skillCategoryMap[category] = [];
        }
        skillCategoryMap[category].push(skill);
        found = true;
        break;
      }
    }
    if (!found) {
      unmappedSkills.push(skill);
    }
  });

  return { skillCategoryMap, unmappedSkills };
}

/**
 * Map unknown skills to related known skills based on keywords and similarity
 */
function getRelatedSkillsForFallback(unknownSkill) {
  const skillLower = unknownSkill.toLowerCase();
  
  // Array of patterns and their related skills
  const fallbackMappings = [
    { pattern: /(cloud|aws|azure|gcp|kubernetes|docker|deployment)/i, skills: ["System Design", "API"] },
    { pattern: /(vue|svelte|angular|html|css|ui|ux|frontend)/i, skills: ["JavaScript", "React"] },
    { pattern: /(django|flask|fastapi|rails|spring|go|rust|backend)/i, skills: ["Java", "Python", "API"] },
    { pattern: /(mongo|postgres|mysql|redis|nosql|elasticsearch|database)/i, skills: ["DBMS", "SQL"] },
    { pattern: /(kafka|rabbitmq|message|queue|stream|microservice|distributed)/i, skills: ["System Design", "API"] },
    { pattern: /(spark|hadoop|etl|pipeline|data-eng|big-data)/i, skills: ["DSA", "Machine Learning"] },
    { pattern: /(testing|jest|selenium|pytest|qa|automation)/i, skills: ["OOP", "Python"] },
    { pattern: /(devops|ci|cd|jenkins|gitlab|github|container)/i, skills: ["System Design", "API"] },
    { pattern: /(blockchain|crypto|web3|solidity|ethereum)/i, skills: ["System Design", "DSA"] },
    { pattern: /(ios|android|flutter|react-native|mobile)/i, skills: ["JavaScript", "OOP"] },
    { pattern: /(unity|unreal|game|graphics|3d)/i, skills: ["OOP", "DSA"] },
  ];
  
  // Find matching pattern
  for (const mapping of fallbackMappings) {
    if (mapping.pattern.test(skillLower)) {
      return mapping.skills;
    }
  }
  
  // Default fallback if no pattern matches
  return ["DSA", "System Design"];
}

/**
 * Get questions for specific skills or categories
 */
function getQuestionsForSkills(skills) {
  const questions = allQuestions.filter((q) => {
    return skills.some(
      (skill) => q.skill.toLowerCase() === skill.toLowerCase()
    );
  });
  return questions;
}

/**
 * Generate a generic weekly plan based on categories
 */
function generateWeeklyPlan(categories, weeks = 4) {
  const plan = [];

  for (let week = 1; week <= weeks; week++) {
    const weeklyTitles = [];
    const weekPlan = {
      week: week,
      title: `Week ${week}: Preparation Plan`,
      focusAreas: [],
      topics: [],
      categories: []
    };

    // Distribute categories across weeks - cycle through topics if weeks > 4
    Object.entries(categories).forEach(([category, skills]) => {
      const categoryData = skillCategories[category];
      if (categoryData && categoryData.weeklyTopics) {
        // Cycle through topics using modulo to handle weeks > 4
        const topicIndex = (week - 1) % categoryData.weeklyTopics.length;
        const weeklyTopic = categoryData.weeklyTopics[topicIndex];
        weekPlan.topics.push(...weeklyTopic.content);
        weeklyTitles.push(weeklyTopic.title);
        if (!weekPlan.categories.includes(category)) {
          weekPlan.categories.push(category);
        }
      }
    });

    // Set focus areas based on the pattern
    weekPlan.focusAreas = weeklyTitles;
    
    // Determine primary focus type for checklist
    const focusStr = weeklyTitles.join(" ").toLowerCase();
    if (focusStr.includes("fundamentals") || focusStr.includes("basics")) {
      weekPlan.weekType = "fundamentals";
    } else if (focusStr.includes("intermediate")) {
      weekPlan.weekType = "practice";
    } else if (focusStr.includes("advanced")) {
      weekPlan.weekType = "advanced";
    } else if (focusStr.includes("interview") || focusStr.includes("prep")) {
      weekPlan.weekType = "interview";
    } else {
      weekPlan.weekType = "generic";
    }

    // Add generic activities for all weeks
    weekPlan.topics.push(...[
      "Practice problems from your skills",
      "Review concepts learned",
      "Work on mini projects"
    ]);

    plan.push(weekPlan);
  }

  return plan;
}

/**
 * Generate generic plan for unrecognized skills
 */
function generateGenericPlan(skillNames, weeks = 4) {
  const plan = [];
  
  // Different progression for each week
  const weeklyFocus = [
    {
      title: "Fundamentals & Basics",
      weekType: "fundamentals",
      topics: [
        `Learn core concepts of ${skillNames[0]}`,
        "Understand key principles and fundamentals",
        "Setup and environment configuration",
        "First program and basic syntax"
      ]
    },
    {
      title: "Intermediate Concepts",
      weekType: "practice",
      topics: [
        "Explore advanced features and techniques",
        "Understand best practices and patterns",
        "Solve intermediate-level problems",
        "Build simple projects"
      ]
    },
    {
      title: "Advanced Topics",
      weekType: "advanced",
      topics: [
        "Deep dive into complex scenarios",
        "Performance optimization and scalability",
        "Industry best practices and design patterns",
        "Real-world problem solving"
      ]
    },
    {
      title: "Practice & Interview Prep",
      weekType: "interview",
      topics: [
        "Solve challenging problems and case studies",
        "Mock interviews and assessments",
        "Build portfolio projects",
        "Interview questions and discussions"
      ]
    }
  ];

  for (let week = 1; week <= weeks; week++) {
    const focus = weeklyFocus[(week - 1) % weeklyFocus.length]; // Cycle through focus areas
    plan.push({
      week: week,
      title: `Week ${week}: ${skillNames.join(", ")} - ${focus.title}`,
      weekType: focus.weekType,
      topics: focus.topics
    });
  }

  return plan;
}

/**
 * Main handler for generating preparation plan
 */
function generatePreparationPlan(skills, weeks = 4) {
  const { skillCategoryMap, unmappedSkills } = mapSkillsToCategories(skills);

  const result = {
    recognized: [],
    unrecognized: unmappedSkills,
    weeklyPlan: []
  };

  // Generate plan based on recognized skills
  if (Object.keys(skillCategoryMap).length > 0) {
    result.recognized = Object.entries(skillCategoryMap).flatMap(
      ([category, categorySkills]) => categorySkills
    );
    result.weeklyPlan = generateWeeklyPlan(skillCategoryMap, weeks);
  }

  // Generate generic plan for unrecognized skills
  if (unmappedSkills.length > 0) {
    const genericPlan = generateGenericPlan(unmappedSkills, weeks);
    if (result.weeklyPlan.length === 0) {
      result.weeklyPlan = genericPlan;
    } else {
      // Merge generic plan with existing plan
      result.weeklyPlan.forEach((week, index) => {
        if (genericPlan[index]) {
          week.topics.push(...genericPlan[index].topics);
        }
      });
    }
  }

  return result;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * POST /api/data
 * Generate personalized preparation plan and questions
 */
app.post("/api/data", (req, res) => {
  const { skills = [], weeks = 4 } = req.body;

  console.log("📥 API Request received:");
  console.log("  - skills:", skills);
  console.log("  - weeks:", weeks);

  // Validate input
  if (!skills || skills.length === 0) {
    return res.status(400).json({
      error: "Skills array is required and cannot be empty",
      example: ["Java", "DSA", "Machine Learning"]
    });
  }

  // Generate preparation plan
  const preparationPlan = generatePreparationPlan(skills, weeks);
  console.log("✅ Generated preparation plan for skills:", preparationPlan.recognized);

  // Get filtered questions based on recognized skills + always include HR questions
  const technicalQuestions = getQuestionsForSkills(preparationPlan.recognized);
  
  // Add fallback questions for unrecognized skills
  let fallbackQuestions = [];
  if (preparationPlan.unrecognized.length > 0) {
    const relatedSkillsSet = new Set();
    
    // Get related skills for each unrecognized skill
    preparationPlan.unrecognized.forEach((unknownSkill) => {
      const related = getRelatedSkillsForFallback(unknownSkill);
      related.forEach(skill => relatedSkillsSet.add(skill));
    });
    
    // Get questions from related skills
    fallbackQuestions = getQuestionsForSkills(Array.from(relatedSkillsSet));
    
    // Remove duplicates (in case a skill appears in both recognized and fallback)
    const technicalIds = new Set(technicalQuestions.map(q => q.id));
    fallbackQuestions = fallbackQuestions.filter(q => !technicalIds.has(q.id));
    
    console.log(`💡 Added ${fallbackQuestions.length} fallback questions for unrecognized skills: ${preparationPlan.unrecognized.join(", ")}`);
  }
  
  const hrQuestions = allQuestions.filter((q) => q.skill.toLowerCase() === "hr");
  const filteredQuestions = [...technicalQuestions, ...fallbackQuestions, ...hrQuestions];
  console.log(`📋 Found ${technicalQuestions.length} technical + ${fallbackQuestions.length} fallback + ${hrQuestions.length} HR questions`);

  // Group questions by difficulty
  const questionsByDifficulty = {
    basic: filteredQuestions.filter((q) => q.difficulty === "basic"),
    intermediate: filteredQuestions.filter((q) => q.difficulty === "intermediate"),
    advanced: filteredQuestions.filter((q) => q.difficulty === "advanced")
  };

  // Group questions by skill
  const questionsBySkill = {};
  filteredQuestions.forEach((q) => {
    if (!questionsBySkill[q.skill]) {
      questionsBySkill[q.skill] = [];
    }
    questionsBySkill[q.skill].push(q.question);
  });

  res.json({
    plan: preparationPlan.weeklyPlan,
    recognizedSkills: preparationPlan.recognized,
    unrecognizedSkills: preparationPlan.unrecognized,
    questions: {
      bySkill: questionsBySkill,
      byDifficulty: questionsByDifficulty,
      all: filteredQuestions
    },
    resources: [
      { name: "DSA Practice", desc: "LeetCode, HackerRank, CodeStudio" },
      { name: "System Design", desc: "System Design Interview, Grokking" },
      { name: "Core CS", desc: "DBMS, OS, CN short notes on GeeksforGeeks" },
      { name: "Interview Tips", desc: "Read STAR method, practice mock interviews" },
      { name: "Resume Building", desc: "ATS-friendly resume format on Indeed" },
      { name: "Coding Platforms", desc: "LeetCode, HackerRank, Codechef" }
    ],
    summary: {
      totalQuestions: filteredQuestions.length,
      skillsToLearn: preparationPlan.recognized.length,
      weeksOfPreparation: weeks,
      message: preparationPlan.unrecognized.length > 0
        ? `✅ Mapped ${preparationPlan.recognized.length} skills. Found ${preparationPlan.unrecognized.length} unrecognized skills - using generic plan.`
        : `✅ Successfully mapped all ${preparationPlan.recognized.length} skills!`
    }
  });
});

/**
 * GET /api/categories
 * Get all available skill categories
 */
app.get("/api/categories", (req, res) => {
  const categories = {};
  Object.entries(skillCategories).forEach(([key, data]) => {
    categories[key] = {
      description: data.description,
      skills: data.skills
    };
  });
  res.json(categories);
});

/**
 * GET /api/questions
 * Get all available questions with optional filtering
 */
app.get("/api/questions", (req, res) => {
  const { skill, category, difficulty } = req.query;

  let filtered = allQuestions;

  if (skill) {
    filtered = filtered.filter((q) => q.skill.toLowerCase() === skill.toLowerCase());
  }
  if (category) {
    filtered = filtered.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  }
  if (difficulty) {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  res.json({
    count: filtered.length,
    questions: filtered
  });
});

/**
 * GET /api/skills
 * Get all available skills
 */
app.get("/api/skills", (req, res) => {
  const allSkills = {};
  Object.entries(skillCategories).forEach(([category, data]) => {
    allSkills[category] = data.skills;
  });
  res.json(allSkills);
});

// ============================================
// SERVER INITIALIZATION
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✨ Server running on http://localhost:${PORT}`);
  console.log(`📚 Total questions loaded: ${allQuestions.length}`);
  console.log("🎯 Available categories:", Object.keys(skillCategories).join(", "));
  console.log("\n📖 API Documentation:");
  console.log("  POST /api/data - Generate preparation plan (send: { skills: [...], weeks: 4 })");
  console.log("  GET  /api/categories - View all skill categories");
  console.log("  GET  /api/questions - Get questions (with filters: ?skill=Java&difficulty=basic)");
  console.log("  GET  /api/skills - Get all available skills");
});
