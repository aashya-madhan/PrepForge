# Testing Guide - Dynamic Skill System

## 🧪 How to Test the New System

### **Step 1: Start the Server**

```bash
cd server
node server.js
```

Expected output:

```
✨ Server running on http://localhost:5000
📚 Total questions loaded: 34
🎯 Available categories: programming, ai, service, core
```

---

## 📡 Test Cases

### **Test 1: Multiple Skills Request**

```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Java", "Python", "DSA"],
    "weeks": 4
  }'
```

**Expected:**

- ✅ All 3 skills recognized
- ✅ Mapped to `programming` category
- ✅ 4-week plan generated
- ✅ Questions filtered for these 3 skills

---

### **Test 2: New AI Skills (Emerging Tech)**

```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Machine Learning", "Agentic AI", "Generative AI"],
    "weeks": 4
  }'
```

**Expected:**

- ✅ All 3 AI skills recognized
- ✅ Mapped to `ai` category
- ✅ AI-focused 4-week plan
- ✅ Questions for ML, Agentic AI, and Generative AI

---

### **Test 3: Mixed Categories**

```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Java", "Machine Learning", "Aptitude", "DBMS"],
    "weeks": 4
  }'
```

**Expected:**

- ✅ 4 skills mapped to 4 different categories
- ✅ Combined 4-week plan covering all categories
- ✅ Questions from all 4 skill groups
- ✅ Response: `"skillsToLearn": 4`

---

### **Test 4: Unknown Skill Handling (NO ERROR!)**

```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Java", "QuantumComputing"],
    "weeks": 2
  }'
```

**Expected:**

- ✅ Java recognized
- ✅ QuantumComputing in `unrecognizedSkills` array
- ✅ Generic plan generated for QuantumComputing
- ✅ Combined 2-week plan
- ✅ Message: "Found 1 unrecognized skills - using generic plan"
- ✅ **NO ERROR!** System gracefully handles unknown skills

---

### **Test 5: Get All Categories**

```bash
curl http://localhost:5000/api/categories
```

**Expected:** All 4 categories with their skills and descriptions

```json
{
  "programming": {
    "description": "Programming Languages & Data Structures",
    "skills": ["Java", "Python", "DSA", ...]
  },
  "ai": {
    "description": "Artificial Intelligence & Machine Learning",
    "skills": ["Machine Learning", "Agentic AI", ...]
  },
  ...
}
```

---

### **Test 6: Get Filtered Questions**

#### **By Skill:**

```bash
curl "http://localhost:5000/api/questions?skill=Java"
```

#### **By Category:**

```bash
curl "http://localhost:5000/api/questions?category=ai"
```

#### **By Difficulty:**

```bash
curl "http://localhost:5000/api/questions?difficulty=basic"
```

#### **Combined Filters:**

```bash
curl "http://localhost:5000/api/questions?skill=Java&difficulty=intermediate"
```

---

### **Test 7: Get All Available Skills**

```bash
curl http://localhost:5000/api/skills
```

**Expected:**

```json
{
  "programming": ["Java", "Python", "DSA", ...],
  "ai": ["Machine Learning", "Agentic AI", ...],
  "service": ["Aptitude", "Communication", ...],
  "core": ["DBMS", "OS", "CN", ...]
}
```

---

## 🎯 Validation Checklist

- [ ] **Skill Recognition**: All skills mapped to correct categories
- [ ] **Dynamic Questions**: Questions filtered based on input skills
- [ ] **Weekly Plan**: Generated for all weeks
- [ ] **Unknown Skills**: Handled gracefully without errors
- [ ] **Mixed Categories**: Plan combines topics from all categories
- [ ] **API Responses**: All endpoints return proper JSON
- [ ] **Questions.json**: Loads successfully (check server logs)
- [ ] **Error Handling**: Invalid input returns meaningful errors

---

## 🚨 Troubleshooting

### **Problem: "Cannot find module questions.json"**

**Solution:** Make sure `questions.json` is in the same directory as `server.js`

### **Problem: Skills not being recognized**

**Solution:** Ensure skill names match exactly (case-insensitive, but check spelling)

- ✅ "Machine Learning" (correct)
- ❌ "machinelearning" (wrong - but our code handles this!)
- ❌ "ML" (wrong - add alias support if needed)

### **Problem: Empty questions array**

**Solution:**

- Check if questions.json is malformed JSON
- Ensure question skills match the skills you're sending

---

## 📊 Sample Response (Test 2: AI Skills)

```json
{
  "plan": [
    {
      "week": 1,
      "title": "Week 1: Preparation Plan",
      "topics": [
        "What is AI and ML?",
        "Supervised vs Unsupervised Learning",
        "Key concepts",
        "Applications",
        "Practice problems from your skills",
        "Review concepts learned",
        "Work on mini projects"
      ],
      "categories": ["ai"]
    },
    {
      "week": 2,
      "title": "Week 2: Preparation Plan",
      "topics": [
        "Common algorithms",
        "Training models",
        "Evaluation metrics",
        "Model selection",
        "Practice problems from your skills",
        "Review concepts learned",
        "Work on mini projects"
      ],
      "categories": ["ai"]
    }
  ],
  "recognizedSkills": ["Machine Learning", "Agentic AI", "Generative AI"],
  "unrecognizedSkills": [],
  "questions": {
    "bySkill": {
      "Machine Learning": [
        "What is supervised learning?",
        "Explain the difference between supervised and unsupervised learning.",
        "What are neural networks?",
        "What is cross-validation?"
      ],
      "Agentic AI": [
        "What is an AI agent?",
        "How do AI agents make decisions?",
        "What are multi-agent systems?"
      ],
      "Generative AI": [
        "What is generative AI?",
        "How do Large Language Models (LLMs) work?",
        "What is fine-tuning in generative models?"
      ]
    },
    "byDifficulty": {
      "basic": [
        {...},
        {...}
      ],
      "intermediate": [...],
      "advanced": [...]
    },
    "all": [...]
  },
  "summary": {
    "totalQuestions": 10,
    "skillsToLearn": 3,
    "weeksOfPreparation": 4,
    "message": "✅ Successfully mapped all 3 skills!"
  }
}
```

---

## 🎓 Key Points to Verify

1. **No hardcoded if-else logic** ✅ - Now uses dynamic categorization
2. **Handles multiple skills** ✅ - Test 1, 2, 3 verify this
3. **Supports emerging tech** ✅ - Test 2 (AI skills)
4. **Graceful error handling** ✅ - Test 4 (unknown skills)
5. **Questions loaded from JSON** ✅ - Check server logs
6. **Dynamic weekly plans** ✅ - All tests show different plans
7. **Multiple endpoints** ✅ - Tests 5, 6, 7 verify API coverage

---

## 🎉 Final Test: Add a New Skill in 30 Seconds

### Without restarting server:

1. **Edit questions.json** - Add a new question:

```json
{
  "id": 100,
  "skill": "Docker",
  "category": "core",
  "difficulty": "basic",
  "question": "What is a Docker container?"
}
```

2. **Restart server** (only needed to reload JSON):

```bash
node server.js
```

3. **Test with new skill:**

```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{"skills": ["Docker"], "weeks": 2}'
```

4. **Result:**

- ✅ Docker recognized (core category)
- ✅ 2-week plan generated
- ✅ Question about Docker included
- ✅ **All without touching server code!**

---

🎊 **Your dynamic system is working perfectly!**
