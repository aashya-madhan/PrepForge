import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, CheckCircle, XCircle, AlertTriangle, Zap, File, X, CloudUpload } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import toast from "react-hot-toast";
// Local worker — Vite ?url gives the correct bundled asset path, no CDN needed
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// ─── ATS Analysis Engine ──────────────────────────────────────────────────
// Each criterion is independently measured and scored.
// A bare resume (just sections + email) → ~25–35
// Average fresher resume → ~45–60
// Strong polished resume → ~70–85

const TECH_KEYWORDS = [
  "javascript","typescript","python","java","c++","c#","react","angular","vue",
  "node.js","express","django","flask","spring","fastapi","next.js",
  "sql","mysql","postgresql","mongodb","redis","firebase","elasticsearch",
  "aws","azure","gcp","docker","kubernetes","git","linux","bash",
  "rest api","graphql","microservices","ci/cd","devops","testing","agile",
  "machine learning","deep learning","tensorflow","pytorch","data structures",
  "algorithms","system design","html","css","redux","android","ios","swift","kotlin",
];

const ACTION_VERBS = [
  "developed","built","designed","implemented","optimized","led","managed",
  "created","delivered","improved","reduced","increased","launched","automated",
  "architected","deployed","migrated","integrated","mentored","engineered",
  "spearheaded","streamlined","refactored","debugged","tested","analyzed",
  "researched","coordinated","achieved","established","overhauled","resolved",
];

const WEAK_WORDS = [
  "responsible for","worked on","helped with","assisted in","involved in",
  "familiar with","exposure to","basic knowledge of","participated in","was part of",
];

