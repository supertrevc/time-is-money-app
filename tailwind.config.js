/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#0D0D0D',
          surface: '#1A1A1A',
          overlay: '#262626',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#52525B',
        },
        accent: {
          time: '#FFBF00',
          freedom: '#00E5FF',
          danger: '#FF4444',
          success: '#10B981',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-time': '0 0 10px rgba(255, 191, 0, 0.6)',
        'glow-freedom': '0 0 15px rgba(0, 229, 255, 0.5)',
        'glow-danger': '0 0 10px rgba(255, 68, 68, 0.4)',
      },
    },
  },
  plugins: [],
}
