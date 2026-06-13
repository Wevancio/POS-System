/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Paleta del POS — tonos cálidos de comercio
        primary:  { DEFAULT: '#1a1a2e', light: '#2d2d44' },
        accent:   { DEFAULT: '#e8a838', dark: '#c48c20'  },
        success:  '#22c55e',
        danger:   '#ef4444',
        surface:  { DEFAULT: '#ffffff', muted: '#f8f7f4' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
