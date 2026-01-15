const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.orange,   // 여기만 바꾸면 전체 테마 변경!
      },
    },
  },
  plugins: [],
};
