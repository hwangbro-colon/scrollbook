import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useCountUp } from "../hooks/useCountUp";
import { useBook } from "../hooks/useBook";
import { CURRENT_BOOK_ID } from "../data/currentBook";
import type { Chunk } from "../types/book";

// No mileage, no end-of-book quiz — this reader is reading only, by design.
type Mode = "reel" | "ebook";

// Reel-mode "peek picker" geometry: each row is shorter than the viewport
// so the previous/next rows are visibly peeking above/below the active one,
// like a wheel picker. Centering math depends on these two numbers only —
// see EDGE_PAD_VH below for why.
const CONTAINER_VH = 58;
const ROW_VH = 22;
const EDGE_PAD_VH = (CONTAINER_VH - ROW_VH) / 2; // padding so row 0 still centers at scrollTop 0
// Active never exceeds 1 — scaling a row up beyond its natural width risks
// clipping against the app shell's overflow-hidden edges, so all the size
// contrast comes from how far REST shrinks down instead.
const ACTIVE_SCALE = 1;
const REST_SCALE = 0.55;
const MIN_OPACITY = 0.32;

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
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "ebook" ? "ebook" : "reel");
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
  const [fontScale, setFontScale] = useState(100);

  const addVocab = useAppStore((s) => s.addVocab);
  const setLastActivity = useAppStore((s) => s.setLastActivity);
  const displayedProgress = useCountUp(progress, 250);
  const reelRef = useRef<HTMLDivElement>(null);
  const ebookRef = useRef<HTMLDivElement>(null);
  // Row content elements get their scale/opacity written directly (not via
  // React state) so every scroll tick doesn't trigger a re-render — position
  // itself is left entirely to native scroll, per the "only size changes"
  // requirement.
  const rowContentRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  const totalSteps = reelCards.length + 1; // +1 for the completion card
  const remainingSteps = Math.max(0, totalSteps - 1 - currentIndex);
  const remainingMinutes = book ? Math.max(0, Math.round(book.estimatedReadMinutes * (1 - progress / 100))) : 0;

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

  // scale/opacity only, keyed off a continuous "row units from center" value
  // — position comes purely from the browser's own scroll, never touched
  // here, so growth never causes a jump.
  const updateRowTransforms = (raw: number) => {
    const from = Math.max(0, Math.floor(raw) - 3);
    const to = Math.min(rowContentRefs.current.length - 1, Math.ceil(raw) + 3);
    for (let i = from; i <= to; i++) {
      const el = rowContentRefs.current[i];
      if (!el) continue;
      const t = Math.min(1, Math.abs(i - raw));
      el.style.transform = `scale(${ACTIVE_SCALE - t * (ACTIVE_SCALE - REST_SCALE)})`;
      el.style.opacity = String(1 - t * (1 - MIN_OPACITY));
      el.style.zIndex = String(Math.round((1 - t) * 10));
    }
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const pct = maxScroll <= 0 ? 100 : Math.round((el.scrollTop / maxScroll) * 100);
    setProgress(Math.min(100, Math.max(0, pct)));

    if (mode === "reel") {
      const rowPx = el.clientHeight * (ROW_VH / CONTAINER_VH);
      if (rowPx <= 0) return;
      const raw = el.scrollTop / rowPx;
      updateRowTransforms(raw);
      const idx = Math.round(raw);
      setCurrentIndex(idx);
      const card = reelCards[idx];
      if (book && card?.kind === "chunk") {
        setLastActivity({ type: "scroll", bookId: book.id, bookTitle: book.title, position: `${card.chapterNumber}장부터 이어보기` });
      }
    } else if (el.clientHeight > 0) {
      setCurrentIndex(Math.round(el.scrollTop / el.clientHeight));
    }
  };

  // Paint the initial (pre-scroll) state once the reel's rows exist.
  useEffect(() => {
    if (mode !== "reel" || reelCards.length === 0) return;
    const id = requestAnimationFrame(() => updateRowTransforms((reelRef.current?.scrollTop ?? 0) / (((reelRef.current?.clientHeight ?? 0) * ROW_VH) / CONTAINER_VH || 1)));
    return () => cancelAnimationFrame(id);
  }, [mode, reelCards.length]);

  const jumpToStart = () => {
    setCurrentIndex(0);
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
          <div className="flex items-center gap-2">
            <Link
              to="/scroll"
              aria-label="스크롤 목록으로"
              className="flex h-7 w-7 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)]"
              style={{ borderRadius: "var(--radius-avatar)" }}
            >
              <ChevronLeft size={14} strokeWidth={2} color="var(--color-ink)" aria-hidden="true" />
            </Link>
            <div className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              <b className="text-[var(--color-accent)]">{displayedProgress}%</b>
            </div>
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
            <Link
              to="/scroll"
              aria-label="닫기"
              className="flex h-7 w-7 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)]"
              style={{ borderRadius: "var(--radius-avatar)" }}
            >
              <X size={14} strokeWidth={2} color="var(--color-ink)" aria-hidden="true" />
            </Link>
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
          style={{ scrollSnapType: "y mandatory", paddingTop: `${EDGE_PAD_VH}vh`, paddingBottom: `${EDGE_PAD_VH}vh` }}
        >
          {reelCards.map((card, i) =>
            card.kind === "chunk" ? (
              <div
                key={card.chunk.chunkId}
                ref={(el) => {
                  rowContentRefs.current[i] = el;
                }}
                className="flex flex-col justify-center px-6 text-[var(--color-ink)]"
                style={{ height: `${ROW_VH}vh`, scrollSnapAlign: "center", transformOrigin: "center", transform: `scale(${REST_SCALE})`, opacity: MIN_OPACITY }}
              >
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--color-ink-soft)]">
                  {book.title} · {card.chapterTitle}
                </div>
                <p className="text-[19px] font-semibold leading-[1.6]" style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}>
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
                  <div className="mt-3 text-center text-[10px] tracking-[.04em] text-[var(--color-ink-soft)]">▲ 위로 넘겨서 계속 읽기 ▲</div>
                )}
                {card.isLastOfBook && !card.isFirstOfBook && (
                  <div className="mt-3 text-center text-[10px] tracking-[.04em] text-[var(--color-ink-soft)]">▲ 다 읽었어요, 위로 넘겨보세요 ▲</div>
                )}
              </div>
            ) : (
              <div
                key={`preview-${card.nextChapterNumber}`}
                ref={(el) => {
                  rowContentRefs.current[i] = el;
                }}
                className="flex flex-col items-center justify-center px-6 text-center text-[var(--color-ink)]"
                style={{ height: `${ROW_VH}vh`, scrollSnapAlign: "center", transformOrigin: "center", transform: `scale(${REST_SCALE})`, opacity: MIN_OPACITY }}
              >
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--color-ink-soft)]">다음 장 예고</p>
                <h4 className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {card.nextChapterNumber}장 · {card.nextChapterTitle}
                </h4>
                <p className="mt-2 text-[10px] tracking-[.04em] text-[var(--color-ink-soft)]">▲ 위로 넘겨서 계속 읽기 ▲</p>
              </div>
            ),
          )}

          <div
            ref={(el) => {
              rowContentRefs.current[reelCards.length] = el;
            }}
            className="flex flex-col items-center justify-center px-6 text-center"
            style={{
              height: `${ROW_VH}vh`,
              scrollSnapAlign: "center",
              transformOrigin: "center",
              transform: `scale(${REST_SCALE})`,
              opacity: MIN_OPACITY,
              color: "var(--color-accent)",
            }}
          >
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[.08em] opacity-80">완독</div>
            <h4 className="mb-4 text-[15px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {book.title}, 다 읽었어요 🎉
            </h4>
            <button
              type="button"
              onClick={jumpToStart}
              className="text-center text-[11.5px] font-bold"
              style={{ padding: "8px 16px", borderRadius: "var(--radius-btn)", border: "1px solid currentColor" }}
            >
              처음부터 다시 읽기
            </button>
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

      <p className="flex-none px-5 pb-[88px] pt-1 text-center text-[9px] leading-[1.4] text-[var(--color-ink-soft)]">
        {remainingMinutes < 1 ? "1분 미만" : `${remainingMinutes}분`} 남음 · {remainingSteps}페이지 · 출처: {book.source}
      </p>
    </>
  );
}
