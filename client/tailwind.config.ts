import type { Config } from "tailwindcss"
// @ts-ignore
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0a0a0a", // black (用户消息背景)
        },
        "primary-foreground": "#ffffff", // white (用户消息文字)
        background: "#ffffff",
        foreground: "#0a0a0a",
        input: "#e4e4e7",
        ring: "#0a0a0a",
        popover: "#ffffff",
        "popover-foreground": "#0a0a0a",
        border: "#e4e4e7", // zinc-200
        muted: "#f4f4f5", // zinc-100
        "muted-foreground": "#71717a", // zinc-500
        accent: "#f4f4f5", // zinc-100
        "accent-foreground": "#0a0a0a",
        destructive: "#ef4444", // red-500
        "destructive-foreground": "#ffffff",
        secondary: "#f4f4f5", // zinc-100
        "secondary-foreground": "#0a0a0a",
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        "fade-chunk": "fadeChunk 150ms ease-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        fadeChunk: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
      },
    },
  },
  plugins: [addVariablesForColors, require("@tailwindcss/typography")],
}

export default config

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"))
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val as string])
  )

  addBase({
    ":root": newVars,
  })
}
