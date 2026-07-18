import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function truncate(str, n = 80) {
  return str.length > n ? str.substring(0, n) + "..." : str;
}

export function getDifficultyColor(difficulty) {
  const map = { basic: "difficulty-basic", intermediate: "difficulty-intermediate", advanced: "difficulty-advanced" };
  return map[difficulty] || "badge-blue";
}

export function getCategoryColor(category) {
  const map = {
    programming: "badge-blue",
    ai: "badge-purple",
    service: "badge-orange",
    core: "badge-green",
    hr: "badge-pink",
    aptitude: "badge-yellow",
  };
  return map[category] || "badge-blue";
}

export function getCompanyColor(type) {
  return type === "product" ? "badge-blue" : "badge-orange";
}

export const COMPANY_SKILLS = {
  amazon:    ["DSA", "System Design", "OOP", "Java"],
  microsoft: ["DSA", "System Design", "OOP", "JavaScript"],
  google:    ["DSA", "System Design", "Python"],
  tcs:       ["Java", "SQL", "Aptitude", "HR"],
  infosys:   ["Java", "SQL", "Aptitude", "HR", "Communication"],
  accenture: ["Java", "SQL", "Aptitude", "HR"],
  wipro:     ["Java", "Python", "Aptitude", "HR"],
  cognizant: ["Java", "SQL", "Aptitude", "HR"],
  flipkart:  ["DSA", "System Design", "Java", "OOP"],
  uber:      ["DSA", "System Design", "Python", "API"],
};

export const ALL_SKILLS = ["Java", "Python", "DSA", "JavaScript", "React", "Node", "API", "Machine Learning", "Agentic AI", "Generative AI", "Aptitude", "Communication", "HR", "DBMS", "SQL", "System Design", "OOP"];

export const DIFFICULTY_LEVELS = ["basic", "intermediate", "advanced"];
export const CATEGORIES = ["programming", "ai", "service", "core"];
