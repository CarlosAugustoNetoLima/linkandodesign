import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F3EE",
        surface: "#FFFFFF",
        ink: "#17171A",
        charcoal: "#27272B",
        lime: "#EEFB6E",
        muted: "rgba(23,23,26,0.62)",
        line: "rgba(23,23,26,0.12)",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.6rem, 7.5vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        h1: ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        h2: ["clamp(1.5rem, 2.8vw, 2.4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        xl: "0.625rem",
        "2xl": "0.75rem",
        "3xl": "1rem",
      },
      boxShadow: {
        card: "0 4px 16px -6px rgba(23,23,26,0.10)",
        "card-lg": "0 10px 30px -10px rgba(23,23,26,0.14)",
        dark: "0 14px 36px -14px rgba(23,23,26,0.4)",
        btn: "0 2px 10px -4px rgba(23,23,26,0.14)",
        "btn-hover": "0 6px 18px -6px rgba(23,23,26,0.2)",
        "btn-press": "none",
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
