import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, UIEvent } from "react";
import { Link } from "react-router-dom";
import { Mic, Timer, Sparkles, Trophy, Users, Heart } from "lucide-react";
import { useBookList } from "../../hooks/useBookList";
import { useEssayStore } from "../../store/essayStore";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const AUTO_ADVANCE_MS = 2000;
const RESUME_DELAY_MS = 500; // grace period after a manual swipe before auto-advance resumes
const COMMUNITY_CURRENT = 320;
const COMMUNITY_GOAL = 500;

// Mock #1 pick per 랭킹 category — no real leaderboard backend exists yet.
const RANK_PERSON_MOCK = { name: "휘람", detail: "이번 달 12권 완독" };
const RANK_QUOTE_MOCK = { bookTitle: "운수 좋은 날", text: "이 문안에 들어간답시는 앞집 마나님을 전찻길까지 모셔다 드린 것을..." };

type Slide = { id: string; to: string; content: ReactNode };

// Big auto-advancing/swipeable hero banner at the top of 홈, in spec order:
// 데일리 5분 낭독 → 책추천 → 책 많이 읽는 사람 → 인기 감상문.
export function HomeHeroCarousel() {
  const topBook = useBookList({ sortBy: "newest" })[0];
  const essays = useEssayStore((s) => s.essays);
  const topEssay = useMemo(() => [...essays].sort((a, b) => b.likes - a.likes)[0], [essays]);

  const communityPct = Math.min(100, Math.round((COMMUNITY_CURRENT / COMMUNITY_GOAL) * 100));

  // Order matters: 데일리5분 → 독서타이머 → 책추천 → 랭킹 → 커뮤니티 → 인기감상문.
  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = [
      {
        id: "daily",
        to: "/reading/solo",
        content: (
          <div className="flex h-full flex-col justify-end bg-[var(--color-ink)] p-6 text-white">
            <Mic size={22} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
            <h3 className="mt-3 text-[21px] font-bold leading-[1.3]" style={{ fontFamily: "var(--font-display)" }}>
              데일리 5분
              <br />
              낭독해보세요
            </h3>
            <p className="mt-1.5 text-[12px] opacity-70">오늘도 소리 내어 5분, 마일리지도 쌓여요</p>
          </div>
        ),
      },
      {
        id: "timer",
        to: "/assist/timer",
        content: (
          <div className="flex h-full flex-col justify-end bg-[var(--color-accent)] p-6 text-white">
            <Timer size={22} strokeWidth={1.8} color="#fff" aria-hidden="true" />
            <h3 className="mt-3 text-[21px] font-bold leading-[1.3]" style={{ fontFamily: "var(--font-display)" }}>
              독서타이머로
              <br />
              집중해보세요
            </h3>
            <p className="mt-1.5 text-[12px] opacity-85">혼자 읽든 스크롤로 읽든 시간을 재보세요</p>
          </div>
        ),
      },
    ];

    if (topBook) {
      list.push({
        id: "recommend",
        to: `/scroll/${topBook.id}`,
        content: (
          <div
            className="flex h-full flex-col justify-end p-6 text-white"
            style={{ background: `linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0) 65%), ${topBook.coverColor}` }}
          >
            <Sparkles size={22} strokeWidth={1.8} color="#fff" aria-hidden="true" />
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[.05em] opacity-80">책추천</p>
            <h3 className="mt-1 text-[21px] font-bold leading-[1.3]" style={{ fontFamily: "var(--font-display)" }}>
              {topBook.title}
            </h3>
            <p className="mt-1.5 text-[12px] opacity-85">
              {topBook.genre} · {topBook.author}
            </p>
          </div>
        ),
      });
    }

    list.push({
      id: "ranking",
      to: "/friends",
      content: (
        <div className="flex h-full flex-col justify-end bg-[var(--color-ink)] p-6 text-white">
          <Trophy size={22} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
          <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[.05em] opacity-70">랭킹 1위</p>
          <div className="mt-2 flex flex-col gap-1 text-[12.5px] font-semibold">
            {topBook && <p>📖 책 · {topBook.title}</p>}
            <p>🧑 사람 · {RANK_PERSON_MOCK.name} ({RANK_PERSON_MOCK.detail})</p>
            <p className="truncate">💬 문구 · {RANK_QUOTE_MOCK.text}</p>
            {topEssay && <p>📝 감상문 · {topEssay.name}님의 「{topEssay.bookTitle}」</p>}
          </div>
        </div>
      ),
    });

    list.push({
      id: "community",
      to: "/friends",
      content: (
        <div className="flex h-full flex-col justify-end bg-[var(--color-paper-dim)] p-6">
          <Users size={22} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
          <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[.05em] text-[var(--color-ink-soft)]">커뮤니티</p>
          <h3 className="mt-1 text-[17px] font-bold leading-[1.3] text-[var(--color-ink)]">
            {COMMUNITY_CURRENT} / {COMMUNITY_GOAL}명 모이면 개방
          </h3>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-line)" }}>
            <div className="h-full" style={{ width: `${communityPct}%`, background: "var(--color-accent)" }} />
          </div>
        </div>
      ),
    });

    if (topEssay) {
      list.push({
        id: "top-essay",
        to: `/essay/${topEssay.id}`,
        content: (
          <div className="flex h-full flex-col justify-end bg-[var(--color-accent-tint)] p-6">
            <Heart size={22} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[.05em] text-[var(--color-ink-soft)]">인기 감상문</p>
            <h3 className="mt-1 text-[15.5px] font-bold leading-[1.4] text-[var(--color-ink)]">
              {topEssay.name} · {topEssay.bookTitle}
            </h3>
            <p className="mt-1 text-[12.5px] leading-[1.4] text-[var(--color-ink-soft)] line-clamp-2">{topEssay.text}</p>
            <p className="mt-1.5 text-[11px] font-bold text-[var(--color-accent)]">❤ 공감 {topEssay.likes}</p>
          </div>
        ),
      });
    }

    return list;
  }, [topBook, topEssay, communityPct]);

  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks the "advance from" slide independently of `index` state — an
  // interval closure would otherwise see a stale index forever.
  const indexRef = useRef(0);
  const pausedUntilRef = useRef(0); // Date.now() timestamp; Infinity while a pointer is down
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || slides.length <= 1) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      const next = (indexRef.current + 1) % slides.length;
      indexRef.current = next;
      containerRef.current?.scrollTo({ left: next * containerRef.current.clientWidth, behavior: "smooth" });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slides.length, reducedMotion]);

  // The "n / total" label is driven only by real scroll position (not the
  // optimistic target above), so it never shows a number ahead of what's
  // still mid-transition on screen.
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el.clientWidth) return;
    const i = Math.min(slides.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)));
    indexRef.current = i;
    setIndex((prev) => (prev === i ? prev : i));
  };

  const resume = () => {
    pausedUntilRef.current = Date.now() + RESUME_DELAY_MS;
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative -mx-5">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={() => {
          pausedUntilRef.current = Infinity;
        }}
        onPointerUp={resume}
        onPointerCancel={resume}
        className="no-scrollbar flex overflow-x-auto"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {slides.map((slide) => (
          <Link key={slide.id} to={slide.to} className="h-[220px] w-full flex-none px-5" style={{ scrollSnapAlign: "start" }}>
            <div className="h-full w-full overflow-hidden" style={{ borderRadius: "var(--radius-card)" }}>
              {slide.content}
            </div>
          </Link>
        ))}
      </div>
      {slides.length > 1 && (
        <div
          className="pointer-events-none absolute bottom-3 flex items-center px-2.5 py-1 text-[10px] font-bold text-white"
          style={{ right: "28px", borderRadius: "var(--radius-chip)", background: "rgba(0,0,0,.45)" }}
        >
          {index + 1} / {slides.length}
        </div>
      )}
    </div>
  );
}
