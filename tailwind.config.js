/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Crimson Pro', 'serif'],
      },

      colors: {
        /* KEEP stone (you already have it) */
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0a0a0a',
        },

        /* ADD YOUR BRAND COLORS (from poster) */
        ivory: '#f7f5f2',          // background
        ink: '#1a1a1a',            // main text
        gold: '#b89b5e',           // accent
        charcoal: '#111111',       // dark sections
      },

      letterSpacing: {
        'elegant': '0.08em',       // for that spaced-out poster text
        'wide-xl': '0.12em',
      },

      lineHeight: {
        'relaxed-xl': '1.9',
      },

      maxWidth: {
        'reading': '720px',        // for blog/editorial feel
      },

      boxShadow: {
        'soft': '0 10px 30px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}