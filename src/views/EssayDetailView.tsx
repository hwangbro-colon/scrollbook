import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useEssayStore } from "../store/essayStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { EssayRow } from "../components/common/EssayRow";
import { Avatar } from "../components/common/Avatar";
import { EmptyState } from "../components/common/EmptyState";
import { MessageSquareHeart } from "lucide-react";

export function EssayDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const essays = useEssayStore((s) => s.essays);
  const toggleLike = useEssayStore((s) => s.toggleLike);

  const essay = essays.find((e) => e.id === id);
  const otherEssays = essay ? essays.filter((e) => e.bookId === essay.bookId && e.id !== essay.id) : [];

  if (!essay) {
    return (
      <ScreenScroll>
        <EmptyState icon={MessageSquareHeart} title="감상문을 찾을 수 없어요" />
      </ScreenScroll>
    );
  }

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

      <div className="flex items-center gap-2.5">
        <Avatar letter={essay.initial} size={38} />
        <div>
          <h3 className="text-[14px] font-bold text-[var(--color-ink)]">{essay.name}</h3>
          <p className="text-[11px] text-[var(--color-ink-soft)]">{essay.bookTitle}</p>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-[1.7] text-[var(--color-ink)]">{essay.text}</p>

      <button
        type="button"
        onClick={() => toggleLike(essay.id)}
        className="mt-4 flex items-center gap-1.5 text-[13px] font-bold"
        style={{ color: essay.likedByMe ? "var(--color-accent)" : "var(--color-ink-soft)" }}
      >
        {essay.likedByMe ? "❤" : "🤍"} 공감 {essay.likes}
      </button>

      <SectionHead title="이 책의 다른 감상문" />
      {otherEssays.length === 0 ? (
        <EmptyState icon={MessageSquareHeart} title="아직 다른 감상문이 없어요" />
      ) : (
        <div>
          {otherEssays.map((e, i) => (
            <Link key={e.id} to={`/essay/${e.id}`}>
              <EssayRow first={i === 0} initial={e.initial} name={e.name} text={e.text} likes={e.likes} />
            </Link>
          ))}
        </div>
      )}
    </ScreenScroll>
  );
}