function analyzeResume(text) {
  if (!text || text.trim().length < 20) {
    return { score: 0, checks: [], breakdown: [], foundKeywords: [], missingKeywords: [], wordCount: 0, metrics: {} };
  }

  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wCount = words.length;
  let score = 0;
  const checks = [];
  const breakdown = [];

  // ── 1. REQUIRED SECTIONS (max 20 pts — 5 each) ────────────────────────
  // Use word-boundary regex so "skills" isn't matched inside "lifeskills"
  const SECTION_PATTERNS = {
    experience: /\b(experience|work experience|employment|internship|professional experience)\b/i,
    education:  /\b(education|academic|qualification|degree|university|college)\b/i,
    skills:     /\b(skills|technical skills|core competencies|competencies)\b/i,
    projects:   /\b(projects|personal projects|academic projects|key projects)\b/i,
  };
  let secScore = 0;
  Object.entries(SECTION_PATTERNS).forEach(([name, pattern]) => {
    const found = pattern.test(text);
    checks.push({ label: `"${name.charAt(0).toUpperCase() + name.slice(1)}" section`, pass: found, type: "structure" });
    if (found) secScore += 5;
  });
  score += secScore;
  breakdown.push({ label: "Required Sections", earned: secScore, max: 20 });

  // ── 2. CONTACT INFO (max 10 pts) ──────────────────────────────────────
  // Email: standard pattern
  const hasEmail = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}\b/.test(text);
  // Phone: must look like a real phone (10+ digit sequence, not a year or ID)
  const hasPhone = /(\+?1?\s?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})|(\+?91[\s\-]?\d{5}[\s\-]?\d{5})|(\+?[\d]{10,12})/.test(text.replace(/\b(19|20)\d{2}\b/g, ""));
  // LinkedIn: must have actual URL pattern
  const hasLinkedin = /linkedin\.com\/(in|pub)\/[\w\-]+/i.test(text) || /linkedin\.com\/in\//i.test(lower);
  // GitHub: must have actual URL
  const hasGithub = /github\.com\/[\w\-]+/i.test(text);

  checks.push({ label: "Professional email address",       pass: hasEmail,    type: "contact" });
  checks.push({ label: "Phone number (proper format)",     pass: hasPhone,    type: "contact" });
  checks.push({ label: "LinkedIn URL (linkedin.com/in/…)", pass: hasLinkedin, type: "contact" });
  checks.push({ label: "GitHub URL (github.com/…)",        pass: hasGithub,   type: "contact" });

  const contactScore = (hasEmail ? 4 : 0) + (hasPhone ? 2 : 0) + (hasLinkedin ? 2 : 0) + (hasGithub ? 2 : 0);
  score += contactScore;
  breakdown.push({ label: "Contact Completeness", earned: contactScore, max: 10 });

  // ── 3. RESUME LENGTH (max 8 pts) ──────────────────────────────────────
  let lengthScore = 0;
  let lengthPass = false;
  if      (wCount >= 200 && wCount <= 600)  { lengthScore = 8;  lengthPass = true; }
  else if (wCount > 600  && wCount <= 900)  { lengthScore = 5;  lengthPass = false; }
  else if (wCount >= 100 && wCount < 200)   { lengthScore = 3;  lengthPass = false; }
  else if (wCount > 900  && wCount <= 1400) { lengthScore = 3;  lengthPass = false; }
  else if (wCount > 1400)                   { lengthScore = 1;  lengthPass = false; }
  else                                       { lengthScore = 0;  lengthPass = false; }

  checks.push({ label: `Word count: ${wCount} words (ideal: 200–600 for freshers)`, pass: lengthPass, type: "format" });
  score += lengthScore;
  breakdown.push({ label: "Resume Length", earned: lengthScore, max: 8 });

  // ── 4. TECHNICAL KEYWORDS (max 22 pts) ────────────────────────────────
  // Match whole words only to avoid false positives (e.g. "javanese" ≠ "java")
  const foundTech = TECH_KEYWORDS.filter((k) => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(lower);
  });
  const missingTech = TECH_KEYWORDS.filter((k) => !foundTech.includes(k));
  // 0 keywords = 0pts, scaling up — needs 10+ for full marks
  const techScore = Math.min(22, Math.round((foundTech.length / 10) * 22));
  checks.push({
    label: `Technical keywords: ${foundTech.length} found (need 10+ for full marks)`,
    pass: foundTech.length >= 6,
    type: "keywords",
  });
  score += techScore;
  breakdown.push({ label: "Technical Keywords", earned: techScore, max: 22 });

  // ── 5. ACTION VERBS (max 10 pts) ──────────────────────────────────────
  // Only count verbs at word boundaries (start of line or after newline/bullet)
  const foundVerbs = ACTION_VERBS.filter((v) =>
    new RegExp(`(^|\\n|•|-)\\s*${v}\\b`, "im").test(text)
  );
  // Also count verbs that appear naturally in sentences
  const verbsInText = ACTION_VERBS.filter((v) =>
    new RegExp(`\\b${v}(d|ed|ing|s)?\\b`, "i").test(text)
  );
  const actionCount = Math.max(foundVerbs.length, Math.round(verbsInText.length * 0.7));
  const actionScore = Math.min(10, Math.round((actionCount / 7) * 10));

  checks.push({
    label: `Action verbs: ${actionCount} found (need 7+ for full marks)`,
    pass: actionCount >= 4,
    type: "content",
  });
  score += actionScore;
  breakdown.push({ label: "Action Verbs", earned: actionScore, max: 10 });

  // ── 6. QUANTIFIED ACHIEVEMENTS (max 15 pts) ───────────────────────────
  // Only count MEANINGFUL metrics (numbers + context words), not years or phone numbers
  const metricMatches = text.match(
    /\b\d+[\d,]*\s*(%|x\b|times|users|customers|clients|projects|team members|engineers|bugs|issues|features|ms\b|seconds|kb|mb|gb|lines of code|repos|apps|services|endpoints|commits|requests|transactions|points|hours per|minutes per|faster|improvement|increase|decrease|reduction)\b/gi
  ) || [];
  // Deduplicate and count
  const uniqueMetrics = new Set(metricMatches.map((m) => m.toLowerCase().trim())).size;
  const metricScore = Math.min(15, uniqueMetrics * 5);

  checks.push({
    label: `Quantified impact: ${uniqueMetrics} metrics found (e.g. "Reduced load time by 40%")`,
    pass: uniqueMetrics >= 2,
    type: "impact",
  });
  score += metricScore;
  breakdown.push({ label: "Quantified Impact", earned: metricScore, max: 15 });

  // ── 7. WEAK LANGUAGE PENALTY (up to -10 pts) ──────────────────────────
  const foundWeakPhrases = WEAK_WORDS.filter((w) =>
    new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
  );
  const weakPenalty = Math.min(10, foundWeakPhrases.length * 3);
  checks.push({
    label: `Weak phrases: ${foundWeakPhrases.length} found${foundWeakPhrases.length > 0 ? ` ("${foundWeakPhrases[0]}", …)` : " — none ✓"}`,
    pass: foundWeakPhrases.length === 0,
    type: "language",
  });
  score = Math.max(0, score - weakPenalty);
  if (weakPenalty > 0) {
    breakdown.push({ label: "Weak Language Penalty", earned: -weakPenalty, max: 0 });
  }

  // ── 8. WRITING STYLE — no first-person pronouns (max 5 pts) ──────────
  // Only flag actual first-person usage, not names like "I.T." or "I/O"
  const pronounRegex = /\b(I am |I have |I was |I built |I led |I designed |I developed |I created |My responsibilities|My role |My experience)\b/;
  const hasPronouns = pronounRegex.test(text);
  checks.push({
    label: "No first-person pronouns ('I built' → 'Built')",
    pass: !hasPronouns,
    type: "format",
  });
  if (!hasPronouns) score += 5;
  breakdown.push({ label: "Writing Style", earned: hasPronouns ? 0 : 5, max: 5 });

  // ── 9. PROFESSIONAL SUMMARY (max 5 pts) ──────────────────────────────
  const hasSummary = /\b(summary|objective|professional profile|career objective|about me|profile)\b/i.test(text);
  checks.push({ label: "Professional summary/objective section", pass: hasSummary, type: "structure" });
  if (hasSummary) score += 5;
  breakdown.push({ label: "Summary Section", earned: hasSummary ? 5 : 0, max: 5 });

  // ── 10. FORMATTING (max 5 pts) ────────────────────────────────────────
  // Bullet points: must be actual bullet characters or consistent dashes at line start
  const hasBullets = /^[\s]*(•|▪|◦|→|►|\*|\-)\s+\w/m.test(text);
  // Dates: formatted as "Month Year" or "YYYY–YYYY" or "MM/YYYY"
  const hasDates = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}|(19|20)\d{2}\s*[–\-–]\s*(19|20)\d{2}|((0?[1-9]|1[0-2])\/(19|20)\d{2})/i.test(text);
  // Degree
  const hasDegree = /\b(b\.?tech|b\.?e\.?|m\.?tech|m\.?e\.?|b\.?sc|m\.?sc|bachelor|master|b\.?c\.?a|m\.?c\.?a|phd|ph\.?d)\b/i.test(text);

  const formatScore = (hasBullets ? 2 : 0) + (hasDates ? 1 : 0) + (hasDegree ? 2 : 0);
  checks.push({ label: "Bullet points at line start (•, -, ▪)", pass: hasBullets, type: "format" });
  checks.push({ label: "Dates formatted (e.g. Jan 2023 – Jun 2024)", pass: hasDates, type: "format" });
  checks.push({ label: "Degree/qualification explicitly mentioned", pass: hasDegree, type: "format" });
  score += formatScore;
  breakdown.push({ label: "Formatting Signals", earned: formatScore, max: 5 });

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    checks,
    breakdown,
    foundKeywords: foundTech.slice(0, 24),
    missingKeywords: missingTech.filter((k) => k.length > 2).slice(0, 14),
    wordCount: wCount,
    metrics: {
      uniqueMetrics,
      actionCount,
      techCount: foundTech.length,
      weakCount: foundWeakPhrases.length,
    },
  };
}

