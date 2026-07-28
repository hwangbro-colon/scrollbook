import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowUpRight, ArrowDownRight, Lock, History, Ticket } from "lucide-react";
import { useMileageStore, COUPON_CATALOG } from "../store/mileageStore";
import { useCountUp } from "../hooks/useCountUp";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmModal } from "../components/common/ConfirmModal";

const GRADE_TIERS = [
  { name: "새싹 독서가", min: 0 },
  { name: "꾸준한 독서가", min: 800 },
  { name: "몰입 독서가", min: 2000 },
] as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function MileageView() {
  const navigate = useNavigate();
  const balance = useMileageStore((s) => s.balance);
  const history = useMileageStore((s) => s.history);
  const redeemedCouponIds = useMileageStore((s) => s.redeemedCouponIds);
  const redeemCoupon = useMileageStore((s) => s.redeemCoupon);
  const totalEarned = useMileageStore((s) => s.totalEarned());
  const displayedBalance = useCountUp(balance, 400);

  const [confirmCouponId, setConfirmCouponId] = useState<string | null>(null);
  const confirmCoupon = COUPON_CATALOG.find((c) => c.id === confirmCouponId) ?? null;
  const redeemedCoupons = COUPON_CATALOG.filter((c) => redeemedCouponIds.includes(c.id));

  const currentGradeIndex = [...GRADE_TIERS].reverse().findIndex((g) => totalEarned >= g.min);
  const currentGrade = GRADE_TIERS.length - 1 - (currentGradeIndex === -1 ? GRADE_TIERS.length - 1 : currentGradeIndex);

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

      <div className="flex flex-col items-center border-[1.5px] border-[var(--color-accent)] bg-[var(--color-accent-tint)] py-6" style={{ borderRadius: "14px" }}>
        <p className="text-xs font-bold text-[var(--color-accent)]">보유 마일리지</p>
        <p className="mt-1 text-[32px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          {displayedBalance.toLocaleString()}
          <span className="ml-1 text-lg">P</span>
        </p>
      </div>

      <SectionHead title="등급" />
      <div className="flex gap-2">
        {GRADE_TIERS.map((g, i) => {
          const unlocked = i <= currentGrade;
          return (
            <div
              key={g.name}
              className={`flex flex-1 flex-col items-center gap-1 border-[1.5px] px-2 py-3 text-center ${
                unlocked ? "border-[var(--color-accent)] bg-[var(--color-accent-tint)]" : "border-[var(--color-line)] bg-[var(--color-paper-dim)]"
              }`}
              style={{ borderRadius: "var(--radius-card)" }}
            >
              {!unlocked && <Lock size={14} color="var(--color-ink-soft)" aria-hidden="true" />}
              <span
                className="text-[11px] font-bold"
                style={{ color: unlocked ? "var(--color-accent)" : "var(--color-ink-soft)" }}
              >
                {g.name}
              </span>
              <span className="text-[9.5px] text-[var(--color-ink-soft)]">{g.min.toLocaleString()}P~</span>
            </div>
          );
        })}
      </div>

      <SectionHead title="교환 가능한 쿠폰" />
      <div className="flex flex-col gap-2">
        {COUPON_CATALOG.map((coupon) => {
          const affordable = balance >= coupon.cost;
          const alreadyRedeemed = redeemedCouponIds.includes(coupon.id);
          return (
            <div
              key={coupon.id}
              className="border-[1.5px] border-[var(--color-ink)] p-4"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <p className="text-[13px] font-bold text-[var(--color-ink)]">{coupon.title}</p>
              <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">{coupon.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[13px] font-bold text-[var(--color-accent)]">{coupon.cost.toLocaleString()}P</span>
                {alreadyRedeemed ? (
                  <span className="text-[11px] font-bold text-[var(--color-ink-soft)]">교환 완료</span>
                ) : (
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => setConfirmCouponId(coupon.id)}
                    className="bg-[var(--color-ink)] px-3.5 py-2 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[var(--color-paper-dim)] disabled:text-[var(--color-ink-soft)]"
                    style={{ borderRadius: "var(--radius-btn)" }}
                  >
                    교환하기
                  </button>
                )}
              </div>
              {!affordable && !alreadyRedeemed && (
                <p className="mt-2 text-[11px] text-[var(--color-ink-soft)]">
                  {(coupon.cost - balance).toLocaleString()}P 더 모으면 교환할 수 있어요
                </p>
              )}
            </div>
          );
        })}
      </div>

      <SectionHead title="보유 쿠폰함" />
      {redeemedCoupons.length === 0 ? (
        <EmptyState icon={Ticket} title="아직 교환한 쿠폰이 없어요" />
      ) : (
        <div className="flex flex-col gap-2">
          {redeemedCoupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between border border-[var(--color-line)] bg-[var(--color-paper-dim)] px-4 py-3" style={{ borderRadius: "var(--radius-card)" }}>
              <span className="text-[12.5px] font-bold text-[var(--color-ink)]">{c.title}</span>
              <span className="text-[10.5px] font-semibold text-[var(--color-ink-soft)]">보유중</span>
            </div>
          ))}
        </div>
      )}

      <SectionHead title="적립/사용 내역" />
      {history.length === 0 ? (
        <EmptyState icon={History} title="아직 내역이 없어요" />
      ) : (
        <div>
          {history.map((h, i) => (
            <div
              key={h.id}
              className={`flex items-center gap-3 py-2.5 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}
            >
              <div
                className="flex h-8 w-8 flex-none items-center justify-center"
                style={{
                  borderRadius: "var(--radius-avatar)",
                  background: h.type === "earn" ? "var(--color-accent-tint)" : "var(--color-paper-dim)",
                }}
              >
                {h.type === "earn" ? (
                  <ArrowUpRight size={15} color="var(--color-accent)" aria-hidden="true" />
                ) : (
                  <ArrowDownRight size={15} color="var(--color-ink)" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] font-semibold text-[var(--color-ink)]">{h.reason}</p>
                <p className="text-[10.5px] text-[var(--color-ink-soft)]">{formatDate(h.timestamp)}</p>
              </div>
              <span
                className="text-[13px] font-bold"
                style={{ color: h.type === "earn" ? "var(--color-accent)" : "var(--color-ink)" }}
              >
                {h.type === "earn" ? "+" : "-"}
                {h.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmCoupon}
        title="쿠폰을 교환할까요?"
        message={`"${confirmCoupon?.title}" 쿠폰으로 ${confirmCoupon?.cost.toLocaleString()}P를 교환해요. 정말 교환하시겠어요? 이 작업은 되돌릴 수 없어요.`}
        confirmLabel="교환하기"
        onCancel={() => setConfirmCouponId(null)}
        onConfirm={() => {
          if (confirmCouponId) redeemCoupon(confirmCouponId);
          setConfirmCouponId(null);
        }}
      />
    </ScreenScroll>
  );
}
