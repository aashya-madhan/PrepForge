import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Plus, Trash2, RotateCcw } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const DEFAULT_ITEMS = [
  "Study today's topic for 2 hours",
  "Solve 5 DSA problems",
  "Revise yesterday's concepts",
  "Practice 1 mock interview question",
  "Update notes",
  "Review bookmarked questions",
];

function getWeekKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
  return `week_${d.getFullYear()}_${Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 604800000)}`;
}

export function Checklist() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekKey = getWeekKey(weekOffset);
  const [newItem, setNewItem] = useState("");

  // Load from server if authenticated
  const { data: serverChecklist = {} } = useQuery({
    queryKey: ["checklist"],
    queryFn: () => api.get("/users/checklist").then((r) => r.data),
    enabled: isAuthenticated,
  });

  // Local fallback
  const [localItems, setLocalItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("checklist") || "{}"); } catch { return {}; }
  });

  const items = isAuthenticated
    ? (serverChecklist[weekKey] || DEFAULT_ITEMS.map((t) => ({ text: t, done: false })))
    : (localItems[weekKey] || DEFAULT_ITEMS.map((t) => ({ text: t, done: false })));

  const saveMut = useMutation({
    mutationFn: ({ key, items }) => api.put("/users/checklist", { weekKey: key, items }),
    onSuccess: () => qc.invalidateQueries(["checklist"]),
  });

  const saveItems = (newItems) => {
    if (isAuthenticated) {
      saveMut.mutate({ key: weekKey, items: newItems });
    } else {
      const updated = { ...localItems, [weekKey]: newItems };
      setLocalItems(updated);
      localStorage.setItem("checklist", JSON.stringify(updated));
    }
  };

  const toggle = (i) => {
    const updated = items.map((item, idx) => idx === i ? { ...item, done: !item.done } : item);
    saveItems(updated);
    if (isAuthenticated) qc.setQueryData(["checklist"], (old = {}) => ({ ...old, [weekKey]: updated }));
    else setLocalItems((prev) => ({ ...prev, [weekKey]: updated }));
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = [...items, { text: newItem.trim(), done: false }];
    saveItems(updated);
    if (isAuthenticated) qc.setQueryData(["checklist"], (old = {}) => ({ ...old, [weekKey]: updated }));
    else setLocalItems((prev) => ({ ...prev, [weekKey]: updated }));
    setNewItem("");
    toast.success("Task added");
  };

  const removeItem = (i) => {
    const updated = items.filter((_, idx) => idx !== i);
    saveItems(updated);
    if (isAuthenticated) qc.setQueryData(["checklist"], (old = {}) => ({ ...old, [weekKey]: updated }));
    else setLocalItems((prev) => ({ ...prev, [weekKey]: updated }));
  };

  const resetWeek = () => {
    const updated = items.map((item) => ({ ...item, done: false }));
    saveItems(updated);
    if (isAuthenticated) qc.setQueryData(["checklist"], (old = {}) => ({ ...old, [weekKey]: updated }));
    else setLocalItems((prev) => ({ ...prev, [weekKey]: updated }));
    toast("Week reset");
  };

  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const weekLabel = weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)} weeks ago`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title mb-1">Daily Checklist</h1>
          <p className="text-text-muted text-sm">Stay consistent and track your weekly tasks.</p>
        </div>
        <button onClick={resetWeek} className="btn-ghost gap-1.5 text-sm">
          <RotateCcw className="w-3.5 h-3.5" />Reset
        </button>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-3">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="btn-secondary px-3">←</button>
        <span className="flex-1 text-center text-sm font-medium text-text-primary">{weekLabel}</span>
        <button onClick={() => setWeekOffset((w) => Math.min(0, w + 1))} disabled={weekOffset === 0} className="btn-secondary px-3 disabled:opacity-40">→</button>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">Progress</span>
          <span className="text-sm font-bold text-text-primary">{done}/{total} tasks</span>
        </div>
        <ProgressBar value={done} max={total} />
        {percent === 100 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent-green text-sm mt-2 flex items-center gap-1">
            🎉 All tasks completed! Great work this week!
          </motion.p>
        )}
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <input
          className="input flex-1" placeholder="Add a custom task..."
          value={newItem} onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <button onClick={addItem} className="btn-primary gap-1.5">
          <Plus className="w-4 h-4" />Add
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`card flex items-center gap-3 p-4 transition-all ${item.done ? "opacity-60" : ""}`}
          >
            <button
              onClick={() => toggle(i)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                item.done ? "bg-accent-green border-accent-green" : "border-border hover:border-brand-500"
              }`}
            >
              {item.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <span className={`flex-1 text-sm ${item.done ? "line-through text-text-muted" : "text-text-secondary"}`}>
              {item.text}
            </span>
            <button onClick={() => removeItem(i)} className="btn-ghost p-1.5 text-text-muted hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
