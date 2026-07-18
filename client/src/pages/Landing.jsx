import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap, BookOpen, Brain, Target, Building2, BarChart3,
  CheckSquare, ArrowRight, Star, Users, Trophy, Sparkles,
  Code2, FileText, Mic, StickyNote
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const FEATURES = [
  { icon: Target, title: "AI Study Roadmap", desc: "Personalized weekly plans based on your skills and target company.", color: "text-brand-400 bg-brand-600/10" },
  { icon: BookOpen, title: "Question Bank", desc: "500+ curated questions with filters by skill, difficulty, and company.", color: "text-accent-purple bg-accent-purple/10" },
  { icon: Building2, title: "Company Prep", desc: "Targeted preparation for TCS, Infosys, Amazon, Microsoft, Google.", color: "text-accent-green bg-accent-green/10" },
  { icon: Mic, title: "Mock Interview", desc: "Timed practice sessions with instant scoring and feedback.", color: "text-accent-orange bg-accent-orange/10" },
  { icon: FileText, title: "Resume Analyzer", desc: "ATS score checker with keyword optimization tips.", color: "text-accent-pink bg-accent-pink/10" },
  { icon: CheckSquare, title: "Daily Checklist", desc: "Track your progress with weekly checklists and streak counters.", color: "text-accent-yellow bg-accent-yellow/10" },
  { icon: Brain, title: "Flashcards", desc: "Spaced repetition flashcards for key concepts and answers.", color: "text-cyan-400 bg-cyan-400/10" },
  { icon: StickyNote, title: "Notes", desc: "Rich personal notes with tags, organized by topic.", color: "text-rose-400 bg-rose-400/10" },
];

const STATS = [
  { value: "500+", label: "Questions", icon: BookOpen },
  { value: "17", label: "Skills Covered", icon: Code2 },
  { value: "10+", label: "Companies", icon: Building2 },
  { value: "100%", label: "Free to Use", icon: Star },
];

const COMPANIES = ["Amazon", "Google", "Microsoft", "TCS", "Infosys", "Accenture", "Wipro", "Flipkart"];

export function Landing() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-text-primary">PrepForge</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#companies" className="hover:text-text-primary transition-colors">Companies</a>
            <a href="#stats" className="hover:text-text-primary transition-colors">Stats</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent-purple/8 rounded-full blur-[100px]" />
        </div>

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeUp}>
            <span className="badge badge-blue mb-6 inline-flex">
              <Sparkles className="w-3 h-3" />
              AI-Powered Placement Preparation
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Crack Your Next{" "}
            <span className="text-gradient">Interview</span>
            <br />with Confidence
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
            A complete placement preparation platform with AI roadmaps, 500+ questions, mock interviews,
            resume analysis, and company-specific prep — all in one place.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all duration-150 text-base shadow-glow-sm hover:shadow-glow-md"
            >
              Start Preparing Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-surface-3 hover:bg-surface-4 text-text-primary border border-border hover:border-border-bright font-medium rounded-xl transition-all text-base">
              Sign In
            </Link>
          </motion.div>

          {/* Companies strip */}
          <motion.div variants={fadeUp} className="mt-16">
            <p className="text-xs text-text-muted mb-4 uppercase tracking-widest">Prep for top companies</p>
            <div className="flex flex-wrap justify-center gap-3">
              {COMPANIES.map((c) => (
                <span key={c} className="px-3 py-1 bg-surface-3 border border-border rounded-full text-sm text-text-secondary">{c}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 border-y border-border bg-surface-1">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-10 h-10 bg-surface-3 border border-border rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <div className="text-3xl font-bold text-text-primary">{value}</div>
              <div className="text-sm text-text-muted">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything you need to get placed</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              From question banks to mock interviews, we've built every tool you need for a successful placement season.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card-hover p-5 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1.5">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section id="companies" className="py-24 px-6 bg-surface-1 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Company-wise Preparation</h2>
            <p className="text-text-secondary">Targeted interview preparation for the companies you're aiming for.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: "product", label: "Product Based", companies: ["Amazon", "Google", "Microsoft", "Flipkart", "Uber"], color: "badge-blue", desc: "DSA, System Design, Core CS, Problem Solving" },
              { type: "service", label: "Service Based", companies: ["TCS", "Infosys", "Accenture", "Wipro", "Cognizant"], color: "badge-orange", desc: "Aptitude, Communication, Basic Programming, HR" },
            ].map(({ type, label, companies, color, desc }) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: type === "product" ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <span className={color}>{label}</span>
                <h3 className="text-lg font-semibold mt-3 mb-1">{label} Companies</h3>
                <p className="text-sm text-text-muted mb-4">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {companies.map((c) => (
                    <span key={c} className="tag">{c}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Ready to get placed?</h2>
            <p className="text-text-secondary mb-8">
              Join thousands of students who've cracked their dream company using PrepForge.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all text-base shadow-glow-sm hover:shadow-glow-md"
            >
              <Zap className="w-5 h-5" />
              Start For Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-text-muted">
        <p>PrepForge — AI-Powered Placement Preparation Platform. Built with ❤️ for students.</p>
      </footer>
    </div>
  );
}
