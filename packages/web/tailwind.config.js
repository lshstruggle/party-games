/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0C0C12',
          850: '#12121A',
          800: '#17171F',
          700: '#1C1C26',
          600: '#25252F',
          500: '#32323E',
        },
        brand: {
          DEFAULT: '#7C5CFF',
          soft: '#A892FF',
          deep: '#5B3FE0',
        },
        accent: {
          DEFAULT: '#FF6B9D',
          soft: '#FF9BBB',
        },
        mint: '#2BD9A0',
        amber: '#FFB020',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      animation: {
        'fade-up': 'fadeUp 240ms ease-out both',
        'pop-in': 'popIn 260ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slideUp 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulseRing 1.6s ease-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        popIn: { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'none' } },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
}
