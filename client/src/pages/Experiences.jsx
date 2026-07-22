import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronDown, ChevronUp, Star, Building2, Search, Lightbulb } from "lucide-react";

const EXPERIENCES = [
  {
    id: 1,
    company: "TCS",
    type: "service",
    role: "Software Engineer Trainee",
    package: "3.36 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "TCS NQT — Online Test", duration: "180 min", content: "3 sections: Verbal Ability (24 Qs, 20 min), Reasoning Ability (30 Qs, 50 min), Numerical Ability (26 Qs, 40 min). Speed matters more than perfection. No negative marking. Coding section was separate — 1 easy + 1 medium problem." },
      { name: "Technical Interview", duration: "30–45 min", content: "Asked about my final year project, OOP concepts (inheritance, polymorphism with examples), basic Java (HashMap vs HashTable, exception handling), SQL queries — find 2nd highest salary, left join explanation. No DSA — just core CS fundamentals." },
      { name: "HR Round", duration: "20 min", content: "Tell me about yourself, strengths/weaknesses, why TCS, relocation flexibility, expected CTC, where you see yourself in 5 years. Very conversational — just be confident and honest." },
    ],
    tips: [
      "Practice IndiaBix aptitude for NQT — the pattern repeats every year.",
      "For technical: revise OOP, DBMS basics, one programming language deeply.",
      "HR is mostly elimination round — dress well, speak clearly, be positive.",
      "The NQT cutoff is usually 60–65%. Don't overthink, maintain speed.",
    ],
    difficulty: "Easy",
    verdict: "Strong in aptitude + basic CS. No advanced DSA needed.",
  },
  {
    id: 2,
    company: "Infosys",
    type: "service",
    role: "Systems Engineer",
    package: "3.6 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "InfyTQ / Hackwithinfy — Online", duration: "150 min", content: "Aptitude (15 Qs), Logical Reasoning (10 Qs), Verbal Ability (20 Qs), Coding (2 problems — easy to medium). If you clear HackWithInfy with good coding score you get a higher band (SP/SSP = 6.25/9.5 LPA)." },
      { name: "Technical + HR (single round)", duration: "60 min", content: "Started with project explanation, then Java questions (streams, collections, multithreading basics), asked to write code on paper for string reversal without inbuilt functions, SQL — inner vs outer join with example, then directly HR questions in same round." },
    ],
    tips: [
      "HackWithInfy coding performance directly affects your salary band — practice LeetCode easy/medium.",
      "Java 8 features (streams, lambda, Optional) are asked very frequently.",
      "Prepare to write code on paper — whiteboard coding is common.",
      "Projects: know every line of your project — they ask deep technical questions.",
    ],
    difficulty: "Easy",
    verdict: "Better Java knowledge = higher band. Coding matters here more than TCS.",
  },
  {
    id: 3,
    company: "Accenture",
    type: "service",
    role: "Associate Software Engineer",
    package: "4.5 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "Cognitive + Technical Assessment", duration: "90 min", content: "3 sections: Cognitive Ability (MCQ — reasoning, data interpretation), Technical (C++/Java/Python MCQs — output-based, OS, DBMS basics), Communication Assessment (essay writing + email writing). The comms test is unique to Accenture — practice writing professionally." },
      { name: "Technical Interview", duration: "40 min", content: "Asked about C++ vs Java, OOPS with code examples, basic data structures (when to use array vs linked list), REST API concepts, what happens when you type a URL in browser. Moderate difficulty — not very deep." },
      { name: "HR Round", duration: "20 min", content: "Behavioral questions focused on teamwork, handling pressure, learning agility. STAR method answers worked well. Asked about hybrid work model comfort." },
    ],
    tips: [
      "Communication assessment is elimination — write 150+ words, no grammar mistakes.",
      "Output-based MCQs: practice C/Java code tracing thoroughly.",
      "Accenture values communication over deep technical knowledge.",
      "Research Accenture's recent projects/news before the HR round.",
    ],
    difficulty: "Easy",
    verdict: "Communication skills are the differentiator here over pure technical depth.",
  },
  {
    id: 4,
    company: "Wipro",
    type: "service",
    role: "Project Engineer",
    package: "3.5 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "NLTH Online Test", duration: "120 min", content: "Online aptitude (quant + verbal + reasoning) — 60 mins, then Coding Test — 60 mins with 2 problems. Difficulty is similar to TCS NQT. Wipro Elite stream requires a good coding score for 6.5 LPA package." },
      { name: "Technical Interview", duration: "45 min", content: "Questions about Python (decorators, list vs tuple vs dict), DBMS (ACID, normalization), written SQL query to find employees with salary > dept average. Discussed about my project architecture — why I chose certain technologies." },
      { name: "HR Interview", duration: "25 min", content: "Standard HR: about yourself, achievements, failure story (STAR), expected salary, shift flexibility." },
    ],
    tips: [
      "Elite stream cutoff is stricter — practice coding problems to get 3–4 LPA bump.",
      "Python is preferred language here — practice Python-specific interview questions.",
      "Know your project inside out — architecture decisions, tech choices, challenges faced.",
      "Wipro HR is relaxed but they check stability — avoid saying you want to leave in 1 year.",
    ],
    difficulty: "Easy",
    verdict: "Similar to TCS pattern. Python knowledge gives extra edge.",
  },
  {
    id: 5,
    company: "Cognizant",
    type: "service",
    role: "Programmer Analyst Trainee",
    package: "4 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "GenC Online Test", duration: "90 min", content: "Aptitude (quant + verbal), Coding (2 problems). GenC Next and GenC Elevate have harder coding rounds with DSA. For regular GenC, easy coding is sufficient — reverse string, palindrome, basic patterns." },
      { name: "Technical Interview", duration: "40 min", content: "OOP concepts (with real examples), difference between overloading vs overriding (with code), exception hierarchy in Java, basic SQL (group by, having clause difference from where). Asked to explain my internship/project work." },
      { name: "HR Round", duration: "20 min", content: "Why Cognizant, relocation, long-term goals. They specifically asked about commitment to the company for at least 2 years." },
    ],
    tips: [
      "GenC Next/Elevate pays better — practice LeetCode easy to qualify for those tracks.",
      "Exception handling in Java is a favorite topic — know checked vs unchecked thoroughly.",
      "Having clause vs Where clause — classic SQL question, prepare with examples.",
      "Cognizant bond: there may be a 1-year training bond, clarify before accepting.",
    ],
    difficulty: "Medium",
    verdict: "Higher coding skills = better track = better package. Worth preparing DSA basics.",
  },
  {
    id: 6,
    company: "Amazon",
    type: "product",
    role: "SDE-1",
    package: "32–44 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "Online Assessment (OA)", duration: "90 min", content: "2 coding problems (medium to hard LeetCode difficulty) + work simulation scenario (LP-based situational questions). Problems are timed. I got: sliding window maximum + a DP problem. Work simulation is elimination — choose answers aligned with Amazon LPs." },
      { name: "Phone Screen", duration: "60 min", content: "1 coding problem (medium) + LP question. Problem was designing an iterator for a flattened list. Explained brute force first, then optimized. LP: Tell me about a time you delivered results under pressure (Deliver Results LP)." },
      { name: "Loop Interview 1 — DSA", duration: "60 min", content: "Two pointer problem on arrays. After solving, asked to optimize further, then asked about edge cases. Then an LP question: Describe a project where you took ownership end-to-end." },
      { name: "Loop Interview 2 — System Design", duration: "60 min", content: "Design Amazon's order tracking system — handle millions of orders, real-time status updates. Discussed Kafka for events, DynamoDB for orders, Redis for caching, WebSocket for real-time." },
      { name: "Loop Interview 3 — LP + Coding", duration: "60 min", content: "Heavy LP focus — 3 LP questions (Customer Obsession, Invent and Simplify, Hire and Develop the Best). 1 medium coding problem — word break using DP. LPs took 40 mins." },
      { name: "Bar Raiser", duration: "60 min", content: "Toughest round — behavioral depth + hard coding. Problem: median of stream (two heaps). LP: a time you disagreed with your team and how you handled it. They push back on your answers to test depth." },
    ],
    tips: [
      "Prepare 2 stories for each of the 16 Leadership Principles — they will be asked.",
      "For DSA: solve all Blind 75 + Amazon tagged problems on LeetCode.",
      "System design: start with requirements clarification — interviewers want you to ask questions.",
      "STAR format is mandatory for LPs — practice out loud until it feels natural.",
      "Bar raiser can be from any team — they focus on LPs and raising the bar, not just technical.",
      "Coding: always explain your thought process as you code — silence is a red flag.",
    ],
    difficulty: "Hard",
    verdict: "LP preparation is as important as DSA. You must master both to clear Amazon.",
  },
  {
    id: 7,
    company: "Microsoft",
    type: "product",
    role: "SDE-1",
    package: "40–50 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "Online Assessment", duration: "75 min", content: "2 coding problems — one easy (string manipulation) and one medium (BST problem). Platform: Codility or HackerRank. Code must be syntactically and logically correct for full marks." },
      { name: "Technical Interview 1", duration: "60 min", content: "LLD focus — design a parking lot (class diagram, relationships). Then a coding problem: serialize/deserialize binary tree. Interviewer was collaborative — hints were given when stuck." },
      { name: "Technical Interview 2 — DSA", duration: "60 min", content: "Two problems: clone a linked list with random pointers, then find all paths in a binary tree with given sum. Discussed time complexity deeply for each solution." },
      { name: "Technical Interview 3 — Concepts", duration: "60 min", content: "OOP design principles (SOLID), difference between process and thread, how does virtual memory work, what happens in a database when you execute a transaction. No coding — pure conceptual depth." },
      { name: "HR / Hiring Manager", duration: "45 min", content: "Growth mindset questions — what do you do when you fail, how do you learn new things, collaboration examples. Microsoft values 'learn-it-all' over 'know-it-all'." },
    ],
    tips: [
      "LLD (Low Level Design) is important — practice designing parking lot, elevator, LRU cache.",
      "Microsoft interviews are collaborative — if stuck, say so and ask for hints.",
      "Concepts round: revise OS (process/thread, virtual memory), DBMS (transactions), networking basics.",
      "Growth mindset answers: always end with 'what I learned and what I changed after.'",
      "Write clean, readable code — they value code quality as much as correctness.",
    ],
    difficulty: "Hard",
    verdict: "More balanced than Amazon — DSA + LLD + OS/DBMS concepts are all tested.",
  },
  {
    id: 8,
    company: "Flipkart",
    type: "product",
    role: "SDE-1",
    package: "30–40 LPA",
    year: "2024",
    result: "Selected",
    rounds: [
      { name: "Online Coding Test", duration: "90 min", content: "3 problems — 1 easy, 1 medium, 1 hard. I got: array rotation (easy), LRU cache implementation (medium), word break with constraints (hard). Partial scoring for partial solutions." },
      { name: "Machine Coding Round", duration: "90 min", content: "Build a working console application in your preferred language — I got 'design a splitwise-like expense splitter'. Must be fully functional, modular, clean code. This round is unique to Flipkart and heavy on OOP design." },
      { name: "Technical Interview 1 — DSA", duration: "60 min", content: "Median of two sorted arrays (hard), then discussed the approach alternatives. Explained BST vs heap — when to use each. Asked about graphs — Dijkstra's time complexity." },
      { name: "Technical Interview 2 — System Design", duration: "60 min", content: "Design Flipkart's flash sale system — handle 10M concurrent users for 100 items. Discussed Redis for inventory, Kafka for orders, rate limiting with token bucket, CQRS pattern." },
      { name: "HR Round", duration: "30 min", content: "Culture fit — startup mindset, ownership, handling ambiguous requirements, speed vs quality trade-offs." },
    ],
    tips: [
      "Machine coding round is the most unique and hardest to prepare — practice building small apps with clean OOP in 90 mins.",
      "Flipkart focuses heavily on system design for scale — learn e-commerce specific patterns.",
      "DSA difficulty is on par with Amazon — Blind 75 is the minimum preparation.",
      "Code quality in machine coding is as important as functionality — use design patterns.",
      "System design: always mention monitoring, logging, and alerting — shows production thinking.",
    ],
    difficulty: "Hard",
    verdict: "Machine coding round is the differentiator. Practice building apps, not just solving puzzles.",
  },
];

