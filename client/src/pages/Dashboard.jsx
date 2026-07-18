import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Flame, Trophy, Target, BookOpen, Brain, CheckSquare,
  Bookmark, ArrowRight, Zap, Building2, TrendingUp, Star
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ProgressBar } from "../components/ui/ProgressBar";
import { CardSkeleton } from "../components/ui/Skeleton";
import api from "../lib/api";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className="card-hover p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-muted">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

const QUICK_LINKS = [
  { label: "Generate AI Roadmap", desc: "Personalized prep plan", icon: Target, to: "/roadmap", color: "bg-brand-600/15 text-brand-400" },
  { label: "Practice Questions", desc: "500+ curated questions", icon: BookOpen, to: "/questions", color: "bg-accent-purple/15 text-accent-purple" },
  { label: "Mock Interview", desc: "Timed practice session", icon: Brain, to: "/mock", color: "bg-accent-green/15 text-accent-green" },
  { label: "Company Prep", desc: "Targeted preparation", icon: Building2, to: "/companies", color: "bg-accent-orange/15 text-accent-orange" },
];

export function Dashboard() {
  const { user } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get("/users/analytics").then((r) => r.data),
    staleTime: 30000,
    retry: false,
  });

  const { data: qStats } = useQuery({
    queryKey: ["qstats"],
    queryFn: () => api.get("/questions/stats").then((r) => r.data),
    staleTime: 60000,
  });

  const progress = analytics?.checklistProgress?.percent ?? 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
      {/* Greeting */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title mb-1">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0] || "Prep Star"}</span> 👋
          </h1>
          <p className="text-text-muted text-sm">Track your progress, practice questions, and stay consistent.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-3 border border-border rounded-xl">
          <Flame className="w-4 h-4 text-accent-orange" />
          <span className="text-sm font-semibold text-text-primary">{user?.streak || 0} day streak</span>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Flame} label="Day Streak" value={analytics?.streak ?? user?.streak ?? 0} color="bg-accent-orange/15 text-accent-orange" />
            <StatCard icon={Trophy} label="Total Points" value={analytics?.totalPoints ?? user?.totalPoints ?? 0} color="bg-accent-yellow/15 text-accent-yellow" />
            <StatCard icon={Bookmark} label="Bookmarks" value={analytics?.bookmarksCount ?? 0} color="bg-accent-purple/15 text-accent-purple" to="/bookmarks" />
            <StatCard icon={Brain} label="Flashcards" value={analytics?.flashcardsCount ?? 0} color="bg-brand-600/15 text-brand-400" to="/flashcards" />
          </>
        )}
      </motion.div>

      {/* Progress + Quick Links */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <h2 className="section-title">Overall Progress</h2>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold gradient-text">{progress}%</span>
            <span className="text-text-muted text-sm mb-1">completed</span>
          </div>
          <ProgressBar value={progress} max={100} />
          <div className="mt-4 space-y-2">
            {[
              { label: "Questions Bookmarked", val: analytics?.bookmarksCount ?? 0 },
              { label: "Notes Created", val: analytics?.notesCount ?? 0 },
              { label: "Mock Sessions", val: analytics?.mockInterviews?.sessions ?? 0 },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-text-muted">{label}</span>
                <span className="text-text-secondary font-medium">{val}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ label, desc, icon: Icon, to, color }) => (
              <Link key={to} to={to}
                className="card-hover p-4 flex items-center gap-4 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm">{label}</p>
                  <p className="text-xs text-text-muted">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Question Stats */}
      {qStats && (
        <motion.div variants={fadeUp} className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-accent-purple" />
            <h2 className="section-title">Question Bank Overview</h2>
            <span className="ml-auto badge badge-purple">{qStats.total} total</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(qStats.byDifficulty || {}).map(([level, count]) => (
              <div key={level} className="bg-surface-3 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-text-primary">{count}</p>
                <p className="text-xs text-text-muted capitalize mt-1">{level}</p>
                <ProgressBar value={count} max={qStats.total} className="mt-2" />
              </div>
            ))}
            <div className="bg-surface-3 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-text-primary">{Object.keys(qStats.bySkill || {}).length}</p>
              <p className="text-xs text-text-muted mt-1">Skills</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badges */}
      {(user?.badges?.length > 0 || true) && (
        <motion.div variants={fadeUp} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-accent-yellow" />
            <h2 className="section-title">Achievements</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "🚀", name: "First Login", desc: "Started your journey" },
              { icon: "🔥", name: "On Fire", desc: "3+ day streak" },
              { icon: "📚", name: "Book Worm", desc: "Read 10+ questions" },
              { icon: "🎯", name: "Sharp Shooter", desc: "Complete a mock interview" },
            ].map((badge) => (
              <div key={badge.name} className="flex items-center gap-3 px-4 py-3 bg-surface-3 border border-border rounded-xl">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{badge.name}</p>
                  <p className="text-xs text-text-muted">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
