/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'background': 'rgb(var(--background) / <alpha-value>)',
        'card-bg': 'rgb(var(--card-bg) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'divider': 'rgb(var(--divider) / <alpha-value>)',
        'primary': '#C4A962',
        'primary-dark': '#B39856',
        'expense': '#D14D72',
        'success': '#3FBC8B'
      },
      // Cores específicas para o dark mode
      backgroundColor: {
        dark: {
          'background': '#111827',
          'card': '#1F2937',
          'hover': '#374151'
        }
      },
      textColor: {
        dark: {
          'primary': '#F9FAFB',
          'secondary': '#D1D5DB'
        }
      },
      borderColor: {
        dark: {
          'default': '#374151',
          'hover': '#4B5563'
        }
      }
    },
  },
  plugins: [],
} 