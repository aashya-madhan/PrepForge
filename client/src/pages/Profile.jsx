import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Flame, Trophy, BookOpen, Brain, Edit3, Save, X } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import { CardSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", college: user?.college || "", graduationYear: user?.graduationYear || "" });

  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get("/users/analytics").then((r) => r.data),
    staleTime: 30000,
  });

  const updateMut = useMutation({
    mutationFn: (data) => api.put("/auth/profile", data),
    onSuccess: (res) => {
      updateUser(res.data);
      toast.success("Profile updated!");
      setEditing(false);
    },
    onError: () => toast.error("Update failed"),
  });

  const save = () => updateMut.mutate(form);
  const cancel = () => { setEditing(false); setForm({ name: user?.name || "", bio: user?.bio || "", college: user?.college || "", graduationYear: user?.graduationYear || "" }); };

  const stats = [
    { icon: Flame, label: "Day Streak", value: analytics?.streak ?? user?.streak ?? 0, color: "text-accent-orange" },
    { icon: Trophy, label: "Total Points", value: analytics?.totalPoints ?? 0, color: "text-accent-yellow" },
    { icon: BookOpen, label: "Bookmarks", value: analytics?.bookmarksCount ?? 0, color: "text-accent-purple" },
    { icon: Brain, label: "Flashcards", value: analytics?.flashcardsCount ?? 0, color: "text-brand-400" },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="page-title">Profile</h1>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <textarea className="input h-20 resize-none" placeholder="Short bio..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
                  <input type="number" className="input" placeholder="Grad Year" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={save} disabled={updateMut.isPending} className="btn-primary gap-2"><Save className="w-3.5 h-3.5" />{updateMut.isPending ? "Saving..." : "Save"}</button>
                  <button onClick={cancel} className="btn-ghost gap-2"><X className="w-3.5 h-3.5" />Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
                  {user?.role === "admin" && <span className="badge badge-orange text-xs">Admin</span>}
                  <button onClick={() => setEditing(true)} className="btn-ghost p-1.5 ml-auto">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-text-muted">{user?.email}</p>
                {user?.bio && <p className="text-sm text-text-secondary mt-2">{user.bio}</p>}
                <div className="flex gap-4 mt-3 text-sm text-text-muted">
                  {user?.college && <span>🎓 {user.college}</span>}
                  {user?.graduationYear && <span>📅 Class of {user.graduationYear}</span>}
                </div>
                {user?.createdAt && <p className="text-xs text-text-muted mt-2">Member since {formatDate(user.createdAt)}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      {analytics && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Preparation Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Weekly Checklist</span>
                <span className="text-text-primary">{analytics.checklistProgress?.percent ?? 0}%</span>
              </div>
              <ProgressBar value={analytics.checklistProgress?.done ?? 0} max={analytics.checklistProgress?.total || 1} />
            </div>
            {analytics.mockInterviews?.sessions > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">Mock Interviews</span>
                  <span className="text-text-primary">{analytics.mockInterviews.sessions} sessions</span>
                </div>
                <ProgressBar value={analytics.mockInterviews.avgScore} max={100} color="green" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🚀", name: "First Steps", desc: "Created your account" },
            { icon: "🔥", name: "Consistency", desc: "Maintained a streak" },
            { icon: "📚", name: "Bookworm", desc: "Saved first bookmark" },
            { icon: "🧠", name: "Flash Master", desc: "Created flashcards" },
          ].map((b) => (
            <div key={b.name} className="flex items-center gap-3 p-3 bg-surface-3 rounded-xl border border-border">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-sm font-medium text-text-primary">{b.name}</p>
                <p className="text-xs text-text-muted">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