const DIFF_COLORS = {
  Easy: "badge-green",
  Medium: "badge-yellow",
  Hard: "badge-orange",
};

const RESULT_COLORS = {
  Selected: "text-accent-green bg-accent-green/10 border border-accent-green/30",
  Rejected: "text-red-400 bg-red-500/10 border border-red-500/30",
};

export function Experiences() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [expandedRound, setExpandedRound] = useState({});

  const filtered = EXPERIENCES.filter((e) => {
    const matchSearch = !search || e.company.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.type === filter || e.difficulty.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const toggleRound = (expId, ri) => {
    const key = `${expId}-${ri}`;
    setExpandedRound((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title mb-1">Interview Experiences</h1>
        <p className="text-text-muted text-sm">Real interview experiences from students — round by round breakdown with tips.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input pl-9" placeholder="Search company or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "product", label: "Product" },
            { key: "service", label: "Service" },
            { key: "easy", label: "Easy" },
            { key: "hard", label: "Hard" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                filter === key ? "bg-brand-600 border-brand-600 text-white" : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-muted">{filtered.length} experiences</p>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((exp, i) => {
          const isOpen = expanded === exp.id;
          return (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card overflow-hidden"
            >
              {/* Header */}
              <button className="w-full flex items-start gap-4 p-5 text-left hover:bg-surface-3 transition-colors"
                onClick={() => setExpanded(isOpen ? null : exp.id)}
              >
                <div className="w-11 h-11 bg-surface-3 border border-border rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {exp.company === "Amazon" ? "🛒" : exp.company === "Microsoft" ? "🪟" : exp.company === "Flipkart" ? "🛍️" : "🏢"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-text-primary">{exp.company}</h3>
                    <span className={`badge text-xs ${DIFF_COLORS[exp.difficulty]}`}>{exp.difficulty}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESULT_COLORS[exp.result]}`}>{exp.result}</span>
                    <span className="text-xs text-text-muted ml-auto">{exp.year}</span>
                  </div>
                  <p className="text-sm text-text-secondary">{exp.role}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-accent-green font-medium">💰 {exp.package}</span>
                    <span className="text-xs text-text-muted">{exp.rounds.length} rounds</span>
                    <span className={`text-xs badge ${exp.type === "product" ? "badge-blue" : "badge-orange"}`}>
                      {exp.type === "product" ? "Product" : "Service"}
                    </span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0 mt-1" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"
                  >
                    <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                      {/* Verdict */}
                      <div className="p-3 bg-brand-600/10 border border-brand-600/20 rounded-xl text-sm text-brand-300">
                        <span className="font-semibold text-brand-400">Verdict: </span>{exp.verdict}
                      </div>

                      {/* Rounds */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-text-primary">Interview Rounds</h4>
                        {exp.rounds.map((round, ri) => {
                          const key = `${exp.id}-${ri}`;
                          const open = expandedRound[key];
                          return (
                            <div key={ri} className="bg-surface-3 rounded-xl border border-border overflow-hidden">
                              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-4 transition-colors"
                                onClick={() => toggleRound(exp.id, ri)}
                              >
                                <span className="w-6 h-6 bg-brand-600/20 text-brand-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {ri + 1}
                                </span>
                                <span className="flex-1 text-sm font-medium text-text-primary">{round.name}</span>
                                <span className="text-xs text-text-muted mr-2">{round.duration}</span>
                                {open ? <ChevronUp className="w-3.5 h-3.5 text-text-muted shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />}
                              </button>
                              <AnimatePresence>
                                {open && (
                                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="px-4 pb-3 pt-1 text-sm text-text-secondary leading-relaxed border-t border-border">
                                      {round.content}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tips */}
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-accent-yellow" />
                          Tips from Experience
                        </h4>
                        <div className="space-y-2">
                          {exp.tips.map((tip, ti) => (
                            <div key={ti} className="flex items-start gap-2 text-sm text-text-muted">
                              <span className="text-accent-yellow mt-0.5 flex-shrink-0">✦</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
