module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Warm organic ink palette. Hex mirrors of the OKLCH tokens in
        // globals.css (Tailwind's opacity modifiers need plain colors);
        // components that can read vars should use the vars instead.
        surface: {
          DEFAULT: '#16110d',
          elevated: '#1f1813',
          overlay: '#1b1510',
          raised: '#28211a',
        },
        accent: {
          green: '#8a9a5b',
          cyan: '#cf9457',
          muted: 'rgba(236, 229, 220, 0.06)',
        },
        bone: '#ece5db',
        umber: '#16110d',
      },
      fontFamily: {
        sans: ['Newsreader', 'Georgia', 'ui-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['Endless', 'Newsreader', 'Georgia', 'serif'],
      },
      // One fixed z scale for the whole site. Layers are named for what they
      // are, not for a number someone guessed at the call site.
      zIndex: {
        ocean: '0',
        content: '10',
        chrome: '40',
        menu: '80',
        overlay: '100',
        tooltip: '150',
        nav: '200',
        lightbox: '300',
        lightboxChrome: '400',
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
        glow: '0 0 40px -10px rgba(207, 148, 87, 0.16)',
        'glow-soft': '0 0 80px -20px rgba(236,229,220,0.06)',
        card: '0 4px 24px -4px rgba(10, 7, 5, 0.5), 0 0 0 1px rgba(236,229,220,0.05)',
        'card-hover': '0 8px 40px -8px rgba(10, 7, 5, 0.6), 0 0 0 1px rgba(236,229,220,0.09)',
      },
    },
  },
  plugins: [],
}
