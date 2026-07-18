import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Plus, Trash2, RotateCcw, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { CardSkeleton } from "../components/ui/Skeleton";
import api from "../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export function Flashcards() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", difficulty: "medium" });

  const { data: flashcards = [], isLoading } = useQuery({
    queryKey: ["flashcards"],
    queryFn: () => api.get("/users/flashcards").then((r) => r.data),
    enabled: isAuthenticated,
  });

  const createMut = useMutation({
    mutationFn: (data) => api.post("/users/flashcards", data),
    onSuccess: () => { qc.invalidateQueries(["flashcards"]); toast.success("Flashcard added!"); setModalOpen(false); setForm({ question: "", answer: "", difficulty: "medium" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/users/flashcards/${id}`),
    onSuccess: () => qc.invalidateQueries(["flashcards"]),
  });

  const diffColors = { easy: "badge-green", medium: "badge-yellow", hard: "badge-pink" };

  if (!isAuthenticated) {
    return <div className="space-y-6"><h1 className="page-title">Flashcards</h1><EmptyState icon={Brain} title="Sign in to use flashcards" description="Create spaced repetition flashcards for key concepts." /></div>;
  }

  if (studyMode && flashcards.length > 0) {
    const card = flashcards[studyIndex];
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Study Mode</h1>
          <button onClick={() => { setStudyMode(false); setFlipped(false); setStudyIndex(0); }} className="btn-secondary gap-2">
            <RotateCcw className="w-4 h-4" />Exit
          </button>
        </div>
        <div className="text-center text-sm text-text-muted">{studyIndex + 1} / {flashcards.length}</div>

        {/* Flip card */}
        <div className="cursor-pointer" onClick={() => setFlipped(!flipped)} style={{ perspective: "1000px" }}>
          <motion.div
            style={{ transformStyle: "preserve-3d", minHeight: "240px" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Front */}
            <div className="card absolute inset-0 flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: "hidden" }}>
              <span className="badge badge-blue mb-4">Question</span>
              <p className="text-lg text-text-primary">{card.question}</p>
              <p className="text-xs text-text-muted mt-4 flex items-center gap-1"><Eye className="w-3 h-3" />Click to reveal answer</p>
            </div>
            {/* Back */}
            <div className="card absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-surface-3" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <span className="badge badge-green mb-4">Answer</span>
              <p className="text-text-primary">{card.answer}</p>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setStudyIndex((i) => Math.max(0, i - 1)); setFlipped(false); }} disabled={studyIndex === 0} className="btn-secondary flex-1 gap-2 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />Prev
          </button>
          <button onClick={() => { setStudyIndex((i) => Math.min(flashcards.length - 1, i + 1)); setFlipped(false); }} disabled={studyIndex >= flashcards.length - 1} className="btn-primary flex-1 gap-2 disabled:opacity-40">
            Next<ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title mb-1">Flashcards</h1>
          <p className="text-text-muted text-sm">{flashcards.length} cards</p>
        </div>
        <div className="flex gap-3">
          {flashcards.length > 0 && (
            <button onClick={() => setStudyMode(true)} className="btn-secondary gap-2"><Brain className="w-4 h-4" />Study Mode</button>
          )}
          <button onClick={() => setModalOpen(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" />Add Card</button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : flashcards.length === 0 ? (
        <EmptyState icon={Brain} title="No flashcards yet" description="Add your first flashcard to start spaced repetition practice."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" />Add Flashcard</button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((card, i) => (
            <motion.div key={card._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card-hover p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`badge ${diffColors[card.difficulty] || "badge-blue"}`}>{card.difficulty}</span>
                <button onClick={() => deleteMut.mutate(card._id)} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-sm font-medium text-text-primary mb-2 line-clamp-2">{card.question}</p>
              <div className="border-t border-border pt-2 mt-2">
                <p className="text-xs text-text-muted mb-1">Answer</p>
                <p className="text-sm text-text-secondary line-clamp-2">{card.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Flashcard">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-text-muted mb-1 block">Question *</label>
            <textarea className="input h-24 resize-none" placeholder="What is the question?" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Answer *</label>
            <textarea className="input h-24 resize-none" placeholder="What is the answer?" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {["easy", "medium", "hard"].map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => createMut.mutate(form)} disabled={!form.question || !form.answer || createMut.isPending} className="btn-primary flex-1 justify-center">
              {createMut.isPending ? "Saving..." : "Add Flashcard"}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
