const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const companyRequirements = {
  product: ["dsa", "system design", "dbms", "oop"],
  service: ["aptitude", "java", "sql", "communication"],
  startup: ["javascript", "react", "node", "api"]
};

const data = {
  roadmap: {
    product: [
      {
        title: "Data Structures & Algorithms",
        points: [
          "Arrays, Linked Lists, Stacks, Queues",
          "Binary Trees and Graphs",
          "Dynamic Programming",
          "Practice problems on LeetCode"
        ]
      },
      {
        title: "System Design",
        points: [
          "Scalability basics",
          "Design patterns",
          "Microservices vs Monolith",
          "Practice system design questions"
        ]
      },
      {
        title: "Core CS",
        points: [
          "DBMS concepts",
          "Operating Systems",
          "Computer Networks",
          "OOP principles"
        ]
      }
    ],

  service: [
    {
      title: "Aptitude",
      points: [
        "Quantitative aptitude",
        "Logical reasoning",
        "Verbal ability",
        "Daily mock tests"
      ]
    },
    {
      title: "Programming Basics",
      points: [
        "Java / Python fundamentals",
        "Basic coding problems",
        "Understanding algorithms",
        "Practice HackerRank problems"
      ]
    },
    {
      title: "Interview Preparation",
      points: [
        "HR interview questions",
        "Communication skills",
        "Group discussion practice",
        "Resume preparation"
      ]
    }
  ]
},
  questions: {
    dsa: [
    "Explain time complexity with examples.",
    "What is a binary search tree?",
    "Difference between stack and queue.",
    "How does quicksort work?"
  ],

    dbms: [
    "What is normalization?",
    "Explain ACID properties.",
    "Difference between SQL and NoSQL.",
    "What is indexing?"
  ],

    javascript: [
    "Explain closures in JavaScript.",
    "What is event delegation?",
    "Difference between var, let and const.",
    "What is async/await?"
  ],

    react: [
    "What are React hooks?",
    "Difference between state and props.",
    "Explain virtual DOM.",
    "What is useEffect?"
  ],

    python: [
    "What is a list in Python?",
    "What is the difference between list and tuple?",
    "Explain Python decorators.",
    "What is a lambda function in Python?",
    "What is the purpose of virtual environments?"
  ],
    java: [
    "What is JVM?",
    "Explain inheritance in Java.",
    "What is the difference between interface and abstract class?",
    "What is multithreading in Java?",
    "What is method overloading vs overriding?",
    "What is the difference between String, StringBuffer, and StringBuilder?",
    "Explain the Collections framework.",
    "What is exception handling?",
    "Explain Java memory management.",
    "What is the difference between Comparable and Comparator?",
    "What are streams in Java?",
    "Explain varargs in Java.",
    "What is the volatile keyword?",
    "What is the transient keyword?",
    "Explain the super keyword.",
    "What is the this keyword?"
  ],
    sql: [
    "What is a PRIMARY KEY?",
    "Difference between SQL and NoSQL.",
    "What are JOINS? Explain different types.",
    "What is normalization?",
    "Explain ACID properties in SQL.",
    "What is indexing and why is it important?",
    "What is a sub-query?",
    "Difference between UNION and UNION ALL.",
    "What are triggers in SQL?",
    "Explain GROUP BY and HAVING clauses."
  ],
    aptitude: [
    "What is simple interest?",
    "How do you calculate compound interest?",
    "What is the formula for profit and loss?",
    "How do you solve speed and distance problems?",
    "What is the time-work formula?",
    "Explain ratios and proportions.",
    "How do you solve percentage problems?",
    "What is permutation and combination?",
    "How do you calculate probability?",
    "Explain logical reasoning patterns.",
    "What is average and how do you calculate it?",
    "Explain the HCF and LCM concept.",
    "How do you solve age-related problems?",
    "What is simple equation solving?",
    "Explain mensuration formulas.",
    "How do you approach data interpretation?"
  ],
    oop: [
    "What are the four pillars of OOP?",
    "Explain encapsulation with an example.",
    "What is inheritance? Types of inheritance.",
    "What is polymorphism? Explain with examples.",
    "Difference between abstract class and interface.",
    "What is composition vs aggregation?",
    "Explain operator overloading.",
    "What is the purpose of the 'super' keyword?",
    "What is method overriding?",
    "Explain the 'this' keyword in OOP."
  ],
    communication: [
    "How do you handle conflicts in a team?",
    "Tell me about your strongest leadership quality.",
    "How do you manage time effectively?",
    "Describe a time you failed and what you learned.",
    "How do you explain technical concepts to non-technical people?",
    "What is your communication style?",
    "How do you handle criticism?",
    "Explain your teamwork experience.",
    "How do you stay motivated?",
    "What is your approach to problem-solving?",
    "How do you build trust in a team?",
    "Describe a successful project you worked on.",
    "How do you handle a difficult colleague?",
    "What is your experience with cross-functional teams?",
    "How do you prioritize tasks and communicate deadlines?",
    "Explain a time you had to learn something new quickly."
  ],
    node: [
    "What is Node.js?",
    "Explain the event-driven architecture in Node.js.",
    "What is the difference between callbacks and promises?",
    "Explain async/await in Node.js.",
    "What is middleware?",
    "Explain the Express framework.",
    "What are streams in Node.js?",
    "How do you handle errors in Node.js?",
    "What is npm?",
    "Explain the module system in Node.js."
  ],
    api: [
    "What is REST API?",
    "Explain HTTP methods: GET, POST, PUT, DELETE.",
    "What is the difference between SOAP and REST?",
    "What are status codes?",
    "Explain API authentication and authorization.",
    "What is API versioning?",
    "Explain request and response in APIs.",
    "What is rate limiting?",
    "Explain caching in APIs.",
    "What is API documentation?"
  ],
    "system design": [
    "What is scalability?",
    "Explain load balancing.",
    "What is a database sharding strategy?",
    "Explain caching strategies.",
    "What is eventual consistency?",
    "Explain microservices vs monolithic architecture.",
    "What is horizontal vs vertical scaling?",
    "Explain CAP theorem.",
    "What is a message queue?",
    "Explain system design interview approach."
  ],
     web: [
    "What is the DOM?",
    "What is the difference between HTML and HTML5?",
    "Explain REST APIs.",
    "What is responsive design?",
    "What is the difference between var, let, and const?"
  ],
    technical: [
      "What is the difference between stack and queue?",
      "Explain DBMS normalization with an example.",
      "What is the difference between process and thread?",
      "What are the four pillars of OOP?",
      "What is the purpose of indexing in SQL?",
      "Explain time complexity of binary search.",
      "What is REST API and how does it work?"
    ],
    hr: [
      "Tell me about yourself.",
      "Why should we hire you?",
      "What are your strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "Why do you want to join our company?",
      "Describe a challenge you faced and how you solved it."
    ]
  },
  resources: [
    { name: "DSA Practice", desc: "LeetCode, HackerRank, CodeStudio" },
    { name: "Aptitude", desc: "IndiaBix, Testbook, mock tests" },
    { name: "Core CS", desc: "DBMS, OS, CN, OOP short notes" },
    { name: "Resume", desc: "One-page ATS-friendly resume format" }
  ]
};

