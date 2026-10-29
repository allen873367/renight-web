/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        dim: '#8A99A8',
        night: '#1E293B',
        'accent-calm': '#38BDF8'
      },
      minHeight: {
        'screen-dvh': '100dvh'
      }
    }
  },
  plugins: []
}
