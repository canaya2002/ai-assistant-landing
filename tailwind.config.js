/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Colores personalizados de NORA
      colors: {
        'nora-primary': '#3b82f6',
        'nora-secondary': '#8b5cf6',
        'nora-accent': '#10b981',
        'nora-dark': '#0f172a',
        'nora-gray': '#1e293b',
        'nora-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        'nora-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },

      // Fuentes personalizadas
      fontFamily: {
        'lastica': ['Lastica', 'system-ui', 'sans-serif'],
        'sans': ['Lastica', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },

      // Animaciones personalizadas
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'floatDelayed 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typewriter': 'typewriter 2s steps(40) 1s both',
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'sparkle': 'sparkle 3s linear infinite',
        'breath': 'breath 4s ease-in-out infinite',
        'breath-delayed': 'breathDelayed 6s ease-in-out infinite',
        'slide-x': 'slideX 8s linear infinite',
        'slide-x-reverse': 'slideXReverse 10s linear infinite',
        'width-expand': 'widthExpand 1.5s ease-out forwards',
        'loading-dots': 'loadingDots 1.5s steps(4, end) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      // Keyframes para las animaciones
      keyframes: {
        fadeUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        floatDelayed: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(10px) translateX(-5px)' },
          '50%': { transform: 'translateY(0px) translateX(-10px)' },
          '75%': { transform: 'translateY(-10px) translateX(-5px)' }
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)'
          },
          '50%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'
          }
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        },
        gradientX: {
          '0%, 100%': {
            backgroundSize: '200% 200%',
            backgroundPosition: 'left center'
          },
          '50%': {
            backgroundSize: '200% 200%',
            backgroundPosition: 'right center'
          }
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        sparkle: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
          '100%': { transform: 'translateX(100%) translateY(100%) rotate(45deg)' }
        },
        breath: {
          '0%, 100%': { 
            transform: 'translate(-50%, -50%) scale(1)', 
            opacity: '0.1' 
          },
          '50%': { 
            transform: 'translate(-50%, -50%) scale(1.1)', 
            opacity: '0.3' 
          }
        },
        breathDelayed: {
          '0%, 100%': { 
            transform: 'translate(-50%, -50%) scale(1)', 
            opacity: '0.05' 
          },
          '50%': { 
            transform: 'translate(-50%, -50%) scale(1.15)', 
            opacity: '0.2' 
          }
        },
        slideX: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        slideXReverse: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        widthExpand: {
          '0%': { width: '0' },
          '100%': { width: '8rem' }
        },
        loadingDots: {
          '0%, 20%': { content: '""' },
          '40%': { content: '"."' },
          '60%': { content: '".."' },
          '80%, 100%': { content: '"..."' }
        }
      },

      // Espaciado personalizado
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Tamaños de contenedor personalizados
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },

      // Altura personalizada
      height: {
        '128': '32rem',
      },

      // Blur personalizado
      backdropBlur: {
        xs: '2px',
      },

      // Sombras personalizadas
      boxShadow: {
        'nora': '0 10px 40px rgba(59, 130, 246, 0.1)',
        'nora-lg': '0 20px 60px rgba(59, 130, 246, 0.15)',
        'purple': '0 10px 40px rgba(139, 92, 246, 0.1)',
        'purple-lg': '0 20px 60px rgba(139, 92, 246, 0.15)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
      },

      // Gradientes personalizados
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'nora-gradient': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        'nora-dark-gradient': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
      },

      // Tipografía personalizada
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '10xl': ['10rem', { lineHeight: '1' }],
        '11xl': ['12rem', { lineHeight: '1' }],
        '12xl': ['14rem', { lineHeight: '1' }],
      },

      // Anchos de línea personalizados
      borderWidth: {
        '3': '3px',
      },

      // Opacidad personalizada
      opacity: {
        '2.5': '0.025',
        '7.5': '0.075',
        '15': '0.15',
      },

      // Z-index personalizado
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Transiciones personalizadas
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },

      // Duraciones de transición personalizadas
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },

      // Funciones de temporización personalizadas
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [
    // Plugin para agregar utilidades de texto gradiente
    function({ addUtilities }) {
      const newUtilities = {
        '.text-gradient-nora': {
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-rainbow': {
          background: 'linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.3)',
          'backdrop-filter': 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.no-select': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
        },
        '.no-drag': {
          '-webkit-user-drag': 'none',
          '-khtml-user-drag': 'none',
          '-moz-user-drag': 'none',
          '-o-user-drag': 'none',
          'user-drag': 'none',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}