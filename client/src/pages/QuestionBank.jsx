import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Bookmark, BookmarkCheck, ChevronDown, ChevronLeft,
  Code2, Brain, Database, Cpu, Users, Zap, BookOpen, Star
} from "lucide-react";
import { CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { getDifficultyColor } from "../lib/utils";
import api from "../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

// ── Topic catalogue shown on the home view ──────────────────────────────────
const TOPIC_CARDS = [
  {
    id: "DSA",
    label: "Data Structures & Algorithms",
    icon: Code2,
    color: "bg-brand-600/15 text-brand-400 border-brand-600/30",
    accent: "border-l-brand-500",
    count: null,
    desc: "Arrays, Trees, Graphs, DP, Sorting & more",
    skill: "DSA",
  },
  {
    id: "System Design",
    label: "System Design",
    icon: Cpu,
    color: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
    accent: "border-l-accent-purple",
    count: null,
    desc: "Scalability, Caching, Load Balancing, Databases",
    skill: "System Design",
  },
  {
    id: "OOP",
    label: "Object Oriented Programming",
    icon: Brain,
    color: "bg-accent-green/15 text-accent-green border-accent-green/30",
    accent: "border-l-accent-green",
    count: null,
    desc: "Encapsulation, Inheritance, Design Patterns",
    skill: "OOP",
  },
  {
    id: "DBMS",
    label: "DBMS",
    icon: Database,
    color: "bg-accent-orange/15 text-accent-orange border-accent-orange/30",
    accent: "border-l-accent-orange",
    count: null,
    desc: "Normalization, ACID, Indexing, Transactions",
    skill: "DBMS",
  },
  {
    id: "Java",
    label: "Java",
    icon: Code2,
    color: "bg-red-500/15 text-red-400 border-red-500/30",
    accent: "border-l-red-500",
    count: null,
    desc: "JVM, Collections, Threads, OOP in Java",
    skill: "Java",
  },
  {
    id: "Python",
    label: "Python",
    icon: Code2,
    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    accent: "border-l-yellow-500",
    count: null,
    desc: "Decorators, Generators, Lambda, GIL",
    skill: "Python",
  },
  {
    id: "JavaScript",
    label: "JavaScript",
    icon: Zap,
    color: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
    accent: "border-l-yellow-400",
    count: null,
    desc: "Closures, Promises, Event Loop, ES6+",
    skill: "JavaScript",
  },
  {
    id: "React",
    label: "React",
    icon: Zap,
    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    accent: "border-l-cyan-500",
    count: null,
    desc: "Hooks, Virtual DOM, State Management",
    skill: "React",
  },
  {
    id: "SQL",
    label: "SQL",
    icon: Database,
    color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    accent: "border-l-indigo-500",
    count: null,
    desc: "Joins, Subqueries, Optimization, Stored Procs",
    skill: "SQL",
  },
  {
    id: "Aptitude",
    label: "Aptitude",
    icon: Star,
    color: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    accent: "border-l-pink-500",
    count: null,
    desc: "Quant, Reasoning, Speed-Distance-Time",
    skill: "Aptitude",
  },
  {
    id: "HR",
    label: "HR & Behavioural",
    icon: Users,
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    accent: "border-l-emerald-500",
    count: null,
    desc: "Tell me about yourself, STAR method, HR rounds",
    skill: "HR",
  },
  {
    id: "Machine Learning",
    label: "Machine Learning",
    icon: Brain,
    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    accent: "border-l-violet-500",
    count: null,
    desc: "Supervised/Unsupervised, Neural Nets, Backprop",
    skill: "Machine Learning",
  },
];

// ── Single topic question list ───────────────────────────────────────────────
function TopicQuestions({ topic, onBack }) {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["topic-questions", topic.skill],
    queryFn: () =>
      api.get(`/questions?skill=${encodeURIComponent(topic.skill)}&limit=100`)
         .then((r) => r.data),
    staleTime: 60000,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => api.get("/users/bookmarks").then((r) => r.data.bookmarks),
    enabled: isAuthenticated,
    initialData: [],
  });

  const bookmarkMut = useMutation({
    mutationFn: (id) => api.post(`/users/bookmarks/${id}`).then((r) => r.data),
    onSuccess: (d) => {
      qc.setQueryData(["bookmarks"], d.bookmarks);
      toast.success(d.bookmarked ? "Bookmarked!" : "Removed");
    },
    onError: () => toast.error("Sign in to bookmark"),
  });

  const allQ = data?.questions || [];
  const filtered = allQ.filter((q) => {
    const matchDiff = difficulty === "all" || q.difficulty === difficulty;
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  const Icon = topic.icon;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost p-2">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${topic.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="section-title">{topic.label}</h2>
          <p className="text-xs text-text-muted">{allQ.length} questions</p>
        </div>
      </div>

      {/* Search + difficulty filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-9"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "basic", "intermediate", "advanced"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all capitalize ${
                difficulty === d
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
              }`}
            >
              {d === "all" ? "All" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="flex gap-4 text-xs text-text-muted">
          {["basic", "intermediate", "advanced"].map((d) => {
            const cnt = allQ.filter((q) => q.difficulty === d).length;
            const colors = { basic: "text-emerald-400", intermediate: "text-amber-400", advanced: "text-red-400" };
            return (
              <span key={d} className="flex items-center gap-1">
                <span className={`font-semibold ${colors[d]}`}>{cnt}</span>
                <span className="capitalize">{d}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Questions */}
      {isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No questions found" description="Try a different search or difficulty level" />
      ) : (
        <div className="space-y-2">
          {filtered.map((q, i) => {
            const isBookmarked = bookmarks.includes(q.id);
            const isOpen = expanded === q.id;
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.3) }}
                className={`card overflow-hidden border-l-4 ${topic.accent}`}
              >
                <button
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-3 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                >
                  <span className="text-text-muted text-xs font-mono w-6 mt-0.5 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-sm text-text-primary leading-relaxed">{q.question}</p>
                    <div className="flex items-center gap-2">
                      <span className={getDifficultyColor(q.difficulty)}>{q.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); bookmarkMut.mutate(q.id); }}
                      className="btn-ghost p-1.5"
                      title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                    >
                      {isBookmarked
                        ? <BookmarkCheck className="w-4 h-4 text-brand-400" />
                        : <Bookmark className="w-4 h-4 text-text-muted" />}
                    </button>
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border bg-surface-3">
                        {q.answer ? (
                          <div className="mt-3 bg-surface-2 rounded-lg p-3 text-sm text-text-secondary leading-relaxed border-l-2 border-accent-green">
                            <span className="text-accent-green font-medium text-xs block mb-1.5">Answer</span>
                            {q.answer}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-text-muted italic">
                            Try answering out loud — speaking the answer is the best way to prepare.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Question Bank page ──────────────────────────────────────────────────
export function QuestionBank() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");

  // Fetch counts for each topic
  const { data: stats } = useQuery({
    queryKey: ["qstats"],
    queryFn: () => api.get("/questions/stats").then((r) => r.data),
    staleTime: Infinity,
  });

  const bySkill = stats?.bySkill || {};

  // Filter topics by global search
  const visibleTopics = globalSearch
    ? TOPIC_CARDS.filter(
        (t) =>
          t.label.toLowerCase().includes(globalSearch.toLowerCase()) ||
          t.desc.toLowerCase().includes(globalSearch.toLowerCase())
      )
    : TOPIC_CARDS;

  if (selectedTopic) {
    return (
      <TopicQuestions
        topic={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title mb-1">Question Bank</h1>
        <p className="text-text-muted text-sm">
          Choose a topic to see all questions with answers.
        </p>
      </div>

      {/* Global search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          className="input pl-9"
          placeholder="Search topics..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="flex gap-4 text-sm flex-wrap">
          <span className="text-text-muted">
            <span className="font-semibold text-text-primary">{stats.total}</span> total questions
          </span>
          <span className="text-text-muted">
            <span className="font-semibold text-emerald-400">{stats.byDifficulty?.basic || 0}</span> basic
          </span>
          <span className="text-text-muted">
            <span className="font-semibold text-amber-400">{stats.byDifficulty?.intermediate || 0}</span> intermediate
          </span>
          <span className="text-text-muted">
            <span className="font-semibold text-red-400">{stats.byDifficulty?.advanced || 0}</span> advanced
          </span>
        </div>
      )}

      {/* Topic cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTopics.map((topic, i) => {
          const Icon = topic.icon;
          const count = bySkill[topic.skill] || 0;

          return (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedTopic(topic)}
              className={`card-hover p-5 text-left border-l-4 ${topic.accent} group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${topic.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {count > 0 && (
                  <span className="badge badge-blue text-xs">{count} Q</span>
                )}
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1 group-hover:text-brand-300 transition-colors">
                {topic.label}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">{topic.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <BookOpen className="w-3.5 h-3.5" />
                <span>View questions →</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {visibleTopics.length === 0 && (
        <EmptyState
          icon={Search}
          title="No topics match"
          description={`No topics found for "${globalSearch}"`}
          action={
            <button onClick={() => setGlobalSearch("")} className="btn-secondary text-sm">
              Clear search
            </button>
          }
        />
      )}
    </div>
  );
}
