/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#000000',
        canvasSubtle: '#050505',
        card: '#0A0A0A',
        cardHover: '#121212',
        borderHairline: '#1C1C1C',
        borderSubtle: '#262626',
        
        aerospaceBlue: '#2563EB',
        aerospaceBlueHover: '#1D4ED8',
        opticsCyan: '#06B6D4',
        telemetryGreen: '#10B981',
        calibAmber: '#F59E0B',
        alertRose: '#F43F5E',

        textPrimary: '#FFFFFF',
        textSecondary: '#8A8A8A',
        textMuted: '#525252',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
