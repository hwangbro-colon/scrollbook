import { useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Share2 } from "lucide-react";
import { Logo } from "../components/common/Logo";
import { OnboardingPopup } from "../components/common/OnboardingPopup";
import { ShareCardCapture } from "../components/common/ShareCardCapture";
import type { ShareCardTarget } from "../components/common/ShareCardCapture";
import { useOnboardingStore } from "../store/onboardingStore";
import { useSavedCardsStore } from "../store/savedCardsStore";
import { useToastStore } from "../store/toastStore";
import { buildFeed } from "../lib/feed";
import type { FeedItem } from "../lib/feed";

// 홈 탭 = 완독스크롤 피드. bookbook-scroll 원본 로직 그대로: 여러 책의 청크를
// 이어붙인 세로 스냅 피드를 훑어보다가, "더 읽고 싶다면?"을 누르면 그 책의
// 완독모드(/read/:bookId)로 들어간다. 공유/저장은 피드 카드 단위로 즉시 동작.

const CONTAINER_VH = 62;
const ROW_VH = 26;
const EDGE_PAD_VH = (CONTAINER_VH - ROW_VH) / 2;
const REST_SCALE = 0.55;
const MIN_OPACITY = 0.3;

export function HomeScrollView() {
  const navigate = useNavigate();
  const hasSeenTutorial = useOnboardingStore((s) => s.hasSeenTutorial);
  const { isSaved, toggleSave } = useSavedCardsStore();
  const showToast = useToastStore((s) => s.show);

  const feed = useMemo(() => buildFeed(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareTarget, setShareTarget] = useState<ShareCardTarget | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateRowTransforms = (raw: number) => {
    const from = Math.max(0, Math.floor(raw) - 3);
    const to = Math.min(rowRefs.current.length - 1, Math.ceil(raw) + 3);
    for (let i = from; i <= to; i++) {
      const el = rowRefs.current[i];
      if (!el) continue;
      const t = Math.min(1, Math.abs(i - raw));
      el.style.transform = `scale(${1 - t * (1 - REST_SCALE)})`;
      el.style.opacity = String(1 - t * (1 - MIN_OPACITY));
    }
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rowPx = el.clientHeight * (ROW_VH / CONTAINER_VH);
    if (rowPx <= 0) return;
    const raw = el.scrollTop / rowPx;
    updateRowTransforms(raw);
    setActiveIndex(Math.round(raw));
  };

  const active: FeedItem | undefined = feed[activeIndex];
  const nextItem: FeedItem | undefined = feed[activeIndex + 1];

  const cardKey = (item: FeedItem) => `${item.book.id}:${item.phraseKey}`;

  const handleShare = (item: FeedItem) => {
    setShareTarget({ bookTitle: item.book.title, author: item.book.author, sentences: item.chunk.sentences });
  };

  const handleSave = (item: FeedItem) => {
    const nowSaved = toggleSave({ id: cardKey(item), bookId: item.book.id, bookTitle: item.book.title, author: item.book.author, chunkId: item.chunk.chunkId, sentences: item.chunk.sentences });
    showToast(nowSaved ? "문장카드를 저장했어요" : "저장을 취소했어요");
  };

  if (feed.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-[12.5px] text-[var(--color-ink-soft)]">
        아직 스크롤할 콘텐츠가 없어요
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="flex flex-none items-center justify-between px-5"
        style={{ paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", paddingBottom: "10px" }}
      >
        <div className="flex items-center gap-1.5">
          <Logo size={22} />
          <span className="text-[16px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            북북
          </span>
        </div>
        {active && (
          <span className="text-[12.5px] font-bold text-[var(--color-ink-soft)]">
            {active.indexInBook + 1}/{active.totalInBook}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
        style={{ scrollSnapType: "y mandatory", paddingTop: `${EDGE_PAD_VH}vh`, paddingBottom: `${EDGE_PAD_VH}vh` }}
      >
        {feed.map((item, i) => (
          <div
            key={cardKey(item)}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className="flex flex-col justify-center px-7 text-[var(--color-ink)]"
            style={{
              height: `${ROW_VH}vh`,
              scrollSnapAlign: "center",
              transformOrigin: "center",
              transform: `scale(${REST_SCALE})`,
              opacity: MIN_OPACITY,
            }}
          >
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--color-ink-soft)]">
              {item.book.title} · {item.chapterTitle}
            </div>
            <p className="text-[26px] font-bold leading-[1.5]" style={{ fontFamily: "var(--font-display)", wordBreak: "keep-all" }}>
              {item.text}
            </p>
            <p className="mt-2 text-[11px] text-[var(--color-ink-soft)]">
              {item.book.author}
            </p>

            {i === activeIndex && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/read/${item.book.id}`)}
                  className="flex-1 py-2.5 text-center text-[12px] font-extrabold text-white"
                  style={{ borderRadius: "var(--radius-btn)", background: "var(--color-accent)" }}
                >
                  더 읽고 싶다면?
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(item)}
                  aria-label="문장카드 저장"
                  className="flex h-9 w-9 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)]"
                  style={{ borderRadius: "var(--radius-avatar)" }}
                >
                  <Bookmark
                    size={15}
                    strokeWidth={1.8}
                    color="var(--color-ink)"
                    fill={isSaved(cardKey(item)) ? "var(--color-ink)" : "none"}
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(item)}
                  aria-label="문장카드 공유"
                  className="flex h-9 w-9 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)]"
                  style={{ borderRadius: "var(--radius-avatar)" }}
                >
                  <Share2 size={15} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {nextItem && (
        <p className="flex-none px-7 pb-[88px] pt-1 text-center text-[10.5px] text-[var(--color-ink-soft)] opacity-70">
          다음: {nextItem.text}
        </p>
      )}

      {!hasSeenTutorial && <OnboardingPopup />}
      {shareTarget && <ShareCardCapture target={shareTarget} onDone={() => setShareTarget(null)} />}
    </div>
  );
}
