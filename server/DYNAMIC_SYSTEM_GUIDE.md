# Dynamic Skill Preparation System - Documentation

## 🎯 Overview

Your backend has been upgraded from a **hardcoded, fixed-skill system** to a **fully dynamic, scalable system** that can handle unlimited skills and categories.

---

## 📊 System Architecture

### 1. **Skill Categorization System** (Core Innovation)

Instead of if-else statements, skills are now organized into **4 dynamic categories**:

```javascript
skillCategories = {
  programming: {
    skills: ["Java", "Python", "DSA", "JavaScript", "React", "Node"],
    description: "Programming Languages & Data Structures",
    weeklyTopics: [...]
  },
  ai: {
    skills: ["Machine Learning", "Agentic AI", "Generative AI", "Deep Learning", "NLP"],
    description: "Artificial Intelligence & Machine Learning",
    weeklyTopics: [...]
  },
  service: {
    skills: ["Aptitude", "Communication", "HR"],
    description: "Aptitude & Soft Skills",
    weeklyTopics: [...]
  },
  core: {
    skills: ["DBMS", "OS", "CN", "System Design", "OOP"],
    description: "Core Computer Science",
    weeklyTopics: [...]
  }
}
```

### 2. **Questions Storage** (questions.json)

Questions are **no longer hardcoded**. They're stored in a structured JSON file:

```json
[
  {
    "id": 1,
    "skill": "Java",
    "category": "programming",
    "difficulty": "basic",
    "question": "What is JVM?"
  },
  {
    "id": 13,
    "skill": "Machine Learning",
    "category": "ai",
    "difficulty": "basic",
    "question": "What is supervised learning?"
  }
]
```

**Benefits:**

- Add new skills without touching server code
- Add new questions anytime
- Questions are categorized by skill, category, and difficulty

---

## 🔄 How Dynamic Logic Works

### **Flow Diagram:**

```
User Input (Skills Array)
        ↓
mapSkillsToCategories()  ← Maps each skill to its category
        ↓
    ┌───┴───┐
    ↓       ↓
Recognized  Unrecognized Skills
Skills      (Generic Plan)
    ↓       ↓
    └───┬───┘
        ↓
generateWeeklyPlan() ← Creates week-by-week roadmap
        ↓
getQuestionsForSkills() ← Filters questions dynamically
        ↓
JSON Response
```

---

## 📝 Key Functions Explained

### 1. **`mapSkillsToCategories(skills)`**

**Purpose:** Dynamically map user input skills to predefined categories.

```javascript
function mapSkillsToCategories(skills) {
  const skillCategoryMap = {};
  const unmappedSkills = [];

  skills.forEach((skill) => {
    let found = false;
    for (const [category, data] of Object.entries(skillCategories)) {
      const normalizedSkill = skill.toLowerCase().trim();
      const categorySkills = data.skills.map((s) => s.toLowerCase());
      if (categorySkills.includes(normalizedSkill)) {
        skillCategoryMap[category] = [...];
        found = true;
        break;
      }
    }
    if (!found) {
      unmappedSkills.push(skill); // Generic plan for unknown skills
    }
  });

  return { skillCategoryMap, unmappedSkills };
}
```

**Example:**

- Input: `["Java", "Machine Learning", "Aptitude"]`
- Output:
  ```javascript
  {
    skillCategoryMap: {
      programming: ["Java"],
      ai: ["Machine Learning"],
      service: ["Aptitude"]
    },
    unmappedSkills: []
  }
  ```

---

### 2. **`generateWeeklyPlan(categories, weeks)`**

**Purpose:** Create a week-by-week preparation plan based on categories.

```javascript
function generateWeeklyPlan(categories, weeks = 4) {
  const plan = [];

  for (let week = 1; week <= weeks; week++) {
    const weekPlan = {
      week: week,
      title: `Week ${week}: Preparation Plan`,
      topics: [],
      categories: [],
    };

    // Distribute topics from each category
    Object.entries(categories).forEach(([category, skills]) => {
      const categoryData = skillCategories[category];
      if (categoryData && categoryData.weeklyTopics[week - 1]) {
        weekPlan.topics.push(...categoryData.weeklyTopics[week - 1].content);
      }
    });

    plan.push(weekPlan);
  }

  return plan;
}
```

**Example Output (Week 1):**

