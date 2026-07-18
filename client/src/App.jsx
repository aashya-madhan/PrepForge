import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import { Landing } from "./pages/Landing";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/Dashboard";
import { Roadmap } from "./pages/Roadmap";
import { QuestionBank } from "./pages/QuestionBank";
import { MockInterview } from "./pages/MockInterview";
import { Companies } from "./pages/Companies";
import { CompanyPrep } from "./pages/CompanyPrep";
import { Checklist } from "./pages/Checklist";
import { Notes } from "./pages/Notes";
import { Flashcards } from "./pages/Flashcards";
import { Bookmarks } from "./pages/Bookmarks";
import { ResumeAnalyzer } from "./pages/ResumeAnalyzer";
import { Resources } from "./pages/Resources";
import { Profile } from "./pages/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected App Shell */}
            <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/questions" element={<QuestionBank />} />
              <Route path="/mock" element={<MockInterview />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyPrep />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/resume" element={<ResumeAnalyzer />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#16161f", border: "1px solid #2a2a40", color: "#f1f0ff" },
            success: { iconTheme: { primary: "#34d399", secondary: "#16161f" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#16161f" } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
