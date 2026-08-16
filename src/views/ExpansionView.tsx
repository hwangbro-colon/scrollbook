import { Sparkles } from "lucide-react";

// 탭 3 — "(확장)" 자리. 스펙: "비활성 placeholder 화면: '곧 만나요' 카피만 표시".
// 어떤 기능이 여기 들어갈지는 미정(spec/STORYBOARD.md 확인 필요 사항 4번) —
// 그래서 실제 기능은 아무것도 안 만들고 카피만 둠.
export function ExpansionView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <Sparkles size={28} strokeWidth={1.6} color="var(--color-ink-soft)" aria-hidden="true" />
      <p className="text-lg font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        곧 만나요
      </p>
      <p className="text-[12px] text-[var(--color-ink-soft)]">새로운 기능을 준비하고 있어요</p>
    </div>
  );
}
