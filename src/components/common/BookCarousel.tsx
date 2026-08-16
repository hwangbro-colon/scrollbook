import { useState } from "react";
import type { ReactNode, UIEvent } from "react";

// Center-emphasized peek carousel — spec: "가로 스크롤, 중앙 카드 강조" /
// storyboard: "중앙 강조 + 좌우 부분 노출 카드(3권 노출)". Each card is ~76%
// of the track width with equal side padding, so neighbors visibly peek in;
// the active (centered) card renders at full opacity/scale via `renderCard`,
// everything else is dimmed — same idea as the reader's peek-picker, just
// horizontal.
export function BookCarousel<T extends { id: string }>({
  items,
  renderCard,
}: {
  items: T[];
  renderCard: (item: T, isActive: boolean) => ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el.clientWidth) return;
    const cardWidth = el.clientWidth * 0.76;
    const i = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex((prev) => (prev === i ? prev : Math.min(items.length - 1, Math.max(0, i))));
  };

  if (items.length === 0) return null;

  return (
    <div
      onScroll={handleScroll}
      className="no-scrollbar flex overflow-x-auto"
      style={{ scrollSnapType: "x mandatory", padding: "0 12%" }}
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className="flex-none px-2 transition-[opacity,transform] duration-150"
          style={{
            width: "76%",
            scrollSnapAlign: "center",
            opacity: i === activeIndex ? 1 : 0.45,
            transform: i === activeIndex ? "scale(1)" : "scale(0.92)",
          }}
        >
          {renderCard(item, i === activeIndex)}
        </div>
      ))}
    </div>
  );
}
