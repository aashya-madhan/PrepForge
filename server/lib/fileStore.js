/**
 * fileStore.js — JSON-file based data store
 * Used as a fallback when MongoDB is not available.
 * Data is persisted in server/data/*.json files.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "../data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readStore(name) {
  try {
    const raw = fs.readFileSync(filePath(name), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeStore(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

function generateId() {
  return crypto.randomBytes(12).toString("hex");
}

// ──────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────

function getUsers() {
  return readStore("users");
}

function saveUsers(users) {
  writeStore("users", users);
}

function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function findUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

function createUser({ name, email, password, college, graduationYear }) {
  const users = getUsers();
  const user = {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    password, // already hashed by caller
    role: "user",
    avatar: "",
    bio: "",
    college: college || "",
    graduationYear: graduationYear || null,
    streak: 0,
    lastActive: new Date().toISOString(),
    totalPoints: 0,
    bookmarkedQuestions: [],
    notes: [],
    flashcards: [],
    badges: [],
    checklistProgress: {},
    mockInterviews: [],
    darkMode: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  saveUsers(users);
  return users[idx];
}

function updateStreak(user) {
  const today = new Date();
  const lastActive = new Date(user.lastActive);
  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  let streak = user.streak || 0;
  if (diffDays === 1) streak += 1;
  else if (diffDays > 1) streak = 1;
  return { streak, lastActive: today.toISOString() };
}

// ──────────────────────────────────────────────
// USER SUB-DOCUMENT HELPERS
// ──────────────────────────────────────────────

function toggleBookmark(userId, questionId) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const bookmarks = users[idx].bookmarkedQuestions || [];
  const pos = bookmarks.indexOf(questionId);
  if (pos > -1) bookmarks.splice(pos, 1);
  else bookmarks.push(questionId);

  users[idx].bookmarkedQuestions = bookmarks;
  saveUsers(users);
  return { bookmarked: pos === -1, bookmarks };
}

function addNote(userId, { title, content, tags }) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const note = { _id: generateId(), title, content, tags: tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  users[idx].notes = users[idx].notes || [];
  users[idx].notes.push(note);
  saveUsers(users);
  return users[idx].notes;
}

function updateNote(userId, noteId, updates) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const noteIdx = (users[idx].notes || []).findIndex((n) => n._id === noteId);
  if (noteIdx === -1) return null;

  users[idx].notes[noteIdx] = { ...users[idx].notes[noteIdx], ...updates, updatedAt: new Date().toISOString() };
  saveUsers(users);
  return users[idx].notes[noteIdx];
}

function deleteNote(userId, noteId) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  users[idx].notes = (users[idx].notes || []).filter((n) => n._id !== noteId);
  saveUsers(users);
  return true;
}

function addFlashcard(userId, { question, answer, difficulty }) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const card = { _id: generateId(), question, answer, difficulty: difficulty || "medium", createdAt: new Date().toISOString() };
  users[idx].flashcards = users[idx].flashcards || [];
  users[idx].flashcards.push(card);
  saveUsers(users);
  return users[idx].flashcards;
}

function deleteFlashcard(userId, cardId) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  users[idx].flashcards = (users[idx].flashcards || []).filter((f) => f._id !== cardId);
  saveUsers(users);
  return true;
}

function saveChecklist(userId, weekKey, items) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  users[idx].checklistProgress = users[idx].checklistProgress || {};
  users[idx].checklistProgress[weekKey] = items;
  saveUsers(users);
  return true;
}

function saveMockInterview(userId, sessionData) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx].mockInterviews = users[idx].mockInterviews || [];
  users[idx].mockInterviews.push({ ...sessionData, date: new Date().toISOString() });
  users[idx].totalPoints = (users[idx].totalPoints || 0) + sessionData.score;
  saveUsers(users);
  return users[idx].totalPoints;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateStreak,
  toggleBookmark,
  addNote,
  updateNote,
  deleteNote,
  addFlashcard,
  deleteFlashcard,
  saveChecklist,
  saveMockInterview,
  getUsers,
};
