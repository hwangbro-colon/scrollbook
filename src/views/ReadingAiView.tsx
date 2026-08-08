import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useBook } from "../hooks/useBook";
import { CURRENT_BOOK_ID } from "../data/currentBook";
import { useToastStore } from "../store/toastStore";
import { ScreenScroll } from "../components/common/ScreenScroll";

// AI랑낭독 — no real speech recognition/TTS is wired up in this prototype;
// tapping "함께 읽기 시작" just simulates AI catching up sentence by
// sentence, mirroring how 라이브낭독's turn-taking already works.
export function ReadingAiView() {
  const navigate = useNavigate();
  const book = useBook(CURRENT_BOOK_ID);
  const showToast = useToastStore((s) => s.show);
  const [reading, setReading] = useState(false);

  const sentence = book?.chapters[0]?.chunks[0]?.sentences[0];

  return (
    <ScreenScroll>
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
        className="mb-4 flex h-8 w-8 items-center justify-center border-[1.5px] border-[var(--color-ink)]"
        style={{ borderRadius: "var(--radius-avatar)" }}
      >
        <ChevronLeft size={16} strokeWidth={2} color="var(--color-ink)" aria-hidden="true" />
      </button>

      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        AI랑낭독
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">AI 목소리와 번갈아가며 읽어요</p>

      <div className="border-[1.5px] border-[var(--color-ink)] p-5" style={{ borderRadius: "var(--radius-card)" }}>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
          <span className="text-[12px] font-bold text-[var(--color-ink)]">{book?.title ?? "책"}</span>
        </div>
        {sentence && <p className="text-[14px] leading-[1.7] text-[var(--color-ink)]">{sentence}</p>}
        <button
          type="button"
          onClick={() => {
            setReading((v) => !v);
            if (!reading) showToast("AI가 다음 문장을 읽어줄게요 (프로토타입 시뮬레이션)");
          }}
          className="mt-4 w-full py-3 text-[13px] font-extrabold text-white"
          style={{ borderRadius: "var(--radius-btn)", background: "var(--color-accent)" }}
        >
          {reading ? "일시정지" : "함께 읽기 시작"}
        </button>
        {reading && <p className="mt-2.5 text-center text-[11px] text-[var(--color-ink-soft)]">🎧 AI가 듣고 있어요…</p>}
      </div>
    </ScreenScroll>
  );
}
