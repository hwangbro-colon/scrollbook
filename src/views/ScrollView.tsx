import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useMileageStore } from "../store/mileageStore";
import { useCountUp } from "../hooks/useCountUp";
import { useBook } from "../hooks/useBook";
import { CURRENT_BOOK_ID } from "../data/currentBook";
import type { Chunk } from "../types/book";

const COMPLETION_BONUS = 30;

type Mode = "reel" | "ebook";

const QUIZ_SUBMIT_DELAY_MS = 450;

type ReelCard =
  | { kind: "chunk"; chunk: Chunk; chapterNumber: number; chapterTitle: string; isFirstOfBook: boolean; isLastOfBook: boolean }
  | { kind: "chapterPreview"; nextChapterNumber: number; nextChapterTitle: string };

function HighlightedText({
  sentence,
  vocabByWord,
  addedWords,
  onTap,
}: {
  sentence: string;
  vocabByWord: Map<string, string>;
  addedWords: Set<string>;
  onTap: (word: string, meaning: string) => void;
}) {
  const words = [...vocabByWord.keys()].filter((w) => sentence.includes(w));
  if (words.length === 0) return <>{sentence}</>;

  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = sentence.split(pattern).filter((p) => p.length > 0);

  return (
    <>
      {parts.map((part, i) => {
        if (!vocabByWord.has(part)) return <span key={i}>{part}</span>;
        const added = addedWords.has(part);
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!added) onTap(part, vocabByWord.get(part)!);
            }}
            className="inline underline decoration-dotted underline-offset-4"
            style={{ color: added ? "#8CFF9A" : "var(--color-accent)" }}
          >
            {part}
            {added && " ✓"}
          </button>
        );
      })}
    </>
  );
}

