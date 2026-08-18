import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useBook } from "../hooks/useBook";
import { useReadingProgressStore } from "../store/readingProgressStore";
import { flattenChapters } from "../lib/feed";

// 완독모드 — 스펙: "원문 100% 그대로 순차 페이지 렌더 + 진행률 % + 'N/M' 표시 +
// 이어읽기 상태 저장". 청크 하나 = 페이지 하나로 스냅 스크롤. 페이지가 바뀔 때마다
// readingProgressStore에 위치를 저장해서, 다시 들어오면 마지막으로 보던 페이지부터
// 이어서 보여준다(스크롤 위치를 그 지점으로 즉시 이동, 애니메이션 없이).
export function ReadFullView() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const book = useBook(bookId ?? "");
  const { progress, setProgress } = useReadingProgressStore();

  const pages = useMemo(() => (book ? flattenChapters(book) : []), [book]);
  const total = pages.length;
  const saved = bookId ? progress[bookId] : undefined;

  const [currentIndex, setCurrentIndex] = useState(saved?.lastChunkIndex ?? 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  // 저장된 위치로 즉시 이동(스크롤 애니메이션 없이) — 마운트 시 한 번만.
  useEffect(() => {
    if (restoredRef.current || total === 0) return;
    const el = containerRef.current;
    if (!el) return;
    const startIndex = Math.min(saved?.lastChunkIndex ?? 0, total - 1);
    el.scrollTop = startIndex * el.clientHeight;
    setCurrentIndex(startIndex);
    restoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el.clientHeight) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setCurrentIndex(idx);
    if (bookId) setProgress(bookId, idx, total);
  };

  if (!book) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-[12.5px] text-[var(--color-ink-soft)]">
        책을 찾을 수 없어요.
      </div>
    );
  }

  const percent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;
  const isDone = total > 0 && currentIndex >= total - 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-none px-5" style={{ paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", paddingBottom: "10px" }}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center border-[1.5px] border-[var(--color-ink)]"
            style={{ borderRadius: "var(--radius-avatar)" }}
          >
            <ChevronLeft size={16} strokeWidth={2} color="var(--color-ink)" aria-hidden="true" />
          </button>
          <div className="text-center">
            <p className="text-[13px] font-bold text-[var(--color-ink)]">{book.title}</p>
            <p className="text-[10px] text-[var(--color-ink-soft)]">{book.author}</p>
          </div>
          <span className="w-8 text-right text-[11.5px] font-bold text-[var(--color-accent)]">{percent}%</span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full" style={{ background: "var(--color-paper-dim)" }}>
          <div className="h-full transition-all duration-200" style={{ width: `${percent}%`, background: "var(--color-accent)" }} />
        </div>
      </div>

      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-[12.5px] text-[var(--color-ink-soft)]">이 책은 아직 콘텐츠를 준비 중이에요.</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {pages.map((page, i) => (
            <div
              key={page.phraseKey}
              className="flex h-full flex-col justify-center px-7"
              style={{ scrollSnapAlign: "start", minHeight: "100%" }}
            >
              <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[.06em] text-[var(--color-ink-soft)]">
                {page.chapterNumber}장 · {page.chapterTitle}
              </p>
              <p className="text-[24px] font-semibold leading-[1.7] text-[var(--color-ink)]" style={{ wordBreak: "keep-all" }}>
                {page.text}
              </p>
              {i === total - 1 && (
                <div className="mt-8 flex flex-col items-center gap-1 text-center">
                  <p className="text-[20px] font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
                    the end
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-soft)]">{book.title}, 완독했어요 🎉</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="flex-none px-5 pb-3 pt-1 text-center text-[9px] leading-[1.4] text-[var(--color-ink-soft)]">
        {total > 0 && `${currentIndex + 1}/${total} · `}
        {isDone ? "완독" : "읽는 중"} · 출처: {book.source}
      </p>
    </div>
  );
}
