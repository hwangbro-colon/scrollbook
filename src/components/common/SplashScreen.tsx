import { Logo } from "./Logo";
import { theme } from "../../config/theme";

export function SplashScreen() {
  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center gap-4 bg-[var(--color-ink)]">
      <Logo size={96} />
      <div className="text-center">
        <p className="text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
          {theme.appName}
        </p>
        <p className="mt-1 text-sm text-white/60">{theme.slogan}</p>
      </div>
    </div>
  );
}
