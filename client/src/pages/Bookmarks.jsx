import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, BookmarkX, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../components/ui/EmptyState";
import { CardSkeleton } from "../components/ui/Skeleton";
import { getDifficultyColor } from "../lib/utils";
import api from "../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export function Bookmarks() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: bookmarkIds = [], isLoading: loadingIds } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => api.get("/users/bookmarks").then((r) => r.data.bookmarks),
    enabled: isAuthenticated,
  });

  const { data: allQ = [], isLoading: loadingQ } = useQuery({
    queryKey: ["all-questions-raw"],
    queryFn: () => api.get("/questions?limit=200").then((r) => r.data.questions),
    staleTime: Infinity,
  });

  const removeMut = useMutation({
    mutationFn: (id) => api.post(`/users/bookmarks/${id}`),
    onSuccess: (d) => { qc.setQueryData(["bookmarks"], d.bookmarks); toast.success("Removed"); },
  });

  const bookmarked = allQ.filter((q) => bookmarkIds.includes(q.id));
  const filtered = bookmarked.filter((q) => q.question.toLowerCase().includes(search.toLowerCase()));

  if (!isAuthenticated) {
    return <div className="space-y-6"><h1 className="page-title">Bookmarks</h1><EmptyState icon={Bookmark} title="Sign in to view bookmarks" description="Bookmark questions and access them anytime." /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title mb-1">Bookmarks</h1>
        <p className="text-text-muted text-sm">{bookmarked.length} saved questions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input className="input pl-9" placeholder="Search bookmarked questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loadingIds || loadingQ ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bookmark} title={bookmarked.length === 0 ? "No bookmarks yet" : "No results"} description={bookmarked.length === 0 ? "Bookmark questions from the Question Bank to save them here." : "Try a different search."} />
      ) : (
        <div className="space-y-2">
          {filtered.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="card p-4 flex items-center gap-3"
            >
              <span className="text-text-muted text-xs font-mono w-8 text-right shrink-0">#{q.id}</span>
              <p className="flex-1 text-sm text-text-secondary">{q.question}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className={getDifficultyColor(q.difficulty)}>{q.difficulty}</span>
                <span className="tag">{q.skill}</span>
                <button onClick={() => removeMut.mutate(q.id)} className="btn-ghost p-1.5 hover:text-red-400" title="Remove bookmark">
                  <BookmarkX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
