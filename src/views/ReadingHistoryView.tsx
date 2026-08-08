import { useNavigate } from "react-router-dom";
import { ChevronLeft, History } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { BOOKS } from "../data/books";
import { SOLO_BOOKS_MOCK } from "../data/soloProgress";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { EmptyState } from "../components/common/EmptyState";

// 전체 내가 읽었던 책 기록 — combines the 혼자읽기 progress mock with real
// recording events from this session, newest first.
export function ReadingHistoryView() {
  const navigate = useNavigate();
  const soloRecordings = useAppStore((s) => s.soloRecordings);

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
        읽은 책 기록
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">지금까지 읽거나 낭독한 책 전체 목록이에요</p>

      {SOLO_BOOKS_MOCK.length === 0 ? (
        <EmptyState icon={History} title="아직 읽은 책이 없어요" />
      ) : (
        <div>
          {SOLO_BOOKS_MOCK.map((b, i) => {
            const book = BOOKS.find((x) => x.id === b.bookId);
            return (
              <div key={b.bookId} className={`flex items-center gap-3 py-3 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
                <div className="h-[52px] w-10 flex-none" style={{ borderRadius: "4px", background: book?.coverColor ?? "var(--color-paper-dim)" }} />
                <div className="flex-1">
                  <h5 className="text-[12.5px] font-bold text-[var(--color-ink)]">{b.title}</h5>
                  <p className="mt-0.5 text-[10.5px] text-[var(--color-ink-soft)]">
                    {b.pct}% 읽음 · {new Date(b.lastReadAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} 최근 읽음
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {soloRecordings.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-[11px] font-bold text-[var(--color-ink-soft)]">이번 세션 낭독 기록</p>
          <div>
            {soloRecordings.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between py-2.5 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
                <p className="text-[12px] font-bold text-[var(--color-ink)]">{r.bookTitle}</p>
                <p className="text-[10px] text-[var(--color-ink-soft)]">
                  {new Date(r.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </ScreenScroll>
  );
}
