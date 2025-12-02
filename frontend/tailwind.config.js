/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
        center: true,
        padding: '2rem',
        screens: {
            '2xl': '1400px'
        }
    },
    extend: {
        colors: {
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))', // Canvas (Deepest Background in Dark Mode)
            foreground: 'hsl(var(--foreground))',
            primary: {
                DEFAULT: 'hsl(var(--primary))', // User's Message Bubble Color
                foreground: 'hsl(var(--primary-foreground))'
            },
            secondary: {
                DEFAULT: 'hsl(var(--secondary))', // Other User's Message Bubble Color
                foreground: 'hsl(var(--secondary-foreground))'
            },
            destructive: {
                DEFAULT: 'hsl(var(--destructive))',
                foreground: 'hsl(var(--destructive-foreground))'
            },
            muted: {
                DEFAULT: 'hsl(var(--muted))', 
                foreground: 'hsl(var(--muted-foreground))'
            },
            accent: {
                DEFAULT: 'hsl(var(--accent))',
                foreground: 'hsl(var(--accent-foreground))'
            },
            popover: {
                DEFAULT: 'hsl(var(--popover))',
                foreground: 'hsl(var(--popover-foreground))'
            },
            card: {
                DEFAULT: 'hsl(var(--card))', // Floating Cards like the Profile Details (Highest Elevation in Dark Mode)
                foreground: 'hsl(var(--card-foreground))'
            },
            sidebar: {
                DEFAULT: 'hsl(var(--sidebar-background))', // Sidebar Background (Middle Elevation in Dark Mode)
                foreground: 'hsl(var(--sidebar-foreground))',
                active: 'hsl(var(--sidebar-active-background))', // The selected chat row
                'active-foreground': 'hsl(var(--sidebar-active-foreground))',
                border: 'hsl(var(--sidebar-border))',
                ring: 'hsl(var(--sidebar-ring))'
            }
        },
        borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)'
        },
        keyframes: {
            'accordion-down': {
                from: {
                    height: '0'
                },
                to: {
                    height: 'var(--radix-accordion-content-height)'
                }
            },
            'accordion-up': {
                from: {
                    height: 'var(--radix-accordion-content-height)'
                },
                to: {
                    height: '0'
                }
            },
            'message-slide': {
                from: {
                    opacity: '0',
                    transform: 'translateY(10px)'
                },
                to: {
                    opacity: '1',
                    transform: 'translateY(0)'
                }
            },
            'pulse-glow': {
                '0%, 100%': {
                    opacity: '1'
                },
                '50%': {
                    opacity: '0.7'
                }
            }
        },
        animation: {
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up': 'accordion-up 0.2s ease-out',
            'message-slide': 'message-slide 0.3s ease-out',
            'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
        },
        backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        }
    }
  },
  plugins: [tailwindcssAnimate],
}