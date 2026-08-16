import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Logo } from "../components/common/Logo";
import { BookCarousel } from "../components/common/BookCarousel";
import { EmptyState } from "../components/common/EmptyState";
import { useBookList } from "../hooks/useBookList";
import { useReadingSelectionStore } from "../store/readingSelectionStore";
import { COMPLETED_BOOKS_MOCK, ALMOST_DONE_BOOK_IDS } from "../data/completedBooksMock";
import type { Book } from "../types/book";

type FilterTab = "전체" | "소설" | "고전" | "로맨스";
const FILTER_TABS: FilterTab[] = ["전체", "소설", "고전", "로맨스"];

// 책장 탭 전용 표시 분류 — types/book.ts의 BookGenre(스크롤 리더 등 다른 곳에서
// 쓰는 정식 장르 값)와는 다른, 이 화면 필터 칩에만 쓰는 라벨. bookId로 매핑.
const FILTER_TAG_BY_BOOK_ID: Record<string, Exclude<FilterTab, "전체">> = {
  "unsu-joheun-nal-1924": "소설",
  "byeoljubujeon-classic": "고전",
  "heungbujeon-teaser": "고전",
};

// 스크롤 수/완독 수/클릭 수 — 실 데이터엔 readCount(스크롤 수에 해당)만 있어서,
// 나머지 둘은 그 값에서 일정 비율로 산출한 목업. 나중에 실제 이벤트 집계로
// 교체할 자리(주석대로 여기만 고치면 됨).
function deriveEngagementStats(book: Book) {
  const scrollCount = book.readCount ?? 0;
  return {
    scrollCount,
    completeCount: Math.round(scrollCount * 0.62),
    clickCount: Math.round(scrollCount * 1.8),
  };
}

export function LibraryView() {
  const navigate = useNavigate();
  const selectBook = useReadingSelectionStore((s) => s.selectBook);
  const allBooks = useBookList();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterTab>("전체");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBooks.filter((book) => {
      const matchesFilter = filter === "전체" || FILTER_TAG_BY_BOOK_ID[book.id] === filter;
      const matchesQuery = q === "" || book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [allBooks, query, filter]);

  const readableCount = allBooks.filter((b) => b.chapters.length > 0).length;
  const completionRatePct = readableCount > 0 ? Math.round((COMPLETED_BOOKS_MOCK.length / readableCount) * 100) : 0;
  const inProgressRatePct = readableCount > 0 ? Math.round((ALMOST_DONE_BOOK_IDS.length / readableCount) * 100) : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-none px-5" style={{ paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", paddingBottom: "10px" }}>
        <div className="flex items-center gap-1.5">
          <Logo size={22} />
          <span className="text-[16px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            책장
          </span>
        </div>

        <div className="relative mt-3">
          <Search size={15} strokeWidth={2} color="var(--color-ink-soft)" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색창"
            className="w-full border-[1.5px] border-[var(--color-ink)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--color-ink)] outline-none"
          />
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`flex-none border-[1.5px] px-3.5 py-1.5 text-[11.5px] font-bold ${
                filter === tab ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-line)] text-[var(--color-ink-soft)]"
              }`}
              style={{ borderRadius: "var(--radius-btn)" }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-[88px]">
        <div className="pt-2">
          {filtered.length === 0 ? (
            <div className="px-5">
              <EmptyState icon={Search} title="아직 이 분류의 책이 없어요" description="다른 필터를 눌러보세요" />
            </div>
          ) : (
            <BookCarousel
              items={filtered}
              renderCard={(book) => {
                const stats = deriveEngagementStats(book);
                const tag = COMPLETED_BOOKS_MOCK.some((c) => c.bookId === book.id)
                  ? "완독"
                  : ALMOST_DONE_BOOK_IDS.includes(book.id)
                    ? "거의 다 읽은"
                    : null;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      selectBook(book.id);
                      navigate("/");
                    }}
                    className="flex w-full flex-col items-center gap-3 border-[1.5px] border-[var(--color-ink)] p-4 text-center"
                    style={{ borderRadius: "var(--radius-card)" }}
                  >
                    <div className="relative h-[168px] w-[112px]" style={{ borderRadius: "6px", background: book.coverColor }}>
                      {tag && (
                        <span
                          className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[.03em] text-white"
                          style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-accent)" }}
                        >
                          {tag}
                        </span>
                      )}
                    </div>
                    <div>
                      <h5 className="text-[14px] font-bold text-[var(--color-ink)]">{book.title}</h5>
                      <p className="mt-0.5 text-[10.5px] text-[var(--color-ink-soft)]">{book.author}</p>
                    </div>
                    <p className="text-[10px] text-[var(--color-ink-soft)]">
                      스크롤 {stats.scrollCount.toLocaleString()} · 완독 {stats.completeCount.toLocaleString()} · 클릭 {stats.clickCount.toLocaleString()}
                    </p>
                  </button>
                );
              }}
            />
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 px-5">
          {[
            { label: "완독률", value: completionRatePct },
            { label: "완독 임박", value: inProgressRatePct },
            { label: "이번 주 참여", value: 3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-4 text-white"
              style={{ borderRadius: "var(--radius-card)", background: "var(--color-ink)" }}
            >
              <span className="text-[19px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {stat.value}%
              </span>
              <span className="text-[9.5px] text-white/65">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
