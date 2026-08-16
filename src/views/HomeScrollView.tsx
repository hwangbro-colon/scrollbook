import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { Logo } from "../components/common/Logo";
import { OnboardingPopup } from "../components/common/OnboardingPopup";
import { useOnboardingStore } from "../store/onboardingStore";
import { useReadingSelectionStore } from "../store/readingSelectionStore";
import { useBook } from "../hooks/useBook";
import type { Chunk } from "../types/book";

// 홈 탭 자체가 완독스크롤 리더 — 스펙엔 책 목록 화면이 따로 없고, 책장 탭에서
// 책을 고르면(readingSelectionStore) 이 화면이 그 책으로 바로 갱신됨.
// 이전 버전(ScrollView.tsx, 아직 라우팅은 안 되지만 파일은 남겨둠)에 있던
// 전자책 모드/글자크기 조절/어휘 탭 클릭은 이번 스코프(스크롤 기능만)에서 제외.

// Peek-picker geometry — 위아래로 다음/이전 청크가 살짝 보이는 휠 형태.
const CONTAINER_VH = 62;
const ROW_VH = 24;
const EDGE_PAD_VH = (CONTAINER_VH - ROW_VH) / 2;
const REST_SCALE = 0.55;
const MIN_OPACITY = 0.3;

type ReaderCard = { chunk: Chunk; chapterTitle: string };

export function HomeScrollView() {
  const selectedBookId = useReadingSelectionStore((s) => s.selectedBookId);
  const book = useBook(selectedBookId ?? "");
  const hasSeenTutorial = useOnboardingStore((s) => s.hasSeenTutorial);

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cards = useMemo<ReaderCard[]>(() => {
    if (!book) return [];
    return book.chapters.flatMap((chapter) =>
      chapter.chunks.map((chunk) => ({ chunk, chapterTitle: chapter.chapterTitle })),
    );
  }, [book]);

  const total = cards.length;
  const isComplete = currentIndex >= total && total > 0;
  const readCount = Math.min(currentIndex + 1, total);

  const updateRowTransforms = (raw: number) => {
    const from = Math.max(0, Math.floor(raw) - 3);
    const to = Math.min(rowRefs.current.length - 1, Math.ceil(raw) + 3);
    for (let i = from; i <= to; i++) {
      const el = rowRefs.current[i];
      if (!el) continue;
      const t = Math.min(1, Math.abs(i - raw));
      el.style.transform = `scale(${1 - t * (1 - REST_SCALE)})`;
      el.style.opacity = String(1 - t * (1 - MIN_OPACITY));
    }
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rowPx = el.clientHeight * (ROW_VH / CONTAINER_VH);
    if (rowPx <= 0) return;
    const raw = el.scrollTop / rowPx;
    updateRowTransforms(raw);
    setCurrentIndex(Math.round(raw));
  };

  useEffect(() => {
    setCurrentIndex(0);
    rowRefs.current = [];
    containerRef.current?.scrollTo({ top: 0 });
  }, [book?.id]);

  useEffect(() => {
    if (cards.length === 0) return;
    const id = requestAnimationFrame(() => updateRowTransforms(0));
    return () => cancelAnimationFrame(id);
  }, [cards.length]);

  const restart = () => {
    setCurrentIndex(0);
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="flex flex-none items-center justify-between px-5"
        style={{ paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", paddingBottom: "10px" }}
      >
        <div className="flex items-center gap-1.5">
          <Logo size={22} />
          <span className="text-[16px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            북북
          </span>
        </div>
        {total > 0 && (
          <span className="text-[12.5px] font-bold text-[var(--color-ink-soft)]">
            {readCount}/{total}
          </span>
        )}
      </div>

      {!book ? (
        <div className="flex flex-1 items-center justify-center px-8 text-center text-[12.5px] text-[var(--color-ink-soft)]">
          책장에서 읽을 책을 골라보세요
        </div>
      ) : total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <h3 className="text-base font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            {book.title}
          </h3>
          <p className="text-[12px] text-[var(--color-ink-soft)]">이 책은 아직 스크롤 콘텐츠를 준비 중이에요.</p>
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
            style={{ scrollSnapType: "y mandatory", paddingTop: `${EDGE_PAD_VH}vh`, paddingBottom: `${EDGE_PAD_VH}vh` }}
          >
            {cards.map((card, i) => (
              <div
                key={card.chunk.chunkId}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className="flex flex-col justify-center px-7 text-[var(--color-ink)]"
                style={{
                  height: `${ROW_VH}vh`,
                  scrollSnapAlign: "center",
                  transformOrigin: "center",
                  transform: `scale(${REST_SCALE})`,
                  opacity: MIN_OPACITY,
                }}
              >
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--color-ink-soft)]">
                  {book.title} · {card.chapterTitle}
                </div>
                <p className="text-[19px] font-semibold leading-[1.65]" style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}>
                  {card.chunk.sentences.join(" ")}
                </p>
              </div>
            ))}
            <div
              ref={(el) => {
                rowRefs.current[cards.length] = el;
              }}
              className="flex flex-col items-center justify-center px-6 text-center"
              style={{
                height: `${ROW_VH}vh`,
                scrollSnapAlign: "center",
                transformOrigin: "center",
                transform: `scale(${REST_SCALE})`,
                opacity: MIN_OPACITY,
              }}
            >
              <p
                className="text-[26px] font-bold tracking-[.02em] text-[var(--color-accent)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                the end
              </p>
              {isComplete && (
                <button
                  type="button"
                  onClick={restart}
                  className="mt-4 border-[1.5px] border-[var(--color-ink)] px-4 py-2 text-[11.5px] font-bold text-[var(--color-ink)]"
                  style={{ borderRadius: "var(--radius-btn)" }}
                >
                  처음부터 다시 읽기
                </button>
              )}
            </div>
          </div>
          <p className="flex-none px-5 pb-[88px] pt-1 text-center text-[9px] leading-[1.4] text-[var(--color-ink-soft)]">
            출처: {book.source}
          </p>
        </>
      )}

      {!hasSeenTutorial && <OnboardingPopup />}
    </div>
  );
}
