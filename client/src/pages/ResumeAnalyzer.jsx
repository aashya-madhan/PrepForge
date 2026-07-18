import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, CheckCircle, XCircle, AlertTriangle, Zap, File, X, CloudUpload } from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import toast from "react-hot-toast";
// Local worker — Vite ?url gives the correct bundled asset path, no CDN needed
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// ─── ATS Analysis Engine ──────────────────────────────────────────────────
// Strict weighted scoring — max 100pts, each criterion has a cap so a resume
// with only basics (email + phone + sections) scores ~30, a polished one ~85+

const TECH_KEYWORDS = [
  "javascript","python","java","react","node","sql","mongodb","rest api","git",
  "docker","aws","typescript","css","html","redux","spring","django","flask",
  "postgresql","mysql","kubernetes","ci/cd","linux","firebase","graphql",
  "next.js","express","angular","vue","tensorflow","machine learning","deep learning",
  "data structures","algorithms","system design","microservices","api","testing",
  "agile","devops","azure","gcp","bash","c++","c#","swift","kotlin","android","ios",
];

const ACTION_VERBS = [
  "developed","built","designed","implemented","optimized","led","managed",
  "created","delivered","improved","reduced","increased","launched","automated",
  "architected","deployed","migrated","integrated","mentored","collaborated",
  "engineered","spearheaded","streamlined","refactored","debugged","tested",
  "analysed","analyzed","researched","presented","coordinated","achieved",
];

const WEAK_WORDS = [
  "responsible for","worked on","helped with","assisted","involved in",
  "familiar with","exposure to","basic knowledge","participated in",
];

