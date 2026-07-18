import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Building2, ArrowRight, Search } from "lucide-react";
import { CardSkeleton } from "../components/ui/Skeleton";
import api from "../lib/api";

const DIFFICULTY_BADGE = {
  "Easy":      "badge-green",
  "Medium":    "badge-yellow",
  "Hard":      "badge-orange",
  "Very Hard": "badge-pink",
};

export function Companies() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get("/companies").then((r) => r.data),
    staleTime: Infinity,
  });

  const filtered = companies
    .filter((c) => filter === "all" || c.type === filter)
    .filter((c) =>
      !search || c.name.toLowerCase().includes(search.toLowerCase())
    );

  const productCount = companies.filter((c) => c.type === "product").length;
  const serviceCount = companies.filter((c) => c.type === "service").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title mb-1">Company-wise Preparation</h1>
        <p className="text-text-muted text-sm mt-1">
          Targeted prep for {companies.length} top companies — FAANG, Indian unicorns, and service giants.
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {[
            { key: "all",     label: `All (${companies.length})` },
            { key: "product", label: `Product (${productCount})` },
            { key: "service", label: `Service (${serviceCount})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                filter === key
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input className="input pl-8 py-1.5 text-sm" placeholder="Search company..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company, i) => (
            <motion.div key={company.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-hover p-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 bg-surface-3 border border-border rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {company.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary">{company.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`badge ${company.type === "product" ? "badge-blue" : "badge-orange"} text-xs`}>
                      {company.type === "product" ? "Product" : "Service"}
                    </span>
                    <span className={`badge ${DIFFICULTY_BADGE[company.difficulty] || "badge-blue"} text-xs`}>
                      {company.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-text-muted leading-relaxed mb-3">{company.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {company.skills.map((s) => (
                  <span key={s} className="tag text-xs">{s}</span>
                ))}
              </div>

              {/* CTA */}
              <Link
                to={`/companies/${company.id}`}
                state={{ company }}
                className="btn-primary w-full justify-center gap-2 text-xs"
              >
                Prepare
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-12 text-text-muted text-sm">
          No companies found for "{search}"
        </div>
      )}
    </div>
  );
}
