/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        tc: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          surface: '#f8faff',
          card:    '#ffffff',
          border:  '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-up':   'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-down': 'slideInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':       'fadeIn 0.25s ease-out',
        'bounce-in':     'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'number-flip':   'numberFlip 0.4s ease-out',
        'progress-bar':  'progressBar 1.2s ease-out forwards',
        'float':         'float 4s ease-in-out infinite',
        'shimmer':       'shimmer 1.6s linear infinite',
        'scale-in':      'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        slideInUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        slideInDown: {
          '0%':   { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.88)', opacity: '0' },
          '70%':  { transform: 'scale(1.04)', opacity: '1' },
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.12)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'tc':         '0 4px 24px -4px rgba(99, 102, 241, 0.35)',
        'tc-lg':      '0 8px 40px -8px rgba(99, 102, 241, 0.45)',
        'tc-glow':    '0 0 0 3px rgba(99, 102, 241, 0.15), 0 4px 24px -4px rgba(99, 102, 241, 0.35)',
        'card':       '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.07)',
        'float':      '0 12px 40px rgba(99, 102, 241, 0.2)',
      },
    },
  },
  plugins: [],
};
