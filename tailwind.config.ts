import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#EDE6DC",
        panel: "#F9F5EE",
        panel2: "#20273233",
        line: "#DDD1BE",
        paper: "#3F372E",
        muted: "#A69884",
        amber: "#8A7159",
        teal: "#6B7F5F",
        rust: "#B5654A",
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
