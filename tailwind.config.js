/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        blush: '#FFC0CB',
        hotpink: '#E91E63',
        rosepink: '#FF69B4',
        softgold: '#FFD700',
        ivory: '#FFF5EE',
        deepbrown: '#5D4037',
        
        // Extended palette
        lavender: '#E6E6FA',
        lilac: '#C8A2C8',
        peachy: '#FFDAB9',
        mint: '#98FB98',
        babyblue: '#ADD8E6',
        creamygold: '#F5DEB3',
        dustyrose: '#DCAE96',
        softmint: '#D1FFD7',
        
        // Gradient components
        goldenlight: '#FFF8DC',
        pinklight: '#FFE4E1',
        pinkdark: '#DB7093',
        
        // Warm neutrals
        warmgray: {
          50: '#FAF9F7',
          100: '#E8E6E1',
          200: '#D3CEC4',
          300: '#B8B2A7',
          400: '#A39E93',
          500: '#857F72',
          600: '#625D52',
          700: '#504A40',
          800: '#423D33',
          900: '#27241D',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
        accent: ['Great Vibes', 'cursive'],
        modern: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'soft-pink': '0 4px 15px rgba(255, 192, 203, 0.5)',
        'soft-gold': '0 4px 15px rgba(255, 215, 0, 0.25)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'hover-glow': '0 0 15px rgba(255, 215, 0, 0.4)',
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(to bottom, #FFC0CB, #FFF5EE)',
        'luxury-gradient': 'linear-gradient(to right, #FFD700, #FFF8DC)',
        'warm-overlay': 'linear-gradient(to right, rgba(255, 192, 203, 0.7), rgba(255, 228, 225, 0.7))',
        'gold-shimmer': 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 248, 220, 0.2), rgba(255, 215, 0, 0.1))',
      },
      borderWidth: {
        'thin': '0.5px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
} 