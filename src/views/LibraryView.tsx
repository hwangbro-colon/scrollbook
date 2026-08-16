import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Logo } from "../components/common/Logo";
import { BookCarousel } from "../components/common/BookCarousel";
import { EmptyState } from "../components/common/EmptyState";
import { useBookList } from "../hooks/useBookList";
import { useReadingProgressStore } from "../store/readingProgressStore";
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

// 캐러셀 아래 검정 칸 9개(3x3) — 실제 카탈로그엔 아직 3권뿐이라, "전체 도서"
// 그리드가 꽉 찬 모습을 보여주기 위한 목업 책 이름/진행률. 실제 카탈로그가
// 늘어나면 이 배열을 지우고 useBookList() 결과로 교체하면 됨.
const LIBRARY_GRID_MOCK: { title: string; percent: number }[] = [
  { title: "메밀꽃 필 무렵", percent: 88 },
  { title: "소나기", percent: 45 },
  { title: "봄봄", percent: 100 },
  { title: "동백꽃", percent: 62 },
  { title: "무진기행", percent: 12 },
  { title: "삼포 가는 길", percent: 0 },
  { title: "날개", percent: 73 },
  { title: "배따라기", percent: 30 },
  { title: "사랑손님과 어머니", percent: 55 },
];

export function LibraryView() {
  const navigate = useNavigate();
  const { isCompleted, isInProgress } = useReadingProgressStore();
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
                const tag = isCompleted(book.id) ? "완독" : isInProgress(book.id) ? "거의 다 읽은" : null;
                return (
                  <button
                    type="button"
                    onClick={() => navigate(`/read/${book.id}`)}
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

        <p className="mb-2.5 mt-6 px-5 text-[13px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          전체 도서
        </p>
        <div className="grid grid-cols-3 gap-2 px-5">
          {LIBRARY_GRID_MOCK.map((item) => (
            <div
              key={item.title}
              className="flex aspect-[3/4] flex-col items-center justify-end gap-1 p-2 text-center text-white"
              style={{ borderRadius: "var(--radius-card)", background: "var(--color-ink)" }}
            >
              <span className="text-[11px] font-bold leading-[1.3]">{item.title}</span>
              <span className="text-[10.5px] font-bold text-[var(--color-accent)]">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
