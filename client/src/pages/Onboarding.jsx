import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Building2, Code2, Calendar, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

const COMPANY_TYPES = [
  { key: "product", label: "Product Based", emoji: "💻", desc: "Google, Amazon, Microsoft, Flipkart", skills: ["DSA", "System Design", "OOP", "DBMS"] },
  { key: "service", label: "Service Based", emoji: "🏢", desc: "TCS, Infosys, Accenture, Wipro",     skills: ["Aptitude", "Java", "SQL", "Communication"] },
  { key: "startup", label: "Startup",        emoji: "🚀", desc: "Fast-growing startups & unicorns",   skills: ["JavaScript", "React", "Node", "API"] },
  { key: "both",    label: "Both",           emoji: "🌐", desc: "Keeping options open",              skills: ["DSA", "Java", "Aptitude", "SQL"] },
];

const ALL_SKILLS = [
  "DSA", "System Design", "OOP", "DBMS", "Java", "Python",
  "JavaScript", "React", "Node", "SQL", "Aptitude", "HR",
  "Communication", "Machine Learning", "API", "Generative AI",
];

const PLACEMENT_DATES = [
  { key: "1month",  label: "Within 1 month",  weeks: 4  },
  { key: "3months", label: "1–3 months",       weeks: 8  },
  { key: "6months", label: "3–6 months",       weeks: 16 },
  { key: "1year",   label: "6+ months",        weeks: 24 },
];

const STEPS = [
  { id: "company",  title: "Target Company",    subtitle: "What kind of company are you aiming for?" },
  { id: "skills",   title: "Your Skills",        subtitle: "Select skills you want to prepare for" },
  { id: "timeline", title: "Placement Timeline", subtitle: "When is your placement season?" },
  { id: "done",     title: "You're all set!",    subtitle: "Your personalized prep plan is ready" },
];

export function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [companyType, setCompanyType] = useState(null);
  const [skills, setSkills] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (s) =>
    setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const next = () => setStep((s) => s + 1);

  const canNext = () => {
    if (step === 0) return !!companyType;
    if (step === 1) return skills.length >= 1;
    if (step === 2) return !!timeline;
    return true;
  };

  const finish = async () => {
    setLoading(true);
    try {
      // Save preferences to profile
      await api.put("/auth/profile", {
        skills,
        targetCompanies: [companyType],
      });
      // Mark onboarding done in localStorage so it doesn't show again
      localStorage.setItem("onboarded", "true");
      updateUser({ skills, targetCompanies: [companyType] });
      // Navigate to roadmap with preselected options
      navigate("/roadmap", {
        state: { autoGenerate: true, skills, weeks: timeline?.weeks || 8, companyType },
      });
    } catch {
      localStorage.setItem("onboarded", "true");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    localStorage.setItem("onboarded", "true");
    navigate("/dashboard");
  };

  const selectedCompany = COMPANY_TYPES.find((c) => c.key === companyType);

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent-purple rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-text-primary">PrepForge</span>
          </div>
          {step < 3 && (
            <p className="text-sm text-text-muted">
              Step {step + 1} of {STEPS.length - 1}
            </p>
          )}
        </div>

        {/* Step progress dots */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step ? "w-8 bg-brand-500" : i === step ? "w-8 bg-brand-400" : "w-4 bg-surface-4"
              }`} />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 0 — Company type */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-7">
                <h2 className="text-xl font-bold text-text-primary mb-1">{STEPS[0].title}</h2>
                <p className="text-text-muted text-sm mb-6">{STEPS[0].subtitle}</p>
                <div className="grid grid-cols-2 gap-3">
                  {COMPANY_TYPES.map((c) => (
                    <button key={c.key} onClick={() => setCompanyType(c.key)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        companyType === c.key
                          ? "border-brand-500 bg-brand-600/10"
                          : "border-border bg-surface-3 hover:border-border-bright"
                      }`}
                    >
                      <span className="text-2xl block mb-2">{c.emoji}</span>
                      <p className="font-medium text-sm text-text-primary">{c.label}</p>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1 — Skills */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-7">
                <h2 className="text-xl font-bold text-text-primary mb-1">{STEPS[1].title}</h2>
                <p className="text-text-muted text-sm mb-1">{STEPS[1].subtitle}</p>
                {selectedCompany && (
                  <p className="text-xs text-brand-400 mb-5">Suggested for {selectedCompany.label}: {selectedCompany.skills.join(", ")}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILLS.map((s) => (
                    <button key={s} onClick={() => toggleSkill(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        skills.includes(s)
                          ? "bg-brand-600 border-brand-600 text-white"
                          : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
                      }`}
                    >
                      {skills.includes(s) && <Check className="w-3 h-3 inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3">{skills.length} selected — pick at least 1</p>
              </motion.div>
            )}

            {/* Step 2 — Timeline */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-7">
                <h2 className="text-xl font-bold text-text-primary mb-1">{STEPS[2].title}</h2>
                <p className="text-text-muted text-sm mb-6">{STEPS[2].subtitle}</p>
                <div className="space-y-3">
                  {PLACEMENT_DATES.map((d) => (
                    <button key={d.key} onClick={() => setTimeline(d)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        timeline?.key === d.key
                          ? "border-brand-500 bg-brand-600/10"
                          : "border-border bg-surface-3 hover:border-border-bright"
                      }`}
                    >
                      <Calendar className={`w-5 h-5 flex-shrink-0 ${timeline?.key === d.key ? "text-brand-400" : "text-text-muted"}`} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{d.label}</p>
                        <p className="text-xs text-text-muted">{d.weeks}-week study plan will be generated</p>
                      </div>
                      {timeline?.key === d.key && (
                        <Check className="w-4 h-4 text-brand-400 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3 — Done */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="p-7 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-5"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-text-primary mb-2">Welcome, {user?.name?.split(" ")[0]}! 🎉</h2>
                <p className="text-text-muted text-sm mb-6">Here's your setup summary:</p>
                <div className="space-y-2 text-left mb-6">
                  {[
                    { label: "Target", value: COMPANY_TYPES.find((c) => c.key === companyType)?.label },
                    { label: "Skills",   value: skills.slice(0, 4).join(", ") + (skills.length > 4 ? ` +${skills.length - 4} more` : "") },
                    { label: "Timeline", value: timeline?.label },
                    { label: "Plan",     value: `${timeline?.weeks}-week personalized roadmap` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-surface-3 rounded-xl">
                      <Check className="w-4 h-4 text-accent-green flex-shrink-0" />
                      <span className="text-xs text-text-muted w-16">{label}</span>
                      <span className="text-sm text-text-primary font-medium flex-1">{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={finish} disabled={loading} className="btn-primary w-full justify-center gap-2 py-3 text-base">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Zap className="w-5 h-5" />Generate My Roadmap</>
                  }
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation footer */}
          {step < 3 && (
            <div className="px-7 pb-7 flex items-center justify-between">
              <button onClick={skip} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                Skip for now
              </button>
              <button onClick={next} disabled={!canNext()}
                className="btn-primary gap-2 disabled:opacity-40"
              >
                {step === 2 ? "Finish Setup" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
