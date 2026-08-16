import { Logo } from "./Logo";
import { theme } from "../../config/theme";

// Spec: "스플래시: 흰 배경, 중앙 '북북' 로고" — flipped from the old dark splash.
export function SplashScreen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--color-paper)]">
      <Logo size={72} />
      <p className="text-2xl font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        {theme.appName}
      </p>
    </div>
  );
}
