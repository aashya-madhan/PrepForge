/**
 * gemini.js — Gemini API integration for AI Roadmap generation
 * Supports both AIza... keys (legacy) and AQ.... keys (new Google AI Studio format)
 */

// New Google AI Studio keys (AQ...) use a different base URL
function getApiConfig(apiKey) {
  if (apiKey.startsWith("AQ.")) {
    // New format — uses generativelanguage.googleapis.com with x-goog-api-key header
    return {
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      useQueryParam: false,
    };
  }
  // Legacy AIza... format — key goes in query param
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    headers: { "Content-Type": "application/json" },
    useQueryParam: true,
  };
}

function buildRoadmapPrompt(skills, weeks, companyType) {
  const companyContext = {
    product: "product-based companies like Google, Amazon, Microsoft, Flipkart",
    service: "service-based companies like TCS, Infosys, Accenture, Wipro",
    startup: "startups and modern tech companies",
  };
  const context = companyContext[companyType] || "software companies";

  return `You are an expert placement preparation coach for engineering students in India targeting ${context}.

Generate a detailed, personalized ${weeks}-week study roadmap for a student preparing these skills: ${skills.join(", ")}.

Return ONLY valid JSON (no markdown code blocks, no explanation) with this exact structure:

{
  "plan": [
    {
      "week": 1,
      "title": "Week 1: <descriptive title>",
      "weekType": "fundamentals",
      "focusSkills": ["skill1"],
      "topics": [
        {
          "text": "<specific topic — e.g. 'Arrays: Two-pointer technique (LeetCode 15, 11, 42)'>",
          "weight": "⭐⭐⭐",
          "tip": "<practical tip — mention actual platform, time estimate, or technique>"
        }
      ],
      "dailyGoal": "<concrete daily target e.g. '2 LeetCode mediums + 30 min theory'>",
      "resources": ["LeetCode", "GeeksForGeeks"]
    }
  ],
  "recognizedSkills": ${JSON.stringify(skills)},
  "unrecognizedSkills": [],
  "summary": {
    "totalQuestions": 50,
    "skillsToLearn": ${skills.length},
    "weeksOfPreparation": ${weeks},
    "message": "AI-generated personalized roadmap"
  }
}

Rules:
- Generate exactly ${weeks} week objects
- weekType must be one of: "fundamentals", "practice", "advanced", "interview"
- weight: "⭐⭐⭐" = critical/most asked, "⭐⭐" = important, "⭐" = good to know
- Each week: 5-6 topics minimum
- Topics must be SPECIFIC (name actual algorithms, LeetCode problems, concepts)
- tip must be practical — real platforms, time estimates, techniques
- Progress logically: weeks 1-2 fundamentals → weeks 3-4 practice → final weeks interview prep`;
}

export async function generateRoadmapWithGemini(skills, weeks, companyType) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    return null;
  }

  const config = getApiConfig(apiKey.trim());
  const prompt = buildRoadmapPrompt(skills, weeks, companyType);

  const response = await fetch(config.url, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error("Empty response from Gemini");

  // Strip markdown code fences if Gemini wraps the JSON anyway
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed?.plan || !Array.isArray(parsed.plan) || parsed.plan.length === 0) {
    throw new Error("Invalid roadmap structure returned by Gemini");
  }

  return parsed;
}
