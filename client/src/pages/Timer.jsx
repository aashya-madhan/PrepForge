import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Target, CheckCircle, Volume2, VolumeX } from "lucide-react";

const MODES = [
  { id: "focus",       label: "Focus",        minutes: 25, color: "text-brand-400",        bg: "bg-brand-600/15",        ring: "#3b82f6", desc: "Deep work session" },
  { id: "short",       label: "Short Break",  minutes: 5,  color: "text-accent-green",     bg: "bg-accent-green/15",     ring: "#34d399", desc: "Quick rest" },
  { id: "long",        label: "Long Break",   minutes: 15, color: "text-accent-purple",    bg: "bg-accent-purple/15",    ring: "#a78bfa", desc: "Longer rest" },
  { id: "interview",   label: "Interview",    minutes: 45, color: "text-accent-orange",    bg: "bg-accent-orange/15",    ring: "#fb923c", desc: "Full interview simulation" },
  { id: "custom",      label: "Custom",       minutes: 30, color: "text-accent-yellow",    bg: "bg-accent-yellow/15",    ring: "#fbbf24", desc: "Set your own time" },
];

const TIPS = [
  "Stay focused — one problem at a time.",
  "Write your approach before coding.",
  "Explain your thought process out loud.",
  "Start with brute force, then optimize.",
  "Test with edge cases: empty input, single element.",
  "Review your solution for off-by-one errors.",
  "Think about time and space complexity.",
  "Break the problem into smaller subproblems.",
  "Draw diagrams for tree and graph problems.",
  "Practice consistently — 30 mins daily beats 5 hours weekly.",
];

function pad(n) { return String(n).padStart(2, "0"); }

export function Timer() {
  const [modeIdx, setModeIdx]     = useState(0);
  const [customMin, setCustomMin] = useState(30);
  const [seconds, setSeconds]     = useState(MODES[0].minutes * 60);
  const [running, setRunning]     = useState(false);
  const [sessions, setSessions]   = useState(0);
  const [muted, setMuted]         = useState(false);
  const [tipIdx, setTipIdx]       = useState(0);
  const [finished, setFinished]   = useState(false);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const mode = MODES[modeIdx];
  const totalSeconds = mode.id === "custom" ? customMin * 60 : mode.minutes * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Rotate tip every 30s
  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 30000);
    return () => clearInterval(t);
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            if (mode.id === "focus") setSessions((n) => n + 1);
            playDone();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function playDone() {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      [0, 0.3, 0.6].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = [523, 659, 784][i];
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.4);
      });
    } catch {}
  }

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setSeconds(mode.id === "custom" ? customMin * 60 : mode.minutes * 60);
  }, [mode, customMin]);

  const switchMode = (idx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setModeIdx(idx);
    const m = MODES[idx];
    setSeconds(m.id === "custom" ? customMin * 60 : m.minutes * 60);
  };

  const skip = () => {
    const next = (modeIdx + 1) % 3; // cycle focus → short → long
    switchMode(next);
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="page-title mb-1">Study Timer</h1>
        <p className="text-text-muted text-sm">Pomodoro technique — 25 min focus, 5 min break. Repeat.</p>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => switchMode(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              modeIdx === i
                ? `${m.bg} ${m.color} border-current`
                : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
            }`}
          >
            {m.label}
            {m.id !== "custom" && <span className="ml-1 opacity-60">{m.minutes}m</span>}
          </button>
        ))}
      </div>

      {/* Custom minutes input */}
      <AnimatePresence>
        {mode.id === "custom" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <label className="text-sm text-text-muted">Duration (minutes):</label>
              <input type="number" min={1} max={120} value={customMin}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(120, +e.target.value || 1));
                  setCustomMin(v);
                  if (!running) setSeconds(v * 60);
                }}
                className="input w-24 text-center"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer circle */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* SVG ring */}
          <svg width="260" height="260" className="-rotate-90">
            {/* Track */}
            <circle cx="130" cy="130" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            {/* Progress */}
            <motion.circle
              cx="130" cy="130" r={radius}
              fill="none"
              stroke={mode.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {finished ? (
                <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <CheckCircle className={`w-12 h-12 mx-auto mb-2 ${mode.color}`} />
                  <p className="text-sm font-semibold text-text-primary">Done!</p>
                </motion.div>
              ) : (
                <motion.div key="time" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <span className="text-5xl font-bold font-mono text-text-primary tabular-nums">
                    {pad(mins)}:{pad(secs)}
                  </span>
                  <p className={`text-xs mt-1 font-medium ${mode.color}`}>{mode.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{mode.desc}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={() => setMuted(!muted)} className="btn-ghost p-2.5 rounded-xl" title={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button onClick={reset} className="btn-secondary p-3 rounded-xl">
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => { setFinished(false); setRunning((r) => !r); }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-lg ${
              running ? "bg-red-500 hover:bg-red-600" : "bg-brand-600 hover:bg-brand-700 shadow-glow-sm"
            }`}
          >
            {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button onClick={skip} className="btn-secondary p-3 rounded-xl" title="Skip to next phase">
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="btn-ghost p-2.5 rounded-xl flex items-center gap-1.5 text-xs text-accent-orange">
            <Target className="w-4 h-4" />
            <span className="font-semibold">{sessions}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Target, label: "Sessions Today", value: sessions, color: "text-brand-400" },
          { icon: Brain, label: "Focus Time", value: `${sessions * (MODES[0].minutes)}m`, color: "text-accent-purple" },
          { icon: Coffee, label: "Breaks Earned", value: sessions, color: "text-accent-green" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tip of the moment */}
      <AnimatePresence mode="wait">
        <motion.div key={tipIdx}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="card p-4 flex items-start gap-3 border-l-4 border-brand-500"
        >
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs text-text-muted mb-0.5 font-medium">TIP OF THE MOMENT</p>
            <p className="text-sm text-text-secondary">{TIPS[tipIdx]}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* How it works */}
      <div className="card p-5">
        <h3 className="section-title mb-3">How Pomodoro Works</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: "1", label: "Focus 25 min", icon: "🎯", desc: "No distractions" },
            { step: "2", label: "Break 5 min",  icon: "☕", desc: "Rest your mind" },
            { step: "3", label: "Repeat × 4",   icon: "🔁", desc: "Stay consistent" },
            { step: "4", label: "Long Break",    icon: "😴", desc: "Recharge fully" },
          ].map(({ step, label, icon, desc }) => (
            <div key={step} className="bg-surface-3 rounded-xl p-3 text-center">
              <span className="text-2xl block mb-1">{icon}</span>
              <p className="text-sm font-semibold text-text-primary">{label}</p>
              <p className="text-xs text-text-muted mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
