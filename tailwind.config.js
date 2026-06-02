/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          900: '#0a1628',
          800: '#0d1d35',
          700: '#122845',
        },
        ocean: {
          DEFAULT: '#1e4d8c',
          600: '#1e4d8c',
          500: '#2a5fa3',
          400: '#3b75bd',
        },
        gold: {
          DEFAULT: '#c9a84c',
          400: '#d4b969',
          600: '#b3923a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -15px rgba(10, 22, 40, 0.25)',
        card: '0 4px 24px -8px rgba(10, 22, 40, 0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wave': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-22px) translateX(10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out forwards',
        'wave': 'wave 6s ease-in-out infinite',
        'float': 'float 7s ease-in-out infinite',
        'float-slow': 'float-slow 11s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