export function ScrollView() {
  const { bookId } = useParams<{ bookId?: string }>();
  const book = useBook(bookId ?? CURRENT_BOOK_ID);

  const [mode, setMode] = useState<Mode>("reel");
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [submittingOptionIndex, setSubmittingOptionIndex] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [completionAwarded, setCompletionAwarded] = useState(false);
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
  const [fontScale, setFontScale] = useState(100);
  const quizResolved = answered || skipped;

  const earnMileage = useMileageStore((s) => s.earnMileage);
  const addVocab = useAppStore((s) => s.addVocab);
  const setLastActivity = useAppStore((s) => s.setLastActivity);
  const recordQuizAnswer = useAppStore((s) => s.recordQuizAnswer);
  const wrongQuizCounts = useAppStore((s) => s.wrongQuizCounts);
  const displayedProgress = useCountUp(progress, 250);
  const reelRef = useRef<HTMLDivElement>(null);
  const ebookRef = useRef<HTMLDivElement>(null);
  const restoredPositionRef = useRef(false);

  const vocabByWord = useMemo(() => new Map((book?.vocabCandidates ?? []).map((v) => [v.word, v.meaning])), [book]);

  // Chapter-boundary preview cards are inserted once between chapters (not
  // per chunk) — swiping through a chapter reads normally, then a single
  // interstitial card teases the next one before it starts.
  const reelCards = useMemo<ReelCard[]>(() => {
    if (!book) return [];
    const cards: ReelCard[] = [];
    book.chapters.forEach((chapter, chIdx) => {
      chapter.chunks.forEach((chunk) => {
        cards.push({ kind: "chunk", chunk, chapterNumber: chapter.chapterNumber, chapterTitle: chapter.chapterTitle, isFirstOfBook: false, isLastOfBook: false });
      });
      const next = book.chapters[chIdx + 1];
      if (next) cards.push({ kind: "chapterPreview", nextChapterNumber: next.chapterNumber, nextChapterTitle: next.chapterTitle });
    });
    const chunkIdxs = cards.reduce<number[]>((acc, c, i) => (c.kind === "chunk" ? [...acc, i] : acc), []);
    if (chunkIdxs.length > 0) {
      const first = cards[chunkIdxs[0]];
      const last = cards[chunkIdxs[chunkIdxs.length - 1]];
      if (first.kind === "chunk") first.isFirstOfBook = true;
      if (last.kind === "chunk") last.isLastOfBook = true;
    }
    return cards;
  }, [book]);

  const totalSteps = reelCards.length + 1; // +1 for the comprehension-quiz card
  const remainingSteps = Math.max(0, totalSteps - 1 - currentIndex);
  const remainingMinutes = book ? Math.max(0, Math.round(book.estimatedReadMinutes * (1 - progress / 100))) : 0;

  const wrongCount = book ? (wrongQuizCounts[book.id] ?? 0) : 0;
  const activeQuiz = wrongCount >= 2 && book?.comprehensionQuizEasy ? book.comprehensionQuizEasy : book?.comprehensionQuiz;
  const usingEasyQuiz = wrongCount >= 2 && !!book?.comprehensionQuizEasy;

  useEffect(() => {
    if (!book) return;
    setFontScale(Number(localStorage.getItem(`bb-fontscale-${book.id}`) ?? 100));
  }, [book]);

  useEffect(() => {
    if (!book || mode !== "ebook" || restoredPositionRef.current) return;
    const savedChunkId = localStorage.getItem(`bb-ebook-pos-${book.id}`);
    if (savedChunkId) {
      requestAnimationFrame(() => {
        document.getElementById(`ebook-${savedChunkId}`)?.scrollIntoView({ block: "center" });
      });
    }
    restoredPositionRef.current = true;
  }, [book, mode]);

  useEffect(() => {
    if (mode !== "ebook" || !book) return;
    const container = ebookRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (!visible) return;
        const chunkId = (visible.target as HTMLElement).dataset.chunkId;
        if (chunkId) localStorage.setItem(`bb-ebook-pos-${book.id}`, chunkId);
      },
      { root: container, threshold: 0.6 },
    );
    container.querySelectorAll("[data-chunk-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mode, book]);

  const changeFontScale = (next: number) => {
    setFontScale(next);
    if (book) localStorage.setItem(`bb-fontscale-${book.id}`, String(next));
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const pct = maxScroll <= 0 ? 100 : Math.round((el.scrollTop / maxScroll) * 100);
    const clamped = Math.min(100, Math.max(0, pct));
    setProgress(clamped);
    if (el.clientHeight > 0) {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setCurrentIndex(idx);
      const card = reelCards[idx];
      if (book && card?.kind === "chunk") {
        setLastActivity({ type: "scroll", bookId: book.id, bookTitle: book.title, position: `${card.chapterNumber}장부터 이어보기` });
      }
    }
    if (clamped >= 100 && !completionAwarded) {
      setCompletionAwarded(true);
      earnMileage(COMPLETION_BONUS, "완독 보너스", "completion");
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (quizResolved || submittingOptionIndex !== null || !book || !activeQuiz) return;
    setSubmittingOptionIndex(optionIndex);
    setTimeout(() => {
      setSelectedOptionIndex(optionIndex);
      setAnswered(true);
      setSubmittingOptionIndex(null);
      const isCorrect = !!activeQuiz.options[optionIndex]?.correct;
      recordQuizAnswer(book.id, isCorrect);
      // Participation earns mileage regardless of correctness — the point
      // is engagement, not getting it right.
      earnMileage(10, "이해도 체크 참여", "quiz");
    }, QUIZ_SUBMIT_DELAY_MS);
  };

  const handleSkip = () => {
    if (quizResolved || submittingOptionIndex !== null) return;
    setSkipped(true);
  };

  const jumpToStart = () => {
    reelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!book) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 text-sm text-[var(--color-ink-soft)]">
        콘텐츠를 찾을 수 없어요.
      </div>
    );
  }

  if (book.chapters.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <span
          className="mb-1 inline-block text-[9px] font-extrabold uppercase tracking-[.04em]"
          style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-accent-tint)", color: "var(--color-accent)" }}
        >
          AI 콘텐츠 준비중
        </span>
        <h3 className="text-base font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          {book.title}
        </h3>
        <p className="text-[12px] text-[var(--color-ink-soft)]">스크롤/전자책 읽기 콘텐츠를 아직 준비하지 못했어요.</p>
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
          <div className="flex items-center gap-2">
            {mode === "ebook" && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => changeFontScale(Math.max(80, fontScale - 10))}
                  aria-label="글자 작게"
                  className="flex h-6 w-6 items-center justify-center border border-[var(--color-line)] text-[10px] font-bold text-[var(--color-ink-soft)]"
                  style={{ borderRadius: "var(--radius-chip)" }}
                >
                  가-
                </button>
                <span className="w-9 text-center text-[10px] text-[var(--color-ink-soft)]">{fontScale}%</span>
                <button
                  type="button"
                  onClick={() => changeFontScale(Math.min(160, fontScale + 10))}
                  aria-label="글자 크게"
                  className="flex h-6 w-6 items-center justify-center border border-[var(--color-line)] text-[10px] font-bold text-[var(--color-ink-soft)]"
                  style={{ borderRadius: "var(--radius-chip)" }}
                >
                  가+
                </button>
              </div>
            )}
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
          ref={reelRef}
          onScroll={handleScroll}
          className="no-scrollbar h-[58vh] overflow-y-auto"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {reelCards.map((card) =>
            card.kind === "chunk" ? (
              <div
                key={card.chunk.chunkId}
                className="flex h-full flex-col justify-center bg-[var(--color-ink)] px-6 pb-[34px] pt-6 text-white"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.08em] opacity-55">
                  {book.title} · {card.chapterTitle}
                </div>
                <p className="text-[16.5px] font-medium leading-[1.65]" style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}>
                  {card.chunk.sentences.map((s, si) => (
                    <span key={si}>
                      <HighlightedText
                        sentence={s}
                        vocabByWord={vocabByWord}
                        addedWords={addedWords}
                        onTap={(word, meaning) => {
                          addVocab({ word, meaning, sourceBookTitle: book.title, sourceChapter: card.chapterNumber });
                          setAddedWords((prev) => new Set(prev).add(word));
                        }}
                      />
                      <br />
                    </span>
                  ))}
                </p>
                {card.isFirstOfBook && (
                  <div className="mt-4 text-center text-[10px] tracking-[.04em] opacity-40">▲ 위로 넘겨서 계속 읽기 ▲</div>
                )}
                {card.isLastOfBook && !card.isFirstOfBook && (
                  <div className="mt-4 text-center text-[10px] tracking-[.04em] opacity-40">▲ 다 읽었어요, 위로 넘겨보세요 ▲</div>
                )}
              </div>
            ) : (
              <div
                key={`preview-${card.nextChapterNumber}`}
                className="flex h-full flex-col items-center justify-center bg-[var(--color-ink)] px-6 text-center text-white"
                style={{ scrollSnapAlign: "start" }}
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.08em] opacity-55">다음 장 예고</p>
                <h4 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {card.nextChapterNumber}장 · {card.nextChapterTitle}
                </h4>
                <p className="mt-3 text-[10px] tracking-[.04em] opacity-40">▲ 위로 넘겨서 계속 읽기 ▲</p>
              </div>
            ),
          )}

          <div
            className="flex h-full flex-col justify-center bg-[var(--color-accent)] p-6 text-white"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.08em] opacity-85">낭독 완료 · 이해도 체크 (선택)</div>
            {usingEasyQuiz && (
              <span
                className="mb-2 inline-block w-fit text-[9px] font-extrabold uppercase tracking-[.03em]"
                style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "rgba(255,255,255,.22)" }}
              >
                쉬운 문제로 바꿨어요
              </span>
            )}
            <h4
              className="mb-4 whitespace-pre-line text-[16.5px] font-semibold leading-[1.5]"
              style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}
            >
              {activeQuiz?.question}
            </h4>
            <p className="mb-4 text-[11.5px] opacity-80">참여하면 마일리지 +10 적립돼요</p>
            {activeQuiz?.options.map((opt, i) => {
              const isSelected = selectedOptionIndex === i;
              const showCorrect = answered && opt.correct;
              const isSubmitting = submittingOptionIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={quizResolved || submittingOptionIndex !== null}
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
            {!quizResolved && (
              <button
                type="button"
                onClick={handleSkip}
                className="mt-0.5 w-full text-center text-[11.5px] font-bold text-white"
                style={{ padding: "9px 0", borderRadius: "var(--radius-btn)", border: "1px solid rgba(255,255,255,.5)" }}
              >
                건너뛰기
              </button>
            )}
            {answered && (
              <div className="mt-3">
                {selectedOptionIndex !== null && activeQuiz?.options[selectedOptionIndex]?.correct ? (
                  <div
                    className="text-center text-[11.5px] font-extrabold"
                    style={{ background: "#fff", color: "var(--color-accent)", borderRadius: "var(--radius-chip)", padding: "9px 10px" }}
                  >
                    +10 마일리지 적립 완료
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[12.5px] font-bold">괜찮아요, 다시 한번 볼까요?</p>
                    <button
                      type="button"
                      onClick={jumpToStart}
                      className="mt-2 text-[11px] font-bold underline"
                    >
                      ← 정답이 나온 부분으로 돌아가기
                    </button>
                    <div
                      className="mt-2.5 text-center text-[11.5px] font-extrabold"
                      style={{ background: "#fff", color: "var(--color-accent)", borderRadius: "var(--radius-chip)", padding: "9px 10px" }}
                    >
                      +10 마일리지 적립 완료 (참여만으로 지급돼요)
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div ref={ebookRef} onScroll={handleScroll} className="h-[58vh] overflow-y-auto px-6 pb-[26px] pt-2" style={{ fontSize: `${fontScale}%` }}>
          <div className="mb-3 text-[10.5px] font-bold uppercase tracking-[.06em] text-[var(--color-ink-soft)]">
            {book.title} · {book.author}
          </div>
          {book.chapters.map((chapter) => (
            <div key={chapter.chapterNumber}>
              {chapter.chunks.map((chunk) => (
                <p key={chunk.chunkId} id={`ebook-${chunk.chunkId}`} data-chunk-id={chunk.chunkId} className="mb-4 text-[15px] leading-[1.9]">
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