// Generate week-by-week roadmap
function generateWeeklyRoadmap(companyType, weeks) {
  const weeklyRoadmap = [];
  const baseRoadmap = data.roadmap[companyType] || data.roadmap.product;
  
  // Weekly focus areas for different company types
  const weeklyFocus = {
    product: [
      { title: "Week 1: DSA Fundamentals", topics: ["Arrays, Linked Lists", "Basic problem-solving", "Time Complexity basics", "LeetCode Easy problems"] },
      { title: "Week 2: Advanced DSA", topics: ["Stacks and Queues", "Trees and Binary Search Trees", "Graph Basics", "Medium-level problems"] },
      { title: "Week 3: Algorithm Optimization", topics: ["Sorting algorithms", "Dynamic Programming intro", "Complex problem solving", "Mock interviews"] },
      { title: "Week 4: System Design", topics: ["Scalability concepts", "Database design", "API design", "Architecture patterns"] },
      { title: "Week 5: Core CS - DBMS & OS", topics: ["Database normalization", "Transactions and ACID", "Process management", "Memory management"] },
      { title: "Week 6: Core CS - Networks & OOP", topics: ["Network protocols", "OSI model", "OOP principles", "Design patterns"] },
      { title: "Week 7: Deep Dive Prep", topics: ["Advanced problem solving", "System design projects", "Code optimization", "Edge cases"] },
      { title: "Week 8: Final Polish", topics: ["Revision and practice", "Mock interview 1", "Mock interview 2", "Confidence building"] }
    ],
    service: [
      { title: "Week 1: Aptitude Foundation", topics: ["Quantitative basics", "Number systems", "Percentages and ratios", "Daily practice problems"] },
      { title: "Week 2: Advanced Aptitude", topics: ["Speed and distances", "Time and work", "Profit and loss", "Complex calculations"] },
      { title: "Week 3: Logical Reasoning", topics: ["Series and patterns", "Logical statements", "Puzzles", "Analytical thinking"] },
      { title: "Week 4: Java Fundamentals", topics: ["OOP concepts", "Collections framework", "Exception handling", "String manipulation"] },
      { title: "Week 5: SQL & Database", topics: ["Basic queries", "Joins and relationships", "Aggregation functions", "Database design"] },
      { title: "Week 6: Communication Skills", topics: ["Complex sentence structure", "Technical writing", "Group discussion prep", "Reading comprehension"] },
      { title: "Week 7: HR Interview Prep", topics: ["Self introduction", "STAR method", "Behavioral questions", "Company research"] },
      { title: "Week 8: Final Revision", topics: ["Aptitude mock test", "Interview simulation", "Resume practice", "Confidence building"] }
    ]
  };

  const selectedFocus = weeklyFocus[companyType] || weeklyFocus.product;

  // Generate roadmap for each week requested
  for (let i = 0; i < Math.min(weeks, selectedFocus.length); i++) {
    weeklyRoadmap.push({
      title: selectedFocus[i].title,
      points: selectedFocus[i].topics
    });
  }

  return weeklyRoadmap;
}

