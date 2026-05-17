/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0053e2',
          spark: '#ffc220',
        },
      },
    },
  },
  plugins: [],
}
