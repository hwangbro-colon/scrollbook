import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MessageSquareHeart, TrendingUp } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useEssayStore, ESSAY_HIGHLIGHT_LIKE_THRESHOLD } from "../store/essayStore";
import { useSimulatedAsync } from "../hooks/useSimulatedAsync";
import { useBookList } from "../hooks/useBookList";
import { getRecommendReason, RECOMMEND_REASON_LABEL } from "../lib/recommend";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { DailyChallengeCard } from "../components/common/DailyChallengeCard";
import { StreakGraceBanner } from "../components/common/StreakGraceBanner";
import { SectionHead } from "../components/common/SectionHead";
import { EssayRow } from "../components/common/EssayRow";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorCard } from "../components/common/ErrorCard";
import { BookRowSkeleton, EssayRowSkeleton, Skeleton } from "../components/common/Skeleton";
import { DEMO_USER_NAME } from "../data/homeMock";
import { BOOKS } from "../data/books";
import type { Book } from "../types/book";

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function formatAddedAt(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 등록`;
}

function RecommendedBookCard({ book, reason }: { book: Book; reason: ReturnType<typeof getRecommendReason> }) {
  const dismissBook = useAppStore((s) => s.dismissBook);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative w-28 flex-none">
      <Link to={`/scroll/${book.id}`}>
        <div
          className="relative flex h-[140px] flex-col justify-end p-2.5"
          style={{ borderRadius: "8px", background: book.coverColor }}
        >
          {book.isNew && (
            <span
              className="absolute left-2 top-2 bg-[var(--color-accent)] px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-[.03em] text-white"
              style={{ borderRadius: "var(--radius-chip)" }}
            >
              NEW
            </span>
          )}
          <span className="text-xs font-semibold leading-[1.3] text-white" style={{ fontFamily: "var(--font-display)" }}>
            {book.title}
          </span>
        </div>
      </Link>
      <button
        type="button"
        aria-label="더보기"
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen((v) => !v);
        }}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center text-[13px] font-bold text-white"
      >
        ⋯
      </button>
      {menuOpen && (
        <div
          className="absolute right-1 top-7 z-10 border-[1.5px] border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-ink)] whitespace-nowrap"
          style={{ borderRadius: "var(--radius-btn)" }}
        >
          <button
            type="button"
            onClick={() => {
              dismissBook(book.id);
              setMenuOpen(false);
            }}
          >
            관심없음
          </button>
        </div>
      )}
      <span
        className="mt-1.5 mb-1 inline-block text-[9px] font-extrabold"
        style={{ padding: "2px 6px", borderRadius: "var(--radius-chip)", background: "var(--color-paper-dim)", color: "var(--color-ink-soft)" }}
      >
        {RECOMMEND_REASON_LABEL[reason]}
      </span>
      <small className="block text-[10.5px] font-semibold text-[var(--color-ink-soft)]">
        {book.genre} · {book.author}
      </small>
      {book.isNew && formatAddedAt(book.addedAt) && (
        <small className="mt-0.5 block text-[9.5px] text-[var(--color-ink-soft)] opacity-70">{formatAddedAt(book.addedAt)}</small>
      )}
    </div>
  );
}

export function HomeView() {
  const streak = useAppStore((s) => s.streak);
  const dailyChallengeDone = useAppStore((s) => s.dailyChallengeDone);
  const dismissedBookIds = useAppStore((s) => s.dismissedBookIds);
  const lastActivity = useAppStore((s) => s.lastActivity);
  const essays = useEssayStore((s) => s.essays);

  const recommendedBooks = useBookList({ sortBy: "newest", excludeIds: dismissedBookIds });
  const trendingBooks = useBookList({ sortBy: "popularity" });
  const highlightedEssays = essays.filter((e) => e.likes >= ESSAY_HIGHLIGHT_LIKE_THRESHOLD);

  const [trendPeriod, setTrendPeriod] = useState<"daily" | "weekly">("weekly");

  // 책 추천 demonstrates the error+retry path (fails once, then succeeds).
  const books = useSimulatedAsync({ delayMs: 800, failFirstAttempt: true });
  const essaysAsync = useSimulatedAsync({ delayMs: 650 });
  const trends = useSimulatedAsync({ delayMs: 600 });

  return (
    <ScreenScroll>
      <div>
        <h1 className="text-[23px] font-semibold leading-[1.25] text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          안녕, {DEMO_USER_NAME} 👋
        </h1>
        <p className="mt-[3px] text-[12.5px] text-[var(--color-ink-soft)]">오늘도 5분만 같이 읽어볼까요?</p>
      </div>

      <div
        className="mt-3 inline-flex items-center gap-1.5 border-[1.5px] border-[var(--color-ink)] py-[5px] pl-1.5 pr-3"
        style={{ borderRadius: "var(--radius-btn)" }}
      >
        <div
          className="flex h-5 w-5 items-center justify-center text-[10px]"
          style={{
            borderRadius: "var(--radius-chip)",
            background: "linear-gradient(155deg,#FFB37A,var(--color-accent) 65%)",
            boxShadow: "inset -2px -2px 4px rgba(0,0,0,.18)",
          }}
        >
          🔥
        </div>
        <span className="text-xs font-bold text-[var(--color-ink)]">{streak}일 연속 참여중</span>
      </div>

      {!dailyChallengeDone && streak > 0 && <StreakGraceBanner streak={streak} />}

      {lastActivity && (
        <Link
          to={lastActivity.type === "scroll" ? `/scroll/${lastActivity.bookId}` : "/reading"}
          className="mt-3 flex items-center justify-between px-4 py-[13px] text-white"
          style={{ borderRadius: "var(--radius-card)", background: "var(--color-ink)" }}
        >
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[.04em] opacity-60">이어보기</p>
            <h5 className="mt-0.5 text-[13px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {lastActivity.type === "scroll"
                ? `${lastActivity.bookTitle} · ${lastActivity.position}`
                : `${lastActivity.bookTitle} 함께읽기 이어서`}
            </h5>
          </div>
          <ChevronRight size={18} strokeWidth={2.2} color="var(--color-accent)" />
        </Link>
      )}

      <DailyChallengeCard variant="hero" />

      <SectionHead title="책 추천" action="더보기" />
      {books.status === "loading" && <BookRowSkeleton />}
      {books.status === "error" && <ErrorCard message="책 추천을 불러오지 못했어요" onRetry={books.retry} />}
      {books.status === "success" &&
        (recommendedBooks.length === 0 ? (
          <EmptyState icon={TrendingUp} title="추천할 책이 아직 없어요" />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recommendedBooks.map((book) => (
              <RecommendedBookCard key={book.id} book={book} reason={getRecommendReason(book, BOOKS)} />
            ))}
          </div>
        ))}

      <SectionHead title="공감 많이 받은 감상문" action="더보기" />
      {essaysAsync.status === "loading" && (
        <div>
          <EssayRowSkeleton first />
          <EssayRowSkeleton />
        </div>
      )}
      {essaysAsync.status === "success" &&
        (highlightedEssays.length === 0 ? (
          <EmptyState icon={MessageSquareHeart} title="아직 공감받은 감상문이 없어요" description="첫 감상문을 남겨보세요" />
        ) : (
          <div>
            {highlightedEssays.map((essay, i) => (
              <Link key={essay.id} to={`/essay/${essay.id}`}>
                <EssayRow initial={essay.initial} name={essay.name} text={essay.text} likes={essay.likes} first={i === 0} />
              </Link>
            ))}
          </div>
        ))}

      <div className="mt-[22px] flex items-baseline justify-between">
        <h4 className="text-[15px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          요즘 많이 낭독되는 책
        </h4>
        <div className="flex p-[3px]" style={{ background: "var(--color-paper-dim)", borderRadius: "var(--radius-btn)" }}>
          {(["daily", "weekly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTrendPeriod(p)}
              className={`px-2.5 py-1 text-[10.5px] font-bold ${
                trendPeriod === p ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink-soft)]"
              }`}
              style={{ borderRadius: "var(--radius-chip)" }}
            >
              {p === "daily" ? "일간" : "주간"}
            </button>
          ))}
        </div>
      </div>
      {trends.status === "loading" && (
        <div className="flex flex-col gap-2.5 py-1">
          <Skeleton height={16} width="90%" />
          <Skeleton height={16} width="75%" />
          <Skeleton height={16} width="82%" />
        </div>
      )}
      {trends.status === "success" &&
        (trendingBooks.length === 0 ? (
          <EmptyState icon={TrendingUp} title="아직 낭독 랭킹이 없어요" />
        ) : (
          <div>
            {trendingBooks.map((book, i) => {
              const rank = i + 1;
              const change = trendPeriod === "daily" ? book.rankChangeDaily : book.rankChangeWeekly;
              return (
                <div
                  key={book.id}
                  className={`flex items-center gap-3 py-2.5 ${rank === 1 ? "" : "border-t border-[var(--color-line)]"}`}
                >
                  <div
                    className="w-[18px] text-base font-semibold"
                    style={{ fontFamily: "var(--font-display)", color: rank === 1 ? "var(--color-accent)" : "var(--color-ink-soft)" }}
                  >
                    {rank}
                  </div>
                  <div className="flex-1 text-[12.5px] font-semibold text-[var(--color-ink)]">{book.title}</div>
                  <div
                    className="w-8 text-right text-[10.5px] font-bold"
                    style={{ color: !change ? "var(--color-ink-soft)" : change > 0 ? "var(--color-accent)" : "#4B7BEC" }}
                  >
                    {!change ? "-" : change > 0 ? `▲${change}` : `▼${Math.abs(change)}`}
                  </div>
                  <div className="text-[10.5px] font-semibold text-[var(--color-ink-soft)]">낭독 {formatCount(book.readCount ?? 0)}</div>
                </div>
              );
            })}
          </div>
        ))}
    </ScreenScroll>
  );
}
