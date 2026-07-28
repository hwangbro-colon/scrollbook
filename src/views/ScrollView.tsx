import { useMemo, useState } from "react";
import type { UIEvent } from "react";
import { Loader2 } from "lucide-react";
import { useMileageStore } from "../store/mileageStore";
import { useCountUp } from "../hooks/useCountUp";
import { useBook } from "../hooks/useBook";
import { CURRENT_BOOK_ID } from "../data/currentBook";

const COMPLETION_BONUS = 30;

type Mode = "reel" | "ebook";

const QUIZ_SUBMIT_DELAY_MS = 450;

export function ScrollView() {
  const book = useBook(CURRENT_BOOK_ID);

  const [mode, setMode] = useState<Mode>("reel");
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [submittingOptionIndex, setSubmittingOptionIndex] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [completionAwarded, setCompletionAwarded] = useState(false);

  const earnMileage = useMileageStore((s) => s.earnMileage);
  const displayedProgress = useCountUp(progress, 250);

  // Flatten chapters → one flat list of (chunk + chapter label) in order,
  // since the scroll reel shows one chunk per card regardless of chapter.
  const flatChunks = useMemo(() => {
    if (!book) return [];
    return book.chapters.flatMap((chapter) =>
      chapter.chunks.map((chunk, i) => ({
        ...chunk,
        eyebrow: i === 0 ? `${book.title} · ${chapter.chapterTitle}` : "이어서",
        isFirstOfBook: chapter.chapterNumber === 1 && i === 0,
        isLastOfChapter: i === chapter.chunks.length - 1,
      })),
    );
  }, [book]);

  const totalSteps = flatChunks.length + 1; // +1 for the comprehension-quiz card
  const remainingSteps = Math.max(0, totalSteps - 1 - currentIndex);
  const remainingMinutes = book ? Math.max(0, Math.round(book.estimatedReadMinutes * (1 - progress / 100))) : 0;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const pct = maxScroll <= 0 ? 100 : Math.round((el.scrollTop / maxScroll) * 100);
    const clamped = Math.min(100, Math.max(0, pct));
    setProgress(clamped);
    if (el.clientHeight > 0) {
      setCurrentIndex(Math.round(el.scrollTop / el.clientHeight));
    }
    if (clamped >= 100 && !completionAwarded) {
      setCompletionAwarded(true);
      earnMileage(COMPLETION_BONUS, "완독 보너스", "completion");
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (answered || submittingOptionIndex !== null) return;
    setSubmittingOptionIndex(optionIndex);
    setTimeout(() => {
      setSelectedOptionIndex(optionIndex);
      setAnswered(true);
      setSubmittingOptionIndex(null);
      earnMileage(10, "이해도 체크 참여", "quiz");
    }, QUIZ_SUBMIT_DELAY_MS);
  };

  if (!book) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 text-sm text-[var(--color-ink-soft)]">
        콘텐츠를 찾을 수 없어요.
      </div>
    );
  }

  return (
    <>
      <div className="flex-none px-5 pb-2.5 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            <b className="text-[var(--color-accent)]">{displayedProgress}%</b>
          </div>
          <div className="flex p-[3px]" style={{ background: "var(--color-paper-dim)", borderRadius: "var(--radius-btn)" }}>
            {(["reel", "ebook"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-[11px] font-bold ${
                  mode === m ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink-soft)]"
                }`}
                style={{ borderRadius: "var(--radius-chip)" }}
              >
                {m === "reel" ? "스크롤" : "전자책"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full" style={{ background: "var(--color-paper-dim)" }}>
          <div
            className="h-full transition-all duration-200"
            style={{ width: `${displayedProgress}%`, background: "var(--color-accent)" }}
          />
        </div>
      </div>

      {mode === "reel" ? (
        <div
          onScroll={handleScroll}
          className="no-scrollbar h-[58vh] overflow-y-auto"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {flatChunks.map((chunk) => (
            <div
              key={chunk.chunkId}
              className="flex h-full flex-col justify-center bg-[var(--color-ink)] px-6 pb-[34px] pt-6 text-white"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.08em] opacity-55">{chunk.eyebrow}</div>
              <p className="text-[16.5px] font-medium leading-[1.65]" style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}>
                {chunk.sentences.map((s, i) => (
                  <span key={i}>
                    {s}
                    <br />
                  </span>
                ))}
              </p>
              {chunk.isFirstOfBook && (
                <div className="mt-4 text-center text-[10px] tracking-[.04em] opacity-40">▲ 위로 넘겨서 계속 읽기 ▲</div>
              )}
              {chunk.isLastOfChapter && !chunk.isFirstOfBook && (
                <div className="mt-4 text-center text-[10px] tracking-[.04em] opacity-40">계속 넘기면 이야기가 이어져요</div>
              )}
            </div>
          ))}

          <div
            className="flex h-full flex-col justify-center bg-[var(--color-accent)] p-6 text-white"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.08em] opacity-85">이해도 체크</div>
            <h4
              className="mb-4 whitespace-pre-line text-[16.5px] font-semibold leading-[1.5]"
              style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}
            >
              {book.comprehensionQuiz.question}
            </h4>
            {book.comprehensionQuiz.options.map((opt, i) => {
              const isSelected = selectedOptionIndex === i;
              const showCorrect = answered && opt.correct;
              const isSubmitting = submittingOptionIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered || submittingOptionIndex !== null}
                  onClick={() => handleSelectOption(i)}
                  className="mb-2.5 flex w-full items-center justify-between text-left text-[13px] font-semibold"
                  style={{
                    padding: "11px 13px",
                    borderRadius: "var(--radius-btn)",
                    background: showCorrect ? "#fff" : "rgba(255,255,255,.16)",
                    color: showCorrect ? "var(--color-accent)" : "#fff",
                    border: showCorrect ? "none" : "1px solid rgba(255,255,255,.4)",
                    opacity: answered && !isSelected && !showCorrect ? 0.55 : 1,
                  }}
                >
                  {opt.text}
                  {isSubmitting && <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div onScroll={handleScroll} className="h-[58vh] overflow-y-auto px-6 pb-[26px] pt-2">
          <div className="mb-3 text-[10.5px] font-bold uppercase tracking-[.06em] text-[var(--color-ink-soft)]">
            {book.title} · {book.author}
          </div>
          {book.chapters.map((chapter) => (
            <div key={chapter.chapterNumber}>
              {chapter.chunks.map((chunk) => (
                <p key={chunk.chunkId} className="mb-4 text-[15px] leading-[1.9]">
                  {chunk.sentences.join(" ")}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-none justify-center border-t border-[var(--color-line)] px-5 py-2.5 text-[11px] font-semibold text-[var(--color-ink-soft)]">
        예상 남은 시간 {remainingMinutes < 1 ? "1분 미만" : `${remainingMinutes}분`} · {remainingSteps}페이지 남음
      </div>
      <p className="flex-none pb-[88px] text-center text-[10px] text-[var(--color-ink-soft)]/60">출처: {book.source}</p>
    </>
  );
}