// Generate skill-specific weekly breakdowns
function generateSkillWeeklyContent(skill, weeks) {
  const skillWeeklyContent = {
    java: [
      { week: 1, title: "Java Basics", topics: ["Variables and data types", "Operators and control flow", "Basic syntax", "First Java program"] },
      { week: 2, title: "OOP Fundamentals", topics: ["Classes and objects", "Encapsulation", "Inheritance", "Polymorphism basics"] },
      { week: 3, title: "Advanced OOP", topics: ["Abstract classes", "Interfaces", "Method overriding", "Composition vs Inheritance"] },
      { week: 4, title: "Collections Framework", topics: ["Lists, Sets, Maps", "Iterators", "Sorting collections", "Performance considerations"] },
      { week: 5, title: "Exception Handling", topics: ["Try-catch blocks", "Custom exceptions", "Exception propagation", "Best practices"] },
      { week: 6, title: "Advanced Java Concepts", topics: ["Threads and synchronization", "Generics", "Lambda expressions", "Stream API"] },
      { week: 7, title: "File I/O & Serialization", topics: ["File operations", "Streams", "Serialization", "Buffering"] },
      { week: 8, title: "Java Interview Prep", topics: ["Common interview questions", "Coding practice", "Performance optimization", "Mock interviews"] }
    ],
    sql: [
      { week: 1, title: "SQL Basics", topics: ["SELECT and WHERE", "Basic queries", "Data types", "Table structure"] },
      { week: 2, title: "Joins & Relationships", topics: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "Complex joins"] },
      { week: 3, title: "Aggregation & Grouping", topics: ["COUNT, SUM, AVG", "GROUP BY", "HAVING clause", "Aggregate functions"] },
      { week: 4, title: "Subqueries & Advanced Queries", topics: ["Nested queries", "Correlated subqueries", "UNION operations", "Set operations"] },
      { week: 5, title: "Database Design & Normalization", topics: ["1NF, 2NF, 3NF", "Schema design", "Foreign keys", "Constraints"] },
      { week: 6, title: "Indexing & Performance", topics: ["Index types", "Query optimization", "Execution plans", "Performance tuning"] },
      { week: 7, title: "Transactions & Concurrency", topics: ["ACID properties", "Transaction isolation", "Locking", "Deadlocks"] },
      { week: 8, title: "SQL Interview Prep", topics: ["Complex queries", "Real-world scenarios", "Performance problems", "Mock interviews"] }
    ],
    dsa: [
      { week: 1, title: "Arrays & Strings", topics: ["Array operations", "String manipulation", "Two-pointer technique", "Easy problems"] },
      { week: 2, title: "Linked Lists & Stacks", topics: ["Linked list operations", "Stack applications", "Reverse operations", "Medium problems"] },
      { week: 3, title: "Queues & Trees", topics: ["Queue operations", "Binary trees", "Tree traversal", "Hard problems"] },
      { week: 4, title: "Graphs & BFS", topics: ["Graph representation", "BFS algorithm", "Connected components", "Shortest path"] },
      { week: 5, title: "DFS & Advanced Graphs", topics: ["DFS algorithm", "Topological sort", "Cycle detection", "Graph coloring"] },
      { week: 6, title: "Dynamic Programming", topics: ["DP concepts", "Memoization", "Tabulation", "Common patterns"] },
      { week: 7, title: "Advanced Algorithms", topics: ["Greedy algorithms", "Backtracking", "Bit manipulation", "Complex problem solving"] },
      { week: 8, title: "DSA Interview Prep", topics: ["Coding interview simulations", "Time complexity analysis", "Optimization techniques", "Mock contests"] }
    ],
    python: [
      { week: 1, title: "Python Basics", topics: ["Variables and types", "Operators", "Control flow", "Functions"] },
      { week: 2, title: "Data Structures", topics: ["Lists and tuples", "Dictionaries and sets", "List comprehension", "Iteration"] },
      { week: 3, title: "Functions & Modules", topics: ["Function definitions", "Decorators", "Modules and imports", "Lambda functions"] },
      { week: 4, title: "Object-Oriented Programming", topics: ["Classes and objects", "Inheritance", "Polymorphism", "Magic methods"] },
      { week: 5, title: "Error Handling & File I/O", topics: ["Exception handling", "File operations", "Context managers", "JSON/CSV handling"] },
      { week: 6, title: "Advanced Python", topics: ["Generators", "Iterators", "Metaclasses", "Property decorators"] },
      { week: 7, title: "Libraries & Frameworks", topics: ["NumPy basics", "Pandas basics", "Regular expressions", "Datetime"] },
      { week: 8, title: "Python Interview Prep", topics: ["Coding questions", "Algorithm implementation", "Optimization", "Mock interviews"] }
    ],
    react: [
      { week: 1, title: "React Fundamentals", topics: ["JSX syntax", "Components and props", "Virtual DOM", "Creating first component"] },
      { week: 2, title: "State Management", topics: ["useState hook", "Component state", "Props vs state", "Lifting state up"] },
      { week: 3, title: "Lifecycle & Effects", topics: ["useEffect hook", "Component lifecycle", "Cleanup functions", "Dependencies"] },
      { week: 4, title: "Advanced Hooks", topics: ["useContext", "useReducer", "Custom hooks", "Hook rules"] },
      { week: 5, title: "Forms & Validation", topics: ["Form handling", "Input validation", "Form libraries", "Error handling"] },
      { week: 6, title: "Performance Optimization", topics: ["React.memo", "useCallback", "useMemo", "Code splitting"] },
      { week: 7, title: "Routing & State Management", topics: ["React Router", "Context API", "State management libraries", "Redux intro"] },
      { week: 8, title: "React Interview Prep", topics: ["Project building", "Testing components", "Performance questions", "Real-world scenarios"] }
    ],
    dbms: [
      { week: 1, title: "DBMS Fundamentals", topics: ["Database concepts", "ACID properties", "Schema design", "ER diagrams"] },
      { week: 2, title: "Normalization", topics: ["1NF, 2NF, 3NF", "BCNF", "Denormalization", "Normal forms"] },
      { week: 3, title: "Indexing & Storage", topics: ["Index structures", "B-trees", "Hashing", "Storage management"] },
      { week: 4, title: "Transactions & Concurrency", topics: ["Transaction control", "Locking mechanisms", "Deadlock handling", "Isolation levels"] },
      { week: 5, title: "Query Optimization", topics: ["Query execution", "Cost-based optimization", "Query plans", "Indexing strategies"] },
      { week: 6, title: "Security & Recovery", topics: ["Authentication and authorization", "Backup and recovery", "Replication", "Disaster recovery"] },
      { week: 7, title: "Advanced Topics", topics: ["NoSQL concepts", "Distributed databases", "Sharding", "CAP theorem"] },
      { week: 8, title: "DBMS Interview Prep", topics: ["Architecture questions", "Problem solving", "Real-world design", "Advanced concepts"] }
    ],
    aptitude: [
      { week: 1, title: "Quantitative Basics", topics: ["Number systems", "Percentages", "Simple interest", "Ratios and proportions"] },
      { week: 2, title: "Advanced Arithmetic", topics: ["Compound interest", "Profit and loss", "Time-work problems", "Speed and distance"] },
      { week: 3, title: "Permutation & Combination", topics: ["Factorial concepts", "Permutations", "Combinations", "Probability basics"] },
      { week: 4, title: "Advanced Probability", topics: ["Complex probability", "Bayes theorem", "Expected value", "Distribution"] },
      { week: 5, title: "Logical Reasoning 1", topics: ["Series and patterns", "Analogy", "Classification", "Logical statements"] },
      { week: 6, title: "Logical Reasoning 2", topics: ["Syllogisms", "Puzzles", "Direction and distance", "Coding-decoding"] },
      { week: 7, title: "Data Interpretation", topics: ["Tables and graphs", "Bar charts", "Pie charts", "Line graphs"] },
      { week: 8, title: "Aptitude Practice", topics: ["Mock tests", "Speed improvement", "Accuracy practice", "Time management"] }
    ],
    oop: [
      { week: 1, title: "OOP Fundamentals", topics: ["Classes and objects", "Encapsulation", "Data hiding", "Abstraction"] },
      { week: 2, title: "Inheritance", topics: ["Single inheritance", "Multiple inheritance", "Multilevel inheritance", "Types of inheritance"] },
      { week: 3, title: "Polymorphism", topics: ["Method overloading", "Method overriding", "Interface based", "Runtime polymorphism"] },
      { week: 4, title: "Advanced Concepts", topics: ["Abstract classes", "Interfaces", "Composition vs inheritance", "Coupling and cohesion"] },
      { week: 5, title: "Design Patterns", topics: ["Creational patterns", "Structural patterns", "Behavioral patterns", "Singleton pattern"] },
      { week: 6, title: "SOLID Principles", topics: ["Single responsibility", "Open/closed principle", "Liskov substitution", "Interface segregation"] },
      { week: 7, title: "Advanced Design", topics: ["Dependency injection", "Factory pattern", "Observer pattern", "MVC architecture"] },
      { week: 8, title: "OOP Interview Prep", topics: ["Complex scenarios", "Real-world design", "Best practices", "Code examples"] }
    ],
    communication: [
      { week: 1, title: "Introduction Skills", topics: ["Self introduction", "Elevator pitch", "Storytelling", "Body language"] },
      { week: 2, title: "Listening & Questions", topics: ["Active listening", "Asking right questions", "Clarification", "Curiosity"] },
      { week: 3, title: "Technical Explanation", topics: ["Simplifying complex concepts", "Audience awareness", "Visual aids", "Technical writing"] },
      { week: 4, title: "Presentation Skills", topics: ["Presentation structure", "Slide design", "Delivery techniques", "Handling questions"] },
      { week: 5, title: "Team Communication", topics: ["Group discussions", "Conflict resolution", "Collaboration", "Feedback"] },
      { week: 6, title: "Leadership Communication", topics: ["Influencing", "Negotiation", "Delegation", "Motivation"] },
      { week: 7, title: "Crisis & Difficult Situations", topics: ["Handling criticism", "Difficult conversations", "Problem-solving discussion", "Empathy"] },
      { week: 8, title: "Communication Practice", topics: ["Mock discussions", "Interview simulation", "Presentation practice", "Soft skills"] }
    ],
    node: [
      { week: 1, title: "Node.js Basics", topics: ["Node architecture", "Event loop", "Non-blocking I/O", "NPM basics"] },
      { week: 2, title: "Module System", topics: ["CommonJS", "Module exports", "Require mechanism", "Core modules"] },
      { week: 3, title: "Callbacks & Promises", topics: ["Callback functions", "Promise creation", "Promise chains", "Promise utilities"] },
      { week: 4, title: "Async/Await", topics: ["Async functions", "Await operator", "Error handling", "Parallel execution"] },
      { week: 5, title: "Express Framework", topics: ["Routing", "Middleware", "Request/response", "Error handling"] },
      { week: 6, title: "Database Integration", topics: ["MongoDB connection", "SQL databases", "ORM/ODM", "Query optimization"] },
      { week: 7, title: "Advanced Features", topics: ["Streams", "Clustering", "Worker threads", "Performance optimization"] },
      { week: 8, title: "Node.js Project", topics: ["API development", "Authentication", "Testing", "Deployment"] }
    ],
    api: [
      { week: 1, title: "REST API Fundamentals", topics: ["HTTP methods", "Status codes", "Resource design", "Request/response"] },
      { week: 2, title: "API Design", topics: ["URL structure", "Query parameters", "Pagination", "Filtering and sorting"] },
      { week: 3, title: "Authentication & Authorization", topics: ["Basic auth", "Bearer tokens", "JWT", "OAuth"] },
      { week: 4, title: "API Versioning & Documentation", topics: ["Versioning strategies", "Swagger/OpenAPI", "Documentation", "Examples"] },
      { week: 5, title: "Error Handling & Validation", topics: ["Error responses", "Input validation", "Error codes", "Custom errors"] },
      { week: 6, title: "Performance & Caching", topics: ["Caching strategies", "ETags", "Rate limiting", "Compression"] },
      { week: 7, title: "Security & Testing", topics: ["CORS", "SQL injection prevention", "HTTPS", "API testing"] },
      { week: 8, title: "Advanced API Topics", topics: ["GraphQL intro", "WebSockets", "Real-time APIs", "API monitoring"] }
    ],
    "systemdesign": [
      { week: 1, title: "System Design Fundamentals", topics: ["Scalability", "Availability", "Performance", "Fault tolerance"] },
      { week: 2, title: "Load Balancing & Caching", topics: ["Load balancing algorithms", "Caching strategies", "CDN", "Cache invalidation"] },
      { week: 3, title: "Database Scaling", topics: ["Sharding", "Replication", "Read replicas", "Master-slave architecture"] },
      { week: 4, title: "NoSQL & Data Stores", topics: ["MongoDB", "Redis", "Elasticsearch", "Data consistency"] },
      { week: 5, title: "Message Queues & Streaming", topics: ["Message brokers", "Kafka", "RabbitMQ", "Event streaming"] },
      { week: 6, title: "Microservices Architecture", topics: ["Service decomposition", "API gateway", "Service discovery", "Circuit breaker"] },
      { week: 7, title: "Distributed Systems", topics: ["CAP theorem", "Consistency models", "Consensus algorithms", "Distributed transactions"] },
      { week: 8, title: "System Design Interview", topics: ["Design a Twitter clone", "Design Instagram", "Large scale systems", "Real-world examples"] }
    ]
  };

  const skillContent = skillWeeklyContent[skill] || 
                       skillWeeklyContent[skill.replace(/\s+/g, "")] || 
                       [];
  const result = [];

  for (let i = 0; i < Math.min(weeks, skillContent.length); i++) {
    result.push({
      title: `${skill.toUpperCase()} - ${skillContent[i].title}`,
      points: skillContent[i].topics
    });
  }

  return result;
}

