/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta ClinicPro
        primary: {
          DEFAULT: '#1C2B48',  // Azul Marino
          light: '#A7C7E7',    // Baby Blue Eyes
        },
        secondary: {
          DEFAULT: '#8EB1D1',  // Cool Cerulean
          light: '#E8ECEF',    // Platinum
        },
        background: {
          DEFAULT: '#C4D8E5',  // Light Blue Gray
          card: '#F1E4D1',     // Bone White
        },
      },
    },
  },
  plugins: [],
}
