import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useMileageStore } from "../store/mileageStore";
import { useToastStore } from "../store/toastStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { MaskedField } from "../components/common/MaskedField";

const MOCK_PRICE_P = 300;

// 구매 — spec calls for this to draw on 계좌/주소/마일리지, all mocked. No
// real catalog exists yet, so this is a single flat "책 구매" line item.
export function PurchaseView() {
  const navigate = useNavigate();
  const balance = useMileageStore((s) => s.balance);
  const spendMileage = useMileageStore((s) => s.spendMileage);
  const showToast = useToastStore((s) => s.show);
  const affordable = balance >= MOCK_PRICE_P;

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
        책 구매
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">계좌 · 배송지 · 마일리지로 결제해요</p>

      <SectionHead title="결제 정보" />
      <div className="border-[1.5px] border-[var(--color-ink)] px-4" style={{ borderRadius: "var(--radius-card)" }}>
        <MaskedField label="계좌" value="123-456-789012" mode="full" />
        <MaskedField label="배송지" value="서울시 강남구 역삼동 123-45" mode="full" />
      </div>

      <SectionHead title="마일리지 결제" />
      <div className="flex items-center justify-between border-[1.5px] border-[var(--color-accent)] bg-[var(--color-accent-tint)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
        <div>
          <p className="text-[12.5px] font-bold text-[var(--color-ink)]">「별주부전」 소장판</p>
          <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">보유 {balance.toLocaleString()}P</p>
        </div>
        <span className="text-[15px] font-bold text-[var(--color-accent)]">{MOCK_PRICE_P}P</span>
      </div>

      <button
        type="button"
        disabled={!affordable}
        onClick={() => {
          spendMileage(MOCK_PRICE_P, "책 구매 · 별주부전 소장판", "purchase");
          showToast("구매가 완료됐어요 (실제 배송/결제는 연동되지 않아요)");
        }}
        className="mt-4 w-full py-3 text-[13px] font-extrabold text-white disabled:opacity-40"
        style={{ borderRadius: "var(--radius-btn)", background: "var(--color-accent)" }}
      >
        {affordable ? `${MOCK_PRICE_P}P로 구매하기` : "마일리지가 부족해요"}
      </button>
    </ScreenScroll>
  );
}