// Generate week-specific questions
function generateWeeklyQuestions(requiredSkills, weeks, weeklyFocusSkills) {
  const weeklyQuestions = {};

  for (let week = 1; week <= weeks; week++) {
    weeklyQuestions[`week${week}`] = {
      technical: [],
      hr: []
    };

    // Determine which skills to show for this week based on weekly focus
    // If it's a service company, prioritize the focused skill for that week
    let skillsForThisWeek = requiredSkills;
    
    if (weeklyFocusSkills && weeklyFocusSkills[week - 1]) {
      const focusedSkill = weeklyFocusSkills[week - 1];
      // Put focused skill first, then add other required skills
      skillsForThisWeek = [focusedSkill, ...requiredSkills.filter(s => s !== focusedSkill)];
    }

    // Generate technical questions for this week
    skillsForThisWeek.forEach((skill) => {
      let skillKey = skill.toLowerCase();
      
      // Try exact match first, then without spaces
      if (!data.questions[skillKey]) {
        skillKey = skillKey.replace(/\s+/g, "");
      }
      
      if (data.questions[skillKey]) {
        const skillQuestions = data.questions[skillKey];
        const qPerWeek = Math.ceil(skillQuestions.length / weeks);
        const startIdx = (week - 1) * qPerWeek;
        const endIdx = Math.min(startIdx + qPerWeek, skillQuestions.length);
        const weekQuestions = skillQuestions.slice(startIdx, endIdx);
        weeklyQuestions[`week${week}`].technical.push(
          ...weekQuestions.map((q) => `[${skillKey.toUpperCase()}] ${q}`)
        );
      }
    });

    // Generate HR questions for this week
    const hrPerWeek = Math.ceil(data.questions.hr.length / weeks);
    const hrStartIdx = (week - 1) * hrPerWeek;
    const hrEndIdx = Math.min(hrStartIdx + hrPerWeek, data.questions.hr.length);
    weeklyQuestions[`week${week}`].hr = data.questions.hr.slice(hrStartIdx, hrEndIdx);
  }

  return weeklyQuestions;
}

