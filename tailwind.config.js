/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-system', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        canvas: { light: '#FAFAF9', dark: '#0A0A0B' },
        surface: { light: '#FFFFFF', dark: '#131316' },
        border: { light: '#E7E5E4', dark: '#27272A' },
      },
    },
  },
  plugins: [],
};
