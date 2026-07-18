import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle, Circle, Loader2, Sparkles, RotateCcw, Star, TrendingUp, Clock, BookOpen } from "lucide-react";
import { ALL_SKILLS } from "../lib/utils";
import api from "../lib/api";
import toast from "react-hot-toast";
import { ProgressBar } from "../components/ui/ProgressBar";

const COMPANY_PRESETS = {
  product: ["DSA", "System Design", "DBMS", "OOP"],
  service: ["Aptitude", "Java", "Communication", "SQL"],
  startup: ["JavaScript", "React", "Node", "API"],
};

const WEEK_TYPE_COLORS = {
  fundamentals: "border-brand-500 bg-brand-600/10",
  practice:     "border-accent-purple bg-accent-purple/10",
  advanced:     "border-accent-orange bg-accent-orange/10",
  interview:    "border-accent-green bg-accent-green/10",
  generic:      "border-border bg-surface-3",
};

// Rich, detailed topic content per skill per week type
const RICH_TOPICS = {
  DSA: {
    fundamentals: [
      { text: "Arrays & Strings — most frequently tested (40% of coding rounds)", weight: "⭐⭐⭐", tip: "Start here. Practice reversals, rotations, two-pointer problems daily." },
      { text: "Linked List — insert/delete/reverse are must-know patterns", weight: "⭐⭐⭐", tip: "Draw pointer diagrams before coding. Focus on dummy node technique." },
      { text: "Stack & Queue — monotonic stack questions appear in 60% of interviews", weight: "⭐⭐⭐", tip: "Learn to identify when a problem needs a stack (next greater element pattern)." },
      { text: "Big-O Analysis — every interviewer will ask you to explain complexity", weight: "⭐⭐⭐", tip: "Practice explaining time and space complexity for every solution you write." },
      { text: "Recursion fundamentals — base case + trust the recursion", weight: "⭐⭐", tip: "Solve factorial, Fibonacci, power(x,n) to build intuition before trees." },
    ],
    practice: [
      { text: "Binary Trees — traversals (inorder, preorder, postorder) appear in every company", weight: "⭐⭐⭐", tip: "Implement all 3 traversals iteratively and recursively. Practice LCA, diameter." },
      { text: "Binary Search — used in 30% of medium/hard problems, not just sorted arrays", weight: "⭐⭐⭐", tip: "Master the binary search template. Apply it to 'search in rotated array', 'find peak element'." },
      { text: "Hashing — HashMap/HashSet solve O(n²) problems in O(n)", weight: "⭐⭐⭐", tip: "Two-sum pattern. Use frequency maps for anagram, substring problems." },
      { text: "Sliding Window — fixed and variable window patterns", weight: "⭐⭐", tip: "Know when to shrink the window. Practice: longest substring without repeating chars." },
      { text: "Sorting algorithms — understand trade-offs for interviews", weight: "⭐⭐", tip: "Know merge sort (stable, O(n log n)), quicksort (in-place), and when to use each." },
    ],
    advanced: [
      { text: "Dynamic Programming — single biggest topic gap for most candidates", weight: "⭐⭐⭐", tip: "Learn the 4 DP patterns: 1D DP, 2D DP, knapsack, and interval DP. Start with Climbing Stairs." },
      { text: "Graphs — BFS/DFS, shortest path (Dijkstra), cycle detection", weight: "⭐⭐⭐", tip: "Amazon/Google ask graph problems frequently. Practice number of islands, course schedule." },
      { text: "Heaps & Priority Queues — Top-K problems and median finding", weight: "⭐⭐", tip: "Know how to use a min-heap for K closest points, merge K sorted lists." },
      { text: "Trie — autocomplete and word search problems", weight: "⭐⭐", tip: "Build a trie from scratch once. Then practice word search II." },
      { text: "Greedy algorithms — interval scheduling, activity selection", weight: "⭐⭐", tip: "Sort and greedily pick. Practice: meeting rooms, jump game." },
    ],
    interview: [
      { text: "Mock 2 LeetCode Mediums daily — timed 25 minutes each", weight: "⭐⭐⭐", tip: "Don't peek at hints. Write brute force first, then optimize. Speak your thought process aloud." },
      { text: "Blind 75 checklist — covers all high-frequency patterns", weight: "⭐⭐⭐", tip: "Track which topics you miss. Revisit weak areas the day before your interview." },
      { text: "System design warmup — 30 min per day alongside DSA", weight: "⭐⭐", tip: "Read one system design case study from Donne Martin's primer each day." },
      { text: "Review all solved problems — patterns, not solutions", weight: "⭐⭐", tip: "Make a cheat sheet of pattern → problem type mapping for last-minute revision." },
    ],
  },
  "System Design": {
    fundamentals: [
      { text: "Scalability basics — vertical vs horizontal scaling", weight: "⭐⭐⭐", tip: "Understand why horizontal wins at scale. Know when vertical is simpler." },
      { text: "Load balancing — Round Robin, Least Connections, IP Hash", weight: "⭐⭐⭐", tip: "Nginx and HAProxy are most common. Know sticky sessions for stateful apps." },
      { text: "Caching — Redis, Memcached, CDN; TTL and invalidation strategies", weight: "⭐⭐⭐", tip: "Cache-aside is most common pattern. Know when to avoid caching (consistency-critical data)." },
      { text: "Databases — SQL vs NoSQL, when to use each", weight: "⭐⭐⭐", tip: "Know ACID (SQL) vs BASE (NoSQL) trade-offs. Mention specific DBs (Postgres, MongoDB, Cassandra)." },
    ],
    practice: [
      { text: "CAP theorem — every distributed system design question involves this", weight: "⭐⭐⭐", tip: "Memorize: CP (HBase), AP (Cassandra, DynamoDB). Justify your DB choice with CAP." },
      { text: "Sharding and replication — how data scales beyond one server", weight: "⭐⭐⭐", tip: "Know horizontal (shard key) vs vertical sharding. Master-slave vs master-master replication." },
      { text: "Message queues — Kafka, RabbitMQ, async decoupling", weight: "⭐⭐", tip: "Use queues for order processing, notifications, and smoothing traffic spikes." },
      { text: "API design — REST vs GraphQL, versioning, rate limiting", weight: "⭐⭐", tip: "Always design APIs with backward compatibility. Mention rate limiting (token bucket)." },
    ],
    advanced: [
      { text: "Design URL Shortener — classic beginner system design (bit.ly)", weight: "⭐⭐⭐", tip: "Cover: base-62 encoding, DB schema, cache layer, analytics. ~30 min to design end-to-end." },
      { text: "Design Twitter/Instagram Feed — fan-out write vs fan-out read", weight: "⭐⭐⭐", tip: "Key insight: celebrities use pull (fan-out on read); regular users use push (fan-out on write)." },
      { text: "Consistent hashing — distributed hash ring for cache/DB partitioning", weight: "⭐⭐", tip: "Virtual nodes solve the hotspot problem. Understand why it avoids full reshuffling on node change." },
      { text: "Distributed transactions — two-phase commit, saga pattern", weight: "⭐⭐", tip: "Saga is preferred for microservices. Know compensating transactions for rollback." },
    ],
    interview: [
      { text: "Practice the RESHADED framework: Requirements → Estimation → Schema → High-level → APIs → Deep dives", weight: "⭐⭐⭐", tip: "Spend 5 min on requirements clarification. Interviewers want you to ask the right questions." },
      { text: "Time yourself — 45 minutes per design, just like real interviews", weight: "⭐⭐⭐", tip: "Draw the architecture diagram first, then talk through components. Don't start talking without a diagram." },
    ],
  },
  Aptitude: {
    fundamentals: [
      { text: "Percentages & Profit/Loss — appear in 80% of service company aptitude tests", weight: "⭐⭐⭐", tip: "Formula: Profit% = (Profit/CP) x 100. Practice 20 questions per day." },
      { text: "Simple & Compound Interest — TCS, Infosys ask these every year", weight: "⭐⭐⭐", tip: "SI = PRT/100. CI = P(1+R/100)^T - P. Memorize both, practice rapid calculation." },
      { text: "Ratio & Proportion, Averages — quick mental math wins time", weight: "⭐⭐", tip: "Average = Sum/Count. For weighted averages, use the alligation method." },
      { text: "Number System — divisibility rules save 30 seconds per question", weight: "⭐⭐", tip: "Memorize: divisible by 3 (sum of digits), 4 (last 2 digits), 9 (sum of digits)." },
    ],
    practice: [
      { text: "Time, Speed & Distance — second most common aptitude topic", weight: "⭐⭐⭐", tip: "Distance = Speed x Time. Average speed (equal distances) = 2S1*S2/(S1+S2). Train problems: add/subtract speeds." },
      { text: "Time & Work — pipes and cistern, work and wages", weight: "⭐⭐⭐", tip: "Work rate = 1/days. Combined rate = sum of individual rates. Practice until you can solve in 30 seconds." },
      { text: "Permutations & Combinations — needed for probability questions", weight: "⭐⭐", tip: "P(n,r) = n!/(n-r)!, C(n,r) = n!/(r!(n-r)!). Key rule: order matters → permutation." },
      { text: "Blood Relations & Direction Sense — scoring easy marks in logical section", weight: "⭐⭐", tip: "Draw family trees for blood relation. For direction: always start facing North, turn clockwise/counter." },
    ],
    advanced: [
      { text: "Data Interpretation — graphs, pie charts, bar charts, tables", weight: "⭐⭐⭐", tip: "Practice reading charts fast. DI questions give maximum marks in minimum time if practiced." },
      { text: "Probability and Set Theory — Venn diagrams save time", weight: "⭐⭐", tip: "P(A∪B) = P(A) + P(B) - P(A∩B). Draw Venn diagrams for 2-3 set problems." },
      { text: "Coding & Series — missing number, odd one out patterns", weight: "⭐⭐", tip: "Identify the pattern type: arithmetic, geometric, prime, square, alternating. Practice 15/day." },
    ],
    interview: [
      { text: "Full mock aptitude test — 30 questions in 30 minutes", weight: "⭐⭐⭐", tip: "Skip hard questions, mark easy ones first. Speed over perfection in aptitude tests." },
      { text: "IndiaBix topic-wise practice — most relevant for TCS, Infosys, Wipro pattern", weight: "⭐⭐⭐", tip: "Do previous year papers for your target company. Patterns repeat every 2-3 years." },
    ],
  },
};

