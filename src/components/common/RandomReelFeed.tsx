import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useEssayStore } from "../../store/essayStore";
import { useToastStore } from "../../store/toastStore";
import { buildRandomFeed, type AdFeedItem, type FeedItem, type QuoteFeedItem } from "../../lib/randomFeed";
import { Avatar } from "./Avatar";

function QuoteCard({ item }: { item: QuoteFeedItem }) {
  return (
    <div
      className="flex h-full flex-none flex-col justify-center bg-[var(--color-ink)] px-6 pb-[34px] pt-6 text-white"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="mb-3 text-[10px] font-bold uppercase tracking-[.08em] opacity-55">구절 · {item.bookTitle}</div>
      <p className="text-[19px] font-semibold leading-[1.6]" style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}>
        “{item.text}”
      </p>
      <Link
        to={`/scroll/${item.bookId}`}
        className="mt-6 inline-flex w-fit items-center gap-1 border-[1.5px] border-white/50 px-3 py-1.5 text-[11px] font-bold text-white"
        style={{ borderRadius: "var(--radius-btn)" }}
      >
        {item.bookTitle} 읽으러 가기 →
      </Link>
      <p className="mt-3 text-[10px] opacity-40">{item.bookAuthor}</p>
    </div>
  );
}

function AdCard({ item }: { item: AdFeedItem }) {
  const showToast = useToastStore((s) => s.show);
  return (
    <div
      className="flex h-full flex-none flex-col justify-center border-[1.5px] border-dashed border-[var(--color-line)] bg-[var(--color-paper-dim)] px-6 pb-[34px] pt-6"
      style={{ scrollSnapAlign: "start" }}
    >
      <span
        className="mb-3 inline-block w-fit text-[9px] font-extrabold uppercase tracking-[.04em]"
        style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-paper)", color: "var(--color-ink-soft)", border: "1px solid var(--color-line)" }}
      >
        PR · {item.partnerName} 협찬
      </span>
      <h4 className="text-[17px] font-semibold leading-[1.4] text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        {item.headline}
      </h4>
      <p className="mt-2 text-[12.5px] text-[var(--color-ink-soft)]">{item.body}</p>
      <button
        type="button"
        onClick={() => showToast("실제 광고 연동은 준비 중이에요")}
        className="mt-5 w-fit border-[1.5px] border-[var(--color-ink)] px-3.5 py-2 text-[11px] font-bold text-[var(--color-ink)]"
        style={{ borderRadius: "var(--radius-btn)" }}
      >
        자세히 보기
      </button>
    </div>
  );
}

function ReviewFeedCard({ essayId }: { essayId: string }) {
  const essay = useEssayStore((s) => s.essays.find((e) => e.id === essayId));
  const toggleLike = useEssayStore((s) => s.toggleLike);
  if (!essay) return null;

  return (
    <div
      className="flex h-full flex-none flex-col justify-center bg-[var(--color-paper)] px-6 pb-[34px] pt-6"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="mb-4 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--color-ink-soft)]">
        감상문 · {essay.bookTitle}
      </div>
      <div className="flex items-start gap-3">
        <Avatar letter={essay.initial} size={38} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-[var(--color-ink)]">{essay.name}</div>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-[var(--color-ink)]" style={{ wordBreak: "keep-all" }}>
            {essay.text}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => toggleLike(essay.id)}
        className="mt-5 flex w-fit items-center gap-1.5 border-[1.5px] px-3.5 py-2 text-[12px] font-bold"
        style={{
          borderRadius: "var(--radius-btn)",
          borderColor: essay.likedByMe ? "var(--color-accent)" : "var(--color-ink)",
          color: essay.likedByMe ? "var(--color-accent)" : "var(--color-ink)",
        }}
      >
        {essay.likedByMe ? "❤" : "🤍"} 공감 {essay.likes}
      </button>
      <Link to={`/essay/${essay.id}`} className="mt-2 w-fit text-[11px] font-bold text-[var(--color-ink-soft)] underline">
        전체 보기
      </Link>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  if (item.kind === "quote") return <QuoteCard item={item} />;
  if (item.kind === "ad") return <AdCard item={item} />;
  return <ReviewFeedCard essayId={item.essayId} />;
}

// Reels-style feed mixing 구절/광고/감상문 cards, one per full-height snap
// page. Order is shuffled once per mount (not on every re-render) so liking
// a review card mid-scroll doesn't reshuffle the feed under the reader.
export function RandomReelFeed() {
  const items = useMemo(() => buildRandomFeed(), []);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-[12px] text-[var(--color-ink-soft)]">
        아직 보여줄 구절이 없어요.
      </div>
    );
  }

  return (
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto" style={{ scrollSnapType: "y mandatory" }}>
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
