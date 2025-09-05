/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- ¡ESTA LÍNEA ES ESENCIAL!
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ... tu configuración de tema
    },
  },
  plugins: [],
}