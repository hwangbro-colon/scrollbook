// Single source of truth for brand colors, corner-radius tokens, fonts,
// logo path, and app copy. Accent is orange per explicit direction — the
// rest of the palette still follows the design-fidelity reference
// (bookbook_prototype_v4.html).

export const theme = {
  colors: {
    ink: "#212224", // primary text / default foreground
    inkSoft: "#A4A3A5", // secondary/muted text
    paper: "#FFFFFF", // primary background
    paperDim: "#E6E9ED", // secondary/section background
    line: "#E6E9ED", // borders/dividers
    // Single accent color for the whole app — used only for CTAs, streaks,
    // "new" tags, #1 ranking, mileage rewards, quiz cards, etc.
    accent: "#FF6A1A",
    accentTint: "#FFE6D6",
    // Flat cream used only for the topbar background and as the base tone
    // for the bottom nav's glass tint (never used as a general surface).
    navCream: "#FEF2E1",
    navCreamGlass: "rgba(254,242,225,.62)",
  },
  // Cards/badges stay 6-10px (squared, not pill). Buttons are the one
  // exception — full pill per Toss UI reference.
  radius: {
    card: "10px",
    btn: "999px",
    chip: "6px",
    avatar: "8px",
  },
  fonts: {
    display: "'Fredoka', sans-serif", // headlines — rounded, casual
    body: "'Inter', sans-serif", // body text
  },
  logo: "/image.files/logo.png",
  appName: "북북",
  appNameEn: "BOOKBOOK",
  slogan: "함께 소리 내어, 함께 스크롤하며 읽어요",
} as const;

// Applies the theme values as CSS custom properties on the document root,
// so Tailwind utility classes (e.g. bg-[var(--color-accent)]) and plain CSS
// both read from this single config at runtime.
export function applyTheme() {
  const root = document.documentElement.style;
  root.setProperty("--color-ink", theme.colors.ink);
  root.setProperty("--color-ink-soft", theme.colors.inkSoft);
  root.setProperty("--color-paper", theme.colors.paper);
  root.setProperty("--color-paper-dim", theme.colors.paperDim);
  root.setProperty("--color-line", theme.colors.line);
  root.setProperty("--color-accent", theme.colors.accent);
  root.setProperty("--color-accent-tint", theme.colors.accentTint);
  root.setProperty("--color-nav-cream", theme.colors.navCream);
  root.setProperty("--color-nav-cream-glass", theme.colors.navCreamGlass);
  root.setProperty("--radius-card", theme.radius.card);
  root.setProperty("--radius-btn", theme.radius.btn);
  root.setProperty("--radius-chip", theme.radius.chip);
  root.setProperty("--radius-avatar", theme.radius.avatar);
  root.setProperty("--font-display", theme.fonts.display);
  root.setProperty("--font-body", theme.fonts.body);
}
