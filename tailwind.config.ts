import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'sans': ['Inter Tight', 'system-ui', 'sans-serif'],
        'inter-tight': ['Inter Tight', 'system-ui', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Casino Theme Colors */
        'poker-felt': "hsl(var(--poker-felt))",
        'gold': {
          DEFAULT: "hsl(var(--gold-accent))",
          dark: "hsl(var(--gold-accent-dark))",
        },
        'navy': {
          deep: "hsl(var(--navy-deep))",
          card: "hsl(var(--navy-card))",
        },
        'emerald-bright': "hsl(var(--emerald-bright))",
        'winner-glow': "hsl(var(--winner-glow))",
      },
      backgroundImage: {
        'gradient-felt': 'var(--gradient-felt)',
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'gold': 'var(--shadow-gold)',
        'winner': 'var(--shadow-winner)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "card-flip": {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" }
        },
        "score-bounce": {
          "0%, 20%, 53%, 80%, 100%": { transform: "translateY(0px)" },
          "40%, 43%": { transform: "translateY(-10px)" },
          "70%": { transform: "translateY(-5px)" }
        },
        "winner-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--winner-glow) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--winner-glow) / 0.6)" }
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "card-flip": "card-flip 0.6s ease-in-out",
        "score-bounce": "score-bounce 1s ease-in-out",
        "winner-glow": "winner-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out"
      },
      fontSize: {
        // Mobile-first typography scale
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
        '5xl': ['48px', '1'],
        '6xl': ['60px', '1'],
        '7xl': ['72px', '1'],
      },
      spacing: {
        '3.5': '14px', // For mobile padding
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
