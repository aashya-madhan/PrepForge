import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Zap, CheckCircle, XCircle, AlertTriangle, ArrowRight, BarChart3 } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";

// Extract meaningful keywords from text
function extractKeywords(text) {
  const lower = text.toLowerCase();
  // Tech skills
  const TECH = [
    "javascript","typescript","python","java","c++","c#","go","rust","kotlin","swift",
    "react","angular","vue","next.js","node.js","express","django","flask","spring","fastapi",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","cassandra","dynamodb",
    "aws","azure","gcp","docker","kubernetes","terraform","jenkins","ci/cd","git",
    "html","css","sass","tailwind","rest","graphql","grpc","kafka","rabbitmq",
    "machine learning","deep learning","tensorflow","pytorch","scikit-learn","nlp",
    "system design","microservices","distributed systems","api","agile","scrum","devops",
    "linux","bash","shell","data structures","algorithms","oop","design patterns",
    "testing","jest","selenium","cypress","junit","pytest",
    "figma","photoshop","ui/ux","responsive design","accessibility",
    "tableau","power bi","excel","spark","hadoop","data engineering",
  ];
  // Soft skills
  const SOFT = [
    "communication","teamwork","leadership","problem-solving","analytical","critical thinking",
    "time management","collaboration","adaptability","creativity","attention to detail",
    "self-motivated","initiative","ownership","fast learner","multitasking",
  ];
  // Experience level keywords
  const EXPERIENCE = [
    "fresher","entry level","0-1 year","1-2 years","2-3 years","3-5 years","5+ years",
    "senior","junior","mid-level","internship","graduate",
  ];
  // Degree / qualification
  const DEGREE = [
    "b.tech","b.e","m.tech","m.e","bsc","msc","bachelor","master","engineering",
    "computer science","information technology","cse","it","ece","mca",
  ];

  const found = { tech: [], soft: [], experience: [], degree: [] };
  TECH.forEach((k) => { if (lower.includes(k)) found.tech.push(k); });
  SOFT.forEach((k) => { if (lower.includes(k)) found.soft.push(k); });
  EXPERIENCE.forEach((k) => { if (lower.includes(k)) found.experience.push(k); });
  DEGREE.forEach((k) => { if (lower.includes(k)) found.degree.push(k); });
  return found;
}

function matchScore(jdKw, resumeKw) {
  const results = { matched: [], missing: [], score: 0, breakdown: [] };
  const categories = [
    { key: "tech",       label: "Technical Skills", weight: 50 },
    { key: "soft",       label: "Soft Skills",       weight: 20 },
    { key: "experience", label: "Experience Level",  weight: 20 },
    { key: "degree",     label: "Qualifications",    weight: 10 },
  ];

  let totalScore = 0;
  categories.forEach(({ key, label, weight }) => {
    const jdSet  = new Set(jdKw[key]);
    const resSet = new Set(resumeKw[key]);
    if (jdSet.size === 0) {
      results.breakdown.push({ label, matched: 0, total: 0, score: weight, maxScore: weight, pct: 100 });
      totalScore += weight;
      return;
    }
    const matched = [...jdSet].filter((k) => resSet.has(k));
    const missing = [...jdSet].filter((k) => !resSet.has(k));
    const pct = Math.round((matched.length / jdSet.size) * 100);
    const earned = Math.round((matched.length / jdSet.size) * weight);
    results.matched.push(...matched);
    results.missing.push(...missing);
    totalScore += earned;
    results.breakdown.push({ label, matched: matched.length, total: jdSet.size, score: earned, maxScore: weight, pct });
  });

  results.score = Math.min(100, totalScore);
  return results;
}

