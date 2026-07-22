import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Brain, Building2, Target,
  CheckSquare, Bookmark, Mic, FileText, StickyNote, Library,
  LogOut, Zap, ChevronRight, Shield, Timer, MessageSquare,
  GitCompare, Sun, Moon
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard" },
  { label: "Roadmap",           icon: Target,          path: "/roadmap" },
  { label: "Question Bank",     icon: BookOpen,        path: "/questions" },
  { label: "Mock Interview",    icon: Mic,             path: "/mock" },
  { label: "Companies",         icon: Building2,       path: "/companies" },
  { label: "Study Timer",       icon: Timer,           path: "/timer" },
  { label: "Experiences",       icon: MessageSquare,   path: "/experiences" },
  { label: "JD Matcher",        icon: GitCompare,      path: "/jd-matcher" },
  { label: "Checklist",         icon: CheckSquare,     path: "/checklist" },
  { label: "Notes",             icon: StickyNote,      path: "/notes" },
  { label: "Flashcards",        icon: Brain,           path: "/flashcards" },
  { label: "Bookmarks",         icon: Bookmark,        path: "/bookmarks" },
  { label: "Resume Analyzer",   icon: FileText,        path: "/resume" },
  { label: "Resources",         icon: Library,         path: "/resources" },
];

export function Sidebar({ collapsed, onCollapse }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen border-r border-border flex flex-col z-40 transition-all duration-300",
      "bg-surface-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <span className="font-bold text-sm text-text-primary leading-tight block">PrepForge</span>
            <span className="text-[10px] text-text-muted">Placement Platform</span>
          </motion.div>
        )}
        <button
          onClick={() => onCollapse(!collapsed)}
          className={cn("ml-auto btn-ghost p-1 rounded transition-transform", collapsed && "rotate-180")}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + "/");
          return (
            <Link key={path} to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-surface-4 text-text-primary border-l-2 border-brand-500 rounded-l-none pl-[10px]"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-3"
              )}
              title={collapsed ? label : ""}
            >
              <Icon className={cn("flex-shrink-0 w-4 h-4", active && "text-brand-400")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <Link to="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
              location.pathname === "/admin"
                ? "bg-accent-orange/15 text-accent-orange border-l-2 border-accent-orange rounded-l-none pl-[10px]"
                : "text-text-secondary hover:text-accent-orange hover:bg-surface-3"
            )}
            title={collapsed ? "Admin" : ""}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-0.5">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all w-full"
          title={collapsed ? (isDark ? "Light Mode" : "Dark Mode") : ""}
        >
          {isDark
            ? <Sun  className="w-4 h-4 flex-shrink-0 text-accent-yellow" />
            : <Moon className="w-4 h-4 flex-shrink-0 text-brand-400" />
          }
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Profile */}
        <Link to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-3 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email || ""}</p>
            </motion.div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-red-400 hover:bg-surface-3 transition-all w-full"
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
