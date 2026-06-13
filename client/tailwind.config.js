/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080810",
        card: "rgba(16, 16, 28, 0.4)",
        border: "rgba(255, 255, 255, 0.08)",
        // Game-specific colors
        valorant: {
          accent: "#ff4655",
          glow: "rgba(255, 70, 85, 0.4)",
          bg: "#0f1923"
        },
        cs2: {
          accent: "#de9b35",
          glow: "rgba(222, 155, 53, 0.4)",
          bg: "#11141a"
        },
        lol: {
          accent: "#c8aa6e",
          glow: "rgba(200, 170, 110, 0.4)",
          bg: "#091428"
        },
        fortnite: {
          accent: "#00f0ff",
          glow: "rgba(0, 240, 255, 0.4)",
          bg: "#120626"
        },
        pubg: {
          accent: "#f25c05",
          glow: "rgba(242, 92, 5, 0.4)",
          bg: "#161311"
        },
        nexus: {
          accent: "#9b5de5",
          glow: "rgba(155, 93, 229, 0.4)"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 15px var(--tw-shadow-color)",
        "neon-thick": "0 0 25px var(--tw-shadow-color)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px var(--tw-shadow-color)' },
          '100%': { boxShadow: '0 0 20px var(--tw-shadow-color)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
