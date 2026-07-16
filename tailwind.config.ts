import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14181f",
        panel: "#1b212b",
        panel2: "#20273233",
        line: "#2a3140",
        paper: "#eee8db",
        muted: "#8b93a3",
        amber: "#e8a33d",
        teal: "#4f9d91",
        rust: "#c1554a",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