// Generate rich plan topics for a given skill and week type
function getRichTopics(skill, weekType) {
  const richSkill = RICH_TOPICS[skill];
  if (richSkill && richSkill[weekType]) return richSkill[weekType];
  // Generic fallback with useful structure
  return [
    { text: `Study core concepts of ${skill} for this phase`, weight: "⭐⭐", tip: "Focus on understanding over memorization — interviewers probe depth." },
    { text: "Solve 5-10 practice problems daily on this topic", weight: "⭐⭐⭐", tip: "Consistency matters more than volume. 30 focused minutes beats 3 distracted hours." },
    { text: "Review notes and summarize key patterns", weight: "⭐⭐", tip: "Write a one-page cheat sheet — the act of writing reinforces memory." },
    { text: "Watch 1-2 short tutorial videos on difficult sub-topics", weight: "⭐", tip: "Abdul Bari (DSA), Gaurav Sen (System Design), and CodeWithHarry (Java/Python) are excellent." },
  ];
}

const WEEK_TYPE_META = {
  fundamentals: { label: "Fundamentals Phase", icon: BookOpen, desc: "Build your foundation — these concepts appear in 90% of interviews" },
  practice:     { label: "Practice Phase",     icon: Target,   desc: "Apply concepts through problems — pattern recognition is the goal" },
  advanced:     { label: "Advanced Phase",     icon: TrendingUp, desc: "Deep topics that separate good candidates from great ones" },
  interview:    { label: "Interview Ready",   icon: Star,     desc: "Simulate real interview conditions and refine your approach" },
  generic:      { label: "Preparation Phase", icon: Clock,    desc: "Structured study with deliberate practice" },
};

