import { useState } from "react";
import type { VocabEntry } from "../../store/appStore";

export function FlashcardReview({ entries, onClose }: { entries: VocabEntry[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const entry = entries[index];
  const isLast = index === entries.length - 1;

  const goNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setIndex((i) => i + 1);
    setFlipped(false);
  };

  return (
    <div className="border-[1.5px] border-[var(--color-ink)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
      <p className="mb-3 text-center text-[10.5px] font-bold text-[var(--color-ink-soft)]">
        {index + 1} / {entries.length}
      </p>

      <div className="h-32 w-full [perspective:1000px]" onClick={() => setFlipped((f) => !f)}>
        <div
          className={`relative h-full w-full cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div
            className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]"
            style={{ borderRadius: "var(--radius-card)", background: "var(--color-paper-dim)" }}
          >
            <p className="text-[17px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
              {entry.word}
            </p>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center px-4 text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ borderRadius: "var(--radius-card)", background: "var(--color-accent)" }}
          >
            <p className="text-[13px] font-semibold">{entry.meaning}</p>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-center text-[10.5px] text-[var(--color-ink-soft)]">카드를 탭해서 뜻을 확인하세요</p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border-[1.5px] border-[var(--color-ink)] py-2 text-[11.5px] font-bold text-[var(--color-ink)]"
          style={{ borderRadius: "var(--radius-btn)" }}
        >
          그만하기
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex-1 bg-[var(--color-accent)] py-2 text-[11.5px] font-bold text-white"
          style={{ borderRadius: "var(--radius-btn)" }}
        >
          {isLast ? "완료" : "다음 →"}
        </button>
      </div>
    </div>
  );
}
