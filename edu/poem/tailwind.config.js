/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#fdf8f4',
          100: '#f7eee4',
          200: '#ebd9c5',
          300: '#dcbe9f',
          400: '#c89d75',
          500: '#b88256',
          600: '#a36d47',
          700: '#835439',
          800: '#684331',
          900: '#4a2f22',
          950: '#2b1a12',
        },
        parchment: {
          50: '#fcfaf6',
          100: '#f7f3ea',
          200: '#eee5d0',
          300: '#e3d2b0',
          400: '#d5bb8d',
        }
      },
      fontFamily: {
        script: ['"Great Vibes"', '"Dancing Script"', '"Pacifico"', 'cursive'],
        dancing: ['"Dancing Script"', 'cursive'],
        pacifico: ['"Pacifico"', 'cursive'],
        greatvibes: ['"Great Vibes"', 'cursive'],
        poem: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 10px 25px -5px rgba(180, 83, 9, 0.08), 0 8px 10px -6px rgba(180, 83, 9, 0.05)',
        'warm-lg': '0 20px 30px -10px rgba(180, 83, 9, 0.12), 0 10px 15px -5px rgba(180, 83, 9, 0.08)',
        'paper': '0 1px 3px rgba(0,0,0,0.05), 0 20px 25px -5px rgba(120, 53, 15, 0.04), 0 8px 10px -6px rgba(120, 53, 15, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
