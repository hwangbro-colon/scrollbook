import { Avatar } from "./Avatar";

export function EssayRow({
  initial,
  name,
  text,
  likes,
  first = false,
}: {
  initial: string;
  name: string;
  text: string;
  likes: number;
  first?: boolean;
}) {
  return (
    <div className={`flex gap-2.5 py-3 ${first ? "" : "border-t border-[var(--color-line)]"}`}>
      <Avatar letter={initial} />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-[var(--color-ink)]">{name}</div>
        <p className="mt-0.5 text-[12.5px] leading-[1.4] text-[var(--color-ink-soft)]">{text}</p>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[var(--color-accent)]">
          ❤ 공감 {likes}
        </div>
      </div>
    </div>
  );
}
