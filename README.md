# PrepForge — AI-Powered Placement Preparation Platform
live demo  - https://prep-forge-sand.vercel.app/

A professional, full-stack placement preparation platform built with React, Node.js, Express, MongoDB, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Beautiful Landing Page** — Animated hero, feature grid, company showcase
- **JWT Authentication** — Register/Login with role-based access (user/admin)
- **AI Study Roadmap** — Personalized weekly plans based on skills, company type, and timeline
- **Question Bank** — 109+ questions with search, filters (skill, difficulty, category, company)
- **Mock Interview** — Timed practice sessions with scoring and question review
- **Company-wise Prep** — TCS, Infosys, Accenture, Amazon, Microsoft, Google, and more
- **Daily Checklist** — Weekly task tracker with local and server persistence
- **Bookmarks** — Save and organize questions (requires auth)
- **Notes** — Rich notes with tags and timestamps (requires auth)
- **Flashcards** — Flip-card study mode with spaced repetition (requires auth)
- **Resume Analyzer** — Client-side ATS score with keyword detection and tips
- **Resource Library** — Curated learning resources by category
- **User Profile** — Streak, points, badges, progress analytics
- **Dark Mode** — Default dark theme with premium Linear/Vercel aesthetic
- **Loading Skeletons** — Smooth loading states everywhere
- **Empty States** — Polished empty states with actionable CTAs

## 🛠 Tech Stack

**Frontend**
- React 18, React Router v6, Framer Motion
- TanStack Query (React Query) for data fetching
- Tailwind CSS 3 with custom design system
- Lucide React icons, React Hot Toast
- Axios for API calls

**Backend**
- Node.js, Express 4
- MongoDB + Mongoose (optional — works without MongoDB)
- JWT authentication (bcryptjs + jsonwebtoken)
- express-validator, helmet, morgan

## 📁 Project Structure

```
interview-prep-guide/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # AppLayout, Sidebar
│   │   │   └── ui/         # Skeleton, EmptyState, Modal, ProgressBar
│   │   ├── contexts/       # AuthContext (JWT)
│   │   ├── lib/            # api.js (axios), utils.js
│   │   └── pages/
│   │       ├── auth/       # Login, Register
│   │       ├── Landing.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Roadmap.jsx
│   │       ├── QuestionBank.jsx
│   │       ├── MockInterview.jsx
│   │       ├── Companies.jsx
│   │       ├── Checklist.jsx
│   │       ├── Notes.jsx
│   │       ├── Flashcards.jsx
│   │       ├── Bookmarks.jsx
│   │       ├── ResumeAnalyzer.jsx
│   │       ├── Resources.jsx
│   │       └── Profile.jsx
│   └── tailwind.config.js
├── server/
│   ├── middleware/auth.js
│   ├── models/             # User.js, Question.js
│   ├── routes/             # auth.js, questions.js, users.js
│   ├── server.js           # Main server (all legacy APIs preserved)
│   ├── questions.json      # 109 questions
│   └── .env
└── README.md
```

## ⚡ Getting Started

### 1. Start the Backend
```bash
cd server
# Copy .env.example to .env and configure
npm start
# Server runs on http://localhost:5000
```

### 2. Start the Frontend
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### 3. MongoDB (Optional)
The app works **without MongoDB** using JSON-only mode for questions.
For full features (auth, notes, flashcards, bookmarks), install MongoDB:
- Local: `mongodb://localhost:27017/placement-prep`
- Or use [MongoDB Atlas](https://mongodb.com/atlas) free tier

### 4. Configure Environment
```env
# server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement-prep
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## 🎨 Design System

The design is inspired by Linear, Vercel, Notion, and Clerk:
- **Color Palette**: Dark-first with `surface-0` through `surface-5` layers
- **Typography**: Inter (UI) + JetBrains Mono (code)
- **Components**: Cards, badges, buttons, inputs — all in Tailwind CSS
- **Animations**: Framer Motion for page transitions, micro-interactions
- **Icons**: Lucide React — consistent, clean icon set

## 📡 API Endpoints (All Preserved + New)

### Legacy (unchanged)
- `POST /api/data` — Generate AI preparation plan
- `GET /api/questions` — Question bank with filters
- `GET /api/categories` — Skill categories
- `GET /api/skills` — All skills

### New
- `GET /api/companies` — Company profiles
- `GET /api/resources` — Resource library
- `GET /api/health` — Server health check
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user
- `GET/POST /api/users/bookmarks/:id` — Bookmark management
- `GET/POST/PUT/DELETE /api/users/notes` — Notes CRUD
- `GET/POST/DELETE /api/users/flashcards` — Flashcard CRUD
- `GET/PUT /api/users/checklist` — Checklist persistence
- `POST /api/users/mock-interview` — Save mock session
- `GET /api/users/analytics` — User analytics

## 🔐 Security

- JWT tokens stored in localStorage
- Passwords hashed with bcrypt (12 rounds)
- Helmet.js for HTTP security headers
- express-validator for input validation
- Role-based access control (user/admin)
