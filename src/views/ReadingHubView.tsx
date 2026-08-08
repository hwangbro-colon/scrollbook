import { Link } from "react-router-dom";
import { Mic, Sparkles, Radio, ChevronRight } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useBook } from "../hooks/useBook";
import { CURRENT_BOOK_ID } from "../data/currentBook";
import { ScreenScroll } from "../components/common/ScreenScroll";

// Order matters — rendered top-to-bottom as a single-column list.
const SUBMENU = [
  { to: "/reading/solo", icon: Mic, label: "솔로낭독", desc: "혼자 소리 내어 읽고 녹음해요" },
  { to: "/reading/ai", icon: Sparkles, label: "AI랑낭독", desc: "AI 목소리와 번갈아가며 읽어요" },
  { to: "/reading/live", icon: Radio, label: "라이브낭독", desc: "그룹원과 차례대로 함께 읽어요" },
] as const;

export function ReadingHubView() {
  const lastActivity = useAppStore((s) => s.lastActivity);
  const book = useBook(CURRENT_BOOK_ID);

  return (
    <ScreenScroll>
      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        낭독
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">솔로낭독 · AI랑낭독 · 라이브낭독</p>

      <Link
        to="/reading/solo"
        className="flex items-center justify-between px-4 py-[13px] text-white"
        style={{ borderRadius: "var(--radius-card)", background: "var(--color-ink)" }}
      >
        <div className="min-w-0">
          <p className="text-[9.5px] font-bold uppercase tracking-[.04em] opacity-60">
            {lastActivity ? "이어서" : "지금 시작해보세요"}
          </p>
          <h5 className="mt-0.5 truncate text-[13px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {lastActivity ? `${lastActivity.bookTitle} · ${lastActivity.position}` : (book?.title ?? "책 읽기")}
          </h5>
        </div>
        <span className="flex flex-none items-center gap-1 text-[12px] font-bold text-[var(--color-accent)]">
          계속 읽기
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </Link>

      <div className="mt-5 flex flex-col gap-3">
        {SUBMENU.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3.5 border-[1.5px] border-[var(--color-ink)] p-4"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div
              className="flex h-9 w-9 flex-none items-center justify-center border-[1.5px] border-[var(--color-accent)] bg-[var(--color-accent-tint)]"
              style={{ borderRadius: "10px" }}
            >
              <item.icon size={17} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-[13.5px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
                {item.label}
              </h5>
              <p className="mt-0.5 text-[10.5px] leading-[1.3] text-[var(--color-ink-soft)]">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </ScreenScroll>
  );
}
