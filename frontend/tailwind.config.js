/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      }, 
      colors: {
        primaryColor: "#F26132",
        primaryBg: "#242424",
        secondaryBg: "#2F2F2F",
        thirdBg: "#3E4557",
        customGray1: "#D9D9D9",
        customGray2: "#828282",
        customGray3: "#686868",
        customBlack1: "#1E1E1E",
      },
    },
  },
  plugins: [
    import('tailwindcss'),
    import('autoprefixer'),
  ],
}

