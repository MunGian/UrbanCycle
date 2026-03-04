/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        tab: "#F5F5F5",
        body: "#FFFFFF",
        cardBg: "#F5F5F5",
        surface: "#E0E0E0",
        // brandPrimary: "#8bc6b4",
        // brandPrimary: "#4fa78f",
        // brandPrimary: "#94b9c5",
        brandPrimary: "#87d0a9",
        brandSecondary: "#3b7968",
        grayT1: "#1A1A1A",
        grayT2: "#4D4D4D",
        grayT3: "#808080",
        border: "#2C2C2C",
        borderStrong: "#3E3E3E",
      },
    },
  },
  plugins: [],
};
