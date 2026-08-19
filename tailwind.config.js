/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#05070a",
          900: "#0a0e14",
          850: "#0d121a",
          800: "#121826",
          700: "#1a2233",
          600: "#26314a",
        },
        signal: {
          400: "#34e5a8",
          500: "#12c78c",
          600: "#0aa370",
        },
        pulse: {
          400: "#4fd8ff",
          500: "#22b8f0",
        },
        amber: {
          400: "#ffb84f",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-signal": "0 0 0 1px rgba(52,229,168,0.25), 0 0 24px -4px rgba(52,229,168,0.35)",
        "glow-pulse": "0 0 0 1px rgba(79,216,255,0.25), 0 0 24px -4px rgba(79,216,255,0.35)",
        "glow-soft": "0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(52,229,168,0.10) 0%, rgba(5,7,10,0) 70%)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scanline: "scanline 3.5s linear infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        blink: "blink 1.4s ease-in-out infinite",
        "fade-up": "fade-up 0.35s ease-out forwards",
      },
    },
  },
  plugins: [],
};
