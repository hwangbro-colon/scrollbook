import { X } from "lucide-react";
import { useOnboardingStore } from "../../store/onboardingStore";
import { theme } from "../../config/theme";

// Spec: "북북 홈 진입 시 최초 1회 표시" — HomeScrollView renders this
// conditionally on `hasSeenTutorial`, over the reader itself (background is
// whatever's already on screen, per storyboard: "배경: 스크롤 리딩 화면").
export function OnboardingPopup() {
  const dismissTutorial = useOnboardingStore((s) => s.dismissTutorial);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[var(--color-ink)]/92 px-6 pt-[calc(20px+env(safe-area-inset-top,0px))] text-white backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {theme.appName}
        </span>
        <button
          type="button"
          onClick={dismissTutorial}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-white/70"
        >
          <X size={15} strokeWidth={2} color="#fff" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-16 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[.08em] text-white/60">북북 사용법</p>
        <h2 className="text-[22px] font-bold leading-[1.4]" style={{ fontFamily: "var(--font-display)" }}>
          책을 스크롤 해서
          <br />
          읽으세요!
        </h2>
        <p className="max-w-[240px] text-[13px] leading-[1.6] text-white/80">
          첫 5문장이 마음에 들면 계속 읽고, 아니면 위 책장으로 가서 다른 책을 고르세요
        </p>
      </div>
    </div>
  );
}
