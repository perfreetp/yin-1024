/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          light: '#FF8E8E',
          dark: '#E85555',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          light: '#7EDDD7',
          dark: '#3DB8B0',
        },
        accent: {
          DEFAULT: '#A78BFA',
          light: '#C4B5FD',
          dark: '#8B5CF6',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          dark: '#F0E6DB',
        },
        coral: '#FF6B6B',
        mint: '#4ECDC4',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0,0,0,0.06)',
        'card': '0 4px 20px rgba(0,0,0,0.06)',
        'float': '0 8px 30px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
