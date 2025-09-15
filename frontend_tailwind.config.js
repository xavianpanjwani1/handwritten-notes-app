/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        base: {
          50: '#f6f9fb',
          100: '#edf2f7',
          200: '#d9e4ec',
          300: '#c3d4df',
          400: '#9fb8c9',
          500: '#7b9db4',
          600: '#5c8099',
          700: '#476479',
          800: '#324757',
          900: '#1d2c37'
        },
        accent: {
          50: '#fef9f4',
          100: '#fdf1e3',
          200: '#fadfc3',
          300: '#f7c79a',
          400: '#f2a062',
          500: '#ec7b2e',
          600: '#dc611d',
          700: '#b74815',
          800: '#8f3713',
          900: '#6f2c11'
        },
        mint: {
          100: '#e6f8f3',
          300: '#b4e9dc',
          500: '#6ed3bb',
          600: '#49b096'
        }
      },
      boxShadow: {
        soft: '0 4px 16px -2px rgba(20,40,60,0.05), 0 2px 6px -1px rgba(20,40,60,0.06)'
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease',
        pulseSlow: 'pulseSlow 2.5s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseSlow: { '0%,100%': { opacity: 0.45 }, '50%': { opacity: 1 } }
      }
    }
  },
  plugins: []
};