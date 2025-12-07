module.exports = {
 content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#FF3FAF",
          pinkLight: "#FF4FB3",
          black: "#333333",
          dark: "#000000",
          gold: "#D4AF37",
          goldLight: "#F2C75B",
          gray: "#E6E6E6",
          grayLight: "#F8F8F8",
        }
      },
      fontFamily: {
        fontFamily: {
        logo: ["Great Vibes", "cursive"],
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}