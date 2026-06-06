import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#060608',
        stage: '#0E0E14',
        surface: '#14141C',
        border: '#1E1E2E',
        amber: '#F0A500',
        'amber-dim': '#7A5200',
        snow: '#E8E8F0',
        muted: '#6E6E84',
        dim: '#3E3E52',
        live: '#FF3535',
        teal: '#00B4D8',
        emerald: '#06D6A0',
        coral: '#FF6B35',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-ibm-mono)', 'monospace'],
      },
      animation: {
        'pulse-live': 'pulse-live 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'glow-amber': 'glow-amber 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-amber': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(240,165,0,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(240,165,0,0.5)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
