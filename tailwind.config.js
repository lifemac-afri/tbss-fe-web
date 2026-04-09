/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F46B03',
          light: '#F78B3D',
          dark: '#C15300',
          50: '#FFF4EC',
          100: '#FFE4CC',
        },
        secondary: {
          DEFAULT: '#1C25F2',
          light: '#4A52F5',
          dark: '#1219C0',
        },
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        aclonica: ['Aclonica', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.14)',
        modal: '0 20px 60px 0 rgba(0,0,0,0.18)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
