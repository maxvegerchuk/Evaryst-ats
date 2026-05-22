/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          page:    '#F8FAFC',
          card:    '#FFFFFF',
          sidebar: '#F1F5F9',
          overlay: '#EBF0F7',
        },
        border: {
          default: '#E2E8F0',
          strong:  '#CBD5E1',
        },
        text: {
          primary:   '#1E293B',
          secondary: '#475569',
          muted:     '#94A3B8',
        },
        status: {
          success:      '#166534',
          'success-bg': '#DCFCE7',
          danger:       '#991B1B',
          'danger-bg':  '#FEE2E2',
          warning:      '#854D0E',
          'warning-bg': '#FEF3C7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
        btn:  '7px',
      },
    },
  },
  plugins: [],
}
