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
        "space": ["Space Grotesk", "sans-serif"],
        "inter": ["Inter", "sans-serif"],
        "mono-jet": ["JetBrains Mono", "monospace"],
        "display": ["Playfair Display", "serif"],
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Modern theme
        modern: {
          bg: "hsl(var(--modern-bg))",
          fg: "hsl(var(--modern-fg))",
          accent: "hsl(var(--modern-accent))",
          "accent-fg": "hsl(var(--modern-accent-fg))",
          card: "hsl(var(--modern-card))",
          "card-fg": "hsl(var(--modern-card-fg))",
          muted: "hsl(var(--modern-muted))",
          "muted-fg": "hsl(var(--modern-muted-fg))",
          "tag-bg": "hsl(var(--modern-tag-bg))",
          "tag-fg": "hsl(var(--modern-tag-fg))",
          "tag-secondary-bg": "hsl(var(--modern-tag-secondary-bg))",
          "tag-secondary-fg": "hsl(var(--modern-tag-secondary-fg))",
        },
        // Minimal theme
        minimal: {
          bg: "hsl(var(--minimal-bg))",
          fg: "hsl(var(--minimal-fg))",
          accent: "hsl(var(--minimal-accent))",
          "accent-fg": "hsl(var(--minimal-accent-fg))",
          card: "hsl(var(--minimal-card))",
          "card-fg": "hsl(var(--minimal-card-fg))",
          muted: "hsl(var(--minimal-muted))",
          "muted-fg": "hsl(var(--minimal-muted-fg))",
          border: "hsl(var(--minimal-border))",
          "tag-bg": "hsl(var(--minimal-tag-bg))",
          "tag-fg": "hsl(var(--minimal-tag-fg))",
          highlight: "hsl(var(--minimal-highlight))",
          "highlight-fg": "hsl(var(--minimal-highlight-fg))",
        },
        // Dark theme
        "dark-theme": {
          bg: "hsl(var(--dark-bg))",
          fg: "hsl(var(--dark-fg))",
          accent: "hsl(var(--dark-accent))",
          "accent-fg": "hsl(var(--dark-accent-fg))",
          card: "hsl(var(--dark-card))",
          "card-fg": "hsl(var(--dark-card-fg))",
          muted: "hsl(var(--dark-muted))",
          "muted-fg": "hsl(var(--dark-muted-fg))",
          border: "hsl(var(--dark-border))",
          "tag-bg": "hsl(var(--dark-tag-bg))",
          "tag-fg": "hsl(var(--dark-tag-fg))",
          "tag-secondary-bg": "hsl(var(--dark-tag-secondary-bg))",
          "tag-secondary-fg": "hsl(var(--dark-tag-secondary-fg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
