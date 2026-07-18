import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StickyNote, Plus, Trash2, Edit3, Tag, Search } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { CardSkeleton } from "../components/ui/Skeleton";
import api from "../lib/api";
import toast from "react-hot-toast";
import { timeAgo } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

export function Notes() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => api.get("/users/notes").then((r) => r.data),
    enabled: isAuthenticated,
  });

  const createMut = useMutation({
    mutationFn: (data) => api.post("/users/notes", data),
    onSuccess: () => { qc.invalidateQueries(["notes"]); toast.success("Note saved!"); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/users/notes/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(["notes"]); toast.success("Note updated!"); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/users/notes/${id}`),
    onSuccess: () => { qc.invalidateQueries(["notes"]); toast.success("Deleted"); },
  });

  const openCreate = () => { setEditing(null); setForm({ title: "", content: "", tags: "" }); setModalOpen(true); };
  const openEdit = (note) => { setEditing(note); setForm({ title: note.title, content: note.content, tags: (note.tags || []).join(", ") }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const save = () => {
    if (!form.title.trim()) return toast.error("Title required");
    const data = { title: form.title, content: form.content, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    if (editing) updateMut.mutate({ id: editing._id, data });
    else createMut.mutate(data);
  };

  const filtered = notes.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="page-title">Notes</h1>
        <EmptyState icon={StickyNote} title="Sign in to save notes" description="Create and organize your study notes with tags." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title mb-1">Notes</h1>
          <p className="text-text-muted text-sm">{notes.length} notes</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus className="w-4 h-4" />New Note</button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input className="input pl-9" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={StickyNote} title={notes.length === 0 ? "No notes yet" : "No results"} description={notes.length === 0 ? "Click 'New Note' to create your first study note." : "Try a different search."}
          action={notes.length === 0 && <button onClick={openCreate} className="btn-primary gap-2"><Plus className="w-4 h-4" />Create Note</button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div key={note._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }} className="card-hover p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-text-primary text-sm line-clamp-2 flex-1">{note.title}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(note)} className="btn-ghost p-1.5"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteMut.mutate(note._id)} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {note.content && <p className="text-sm text-text-muted line-clamp-3 flex-1">{note.content}</p>}
                {note.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((t) => <span key={t} className="tag text-xs flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{t}</span>)}
                  </div>
                )}
                <p className="text-[11px] text-text-muted">{timeAgo(note.updatedAt || note.createdAt)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Note" : "New Note"}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-text-muted mb-1 block">Title *</label>
            <input className="input" placeholder="Note title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Content</label>
            <textarea className="input h-36 resize-none" placeholder="Write your notes..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Tags (comma separated)</label>
            <input className="input" placeholder="DSA, Java, Interview" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={createMut.isPending || updateMut.isPending} className="btn-primary flex-1 justify-center">
              {(createMut.isPending || updateMut.isPending) ? "Saving..." : "Save Note"}
            </button>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