```json
{
  "week": 1,
  "title": "Week 1: Preparation Plan",
  "topics": [
    "Basics and core concepts",
    "Setup and tools",
    "Learn basics of Python",
    "Learn basics of Machine Learning",
    "Quantitative Skills"
  ],
  "categories": ["programming", "ai", "service"]
}
```

---

### 3. **`generateGenericPlan(skillNames, weeks)`**

**Purpose:** Generate a generic plan for **unrecognized skills** (so they don't fail).

```javascript
function generateGenericPlan(skillNames, weeks = 4) {
  const plan = [];

  for (let week = 1; week <= weeks; week++) {
    plan.push({
      week: week,
      title: `Week ${week}: ${skillNames.join(", ")} Preparation`,
      topics: [
        `Learn basics of ${skillNames[0]}`,
        "Practice problems and exercises",
        "Review and consolidate concepts",
        "Work on practical projects or assignments",
      ],
    });
  }

  return plan;
}
```

**Example:** If user sends `["Agentic AI", "UnknownSkill"]`

- `Agentic AI` → Recognized (mapped to `ai` category)
- `UnknownSkill` → Not recognized (gets generic plan)
- **Result:** Combined plan with both specific and generic content

---

### 4. **`getQuestionsForSkills(skills)`**

**Purpose:** Filter questions from questions.json that match user skills.

```javascript
function getQuestionsForSkills(skills) {
  const questions = allQuestions.filter((q) => {
    return skills.some(
      (skill) => q.skill.toLowerCase() === skill.toLowerCase(),
    );
  });
  return questions;
}
```

**Example:** Input: `["Java", "Python"]`

- Returns all questions where `skill === "Java"` OR `skill === "Python"`

---

## 🚀 API Endpoints

### **1. POST /api/data** (Main Endpoint)

**Purpose:** Generate a complete preparation plan

**Request:**

```json
{
  "skills": ["Java", "Machine Learning", "Agentic AI", "Aptitude"],
  "weeks": 4
}
```

**Response:**

```json
{
  "plan": [
    {
      "week": 1,
      "title": "Week 1: Preparation Plan",
      "topics": [...]
    },
    ...
  ],
  "recognizedSkills": ["Java", "Machine Learning", "Agentic AI", "Aptitude"],
  "unrecognizedSkills": [],
  "questions": {
    "bySkill": {
      "Java": ["What is JVM?", "Explain inheritance..."],
      "Machine Learning": ["What is supervised learning?", ...],
      ...
    },
    "byDifficulty": {
      "basic": [...],
      "intermediate": [...],
      "advanced": [...]
    },
    "all": [...]
  },
  "summary": {
    "totalQuestions": 25,
    "skillsToLearn": 4,
    "weeksOfPreparation": 4,
    "message": "✅ Successfully mapped all 4 skills!"
  }
}
```

---

### **2. GET /api/categories**

**Purpose:** View all available skill categories

**Response:**

```json
{
  "programming": {
    "description": "Programming Languages & Data Structures",
    "skills": ["Java", "Python", "DSA", "JavaScript", "React", "Node"]
  },
  "ai": {
    "description": "Artificial Intelligence & Machine Learning",
    "skills": ["Machine Learning", "Agentic AI", "Generative AI", "Deep Learning", "NLP"]
  },
  ...
}
```

---

### **3. GET /api/questions**

**Purpose:** Get filtered questions

**Query Parameters:**

- `?skill=Java` - Get questions for specific skill
- `?category=programming` - Get questions by category
- `?difficulty=basic` - Get questions by difficulty
- Combine: `?skill=Java&difficulty=intermediate`

**Response:**

```json
{
  "count": 5,
  "questions": [
    {
      "id": 1,
      "skill": "Java",
      "category": "programming",
      "difficulty": "basic",
      "question": "What is JVM?"
    },
    ...
  ]
}
```

---

### **4. GET /api/skills**

**Purpose:** Get all available skills

**Response:**

```json
{
  "programming": ["Java", "Python", "DSA", "JavaScript", "React", "Node"],
  "ai": [
    "Machine Learning",
    "Agentic AI",
    "Generative AI",
    "Deep Learning",
    "NLP"
  ],
  "service": ["Aptitude", "Communication", "HR"],
  "core": ["DBMS", "OS", "CN", "System Design", "OOP"]
}
```

---

## ✨ New Features & Benefits

### **1. Dynamic Skill Support**

- ✅ Add new skills by adding to `skillCategories` object
- ✅ No need to modify endpoint logic
- ✅ Supports unlimited skills

### **2. Graceful Handling of Unknown Skills**

```javascript
// User sends: ["Java", "QuantumComputing"]
// Response:
{
  "recognizedSkills": ["Java"],
  "unrecognizedSkills": ["QuantumComputing"],
  "plan": [combined plan for both]
  // ✅ No error! Generic plan for unknown skill
}
```

### **3. Categorized Weekly Plans**

- Each week has topics from all relevant categories
- Plans are **intelligent and contextual**, not hardcoded

### **4. Easy Question Management**

- All questions in one JSON file
- Add questions without touching server code
- Filter by skill, category, or difficulty

### **5. Scalability**

- Add new skill: Update `skillCategories` or `questions.json`
- All logic adapts automatically
- No if-else chains!

---

## 🔧 How to Add New Skills

### **Step 1: Add to questions.json**

```json
{
  "id": 100,
  "skill": "Kubernetes",
  "category": "core",
  "difficulty": "intermediate",
  "question": "What is a Kubernetes pod?"
}
```

### **Step 2: Add to skillCategories (if new category behavior needed)**

```javascript
skillCategories.core.skills.push("Kubernetes");
// OR if completely new category:
skillCategories.devops = {
  skills: ["Kubernetes", "Docker", "Jenkins"],
  description: "DevOps & CI/CD",
  weeklyTopics: [...]
};
```

### **Step 3: Done!** ✨

User can now send: `["Kubernetes"]` and it works automatically!

---

## 📊 Comparison: Old vs New

| Feature              | Old System                 | New System                 |
| -------------------- | -------------------------- | -------------------------- |
| **Skill Support**    | Fixed (hardcoded if-else)  | Unlimited & Dynamic        |
| **Adding Skills**    | Modify server.js code      | Update JSON file           |
| **Unknown Skills**   | API fails / 404            | Generates generic plan     |
| **Questions**        | Hardcoded in server.js     | Separate questions.json    |
| **Categories**       | If-else conditions         | Dynamic object mapping     |
| **Code Readability** | Complex, nested conditions | Clean, functional approach |
| **Maintenance**      | High (code changes)        | Low (mostly JSON updates)  |

---

## 🎓 Example Workflows

### **Workflow 1: User wants to learn new emerging skills**

```javascript
POST /api/data
{
  "skills": ["Agentic AI", "Generative AI", "Machine Learning"],
  "weeks": 6
}
// ✅ Works instantly! All mapped to 'ai' category
// ✅ Gets intelligent 6-week plan
// ✅ Gets filtered questions for all 3 skills
```

### **Workflow 2: User includes unknown skill**

```javascript
POST /api/data
{
  "skills": ["Java", "UnknownTech", "DSA"],
  "weeks": 4
}
// ✅ Java & DSA recognized (programming category)
// ✅ UnknownTech gets generic plan
// ✅ Combined 4-week plan for all skills
// ✅ Questions only for Java & DSA (no error)
```

### **Workflow 3: Frontend wants to show available options**

```javascript
GET / api / categories;
// ✅ Shows all categories and their skills
// ✅ Use for dropdown menus, skill selection UI

GET / api / skills;
// ✅ Shows flat list by category
// ✅ Use for autocomplete, typeahead
```

---

## 🔄 Migration Steps

### **To use the new system:**

1. **Backup old server.js:**

   ```bash
   mv server.js server_old.js
   ```

2. **Rename new server to main:**

   ```bash
   mv server_new.js server.js
   ```

3. **Run normally:**

   ```bash
   node server.js
   ```

4. **Test API:**
   ```bash
   curl -X POST http://localhost:5000/api/data \
     -H "Content-Type: application/json" \
     -d '{"skills": ["Java", "Machine Learning"], "weeks": 4}'
   ```

---

## 📌 Key Takeaways

✅ **No more hardcoded if-else logic**
✅ **Supports unlimited skills dynamically**
✅ **Questions in separate JSON file**
✅ **Graceful handling of unknown skills**
✅ **Clean, maintainable code**
✅ **Easy to extend and scale**
✅ **Perfect for emerging tech (ML, AI, etc.)**

---

## 💡 Future Enhancements

- Add skill difficulty levels (beginner/intermediate/advanced)
- Add estimated time for each skill
- Add resource links
- Add progress tracking
- Add skill combinations (e.g., "AI + Python")
- Save user preferences to database
- Add achievement badges

---

**Congratulations!** Your system is now **production-ready** and **scalable** 🚀
