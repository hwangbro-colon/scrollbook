import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, StickyNote, Trash2 } from "lucide-react";
import { useMemoStore } from "../store/memoStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { EmptyState } from "../components/common/EmptyState";

export function MemoView() {
  const navigate = useNavigate();
  const memos = useMemoStore((s) => s.memos);
  const addMemo = useMemoStore((s) => s.addMemo);
  const removeMemo = useMemoStore((s) => s.removeMemo);
  const [draft, setDraft] = useState("");

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

      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        메모
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">읽으면서 떠오른 생각을 자유롭게 남겨보세요</p>

      <div className="border-[1.5px] border-[var(--color-ink)] p-3" style={{ borderRadius: "var(--radius-card)" }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="메모를 입력하세요"
          className="w-full border-0 bg-transparent text-[13px] text-[var(--color-ink)] outline-none"
        />
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={() => {
            addMemo(draft.trim());
            setDraft("");
          }}
          className="mt-2 w-full bg-[var(--color-accent)] py-2 text-[12px] font-extrabold text-white disabled:opacity-50"
          style={{ borderRadius: "var(--radius-btn)" }}
        >
          저장
        </button>
      </div>

      <div className="mt-4">
        {memos.length === 0 ? (
          <EmptyState icon={StickyNote} title="아직 메모가 없어요" />
        ) : (
          memos.map((m, i) => (
            <div key={m.id} className={`flex items-start justify-between gap-3 py-3 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-[1.5] text-[var(--color-ink)]">{m.text}</p>
                <p className="mt-1 text-[10px] text-[var(--color-ink-soft)]">
                  {new Date(m.createdAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button type="button" onClick={() => removeMemo(m.id)} aria-label="메모 삭제" className="flex-none">
                <Trash2 size={15} strokeWidth={1.8} color="var(--color-ink-soft)" aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>
    </ScreenScroll>
  );
}
