import type { Config } from "tailwindcss";

// Design system híbrido: base minimalista (papel claro, respiro), DNA brutalista
// (tipografia 800 em caixa alta, lime, sombras de carimbo nos botões) e camada
// moderna (cantos arredondados, sombras difusas, painéis glass com blur).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F3EE", // papel cru
        surface: "#FFFFFF",
        ink: "#17171A", // tinta: texto e acentos
        charcoal: "#27272B", // blocos escuros / marca
        lime: "#EEFB6E", // acento único
        muted: "rgba(23,23,26,0.62)",
        line: "rgba(23,23,26,0.12)", // borda suave padrão
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      // Escala editorial: display grande no desktop, ~50% no mobile via clamp
      fontSize: {
        display: ["clamp(2.6rem, 7.5vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        h1: ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        h2: ["clamp(1.5rem, 2.8vw, 2.4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        // cantos contidos — nada de pílula/blob; arestas presentes mas macias
        xl: "0.625rem",
        "2xl": "0.75rem",
        "3xl": "1rem",
      },
      boxShadow: {
        // Flat com sombra suave: um único borrão discreto, difuso, sem inset,
        // sem highlight, sem relevo — nada de skeuomorfismo.
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
