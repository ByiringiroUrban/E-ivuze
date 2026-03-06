/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '540px',
        md: '720px',
        lg: '960px',
        xl: '1240px',
      },
    },
    extend: {
      colors: {
        'primary': "#064e3b",
        'primary-dark': "#022c22",
        'primary-light': "#10b981",
        'secondary': "#081828",
        'secondary-dark': "#14532d",
        'secondary-light': "#4ade80",
        'accent': "#eab308",
        'accent-light': "#fde047",
        'light-bg': "#f0fdf4",
        'white': '#FFFFFF',
        'gray-text': '#4b5563',
        'nh-primary': '#006838',
        'nh-primary-hover': '#289665',
        'nh-secondary': '#081828',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(200px, 1fr))'
      }
    },
  },
  plugins: [],
}