/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legal Probe color palette
        'raisin-black': '#252323',
        'slate-gray': '#70798c',
        'isabelline': '#f5f1ed',
        'bone': '#dad2bc',
        'khaki': '#a99985',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'mono': ['JetBrains Mono', 'ui-monospace'],
      },
    },
  },
  plugins: [],
}