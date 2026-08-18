// Single source of truth for brand colors, corner-radius tokens, fonts,
// logo path, and app copy. Per the "실제 출시 범위(스크롤 기능만)" prototype
// spec: exactly 3 tones — white / black / accent blue, nothing else. Surfaces
// that need a lighter tint (card backgrounds, dividers) are black at low
// opacity rather than a separate gray hex, so the app never actually
// introduces a 4th color even where it reads as "light gray."

export const theme = {
  colors: {
    ink: "#0A0A0A", // near-black — primary text / default foreground
    inkSoft: "rgba(10,10,10,.5)", // secondary/muted text — tint of ink, not a new color
    paper: "#FFFFFF", // primary background
    paperDim: "rgba(10,10,10,.04)", // secondary/section background — tint of ink
    line: "rgba(10,10,10,.12)", // borders/dividers — tint of ink
    accent: "#348EEF", // the one point color — CTAs, active tab, progress, streaks
    accentTint: "rgba(52,142,239,.12)", // light accent surface (badges, active states)
    // Topbar/bottom-nav surface — translucent paper (white) for the nav's glass blur.
    navCream: "#FFFFFF",
    navCreamGlass: "rgba(255,255,255,.82)",
  },
  // Spec: buttons are border-radius 0 with zero exceptions. Everything else
  // (cards, avatars, chips/tags, stat boxes) stays in the 8-10px range.
  radius: {
    card: "10px",
    btn: "0px",
    chip: "8px",
    avatar: "8px",
  },
  fonts: {
    // 부크크 고딕 Bold/Light 예정 — 실제 폰트 파일(.woff2)이 아직 없어서
    // 지금은 두께가 비슷한 시스템 산세리프로 대체함. 파일이 생기면:
    //   1) public/fonts/BookkGothic-Bold.woff2, BookkGothic-Light.woff2 추가
    //   2) src/index.css 맨 위 "부크크 고딕 자리" 주석 아래에 @font-face 2개 추가
    //   3) 아래 display/body 값을 "'BookkGothic-Bold', ..." / "'BookkGothic-Light', ..."로 교체
    // 그 외 코드는 전혀 안 건드려도 됨 — 이 파일이 유일한 참조 지점.
    display: "-apple-system, BlinkMacSystemFont, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif", // 굵게(font-weight 700) 조합해서 씀 — 로고/제목/버튼
    body: "-apple-system, BlinkMacSystemFont, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif", // 가볍게(font-weight 400) 조합해서 씀 — 본문
  },
  logo: "/image.files/logo.png",
  appName: "북북",
  appNameEn: "BOOKBOOK",
  slogan: "스크롤로, 가볍게 읽어요",
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
