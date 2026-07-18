import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mic, Timer, ChevronRight, RotateCcw, Trophy, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import { getDifficultyColor } from "../lib/utils";
import api from "../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const STATES = { SETUP: "setup", ACTIVE: "active", REVIEW: "review", RESULTS: "results" };

export function MockInterview() {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState(STATES.SETUP);
  const [config, setConfig] = useState({ skill: "DSA", difficulty: "intermediate", count: 10, time: 30 });
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Timer
  useEffect(() => {
    if (state !== STATES.ACTIVE) return;
    if (timeLeft <= 0) { setState(STATES.RESULTS); return; }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [state, timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const { data: allSkills } = useQuery({
    queryKey: ["skills-list"],
    queryFn: () => api.get("/skills").then((r) => r.data),
    staleTime: Infinity,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => api.post("/users/mock-interview", data),
    onSuccess: () => toast.success("Session saved!"),
  });

  const startInterview = async () => {
    try {
      const res = await api.get(`/questions?skill=${config.skill}&difficulty=${config.difficulty}&limit=${config.count}`);
      const qs = res.data.questions;
      if (!qs.length) return toast.error("No questions found for this selection");
      setQuestions(qs);
      setAnswers({});
      setCurrent(0);
      setTimeLeft(config.time * 60);
      setStartTime(Date.now());
      setState(STATES.ACTIVE);
    } catch {
      toast.error("Could not fetch questions");
    }
  };

  const markAnswer = (correct) => {
    setAnswers((a) => ({ ...a, [current]: correct }));
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = useCallback(() => {
    const score = Object.values(answers).filter(Boolean).length;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    if (isAuthenticated) {
      saveMutation.mutate({
        score, totalQuestions: questions.length,
        timeTaken, skillTested: config.skill, difficulty: config.difficulty,
      });
    }
    setState(STATES.RESULTS);
  }, [answers, questions, startTime, config, isAuthenticated]);

  const reset = () => { setState(STATES.SETUP); setQuestions([]); setAnswers({}); };

  const score = Object.values(answers).filter(Boolean).length;
  const scorePercent = questions.length ? Math.round((score / questions.length) * 100) : 0;

  const skillList = allSkills ? Object.values(allSkills).flat() : ["DSA", "Java", "Python", "System Design", "OOP", "DBMS", "HR"];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="page-title mb-1">Mock Interview</h1>
        <p className="text-text-muted text-sm">Timed practice sessions to simulate real interview conditions.</p>
      </div>

      {/* Setup */}
      <AnimatePresence mode="wait">
        {state === STATES.SETUP && (
          <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card p-6 space-y-5"
          >
            <h2 className="section-title">Configure Session</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">Skill / Topic</label>
                <select className="input" value={config.skill} onChange={(e) => setConfig({ ...config, skill: e.target.value })}>
                  {skillList.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">Difficulty</label>
                <select className="input" value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}>
                  {["basic", "intermediate", "advanced"].map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">Number of Questions</label>
                <select className="input" value={config.count} onChange={(e) => setConfig({ ...config, count: +e.target.value })}>
                  {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">Time Limit</label>
                <select className="input" value={config.time} onChange={(e) => setConfig({ ...config, time: +e.target.value })}>
                  {[10, 15, 20, 30, 45, 60].map((t) => <option key={t} value={t}>{t} minutes</option>)}
                </select>
              </div>
            </div>
            <button onClick={startInterview} className="btn-primary gap-2 w-full justify-center py-3">
              <Mic className="w-4 h-4" /> Start Interview
            </button>
          </motion.div>
        )}

        {state === STATES.ACTIVE && questions.length > 0 && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Timer bar */}
            <div className="card p-4 flex items-center gap-4">
              <Timer className={`w-5 h-5 ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-brand-400"}`} />
              <div className="flex-1">
                <ProgressBar value={timeLeft} max={config.time * 60} color={timeLeft < 60 ? "pink" : "brand"} />
              </div>
              <span className={`font-mono text-sm font-semibold ${timeLeft < 60 ? "text-red-400" : "text-text-primary"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Question {current + 1} of {questions.length}</span>
              <span className="text-text-muted">{score} correct so far</span>
            </div>
            <ProgressBar value={current + 1} max={questions.length} />

            {/* Question card */}
            <div className="card p-6">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-8 h-8 bg-brand-600/15 text-brand-400 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {current + 1}
                </span>
                <div className="flex-1">
                  <div className="flex gap-2 mb-3">
                    <span className={getDifficultyColor(questions[current].difficulty)}>{questions[current].difficulty}</span>
                    <span className="badge badge-blue">{questions[current].skill}</span>
                  </div>
                  <p className="text-text-primary text-lg leading-relaxed">{questions[current].question}</p>
                </div>
              </div>

              {answers[current] === undefined ? (
                <div className="flex gap-3">
                  <button onClick={() => markAnswer(true)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-accent-green/15 border border-accent-green/30 text-accent-green rounded-xl hover:bg-accent-green/25 transition-all text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> I know this
                  </button>
                  <button onClick={() => markAnswer(false)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/25 transition-all text-sm font-medium">
                    <XCircle className="w-4 h-4" /> Need to review
                  </button>
                </div>
              ) : (
                <div className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
                  answers[current] ? "bg-accent-green/10 border-accent-green/30 text-accent-green" : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {answers[current] ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {answers[current] ? "Marked as known" : "Marked for review"}
                </div>
              )}

              {answers[current] !== undefined && (
                <button onClick={next} className="btn-primary w-full justify-center mt-3 gap-2">
                  {current < questions.length - 1 ? <><span>Next Question</span><ChevronRight className="w-4 h-4" /></> : <><Trophy className="w-4 h-4" /><span>Finish</span></>}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {state === STATES.RESULTS && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="card p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-surface-3 border-4 border-brand-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold gradient-text">{scorePercent}%</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Session Complete!</h2>
              <p className="text-text-muted mb-6">You got {score} out of {questions.length} questions right</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Score", value: `${score}/${questions.length}`, color: "text-brand-400" },
                  { label: "Accuracy", value: `${scorePercent}%`, color: scorePercent >= 70 ? "text-accent-green" : scorePercent >= 50 ? "text-accent-yellow" : "text-red-400" },
                  { label: "Topic", value: config.skill, color: "text-accent-purple" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-surface-3 rounded-xl p-3">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-text-muted mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <ProgressBar value={score} max={questions.length} color={scorePercent >= 70 ? "green" : "brand"} className="mb-6" />

              <div className="flex gap-3 justify-center">
                <button onClick={reset} className="btn-secondary gap-2">
                  <RotateCcw className="w-4 h-4" /> New Session
                </button>
              </div>
            </div>

            {/* Review answers */}
            <div className="space-y-2">
              <h3 className="section-title">Question Review</h3>
              {questions.map((q, i) => (
                <div key={q.id} className={`card p-4 flex items-start gap-3 border ${answers[i] ? "border-accent-green/20" : "border-red-500/20"}`}>
                  {answers[i] ? <CheckCircle className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <p className="text-sm text-text-secondary">{q.question}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
