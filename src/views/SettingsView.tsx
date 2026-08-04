import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useToastStore } from "../store/toastStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";

export function SettingsView() {
  const navigate = useNavigate();
  const reminderHour = useAppStore((s) => s.reminderHour);
  const setReminderHour = useAppStore((s) => s.setReminderHour);
  const showToast = useToastStore((s) => s.show);
  const [draft, setDraft] = useState(reminderHour === null ? "" : String(reminderHour));

  const handleSave = () => {
    setReminderHour(draft === "" ? null : Number(draft));
    showToast(draft === "" ? "알림을 껐어요" : `${draft.padStart(2, "0")}:00 알림으로 저장했어요`);
  };

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
        계정 설정
      </div>

      <SectionHead title="알림" />
      <div className="border-[1.5px] border-[var(--color-ink)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
        <p className="mb-2.5 text-[12.5px] font-bold text-[var(--color-ink)]">데일리 5분 리마인더 시간</p>
        <div className="flex gap-2">
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-w-0 flex-1 border-[1.5px] border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-[12.5px] text-[var(--color-ink)]"
            style={{ borderRadius: "var(--radius-btn)" }}
          >
            <option value="">끄기</option>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSave}
            className="flex-none bg-[var(--color-accent)] px-4 text-[12.5px] font-extrabold text-white"
            style={{ borderRadius: "var(--radius-btn)" }}
          >
            저장
          </button>
        </div>
        <p className="mt-2.5 text-[11px] text-[var(--color-ink-soft)]">
          실제 푸시 발송은 아직 준비 중이에요. 설정값만 저장돼요.
        </p>
      </div>
    </ScreenScroll>
  );
}
