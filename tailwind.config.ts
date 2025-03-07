import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'impact': ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
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
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				gaming: {
					background: '#0A0A0B',
					card: '#151518',
					accent: '#2A2A2E',
					primary: '#6366F1',
					secondary: '#8B5CF6',
					success: '#10B981',
					warning: '#F59E0B',
					danger: '#EF4444',
					text: {
						primary: '#FFFFFF',
						secondary: '#A1A1AA'
					}
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
				'swipe-up': {
					'0%, 100%': { transform: 'translate(-50%, -50%)' },
					'50%': { transform: 'translate(-50%, -250%)' }
				},
				'pulse': {
					'0%, 100%': { 
						transform: 'translate(-50%, -50%) scale(1)',
						opacity: '0.5'
					},
					'50%': { 
						transform: 'translate(-50%, -50%) scale(1.1)',
						opacity: '1'
					}
				},
				'ping-slow': {
					'75%, 100%': {
						transform: 'scale(2)',
						opacity: '0'
					}
				},
				'wiggle': {
					'0%, 7%, 14%': { transform: 'rotate(-3deg)' },
					'3.5%, 10.5%, 17.5%': { transform: 'rotate(3deg)' },
					'21%, 100%': { transform: 'rotate(0)' },
				},
				
				
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'swipe-up': 'swipe-up 5s ease-in-out infinite',
				'pulse': 'pulse 1s infinite',
				'ping-slow': 'ping-slow 1s cubic-bezier(0, 0, 0.2, 1) infinite',
				'wiggle': 'wiggle 2.5s ease-in-out infinite',
				"fade-in-0": "fade-in-0 0.3s ease-in-out",
				"zoom-in-0": "zoom-in-0 0.3s ease-in-out",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
