/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        melvin: {
          red: "hsl(0 85% 55%)",
          "red-dark": "hsl(0 85% 40%)",
          blue: "hsl(217 85% 45%)",
          "blue-dark": "hsl(217 85% 30%)",
          green: "hsl(100 65% 50%)",
          "green-dark": "hsl(100 75% 35%)",
          yellow: "hsl(45 100% 50%)",
          "yellow-dark": "hsl(40 95% 40%)",
          text: "hsl(220 35% 25%)",
        },
      },
      fontFamily: {
        handwritten: ["Caveat", "cursive"],
        body: ["Quicksand", "sans-serif"],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        }
      },
    },
  },
  plugins: [],
}
