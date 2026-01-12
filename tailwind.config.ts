import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/domains/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base Colors from Figma
        text: "#212529",
        subtitle: "#4a4a4a",
        white: "#ffffff",
        BG: "#f8f9fa",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        sans: ["var(--font-cairo)", "Cairo", "sans-serif"],
      },
      fontSize: {
        // From Figma Design Tokens
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "38px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
        "5xl": ["48px", { lineHeight: "60px" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      lineHeight: {
        "16": "16px",
        "20": "20px",
        "24": "24px",
        "28": "28px",
        "32": "32px",
        "38": "38px",
        "44": "44px",
        "60": "60px",
      },
    },
  },
  plugins: [],
};

export default config;
