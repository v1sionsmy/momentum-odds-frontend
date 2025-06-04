/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'mo-bg': 'var(--mo-bg)',
        'mo-surface': 'var(--mo-surface)',
        'mo-line': 'var(--mo-line)',
        'mo-accent': 'var(--mo-accent)',
        'mo-alert': 'var(--mo-alert)',
        'mo-cyan': 'var(--mo-cyan)',
        'mo-text': 'var(--mo-text)',
        'mo-muted': 'var(--mo-muted)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}; 