function analyzeResume(text) {
  const lower  = text.toLowerCase();
  const words  = text.split(/\s+/).filter(Boolean);
  const wCount = words.length;
  let score    = 0;
  const checks = [];
  const breakdown = [];   // { label, pts, max, earned }

  // ── 1. MANDATORY SECTIONS (max 20pts, 5 each) ──────────────────────────
  const sections = ["experience", "education", "skills", "projects"];
  let secScore = 0;
  sections.forEach((s) => {
    const found = lower.includes(s);
    checks.push({ label: `"${s[0].toUpperCase() + s.slice(1)}" section present`, pass: found, type: "structure" });
    if (found) secScore += 5;
  });
  score += secScore;
  breakdown.push({ label: "Required Sections", earned: secScore, max: 20 });

  // ── 2. CONTACT COMPLETENESS (max 12pts) ────────────────────────────────
  const hasEmail    = /[\w.+-]+@[\w.-]+\.[a-z]{2,6}/.test(text);
  const hasPhone    = /(\+?[\d][\d\s\-().]{7,15})/.test(text);
  const hasLinkedin = /linkedin\.com\/in\//.test(lower) || lower.includes("linkedin");
  const hasGithub   = /github\.com\//.test(lower) || lower.includes("github");

  checks.push({ label: "Email address present",   pass: hasEmail,    type: "contact" });
  checks.push({ label: "Phone number present",    pass: hasPhone,    type: "contact" });
  checks.push({ label: "LinkedIn profile linked", pass: hasLinkedin, type: "contact" });
  checks.push({ label: "GitHub/portfolio linked", pass: hasGithub,   type: "contact" });

  const contactScore = (hasEmail ? 5 : 0) + (hasPhone ? 3 : 0) + (hasLinkedin ? 2 : 0) + (hasGithub ? 2 : 0);
  score += contactScore;
  breakdown.push({ label: "Contact Info", earned: contactScore, max: 12 });

  // ── 3. RESUME LENGTH (max 8pts) ─────────────────────────────────────────
  // Freshers: 200-500 words ideal. Experienced: up to 800.
  let lengthScore = 0;
  if (wCount >= 200 && wCount <= 800)       lengthScore = 8;
  else if (wCount >= 100 && wCount < 200)   lengthScore = 4;
  else if (wCount > 800 && wCount <= 1200)  lengthScore = 5;
  else if (wCount > 1200)                   lengthScore = 2;
  else                                      lengthScore = 0;

  checks.push({
    label: `Word count: ${wCount} words (ideal 200–800)`,
    pass: wCount >= 200 && wCount <= 800,
    type: "format",
  });
  score += lengthScore;
  breakdown.push({ label: "Resume Length", earned: lengthScore, max: 8 });

  // ── 4. TECHNICAL KEYWORDS (max 20pts) ──────────────────────────────────
  const foundTech   = TECH_KEYWORDS.filter((k) => lower.includes(k));
  const missingTech = TECH_KEYWORDS.filter((k) => !lower.includes(k));
  // Strict: need ≥8 keywords for full marks
  const techScore = Math.min(20, Math.round((foundTech.length / 8) * 20));
  checks.push({
    label: `Technical keywords: ${foundTech.length} detected (need ≥ 8 for full marks)`,
    pass: foundTech.length >= 6,
    type: "keywords",
  });
  score += techScore;
  breakdown.push({ label: "Technical Keywords", earned: techScore, max: 20 });

  // ── 5. ACTION VERBS (max 10pts) ─────────────────────────────────────────
  const actionCount = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  // Need ≥8 unique action verbs for full marks
  const actionScore = Math.min(10, Math.round((actionCount / 8) * 10));
  checks.push({
    label: `Strong action verbs: ${actionCount} found (need ≥ 8 for full marks)`,
    pass: actionCount >= 5,
    type: "content",
  });
  score += actionScore;
  breakdown.push({ label: "Action Verbs", earned: actionScore, max: 10 });

  // ── 6. QUANTIFIED ACHIEVEMENTS (max 15pts) ──────────────────────────────
  // Count distinct metric patterns — each one is worth points up to cap
  const metricMatches = (text.match(
    /\d+\s*(%|x|times|users|customers|clients|projects|team|members|engineers|hours|days|weeks|months|years|bugs|issues|features|ms|seconds|kb|mb|gb|tb|lines|repos|apps|services|endpoints|commits|requests|transactions)/gi
  ) || []);
  const uniqueMetrics = new Set(metricMatches.map((m) => m.toLowerCase())).size;
  const metricScore = Math.min(15, uniqueMetrics * 4); // 4pts per unique metric, max 15
  checks.push({
    label: `Quantified achievements: ${uniqueMetrics} metric(s) found (e.g. "reduced latency by 40%")`,
    pass: uniqueMetrics >= 2,
    type: "impact",
  });
  score += metricScore;
  breakdown.push({ label: "Quantified Impact", earned: metricScore, max: 15 });

  // ── 7. WEAK LANGUAGE PENALTY (max -8pts) ────────────────────────────────
  const weakCount = WEAK_WORDS.filter((w) => lower.includes(w)).length;
  const weakPenalty = Math.min(8, weakCount * 2);
  checks.push({
    label: `Weak phrases detected: ${weakCount} (e.g. "responsible for", "familiar with")`,
    pass: weakCount === 0,
    type: "language",
  });
  score -= weakPenalty;
  if (weakPenalty > 0) breakdown.push({ label: "Weak Language Penalty", earned: -weakPenalty, max: 0 });

  // ── 8. NO PERSONAL PRONOUNS (max 5pts) ──────────────────────────────────
  const pronounRegex = /\b(I am|I have|I was|I built|I led|I designed|I developed|My responsibilities|My role)\b/i;
  const hasPronouns = pronounRegex.test(text);
  checks.push({
    label: "No first-person pronouns (ATS-friendly writing style)",
    pass: !hasPronouns,
    type: "format",
  });
  if (!hasPronouns) score += 5;
  breakdown.push({ label: "Writing Style", earned: hasPronouns ? 0 : 5, max: 5 });

  // ── 9. PROFESSIONAL SUMMARY (max 5pts) ──────────────────────────────────
  const hasSummary = /(summary|objective|profile|about me|career goal)/i.test(text);
  checks.push({
    label: "Professional summary / objective section",
    pass: hasSummary,
    type: "structure",
  });
  if (hasSummary) score += 5;
  breakdown.push({ label: "Summary Section", earned: hasSummary ? 5 : 0, max: 5 });

  // ── 10. FORMATTING SIGNALS (max 5pts) ───────────────────────────────────
  // Check for bullet indicators, date ranges, degree keywords
  const hasBullets  = /[•\-\*]/.test(text);
  const hasDates    = /\b(20\d\d|19\d\d)\b/.test(text);
  const hasDegree   = /(b\.?e|b\.?tech|m\.?tech|b\.?sc|m\.?sc|bachelor|master|degree|engineering)/i.test(text);
  const formatScore = (hasBullets ? 2 : 0) + (hasDates ? 1 : 0) + (hasDegree ? 2 : 0);
  checks.push({ label: "Bullet points used for experience/projects", pass: hasBullets, type: "format" });
  checks.push({ label: "Dates present (employment/education timeline)", pass: hasDates, type: "format" });
  checks.push({ label: "Degree/qualification mentioned", pass: hasDegree, type: "format" });
  score += formatScore;
  breakdown.push({ label: "Formatting", earned: formatScore, max: 5 });

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    checks,
    breakdown,
    foundKeywords:   foundTech.slice(0, 20),
    missingKeywords: missingTech.filter((k) => k.length > 3).slice(0, 12),
    wordCount: wCount,
    metrics: { uniqueMetrics, actionCount, techCount: foundTech.length, weakCount },
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