export function JDMatcher() {
  const [jd, setJd]         = useState("");
  const [resume, setResume] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = () => {
    if (jd.length < 50 || resume.length < 50) return;
    setAnalyzing(true);
    setTimeout(() => {
      const jdKw     = extractKeywords(jd);
      const resumeKw = extractKeywords(resume);
      const match    = matchScore(jdKw, resumeKw);
      setResult({ match, jdKw, resumeKw });
      setAnalyzing(false);
    }, 800);
  };

  const score  = result?.match?.score || 0;
  const label  = score >= 80 ? "Excellent Match 🎯" : score >= 60 ? "Good Match 👍" : score >= 40 ? "Partial Match ⚠️" : "Low Match ❌";
  const color  = score >= 80 ? "green" : score >= 60 ? "brand" : "orange";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title mb-1">Job Description Matcher</h1>
        <p className="text-text-muted text-sm">Paste a job description and your resume — see exactly how well they match and what's missing.</p>
      </div>

      {/* Input area */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" />
            Job Description
          </label>
          <textarea
            className="input h-56 resize-none text-xs"
            placeholder="Paste the full job description here — requirements, skills, responsibilities..."
            value={jd}
            onChange={(e) => { setJd(e.target.value); setResult(null); }}
          />
          <p className="text-xs text-text-muted">{jd.split(/\s+/).filter(Boolean).length} words</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-purple" />
            Your Resume
          </label>
          <textarea
            className="input h-56 resize-none text-xs"
            placeholder="Paste your resume text here — skills, experience, education, projects..."
            value={resume}
            onChange={(e) => { setResume(e.target.value); setResult(null); }}
          />
          <p className="text-xs text-text-muted">{resume.split(/\s+/).filter(Boolean).length} words</p>
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={analyzing || jd.length < 50 || resume.length < 50}
        className="btn-primary gap-2 disabled:opacity-40"
      >
        {analyzing
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
          : <><Zap className="w-4 h-4" />Match Resume to JD</>
        }
      </button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score */}
            <div className="card p-6 text-center">
              <p className="text-sm text-text-muted mb-2">JD Match Score</p>
              <div className="text-6xl font-bold gradient-text mb-2">{score}%</div>
              <span className={`badge text-sm ${score >= 80 ? "badge-green" : score >= 60 ? "badge-blue" : score >= 40 ? "badge-yellow" : "badge-pink"}`}>
                {label}
              </span>
              <div className="mt-4 max-w-sm mx-auto">
                <ProgressBar value={score} max={100} color={color} />
              </div>
              <p className="text-xs text-text-muted mt-3">
                {score >= 80
                  ? "Your resume is strongly aligned with this JD. You should apply!"
                  : score >= 60
                  ? "Good alignment. Add the missing keywords to strengthen your application."
                  : score >= 40
                  ? "Partial match. Your resume needs significant tailoring for this role."
                  : "Low match. Consider building the missing skills or target a better-fitting role."}
              </p>
            </div>

            {/* Category breakdown */}
            <div className="card p-5">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                Category Breakdown
              </h3>
              <div className="space-y-3">
                {result.match.breakdown.map((b) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-36 shrink-0">{b.label}</span>
                    <div className="flex-1">
                      <ProgressBar
                        value={b.total > 0 ? b.matched : b.maxScore}
                        max={b.total > 0 ? b.total : b.maxScore}
                        color={b.pct >= 70 ? "green" : b.pct >= 40 ? "brand" : "orange"}
                      />
                    </div>
                    <span className="text-xs text-text-secondary w-24 text-right shrink-0">
                      {b.total > 0 ? `${b.matched}/${b.total} keywords` : "Not specified"}
                    </span>
                    <span className={`text-xs font-bold w-10 text-right shrink-0 ${b.pct >= 70 ? "text-accent-green" : b.pct >= 40 ? "text-brand-400" : "text-accent-orange"}`}>
                      {b.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched + Missing keywords */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-accent-green mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Matched Keywords ({result.match.matched.length})
                </h3>
                {result.match.matched.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.match.matched.map((k) => (
                      <span key={k} className="badge badge-green text-xs capitalize">{k}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">No matching keywords found.</p>
                )}
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Missing from Resume ({result.match.missing.length})
                </h3>
                {result.match.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.match.missing.map((k) => (
                      <span key={k} className="badge badge-pink text-xs capitalize">{k}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">No missing keywords — great match!</p>
                )}
              </div>
            </div>

            {/* Action plan */}
            {result.match.missing.length > 0 && (
              <div className="card p-5">
                <h3 className="section-title mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-yellow" />
                  Action Plan to Improve Your Match
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="badge badge-pink flex-shrink-0">Step 1</span>
                    <p className="text-sm text-text-muted">
                      Add the missing technical keywords to your Skills section — only if you genuinely know them.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="badge badge-yellow flex-shrink-0">Step 2</span>
                    <p className="text-sm text-text-muted">
                      Rewrite your experience bullet points to include JD keywords naturally — e.g., if JD says "REST APIs", make sure your resume says "REST APIs" not just "APIs".
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="badge badge-blue flex-shrink-0">Step 3</span>
                    <p className="text-sm text-text-muted">
                      Tailor your professional summary to include the most important missing keywords from the JD.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="badge badge-green flex-shrink-0">Step 4</span>
                    <p className="text-sm text-text-muted">
                      Run the analyzer again after updating — aim for 75%+ for a strong application.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
