import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText, User, ShoppingBag, Moon } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useToastStore } from "../store/toastStore";
import { useThemeStore } from "../store/themeStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { MaskedField } from "../components/common/MaskedField";
import { ConfirmModal } from "../components/common/ConfirmModal";

const LINK_ROWS = [
  { to: "/profile", icon: User, label: "프로필", desc: "닉네임 · 사진 · 완독 통계" },
  { to: "/purchase", icon: ShoppingBag, label: "구매", desc: "계좌 · 배송지 · 마일리지로 결제" },
  { to: "/activity", icon: FileText, label: "내 활동 내역", desc: "낭독 · 감상문 기록" },
] as const;

export function SettingsView() {
  const navigate = useNavigate();
  const reminderHour = useAppStore((s) => s.reminderHour);
  const setReminderHour = useAppStore((s) => s.setReminderHour);
  const showToast = useToastStore((s) => s.show);
  const { dark, toggleDark } = useThemeStore();
  const [draft, setDraft] = useState(reminderHour === null ? "" : String(reminderHour));
  const [confirmKind, setConfirmKind] = useState<"logout" | "delete" | null>(null);

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
        설정
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
      </div>

      <SectionHead title="화면" />
      <div className="flex items-center justify-between border-[1.5px] border-[var(--color-ink)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
        <div className="flex items-center gap-3">
          <Moon size={18} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
          <span className="text-[12.5px] font-bold text-[var(--color-ink)]">다크모드</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={dark}
          onClick={toggleDark}
          className="relative h-6 w-11 flex-none transition-colors"
          style={{ borderRadius: "var(--radius-chip)", background: dark ? "var(--color-accent)" : "var(--color-line)" }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 bg-white transition-all"
            style={{ borderRadius: "5px", left: dark ? "22px" : "2px" }}
          />
        </button>
      </div>

      <SectionHead title="계좌·배송" />
      <div className="border-[1.5px] border-[var(--color-ink)] px-4" style={{ borderRadius: "var(--radius-card)" }}>
        <MaskedField label="계좌" value="123-456-789012" mode="full" />
        <MaskedField label="배송지" value="서울시 강남구 역삼동 123-45" mode="full" />
      </div>

      <SectionHead title="기타" />
      <div className="flex flex-col gap-2.5">
        {LINK_ROWS.map((row) => (
          <Link
            key={row.to}
            to={row.to}
            className="flex items-center gap-3 border-[1.5px] border-[var(--color-ink)] p-4"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div
              className="flex h-[34px] w-[34px] flex-none items-center justify-center bg-[var(--color-paper-dim)]"
              style={{ borderRadius: "10px" }}
            >
              <row.icon size={16} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <b className="block text-[13px] font-bold text-[var(--color-ink)]">{row.label}</b>
              <span className="text-[11px] text-[var(--color-ink-soft)]">{row.desc}</span>
            </div>
            <ChevronRight size={16} color="var(--color-ink-soft)" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setConfirmKind("logout")}
          className="w-full border-[1.5px] border-[var(--color-ink)] py-2.5 text-[12.5px] font-bold text-[var(--color-ink)]"
          style={{ borderRadius: "var(--radius-btn)" }}
        >
          로그아웃
        </button>
        <button
          type="button"
          onClick={() => setConfirmKind("delete")}
          className="w-full py-2.5 text-[12px] font-semibold text-[var(--color-ink-soft)] underline"
        >
          계정 탈퇴
        </button>
      </div>

      <ConfirmModal
        open={confirmKind !== null}
        title={confirmKind === "logout" ? "로그아웃할까요?" : "계정을 탈퇴할까요?"}
        message={
          confirmKind === "logout"
            ? "이 프로토타입에는 실제 로그인이 없어서, 로그아웃해도 화면은 그대로예요."
            : "탈퇴하면 모든 활동 기록이 사라져요. 이 프로토타입은 실제로 계정을 삭제하지 않아요."
        }
        confirmLabel={confirmKind === "logout" ? "로그아웃" : "탈퇴하기"}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => {
          showToast(confirmKind === "logout" ? "로그아웃 되었어요 (데모)" : "계정 탈퇴가 접수됐어요 (데모)");
          setConfirmKind(null);
        }}
      />
    </ScreenScroll>
  );
}
