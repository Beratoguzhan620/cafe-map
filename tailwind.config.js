/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#F7F6F3",
        surface: "#FFFFFF",
        "surface-2": "#F0EEE9",
        border: "#E2DFD8",
        ink: "#1A1A1A",
        muted: "#6B6862",
        primary: "#1F2A37",
        accent: "#7A5230",
        "accent-soft": "#F2EAE2",
        // Dark theme (docs/DESIGN.md)
        night: {
          bg: "#141413",
          surface: "#1C1C1A",
          "surface-2": "#262624",
          border: "#2E2D2A",
          ink: "#EDEBE6",
          muted: "#A3A098",
          accent: "#C99A6E",
          "accent-soft": "#2E241B",
        },
      },
      fontFamily: {
        sans: ["IBMPlexSans_400Regular"],
        medium: ["IBMPlexSans_500Medium"],
        semibold: ["IBMPlexSans_600SemiBold"],
        mono: ["IBMPlexMono_400Regular"],
      },
      fontSize: {
        xs: ["12px", "18px"],
        sm: ["14px", "21px"],
        base: ["16px", "24px"],
        lg: ["20px", "26px"],
        xl: ["24px", "30px"],
        "2xl": ["32px", "38px"],
      },
      borderRadius: {
        DEFAULT: "6px",
        card: "10px",
      },
    },
  },
  plugins: [],
};
