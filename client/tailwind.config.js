/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand palette — dark-first like Linear
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        surface: {
          0:  "#0a0a0f",   // deepest bg
          1:  "#111118",   // page bg
          2:  "#16161f",   // card
          3:  "#1c1c28",   // elevated card
          4:  "#232334",   // hover
          5:  "#2a2a40",   // active/selected
        },
        border: {
          DEFAULT: "#2a2a40",
          subtle: "#1e1e2e",
          bright: "#3d3d5c",
        },
        text: {
          primary:   "#f1f0ff",
          secondary: "#9b9bbd",
          muted:     "#6b6b8a",
        },
        accent: {
          purple: "#a78bfa",
          blue:   "#60a5fa",
          green:  "#34d399",
          orange: "#fb923c",
          pink:   "#f472b6",
          yellow: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease-out",
        "slide-up":    "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":     "shimmer 2s linear infinite",
        "glow":        "glow 2s ease-in-out infinite alternate",
        "float":       "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0 },                     to: { opacity: 1 } },
        slideUp:      { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideInRight: { from: { opacity: 0, transform: "translateX(20px)" }, to: { opacity: 1, transform: "translateX(0)" } },
        shimmer:      { "0%": { backgroundPosition: "-200% 0" },  "100%": { backgroundPosition: "200% 0" } },
        glow:         { from: { boxShadow: "0 0 10px rgba(99,102,241,0.3)" }, to: { boxShadow: "0 0 30px rgba(99,102,241,0.7)" } },
        float:        { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      backdropBlur: { xs: "2px" },
      boxShadow: {
        "card":       "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
        "glow-sm":    "0 0 15px rgba(99,102,241,0.25)",
        "glow-md":    "0 0 30px rgba(99,102,241,0.35)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
    },
  },
  plugins: [],
};
