import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "react-hot-toast";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-1">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <main
        className="flex-1 overflow-auto transition-all duration-300"
        style={{ marginLeft: collapsed ? "4rem" : "15rem" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#16161f", border: "1px solid #2a2a40", color: "#f1f0ff" },
          success: { iconTheme: { primary: "#34d399", secondary: "#16161f" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#16161f" } },
        }}
      />
    </div>
  );
}
