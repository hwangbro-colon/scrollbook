import { useEffect, useRef, useState } from "react";
import { MicOff, BookOpen } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useToastStore } from "../store/toastStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { DailyChallengeCard } from "../components/common/DailyChallengeCard";
import { SectionHead } from "../components/common/SectionHead";
import { Avatar } from "../components/common/Avatar";
import { EmptyState } from "../components/common/EmptyState";
import { useBook } from "../hooks/useBook";

const GROUP_SESSION_MOCK = {
  groupName: "무지개 독서단",
  bookId: "byeoljubujeon-classic",
  chapterNumber: 2,
  participants: [
    { name: "지호", initial: "지", isOnline: true },
    { name: "휘람", initial: "휘", isOnline: true },
    { name: "윤우", initial: "윤", isOnline: false },
  ],
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

type SoloProgress = { bookId: string; title: string; pct: number; lastReadAt: string };

const SOLO_BOOKS_MOCK: SoloProgress[] = [
  { bookId: "unsu-joheun-nal-1924", title: "운수 좋은 날", pct: 42, lastReadAt: daysAgo(1) },
  { bookId: "byeoljubujeon-classic", title: "별주부전", pct: 15, lastReadAt: daysAgo(9) },
];

const NEGLECT_DAYS = 7;

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="10" rx="3" />
      <path d="M5 11a7 7 0 0014 0" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </svg>
  );
}

const WAVE_HEIGHTS = [9, 20, 13, 22, 9, 16];

export function ReadingView() {
  // Real mic permission isn't requested in this prototype — clicking the
  // mic button simulates a "denied" check so the fallback UI can be seen
  // on demand; clicking again resets it.
  const [micDenied, setMicDenied] = useState(false);
  const [turnIndex, setTurnIndex] = useState(0);
  const [recordingBookId, setRecordingBookId] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const groupStreak = useAppStore((s) => s.groupStreak);
  const groupCompletedToday = useAppStore((s) => s.groupCompletedToday);
  const soloRecordings = useAppStore((s) => s.soloRecordings);
  const addSoloRecording = useAppStore((s) => s.addSoloRecording);
  const setLastActivity = useAppStore((s) => s.setLastActivity);
  const showToast = useToastStore((s) => s.show);

  const groupBook = useBook(GROUP_SESSION_MOCK.bookId);
  const groupChapterTitle = groupBook?.chapters.find((c) => c.chapterNumber === GROUP_SESSION_MOCK.chapterNumber)?.chapterTitle;
  const isLastTurn = turnIndex >= GROUP_SESSION_MOCK.participants.length - 1;
  const currentSpeaker = GROUP_SESSION_MOCK.participants[turnIndex];

  const soloBooksSorted = [...SOLO_BOOKS_MOCK].sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
  const neglectedBooks = soloBooksSorted.filter((b) => Date.now() - new Date(b.lastReadAt).getTime() > NEGLECT_DAYS * 86400000);
  const activeBooks = soloBooksSorted.filter((b) => !neglectedBooks.includes(b));

  const advanceTurn = () => {
    if (isLastTurn) return;
    setTurnIndex((i) => i + 1);
  };

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
      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        낭독
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">데일리 5분 · 함께읽기 · 혼자읽기</p>

      <DailyChallengeCard variant="compact" />

      <div className="mt-[22px] mb-3 flex items-baseline justify-between">
        <h4 className="text-[15px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          함께읽기
        </h4>
        {groupCompletedToday && (
          <span
            className="text-[9.5px] font-extrabold uppercase tracking-[.03em] text-white"
            style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-accent)" }}
          >
            오늘 낭독 완료
          </span>
        )}
      </div>
      {groupBook && (
        <div className="border-[1.5px] border-[var(--color-ink)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[.05em] text-[var(--color-ink-soft)]">
              {GROUP_SESSION_MOCK.groupName}
            </p>
            <p className="text-[10px] font-bold text-[var(--color-ink-soft)]">🔥 그룹 {groupStreak}일 연속</p>
          </div>
          <h3 className="mb-3 text-base font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            {groupBook.title} · {groupChapterTitle}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex">
              {GROUP_SESSION_MOCK.participants.map((p, i) => (
                <Avatar
                  key={p.name}
                  letter={p.initial}
                  className={`${i === 0 ? "" : "-ml-2 border-[var(--color-paper)]"} ${p.isOnline ? "" : "opacity-40"}`}
                />
              ))}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--color-ink-soft)]">현재 차례</div>
              <div className="text-[13px] font-extrabold text-[var(--color-accent)]">{currentSpeaker.name}</div>
            </div>
          </div>

          {micDenied ? (
            <div
              className="mt-[18px] flex flex-col items-center gap-2 bg-[var(--color-paper-dim)] px-4 py-5 text-center"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <MicOff size={22} strokeWidth={1.8} color="var(--color-ink-soft)" aria-hidden="true" />
              <p className="text-xs font-bold text-[var(--color-ink)]">마이크 권한이 필요해요</p>
              <p className="text-[11px] text-[var(--color-ink-soft)]">
                브라우저 설정에서 마이크 권한을 허용하면 낭독을 시작할 수 있어요
              </p>
              <button
                type="button"
                onClick={() => setMicDenied(false)}
                className="mt-1 border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-ink)]"
                style={{ borderRadius: "var(--radius-btn)" }}
              >
                다시 확인
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center pb-1 pt-[18px]">
              <button
                type="button"
                aria-label="낭독 시작"
                onClick={() => setMicDenied(true)}
                className="flex h-[70px] w-[70px] items-center justify-center bg-[var(--color-accent)] text-white"
                style={{ borderRadius: "18px" }}
              >
                <MicIcon />
              </button>
              <div className="mt-3.5 flex h-6 items-end gap-1">
                {WAVE_HEIGHTS.map((h, i) => (
                  <span
                    key={i}
                    className="animate-bb-wave w-1 rounded-sm bg-[var(--color-ink)] opacity-70 motion-reduce:animate-none"
                    style={{ height: h, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[10.5px] text-[var(--color-ink-soft)]">
                차례는 자동으로 넘어가지 않아요 — 낭독이 끝나면 직접 넘겨주세요
              </p>
              <button
                type="button"
                disabled={isLastTurn}
                onClick={advanceTurn}
                className="mt-2 border-[1.5px] border-[var(--color-ink)] px-4 py-1.5 text-[11px] font-bold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderRadius: "var(--radius-btn)" }}
              >
                {isLastTurn ? "마지막 차례예요" : "다음 사람 →"}
              </button>
            </div>
          )}
        </div>
      )}

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
