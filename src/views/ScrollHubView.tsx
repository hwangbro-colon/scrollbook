import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { useBookList } from "../hooks/useBookList";
import { RandomReelFeed } from "../components/common/RandomReelFeed";

type Tab = "complete" | "random";

// Entry point for the 스크롤 탭 when no book is selected yet: a segmented
// control switches between 완독 스크롤 (book list → full read) and 랜덤
// 스크롤 (구절/광고/감상문 reels feed). Picking a book from the 완독 list
// hands off to ScrollView at /scroll/:bookId, which owns the actual reader.
export function ScrollHubView() {
  const [tab, setTab] = useState<Tab>("complete");
  const books = useBookList();
  const lastActivity = useAppStore((s) => s.lastActivity);

  return (
    <>
      <div className="flex-none px-5 pb-2.5 pt-3.5">
        <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          스크롤
        </div>
        <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">완독 스크롤로 책 한 권을, 랜덤 스크롤로 명문장을 만나보세요</p>

        <div className="mt-3 flex p-[3px]" style={{ background: "var(--color-paper-dim)", borderRadius: "var(--radius-btn)" }}>
          {(
            [
              { id: "complete", label: "완독 스크롤" },
              { id: "random", label: "랜덤 스크롤" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-1.5 text-[11.5px] font-bold ${
                tab === t.id ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink-soft)]"
              }`}
              style={{ borderRadius: "var(--radius-chip)" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "complete" ? (
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-[88px]">
          {books.map((book) => {
            const hasContent = book.chapters.length > 0;
            const inProgress = lastActivity?.type === "scroll" && lastActivity.bookId === book.id;
            return (
              <Link
                key={book.id}
                to={`/scroll/${book.id}`}
                className="mb-2.5 flex items-center gap-3 border-[1.5px] border-[var(--color-ink)] p-3"
                style={{ borderRadius: "var(--radius-card)" }}
              >
                <div className="h-[58px] w-11 flex-none" style={{ borderRadius: "4px", background: book.coverColor }} />
                <div className="min-w-0 flex-1">
                  <h5 className="text-[13px] font-bold text-[var(--color-ink)]">{book.title}</h5>
                  <p className="mt-0.5 text-[10.5px] text-[var(--color-ink-soft)]">
                    {book.genre} · {book.author}
                  </p>
                </div>
                {!hasContent ? (
                  <span
                    className="flex-none text-[9px] font-extrabold uppercase tracking-[.03em]"
                    style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-accent-tint)", color: "var(--color-accent)" }}
                  >
                    AI 콘텐츠 준비중
                  </span>
                ) : inProgress ? (
                  <span
                    className="flex-none text-[9px] font-extrabold uppercase tracking-[.03em] text-white"
                    style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-ink)" }}
                  >
                    이어보기
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <RandomReelFeed />
      )}
    </>
  );
}
