/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        deep: "#1E4D3A",
        bright: "#2AC885",
        light: "#6BB892",
        page: "#F7F8F6",
        mint: "#D2E5DA",
        ink: {
          DEFAULT: "#142920",
          mid: "#3D5A50",
          muted: "#6B8578",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "page-gradient":
          "linear-gradient(145deg, #D2E5DA 0%, #E2EEE6 20%, #F0F3F0 50%, #F7F8F6 100%)",
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};
