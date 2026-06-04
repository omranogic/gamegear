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
        gaming: {
          bg: "#0f0f11",
          card: "#1a1a1f",
          accent: "#e63946",
          neon: "#00f2fe",
        },
      },
    },
  },
  plugins: [],
};
export default config;