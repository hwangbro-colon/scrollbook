import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, BookOpen } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useToastStore } from "../store/toastStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { DailyChallengeCard } from "../components/common/DailyChallengeCard";
import { SectionHead } from "../components/common/SectionHead";
import { EmptyState } from "../components/common/EmptyState";
import { SOLO_BOOKS_MOCK, type SoloProgress } from "../data/soloProgress";

const NEGLECT_DAYS = 7;

// 솔로낭독 — the 혼자읽기/다시듣기 half of the old combined ReadingView.
export function ReadingSoloView() {
  const navigate = useNavigate();
  const [recordingBookId, setRecordingBookId] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const soloRecordings = useAppStore((s) => s.soloRecordings);
  const addSoloRecording = useAppStore((s) => s.addSoloRecording);
  const setLastActivity = useAppStore((s) => s.setLastActivity);
  const showToast = useToastStore((s) => s.show);

  const soloBooksSorted = [...SOLO_BOOKS_MOCK].sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
  const neglectedBooks = soloBooksSorted.filter((b) => Date.now() - new Date(b.lastReadAt).getTime() > NEGLECT_DAYS * 86400000);
  const activeBooks = soloBooksSorted.filter((b) => !neglectedBooks.includes(b));

  const startRecording = (book: SoloProgress) => {
    setRecordingBookId(book.bookId);
    setElapsedSec(0);
    timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
  };

  const stopRecording = (book: SoloProgress) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRecordingBookId(null);
    addSoloRecording(book.title);
    setLastActivity({ type: "read", bookId: book.bookId, bookTitle: book.title, position: `${book.pct}% 이어서` });
    showToast("녹음을 저장했어요 (이 브라우저 세션에만 임시 보관돼요)");
  };

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
        솔로낭독
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">혼자 소리 내어 읽고 녹음해보세요</p>

      <DailyChallengeCard variant="compact" />

      <SectionHead title="혼자읽기" action="더보기" />
      {neglectedBooks.length > 0 && (
        <div className="mb-2.5 flex flex-col gap-1.5">
          {neglectedBooks.map((b) => (
            <div
              key={b.bookId}
              className="flex items-center justify-between px-3.5 py-2.5"
              style={{ borderRadius: "var(--radius-card)", background: "var(--color-accent-tint)", border: "1.5px solid var(--color-accent)" }}
            >
              <div>
                <p className="text-[11.5px] font-bold text-[var(--color-ink)]">이어서 읽어볼까요?</p>
                <p className="text-[10.5px] text-[var(--color-ink-soft)]">
                  {b.title} · {Math.floor((Date.now() - new Date(b.lastReadAt).getTime()) / 86400000)}일째 멈춰있어요
                </p>
              </div>
              <span className="text-[10.5px] font-bold text-[var(--color-accent)]">{b.pct}%</span>
            </div>
          ))}
        </div>
      )}
      {activeBooks.length === 0 && neglectedBooks.length === 0 ? (
        <EmptyState icon={BookOpen} title="진행 중인 혼자읽기가 없어요" description="스크롤이나 낭독으로 새 책을 시작해보세요" />
      ) : (
        <div>
          {activeBooks.map((book) => (
            <div key={book.bookId} className="border-t border-[var(--color-line)] py-3 first:border-t-0">
              <div className="flex items-center gap-3">
                <div className="h-[52px] w-10 flex-none" style={{ borderRadius: "4px", background: "var(--color-paper-dim)" }} />
                <div className="flex-1">
                  <h5 className="text-[12.5px] font-bold text-[var(--color-ink)]">{book.title}</h5>
                  <p className="mt-0.5 text-[10.5px] text-[var(--color-ink-soft)]">{book.pct}% 읽음</p>
                </div>
                {recordingBookId === book.bookId ? (
                  <button
                    type="button"
                    onClick={() => stopRecording(book)}
                    className="flex-none bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-white"
                    style={{ borderRadius: "var(--radius-btn)" }}
                  >
                    {elapsedSec}s · 정지
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={recordingBookId !== null}
                    onClick={() => startRecording(book)}
                    className="flex-none border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-xs font-bold text-[var(--color-ink)] disabled:opacity-40"
                    style={{ borderRadius: "var(--radius-btn)" }}
                  >
                    이어읽기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {soloRecordings.length > 0 && (
        <>
          <SectionHead title="다시듣기" />
          <div>
            {soloRecordings.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between py-2.5 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
                <div>
                  <p className="text-[12px] font-bold text-[var(--color-ink)]">{r.bookTitle}</p>
                  <p className="text-[10px] text-[var(--color-ink-soft)]">
                    {new Date(r.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("재생 — 이 프로토타입은 실제 오디오를 저장하지 않아요")}
                  className="flex-none border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-[10.5px] font-bold text-[var(--color-ink)]"
                  style={{ borderRadius: "var(--radius-btn)" }}
                >
                  ▶ 재생
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </ScreenScroll>
  );
}
