/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ═══ Primary Brand (Teal/Cyan) ═══ */
        "primary": "#4dbace",
        "primary-container": "#26a69a",
        "primary-fixed": "#84f5e8",
        "primary-fixed-dim": "#66d9cc",
        "on-primary": "#ffffff",
        "on-primary-container": "#003430",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#005049",
        "inverse-primary": "#66d9cc",
        "surface-tint": "#4dbace",

        /* ═══ Secondary ═══ */
        "secondary": "#525f71",
        "secondary-container": "#d3e1f6",
        "secondary-fixed": "#d6e4f9",
        "secondary-fixed-dim": "#bac8dc",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#566475",
        "on-secondary-fixed": "#001d31",
        "on-secondary-fixed-variant": "#3a4859",

        /* ═══ Tertiary ═══ */
        "tertiary": "#006973",
        "tertiary-container": "#00a4b4",
        "tertiary-fixed": "#93f1ff",
        "tertiary-fixed-dim": "#56d7e9",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#003339",
        "on-tertiary-fixed": "#001f23",
        "on-tertiary-fixed-variant": "#004f57",

        /* ═══ Error / Danger ═══ */
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        /* ═══ Success ═══ */
        "success": "#16a34a",
        "success-container": "#dcfce7",
        "on-success": "#ffffff",
        "on-success-container": "#166534",

        /* ═══ Warning ═══ */
        "warning": "#d97706",
        "warning-container": "#fffbeb",
        "on-warning": "#ffffff",
        "on-warning-container": "#92400e",

        /* ═══ Info ═══ */
        "info": "#2563eb",
        "info-container": "#dbeafe",
        "on-info": "#ffffff",
        "on-info-container": "#1e40af",

        /* ═══ Surface / Background ═══ */
        "surface": "#f8f9fa",
        "surface-bright": "#f8f9fa",
        "surface-dim": "#d9dadb",
        "surface-variant": "#e1e3e4",
        "surface-container": "#edeeef",
        "surface-container-low": "#f3f4f5",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "background": "#f8f9fa",

        /* ═══ On-Surface (Text) ═══ */
        "on-surface": "#191c1d",
        "on-surface-variant": "#3d4947",
        "on-background": "#191c1d",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",

        /* ═══ Outline / Border ═══ */
        "outline": "#6d7a77",
        "outline-variant": "#bcc9c6",
        "border-color": "#e2e8f0",
        "border-color-strong": "#cbd5e1",

        /* ═══ Semantic Aliases ═══ */
        "card": "#ffffff",
        "card-hover": "#f8fafc",
        "muted": "#64748b",
        "muted-foreground": "#475569",
      },

      /* ═══ Border Radius ═══ */
      borderRadius: {
        'none': '0',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },

      /* ═══ Box Shadow ═══ */
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 4px 16px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-slow': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },

      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },

      zIndex: {
        'sidebar': '40',
        'navbar': '30',
        'modal': '50',
        'dropdown': '40',
        'toast': '60',
        'tooltip': '70',
      },
    },
  },
  plugins: [],
}
