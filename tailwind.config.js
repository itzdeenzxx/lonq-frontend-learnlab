/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f9870b',
          600: '#ea7709',
          700: '#c2620a',
          800: '#9a4f10',
          900: '#7c4110',
        },
        accent: {
          50: '#fef3e2',
          100: '#fde8c4',
          200: '#fbd38d',
          300: '#f9b84d',
          400: '#f9870b',
          500: '#e67300',
          600: '#c25e00',
          700: '#9a4b00',
          800: '#7a3c00',
          900: '#5c2d00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(249, 135, 11, 0.3)',
        'glow-lg': '0 0 40px rgba(249, 135, 11, 0.4)',
      },
    },
  },
  plugins: [],
}
