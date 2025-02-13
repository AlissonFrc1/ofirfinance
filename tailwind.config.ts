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
        background: "#F8FAFC",
        "card-bg": "#FFFFFF",
        primary: "#C4A962",
        secondary: "#0A4D68",
        success: "#1B4D3E",
        warning: "#C4A962",
        expense: "#D14D72",
        income: "#3FBC8B",
        "text-primary": "#1E293B",
        "text-secondary": "#64748B",
        divider: "#E2E8F0",
        "accent-blue": "#2C74B3",
        "accent-silver": "#94A3B8",
        "hover-bg": "#E2E8F0",
        "component-bg": "#F8FAFC",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