export function Roadmap() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [weeks, setWeeks] = useState(4);
  const [companyType, setCompanyType] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedWeek, setExpandedWeek] = useState(0);

  const toggleSkill = (s) =>
    setSelectedSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !selectedSkills.includes(s)) { setSelectedSkills((p) => [...p, s]); setCustomSkill(""); }
  };

  const applyPreset = (type) => { setCompanyType(type); setSelectedSkills(COMPANY_PRESETS[type] || []); };

  const generate = async () => {
    const skills = selectedSkills.length > 0 ? selectedSkills : (COMPANY_PRESETS[companyType] || []);
    if (!skills.length) return toast.error("Select at least one skill or company type");
    setLoading(true);
    try {
      const res = await api.post("/data", { skills, weeks });
      setPlan({ ...res.data, selectedSkills: skills });
      setCheckedItems({});
      setExpandedWeek(0);
      toast.success("Roadmap generated!");
    } catch {
      toast.error("Failed to generate plan. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // Build rich topics by merging server plan with local rich content
  function buildRichWeek(week, skillsList) {
    const richTopics = [];
    skillsList.forEach((skill) => {
      const topics = getRichTopics(skill, week.weekType);
      topics.forEach((t) => richTopics.push({ ...t, skill }));
    });
    // deduplicate and cap at 8 per week
    const seen = new Set();
    return richTopics.filter((t) => {
      if (seen.has(t.text)) return false;
      seen.add(t.text);
      return true;
    }).slice(0, 8);
  }

  const allTopics = plan?.plan?.reduce((sum, w) => sum + 6, 0) || 0;
  const doneItems = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title mb-1">AI Study Roadmap</h1>
        <p className="text-text-muted text-sm">
          Get a detailed, actionable weekly plan — with what to study, what carries the most marks, and exactly how to prepare.
        </p>
      </div>

      {/* Setup Card */}
      <div className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">Target Company Type</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "product", label: "Product Based", desc: "DSA + System Design", emoji: "💻" },
              { key: "service", label: "Service Based", desc: "Aptitude + Basics", emoji: "🏢" },
              { key: "startup", label: "Startup / FAANG", desc: "Full-Stack + APIs", emoji: "🚀" },
            ].map(({ key, label, desc, emoji }) => (
              <button key={key} onClick={() => applyPreset(key)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  companyType === key
                    ? "border-brand-500 bg-brand-600/10 text-text-primary"
                    : "border-border bg-surface-3 text-text-secondary hover:border-border-bright"
                }`}
              >
                <span className="text-2xl block mb-2">{emoji}</span>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Skills to Prepare ({selectedSkills.length} selected)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {ALL_SKILLS.map((s) => (
              <button key={s} onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedSkills.includes(s)
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1 text-sm" placeholder="Add custom skill (e.g. Docker, Flutter)"
              value={customSkill} onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomSkill()} />
            <button onClick={addCustomSkill} className="btn-secondary">Add</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Preparation Duration: <span className="text-text-primary font-bold">{weeks} weeks</span>
          </label>
          <input type="range" min={1} max={12} value={weeks}
            onChange={(e) => setWeeks(+e.target.value)} className="w-full accent-brand-500" />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>1 week</span><span>6 weeks</span><span>12 weeks</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={generate} disabled={loading} className="btn-primary gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
              : <><Sparkles className="w-4 h-4" />Generate Roadmap</>
            }
          </button>
          {plan && (
            <button onClick={() => { setPlan(null); setCheckedItems({}); }} className="btn-ghost gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />Reset
            </button>
          )}
        </div>
      </div>

      {/* Generated Plan */}
      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Skills Mapped", value: plan.recognizedSkills?.length || 0, color: "text-accent-green" },
                { label: "Weeks of Prep", value: plan.plan?.length || 0, color: "text-brand-400" },
                { label: "Topics Covered", value: allTopics, color: "text-accent-purple" },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-text-muted mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="card p-4 flex flex-wrap gap-4 text-xs">
              <span className="text-text-muted font-medium">Importance:</span>
              {[["⭐⭐⭐", "text-accent-green", "Must Know — highest exam frequency"],
                ["⭐⭐", "text-accent-yellow", "Important — frequently tested"],
                ["⭐", "text-text-muted", "Good to Know — bonus points"]].map(([w, c, l]) => (
                <span key={w} className="flex items-center gap-1.5">
                  <span>{w}</span><span className={c}>{l}</span>
                </span>
              ))}
            </div>

            {/* Progress */}
            {allTopics > 0 && (
              <div className="card p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Overall Progress</span>
                  <span className="text-text-primary font-medium">{doneItems}/{allTopics} topics</span>
                </div>
                <ProgressBar value={doneItems} max={allTopics} />
              </div>
            )}

            {/* Weekly Plan */}
            <div className="space-y-3">
              {plan.plan?.map((week, wi) => {
                const richTopics = buildRichWeek(week, plan.selectedSkills || plan.recognizedSkills || []);
                const meta = WEEK_TYPE_META[week.weekType] || WEEK_TYPE_META.generic;
                const MetaIcon = meta.icon;
                const isOpen = expandedWeek === wi;
                const weekDone = richTopics.filter((_, ti) => checkedItems[`${wi}-${ti}`]).length;

                return (
                  <motion.div key={wi}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: wi * 0.06 }}
                    className={`card border-l-4 overflow-hidden ${WEEK_TYPE_COLORS[week.weekType] || WEEK_TYPE_COLORS.generic}`}
                  >
                    {/* Week header — clickable */}
                    <button onClick={() => setExpandedWeek(isOpen ? -1 : wi)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface-4 flex items-center justify-center flex-shrink-0">
                        <MetaIcon className="w-5 h-5 text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-blue text-xs">Week {week.week}</span>
                          <span className="text-xs text-text-muted">{meta.label}</span>
                        </div>
                        <p className="font-semibold text-text-primary text-sm">{week.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{meta.desc}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-text-primary">{weekDone}/{richTopics.length}</p>
                        <p className="text-xs text-text-muted">done</p>
                      </div>
                    </button>

                    {/* Week progress bar */}
                    <div className="px-5 pb-2">
                      <ProgressBar value={weekDone} max={richTopics.length} />
                    </div>

                    {/* Expanded topics */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-border"
                        >
                          <div className="p-5 space-y-3">
                            {richTopics.map((topic, ti) => {
                              const key = `${wi}-${ti}`;
                              const done = checkedItems[key];
                              return (
                                <div key={ti}
                                  className={`rounded-xl border p-4 transition-all ${done ? "opacity-60 border-accent-green/30 bg-accent-green/5" : "border-border bg-surface-3 hover:border-border-bright"}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <button onClick={() => setCheckedItems((p) => ({ ...p, [key]: !p[key] }))}
                                      className="mt-0.5 flex-shrink-0"
                                    >
                                      {done
                                        ? <CheckCircle className="w-5 h-5 text-accent-green" />
                                        : <Circle className="w-5 h-5 text-text-muted hover:text-text-secondary transition-colors" />
                                      }
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium leading-relaxed ${done ? "line-through text-text-muted" : "text-text-primary"}`}>
                                          {topic.text}
                                        </p>
                                        <span className="text-sm flex-shrink-0">{topic.weight}</span>
                                      </div>
                                      {topic.tip && (
                                        <p className="text-xs text-brand-400/80 mt-1.5 flex items-start gap-1.5">
                                          <span className="mt-0.5">💡</span>
                                          <span>{topic.tip}</span>
                                        </p>
                                      )}
                                      {topic.skill && (
                                        <span className="tag text-xs mt-2 inline-block">{topic.skill}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {plan.unrecognizedSkills?.length > 0 && (
              <div className="p-4 bg-accent-orange/10 border border-accent-orange/30 rounded-xl text-sm">
                <span className="font-medium text-accent-orange">Note:</span>{" "}
                <span className="text-text-secondary">
                  Skills not in our database: {plan.unrecognizedSkills.join(", ")} — generic plan applied. The tips above still apply to study approach.
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
