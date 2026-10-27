/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Palette: a pastel dawn sky (Noomo) sinking into deep water (Igloo),
      // with a warm peach-gold accent borrowed from Persepolis.
      colors: {
        ink: '#07101d',
        abyss: '#020a14',
        deep: '#06182b',
        sea: '#0d3556',
        tide: '#1d6a8f',
        aqua: '#7de3d6',
        sky: '#c9d2e7',
        mist: '#eaeef7',
        foam: '#f4f6fb',
        sun: '#f3c892',
      },
      fontFamily: {
        // One variable family covers both the wide display caps (font-stretch 125%)
        // and the regular-width body text — fewer font files to download.
        sans: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
