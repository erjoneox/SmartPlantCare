/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        // This allows you to use 'font-poppins' in your className
        poppins: ["Poppins", "sans-serif"],
      },
    },
    extend: {
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        shake: "shake 0.2s ease-in-out 0s 2",
      },
    },
  },
  plugins: [],
};
