/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#12161C',
        surface: '#181D25',
        surface2: '#1E2530',
        border: '#2A313D',
        ink: '#E8EAED',
        muted: '#8B94A3',
        faint: '#5A6472',
        critical: '#E5484D',
        high: '#F5A623',
        medium: '#E8C547',
        low: '#5B8DEF',
        exploited: '#FF8A3D',
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
