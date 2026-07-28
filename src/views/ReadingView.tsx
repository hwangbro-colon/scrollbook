import { useState } from "react";
import { MicOff, BookOpen } from "lucide-react";
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
  avatars: ["지", "휘", "윤"],
  currentTurnName: "지호",
};

const SOLO_BOOK_ID = "unsu-joheun-nal-1924";

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

  const groupBook = useBook(GROUP_SESSION_MOCK.bookId);
  const soloBook = useBook(SOLO_BOOK_ID);
  const groupChapterTitle = groupBook?.chapters.find((c) => c.chapterNumber === GROUP_SESSION_MOCK.chapterNumber)?.chapterTitle;

  return (
    <ScreenScroll>
      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        낭독
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">데일리 5분 · 함께읽기 · 혼자읽기</p>

      <DailyChallengeCard variant="compact" />

      <SectionHead title="함께읽기" />
      {groupBook && (
        <div className="border-[1.5px] border-[var(--color-ink)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[.05em] text-[var(--color-ink-soft)]">
            {GROUP_SESSION_MOCK.groupName}
          </p>
          <h3 className="mb-3 text-base font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            {groupBook.title} · {groupChapterTitle}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex">
              {GROUP_SESSION_MOCK.avatars.map((a, i) => (
                <Avatar key={a} letter={a} className={i === 0 ? "" : "-ml-2 border-[var(--color-paper)]"} />
              ))}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--color-ink-soft)]">현재 차례</div>
              <div className="text-[13px] font-extrabold text-[var(--color-accent)]">{GROUP_SESSION_MOCK.currentTurnName}</div>
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
            </div>
          )}
        </div>
      )}

      <SectionHead title="혼자읽기" action="더보기" />
      {!soloBook ? (
        <EmptyState icon={BookOpen} title="진행 중인 혼자읽기가 없어요" description="스크롤이나 낭독으로 새 책을 시작해보세요" />
      ) : (
        <div>
          <div className="flex items-center gap-3 py-3">
            <div className="h-[52px] w-10 flex-none" style={{ borderRadius: "4px", background: soloBook.coverColor }} />
            <div className="flex-1">
              <h5 className="text-[12.5px] font-bold text-[var(--color-ink)]">{soloBook.title}</h5>
              <p className="mt-0.5 text-[10.5px] text-[var(--color-ink-soft)]">42% 읽음 · 어제 이어서</p>
            </div>
            <button
              type="button"
              className="border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-xs font-bold text-[var(--color-ink)]"
              style={{ borderRadius: "var(--radius-btn)" }}
            >
              이어읽기
            </button>
          </div>
        </div>
      )}
    </ScreenScroll>
  );
}
