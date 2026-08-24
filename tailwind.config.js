/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fbf8fa',
        surface: {
          DEFAULT: '#fbf8fa',
          dim: '#dcd9db',
          bright: '#fbf8fa',
          lowest: '#ffffff',
          low: '#f5f3f4',
          container: '#f0edef',
          high: '#eae7e9',
          highest: '#e4e2e3',
          card: '#ffffff',
        },
        primary: {
          DEFAULT: '#091426',
          container: '#1e293b',
          foreground: '#ffffff',
          muted: '#8590a6',
          fixed: '#d8e3fb',
        },
        secondary: {
          DEFAULT: '#505f76',
          container: '#d0e1fb',
          foreground: '#ffffff',
          muted: '#64748B',
        },
        success: {
          DEFAULT: '#4D7C0F',
          light: '#f0fdf4',
          border: '#bbf7d0',
          dark: '#166534',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#fffbeb',
          border: '#fde68a',
          dark: '#92400e',
        },
        error: {
          DEFAULT: '#BE123C',
          light: '#fff1f2',
          border: '#fecdd3',
          dark: '#881337',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#E2E8F0',
          strong: '#CBD5E1',
        },
        'on-surface': '#1b1b1d',
        'on-surface-variant': '#45474c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
