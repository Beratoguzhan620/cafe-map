// Colours for props that cannot take a className (icons, placeholders, sheet chrome).
export const palette = {
  light: { ink: "#1A1A1A", muted: "#6B6862", accent: "#7A5230", surface: "#FFFFFF", border: "#E2DFD8" },
  dark: { ink: "#EDEBE6", muted: "#A3A098", accent: "#C99A6E", surface: "#1C1C1A", border: "#2E2D2A" },
} as const;

export type Palette = (typeof palette)[keyof typeof palette];
