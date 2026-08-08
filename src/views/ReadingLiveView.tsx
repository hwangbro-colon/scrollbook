import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MicOff } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { Avatar } from "../components/common/Avatar";
import { useBook } from "../hooks/useBook";

const GROUP_SESSION_MOCK = {
  groupName: "무지개 독서단",
  bookId: "byeoljubujeon-classic",
  chapterNumber: 2,
  participants: [
    { name: "준민", initial: "준", isOnline: true },
    { name: "휘람", initial: "휘", isOnline: true },
    { name: "윤우", initial: "윤", isOnline: false },
  ],
};

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

// 라이브낭독 — the turn-based 함께읽기 group session, split out of the old
// combined ReadingView.
export function ReadingLiveView() {
  const navigate = useNavigate();
  const [micDenied, setMicDenied] = useState(false);
  const [turnIndex, setTurnIndex] = useState(0);

  const groupStreak = useAppStore((s) => s.groupStreak);
  const groupCompletedToday = useAppStore((s) => s.groupCompletedToday);
  const groupBook = useBook(GROUP_SESSION_MOCK.bookId);
  const groupChapterTitle = groupBook?.chapters.find((c) => c.chapterNumber === GROUP_SESSION_MOCK.chapterNumber)?.chapterTitle;
  const isLastTurn = turnIndex >= GROUP_SESSION_MOCK.participants.length - 1;
  const currentSpeaker = GROUP_SESSION_MOCK.participants[turnIndex];

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

      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            라이브낭독
          </h1>
          <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">그룹원과 차례대로 소리 내어 읽어요</p>
        </div>
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
                onClick={() => setTurnIndex((i) => Math.min(i + 1, GROUP_SESSION_MOCK.participants.length - 1))}
                className="mt-2 border-[1.5px] border-[var(--color-ink)] px-4 py-1.5 text-[11px] font-bold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderRadius: "var(--radius-btn)" }}
              >
                {isLastTurn ? "마지막 차례예요" : "다음 사람 →"}
              </button>
            </div>
          )}
        </div>
      )}
    </ScreenScroll>
  );
}
