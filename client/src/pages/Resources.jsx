import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Library, ExternalLink, Star } from "lucide-react";
import { CardSkeleton } from "../components/ui/Skeleton";
import api from "../lib/api";
import { useState } from "react";

const TYPE_COLORS = {
  practice: "badge-blue",
  course: "badge-purple",
  guide: "badge-green",
  tool: "badge-orange",
};

export function Resources() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => api.get("/resources").then((r) => r.data),
    staleTime: Infinity,
  });

  const categories = ["All", ...new Set(resources.map((r) => r.category))];
  const filtered = activeCategory === "All" ? resources : resources.filter((r) => r.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title mb-1">Resource Library</h1>
        <p className="text-text-muted text-sm">Curated learning resources for placement preparation</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
              activeCategory === cat
                ? "bg-brand-600 border-brand-600 text-white"
                : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <motion.a
              key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card-hover p-5 group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={`badge ${TYPE_COLORS[r.type] || "badge-blue"} capitalize`}>{r.type}</span>
                  {!r.free && <span className="badge badge-yellow">Premium</span>}
                  {r.free && <span className="badge badge-green">Free</span>}
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-colors flex-shrink-0" />
              </div>
              <h3 className="font-semibold text-text-primary mb-1.5 group-hover:text-brand-300 transition-colors">{r.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{r.description}</p>
              <div className="mt-3 pt-3 border-t border-border">
                <span className="tag text-xs">{r.category}</span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
