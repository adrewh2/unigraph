import { Theme, ThemeId, commonSizes } from "app-shell";

/**
 * Custom Unigraph theme with a modern, vibrant color palette
 * Inspired by cyberpunk aesthetics with excellent readability
 */
export const customUnigraphTheme: Theme = {
  id: "unigraph-custom" as ThemeId,
  name: "Unigraph Neon",
  colors: {
    // Core brand colors - vibrant and modern
    primary: "#00d4ff",        // Electric cyan
    secondary: "#8b5cf6",      // Purple
    accent: "#ff6b35",         // Orange-red accent

    // Background layers - deep dark with subtle variations
    background: "#0a0a0f",           // Very dark blue-black
    backgroundSecondary: "#131318",  // Slightly lighter dark
    backgroundTertiary: "#1a1a24",   // Medium dark with blue tint

    // Interactive surfaces
    surface: "#1e1e2e",              // Card/panel background
    surfaceHover: "#262640",         // Hover state
    surfaceActive: "#2d2d4a",        // Active/pressed state

    // Text hierarchy - high contrast for readability
    text: "#f0f0f5",                 // Primary text - very light
    textSecondary: "#c9c9d6",        // Secondary text
    textMuted: "#8b8b9c",            // Muted/disabled text
    textInverse: "#0a0a0f",          // Text on light backgrounds

    // Border system
    border: "#2a2a3a",               // Subtle borders
    borderFocus: "#00d4ff",          // Focus ring color (matches primary)
    borderHover: "#404055",          // Hover border

    // Status colors - modern and accessible
    success: "#00ff88",              // Bright green
    warning: "#ffb84d",              // Warm orange
    error: "#ff4757",                // Bright red
    info: "#00d4ff",                 // Matches primary

    // Links
    link: "#00d4ff",                 // Matches primary
    linkHover: "#33ddff",            // Lighter on hover

    // Workspace-specific colors with the new palette
    workspaceBackground: "#0a0a0f",      // Deep background
    workspacePanel: "#131318",           // Panel background
    workspaceTitleBackground: "#1a1a24", // Title bar background
    workspaceTitleText: "#00d4ff",       // Bright cyan title text
    workspaceResizer: "#2a2a3a",         // Resizer handle
    workspaceResizerHover: "#00d4ff",    // Bright hover state
    workspaceScrollbar: "#404055",       // Scrollbar
    workspaceScrollbarHover: "#8b5cf6",  // Purple scrollbar hover
  },
  sizes: commonSizes, // Use the shared size definitions from app-shell
};

/**
 * Alternative warm-themed variant with earth tones and gold accents
 */
export const unigraphWarmTheme: Theme = {
  id: "unigraph-warm" as ThemeId,
  name: "Unigraph Warm",
  colors: {
    // Warm, sophisticated color palette
    primary: "#f59e0b",        // Golden yellow
    secondary: "#dc2626",      // Warm red
    accent: "#059669",         // Forest green

    // Rich dark backgrounds with warm undertones
    background: "#1c1917",           // Warm black
    backgroundSecondary: "#292524",  // Dark brown
    backgroundTertiary: "#44403c",   // Medium brown

    // Interactive surfaces with warmth
    surface: "#44403c",              // Card/panel background
    surfaceHover: "#57534e",         // Hover state
    surfaceActive: "#6b7280",        // Active/pressed state

    // Text with warm undertones
    text: "#fbbf24",                 // Warm white/gold
    textSecondary: "#d6d3d1",        // Light warm gray
    textMuted: "#a8a29e",            // Muted warm gray
    textInverse: "#1c1917",          // Dark text on light backgrounds

    // Warm border system
    border: "#57534e",               // Subtle warm borders
    borderFocus: "#f59e0b",          // Golden focus ring
    borderHover: "#78716c",          // Hover border

    // Status colors with warm variants
    success: "#10b981",              // Green (unchanged)
    warning: "#f97316",              // Warm orange
    error: "#dc2626",                // Warm red
    info: "#0ea5e9",                 // Sky blue

    // Warm links
    link: "#fbbf24",                 // Golden link
    linkHover: "#f59e0b",            // Darker gold on hover

    // Workspace-specific colors with warm palette
    workspaceBackground: "#1c1917",      // Warm dark background
    workspacePanel: "#292524",           // Warm panel
    workspaceTitleBackground: "#44403c", // Warm title bar
    workspaceTitleText: "#fbbf24",       // Golden title text
    workspaceResizer: "#57534e",         // Warm resizer
    workspaceResizerHover: "#f59e0b",    // Golden hover
    workspaceScrollbar: "#78716c",       // Warm scrollbar
    workspaceScrollbarHover: "#dc2626",  // Red scrollbar hover
  },
  sizes: commonSizes,
};