// Generate week-specific checklist items
function generateWeeklyChecklist(weeks) {
  const allChecklistItems = {
    1: ["Prepare self introduction", "Study basic concepts", "Set up development environment", "Review your resume"],
    2: ["Practice easy problems", "Revise data structures", "Mock interview prep", "Update LinkedIn profile"],
    3: ["Practice medium problems", "Review system design basics", "Mock interview session", "Read interview tips"],
    4: ["Practice hard problems", "Complete DSA practice", "Mock interview 2", "Review company details"],
    5: ["Advanced problem solving", "System design deep dive", "Mock interview 3", "Prepare project stories"],
    6: ["Optimize previous solutions", "Study design patterns", "Mock interview 4", "Practice communication"],
    7: ["Revision and practice", "Solve past interview problems", "Mock interview 5", "Mental preparation"],
    8: ["Final revision", "Complete mock interviews", "Relax and confidence", "Final preparation review"]
  };

  const weeklyChecklistItems = {};

  for (let week = 1; week <= weeks; week++) {
    weeklyChecklistItems[`week${week}`] = (allChecklistItems[week] || []).map((item) => ({
      text: item,
      done: false
    }));
  }

  return weeklyChecklistItems;
}

app.post("/api/data", (req, res) => {
  const { companyType, skills, weeks = 4 } = req.body;

  console.log("📥 API Request received:");
  console.log("  - companyType:", companyType);
  console.log("  - skills:", skills);
  console.log("  - weeks:", weeks);

  // Use selected skills to improve - if no skills selected, use company type requirements
  const skillsToImprove = (skills && skills.length > 0) 
    ? skills.map((s) => s.toLowerCase()) 
    : (companyRequirements[companyType] || []);

  console.log("✅ Skills to improve on:", skillsToImprove);

  let suggestedQuestions = [];

  skillsToImprove.forEach((skill) => {
    if (data.questions[skill]) {
      suggestedQuestions = suggestedQuestions.concat(data.questions[skill]);
    }
  });

  // Generate week-by-week roadmap for selected skills
  let weeklyRoadmap;
  weeklyRoadmap = skillsToImprove
    .map(skill => {
      const skillName = skill.toLowerCase();
      if (skillName === "dsa") return { title: "Data Structures & Algorithms", points: ["Arrays, Linked Lists, Stacks, Queues", "Binary Trees and Graphs", "Dynamic Programming", "Practice problems on LeetCode"] };
      if (skillName === "system design") return { title: "System Design", points: ["Scalability basics", "Design patterns", "Microservices vs Monolith", "Practice system design questions"] };
      if (skillName === "dbms") return { title: "DBMS", points: ["Database concepts", "Normalization", "Transactions and ACID", "Query optimization"] };
      if (skillName === "oop") return { title: "OOP Principles", points: ["Classes and Objects", "Inheritance and Polymorphism", "Encapsulation", "Design Patterns"] };
      if (skillName === "aptitude") return { title: "Aptitude", points: ["Quantitative Problem Solving", "Logical Reasoning", "Verbal Ability", "Mock Tests"] };
      if (skillName === "java") return { title: "Java", points: ["OOP Concepts", "Collections Framework", "Exception Handling", "Multithreading"] };
      if (skillName === "sql") return { title: "SQL & Database", points: ["Queries and JOINs", "Normalization", "Transactions", "Query Optimization"] };
      if (skillName === "communication") return { title: "Communication", points: ["Self Introduction", "Technical Explanation", "Group Discussion", "HR Interview"] };
      if (skillName === "javascript") return { title: "JavaScript", points: ["ES6+ Syntax", "DOM Manipulation", "Promises & Async/Await", "Event Handling"] };
      if (skillName === "react") return { title: "React", points: ["Components & JSX", "Hooks", "State Management", "Performance Optimization"] };
      if (skillName === "node") return { title: "Node.js", points: ["Event-Driven Architecture", "Express.js", "Streams", "Middleware"] };
      if (skillName === "api") return { title: "API Design", points: ["REST Principles", "HTTP Methods", "Authentication", "Error Handling"] };
      return null;
    })
    .filter(item => item !== null);
  
  console.log("🔧 Generated weekly roadmap for", weeks, "weeks");
  console.log("✅ Weekly roadmap:", JSON.stringify(weeklyRoadmap, null, 2));

  // Map which skill is focused for each week based on company type
  const weeklyFocusSkillMap = {
    service: ["aptitude", "aptitude", "aptitude", "java", "sql", "communication", "communication", "communication"],
    product: ["dsa", "dsa", "dsa", "system design", "dbms", "oop", "dsa", "technical"],
    startup: ["javascript", "react", "node", "api", "javascript", "react", "node", "api"]
  };

  // Generate weekly focus skills - cycle through selected skills
  let weeklyFocusSkills = [];
  for (let w = 0; w < weeks; w++) {
    weeklyFocusSkills[w] = skillsToImprove[w % skillsToImprove.length];
  }

  // Generate skill-specific weekly content for selected skills
  const skillWeeklyRoadmap = {};
  skillsToImprove.forEach((skill) => {
    const skillName = skill.toLowerCase();
    skillWeeklyRoadmap[skillName] = generateSkillWeeklyContent(skillName, weeks);
  });

  console.log("📚 Generated skill-specific weekly content for:", Object.keys(skillWeeklyRoadmap));

  // Generate week-specific questions for selected skills
  const weeklyQuestions = generateWeeklyQuestions(skillsToImprove, weeks, weeklyFocusSkills);
  console.log("📋 Generated weekly questions for", weeks, "weeks");

  // Generate week-specific checklist
  const weeklyChecklist = generateWeeklyChecklist(weeks);
  console.log("✅ Generated weekly checklist for", weeks, "weeks");

  // Adjust number of questions based on weeks
  const maxQuestions = Math.max(5, Math.ceil((weeks / 4) * suggestedQuestions.length));
  const technicalQuestions = suggestedQuestions.slice(0, maxQuestions);
  
  const maxHRQuestions = Math.max(3, Math.ceil((weeks / 4) * data.questions.hr.length));
  const hrQuestions = data.questions.hr.slice(0, maxHRQuestions);

  console.log("📊 Questions adjusted - Technical:", technicalQuestions.length, ", HR:", hrQuestions.length);

  res.json({
    roadmap: weeklyRoadmap,
    skillRoadmap: skillWeeklyRoadmap,
    weeklyQuestions: weeklyQuestions,
    weeklyChecklist: weeklyChecklist,
    questions: {
      technical: technicalQuestions,
      hr: hrQuestions
    },
    resources: data.resources,
    skillsToImprove: skillsToImprove
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});