// ─── PDF Text Extraction (using local pdfjs-dist worker via Vite ?url) ──────
async function extractTextFromPDF(file) {
  const pdfjsLib = await import("pdfjs-dist");
  // Use the locally bundled worker — no CDN, works offline
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return fullText.trim();
}

// ─── Component ─────────────────────────────────────────────────────────────
export function ResumeAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    const isText = file.type === "text/plain";
    const isPDF  = file.type === "application/pdf";
    if (!isText && !isPDF) {
      toast.error("Only PDF or TXT files are supported");
      return;
    }
    setUploadedFile(file);
    setExtracting(true);
    setResult(null);
    try {
      let extracted = "";
      if (isPDF) {
        extracted = await extractTextFromPDF(file);
        if (!extracted || extracted.length < 30) {
          toast.error("Could not extract text from this PDF. Try copy-pasting the text instead.");
          setExtracting(false);
          return;
        }
      } else {
        extracted = await file.text();
      }
      setText(extracted);
      toast.success(`Extracted ${extracted.split(/\s+/).filter(Boolean).length} words from ${file.name}`);
    } catch (err) {
      toast.error("Failed to read file: " + err.message);
    } finally {
      setExtracting(false);
    }
  }, []);

  const onFileInput = (e) => { processFile(e.target.files[0]); e.target.value = ""; };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };

  const analyze = () => {
    if (!text.trim() || text.length < 50) { toast.error("Add more resume content before analyzing"); return; }
    setAnalyzing(true);
    setTimeout(() => { setResult(analyzeResume(text)); setAnalyzing(false); }, 900);
  };

  const clearAll = () => { setText(""); setResult(null); setUploadedFile(null); };

  const scoreColor = result
    ? result.score >= 80 ? "green" : result.score >= 60 ? "brand" : "orange"
    : "brand";
  const scoreLabel = result
    ? result.score >= 80 ? "Excellent ✨" : result.score >= 60 ? "Good 👍" : result.score >= 40 ? "Fair ⚠️" : "Needs Work ❌"
    : "";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title mb-1">Resume Analyzer</h1>
        <p className="text-text-muted text-sm">Upload your PDF resume or paste the text to get an ATS score and actionable tips.</p>
      </div>

      {/* Upload + Paste area */}
      <div className="card p-5 space-y-4">
        {/* Drag & Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-brand-500 bg-brand-600/10"
              : "border-border hover:border-brand-500/50 hover:bg-surface-3"
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={onFileInput} />
          {extracting ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Extracting text from PDF...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex items-center justify-center gap-3">
              <File className="w-6 h-6 text-brand-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">{uploadedFile.name}</p>
                <p className="text-xs text-text-muted">{(uploadedFile.size / 1024).toFixed(1)} KB — click to replace</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); clearAll(); }}
                className="ml-2 btn-ghost p-1.5 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-surface-3 rounded-xl flex items-center justify-center">
                <CloudUpload className="w-6 h-6 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Drop your resume PDF here</p>
                <p className="text-xs text-text-muted mt-1">or click to browse — PDF and TXT supported</p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <div className="flex-1 border-t border-border" />
          <span>or paste resume text directly</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Text area */}
        <div className="relative">
          <textarea
            className="input h-48 resize-none font-mono text-xs"
            placeholder="Paste your full resume text here (Name, Skills, Experience, Education, Projects)..."
            value={text}
            onChange={(e) => { setText(e.target.value); setUploadedFile(null); }}
          />
          {text && (
            <button onClick={clearAll}
              className="absolute top-2 right-2 btn-ghost p-1 text-text-muted hover:text-red-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {text.split(/\s+/).filter(Boolean).length} words
          </span>
          <button onClick={analyze} disabled={analyzing || text.length < 50}
            className="btn-primary gap-2 disabled:opacity-40"
          >
            {analyzing
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
              : <><Zap className="w-4 h-4" />Analyze Resume</>
            }
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score card */}
            <div className="card p-6 text-center">
              <p className="text-sm text-text-muted mb-2">ATS Compatibility Score</p>
              <div className="text-6xl font-bold gradient-text mb-2">{result.score}</div>
              <span className={`badge text-sm ${
                result.score >= 80 ? "badge-green"
                : result.score >= 60 ? "badge-blue"
                : result.score >= 40 ? "badge-yellow"
                : "badge-pink"
              }`}>
                {result.score >= 80 ? "Excellent ✨"
                 : result.score >= 60 ? "Good 👍"
                 : result.score >= 40 ? "Fair ⚠️"
                 : "Needs Work ❌"}
              </span>
              <div className="mt-4 max-w-sm mx-auto">
                <ProgressBar
                  value={result.score} max={100}
                  color={result.score >= 80 ? "green" : result.score >= 60 ? "brand" : "orange"}
                />
              </div>
              <p className="text-xs text-text-muted mt-3">
                {result.score >= 80
                  ? "Well-optimized for ATS. A few polish items remain."
                  : result.score >= 60
                  ? "Solid foundation. Address the failed checks to push above 80."
                  : result.score >= 40
                  ? "Core sections present but missing impact and keywords."
                  : "Several critical items missing — see checklist below."}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Score Breakdown</h3>
              <div className="space-y-2">
                {result.breakdown.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-40 shrink-0">{b.label}</span>
                    <div className="flex-1">
                      <ProgressBar
                        value={Math.max(0, b.earned)}
                        max={b.max || 1}
                        color={b.earned < 0 ? "orange" : b.earned >= b.max * 0.7 ? "green" : "brand"}
                      />
                    </div>
                    <span className={`text-xs font-semibold w-16 text-right shrink-0 ${
                      b.earned < 0 ? "text-red-400"
                      : b.earned >= b.max ? "text-accent-green"
                      : "text-text-secondary"
                    }`}>
                      {b.earned}/{b.max} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Keywords",    value: result.metrics.techCount, good: 8,  color: "text-brand-400" },
                { label: "Action Verbs", value: result.metrics.actionCount, good: 8, color: "text-accent-purple" },
                { label: "Metrics",     value: result.metrics.uniqueMetrics, good: 2, color: "text-accent-green" },
                { label: "Weak Words",  value: result.metrics.weakCount, good: 0, color: "text-accent-orange", invert: true },
              ].map(({ label, value, good, color, invert }) => (
                <div key={label} className="card p-3 text-center">
                  <p className={`text-2xl font-bold ${
                    invert
                      ? value === 0 ? "text-accent-green" : "text-red-400"
                      : value >= good ? "text-accent-green" : color
                  }`}>{value}</p>
                  <p className="text-xs text-text-muted mt-1">{label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {invert ? (value === 0 ? "✓ None" : `Remove ${value}`) : `Need ${good}+`}
                  </p>
                </div>
              ))}
            </div>

            {/* Full checklist */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Full ATS Checklist</h3>
              <div className="space-y-2">
                {result.checks.map((check, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    {check.pass
                      ? <CheckCircle className="w-4 h-4 text-accent-green flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    <span className={`text-sm flex-1 ${check.pass ? "text-text-secondary" : "text-text-muted"}`}>
                      {check.label}
                    </span>
                    <span className="tag text-xs capitalize flex-shrink-0">{check.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-accent-green mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Detected Keywords ({result.foundKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.foundKeywords.length > 0
                    ? result.foundKeywords.map((k) => <span key={k} className="badge badge-green text-xs capitalize">{k}</span>)
                    : <p className="text-xs text-text-muted">No technical keywords detected</p>}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-accent-orange mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Keywords (add relevant ones)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((k) => (
                    <span key={k} className="badge badge-orange text-xs capitalize">{k}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement tips */}
            <div className="card p-5">
              <h3 className="section-title mb-4">How to Push Your Score Higher</h3>
              <div className="space-y-3">
                {[
                  { tip: "Replace 'responsible for X' with 'Built X that achieved Y result'", priority: "High" },
                  { tip: "Add at least 3 quantified achievements: 'Reduced build time by 35%', 'Served 10K daily users'", priority: "High" },
                  { tip: "List 8–12 technical skills matching the job description — ATS scans for exact matches", priority: "High" },
                  { tip: "Keep to 1 page (200–500 words) for freshers; 2 pages max for 3+ years experience", priority: "Medium" },
                  { tip: "Add LinkedIn and GitHub links — they double your callback rate at product companies", priority: "Medium" },
                  { tip: "Write in third-person implied: 'Developed...' not 'I developed...'", priority: "Medium" },
                  { tip: "Include a 2-line professional summary at the top tailored to each role you apply for", priority: "Low" },
                  { tip: "Use standard headings: Experience, Education, Skills, Projects — non-standard names confuse ATS", priority: "Low" },
                ].map(({ tip, priority }) => (
                  <div key={tip} className="flex items-start gap-3">
                    <span className={`badge flex-shrink-0 mt-0.5 ${
                      priority === "High" ? "badge-pink" : priority === "Medium" ? "badge-yellow" : "badge-blue"
                    }`}>
                      {priority}
                    </span>
                    <p className="text-sm text-text-muted">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
