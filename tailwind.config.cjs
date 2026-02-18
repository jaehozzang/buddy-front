/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors"; // 👈 require 대신 import 사용

module.exports = {
  darkMode: "class", // ✨ [필수 추가] 이 설정이 있어야 다크모드 버튼이 작동합니다!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.violet,   // 여기만 바꾸면 전체 테마 변경!
      },
    },
  },
  plugins: [],
};