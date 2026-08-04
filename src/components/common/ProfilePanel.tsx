import { Link } from "react-router-dom";
import { ChevronLeft, Star, FileText, CreditCard, Settings } from "lucide-react";
import { useMileageStore } from "../../store/mileageStore";
import { useCountUp } from "../../hooks/useCountUp";

const PROFILE_MENU = [
  { id: "mileage", icon: Star, label: "마일리지 · 리워드", sub: null as string | null, to: "/mileage" },
  { id: "activity", icon: FileText, label: "내 활동 내역", sub: "낭독 · 감상문 · 퀴즈 기록", to: "/activity" },
  { id: "payment", icon: CreditCard, label: "결제 내역", sub: "쿠폰 · 구독 관리", to: null },
  { id: "settings", icon: Settings, label: "계정 설정", sub: "알림 · 로그아웃", to: "/settings" },
];

export function ProfilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const balance = useMileageStore((s) => s.balance);
  const displayedBalance = useCountUp(balance);

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col bg-[var(--color-paper)] transition-transform duration-[220ms] ease-out"
      style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      aria-hidden={!open}
    >
      <div
        className="flex flex-none items-center gap-3 border-b border-[var(--color-line)] px-5 pb-3"
        style={{ paddingTop: "calc(16px + env(safe-area-inset-top, 0px))" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)]"
          style={{ borderRadius: "var(--radius-avatar)" }}
        >
          <ChevronLeft size={16} strokeWidth={2} color="var(--color-ink)" />
        </button>
        <h2 className="text-[17px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          프로필
        </h2>
      </div>

      <div className="flex flex-none items-center gap-3.5 border-b border-[var(--color-line)] px-5 py-5">
        <div
          className="flex h-[54px] w-[54px] flex-none items-center justify-center bg-[var(--color-accent)] text-[19px] font-semibold text-white"
          style={{ borderRadius: "14px", fontFamily: "var(--font-display)" }}
        >
          서
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[var(--color-ink)]">서연</h3>
          <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-soft)]">무지개 독서단 · 멤버</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
        {PROFILE_MENU.map((item, i) => {
          const Icon = item.icon;
          const rowClass = `flex w-full items-center gap-3 py-3.5 text-left ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`;
          const content = (
            <>
              <div
                className="flex h-[34px] w-[34px] flex-none items-center justify-center bg-[var(--color-paper-dim)]"
                style={{ borderRadius: "10px" }}
              >
                <Icon size={16} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <b className="block text-[13px] font-bold text-[var(--color-ink)]">{item.label}</b>
                <span className="text-[11px] text-[var(--color-ink-soft)]">
                  {item.id === "mileage" ? `${displayedBalance.toLocaleString()} P 보유` : item.sub}
                </span>
              </div>
              <span className="text-sm text-[var(--color-ink-soft)]">›</span>
            </>
          );
          return item.to ? (
            <Link key={item.id} to={item.to} onClick={onClose} className={rowClass}>
              {content}
            </Link>
          ) : (
            <button key={item.id} type="button" className={rowClass}>
              {content}
            </button>
          );
        })}
        <div
          className="mt-3.5 border-[1.5px] border-dashed border-[var(--color-line)] p-3 text-center text-[11.5px] font-bold text-[var(--color-ink-soft)]"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          + 항목 추가 가능
        </div>
      </div>
    </div>
  );
}
