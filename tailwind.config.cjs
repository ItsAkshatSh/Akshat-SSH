module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0a',
          elevated: '#111111',
          overlay: '#0d0d0d',
          raised: '#141414',
        },
        accent: {
          green: '#22c55e',
          cyan: '#22d3ee',
          muted: 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['Silkscreen', 'cursive'],
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUpFade: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(34, 211, 238, 0.12)',
        'glow-soft': '0 0 80px -20px rgba(255,255,255,0.06)',
        card: '0 4px 24px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 8px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
