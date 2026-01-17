import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#FDF6E9",
        },
        foreground: {
          DEFAULT: "#1a1a1a",
        },
        primary: {
          DEFAULT: "#E87A2E",
          dark: "#D06820",
        },
        secondary: {
          DEFAULT: "#FFD93D",
        },
        "accent-purple": {
          DEFAULT: "#C4A7E7",
        },
        "accent-mint": {
          DEFAULT: "#98D8AA",
        },
        cream: {
          DEFAULT: "#FDF6E9",
          dark: "#F5E6D3",
        },
      },
      fontFamily: {
        fraunces: ["var(--font-fraunces)", "serif"],
        "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
