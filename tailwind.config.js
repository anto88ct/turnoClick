/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        tc: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
          surface: '#fafaf9',
          card:    '#ffffff',
          border:  '#e4e4e7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-up': 'slideInUp 0.35s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'number-flip': 'numberFlip 0.4s ease-out',
        'progress-bar': 'progressBar 1.2s ease-out forwards',
      },
      keyframes: {
        slideInUp: {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.9)',  opacity: '0' },
          '70%':  { transform: 'scale(1.03)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        numberFlip: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        progressBar: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'tc': '0 4px 24px -4px rgba(16, 185, 129, 0.25)',
        'tc-lg': '0 8px 40px -8px rgba(16, 185, 129, 0.35)',
        'card': '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
