import { create } from "zustand";
import { useToastStore } from "./toastStore";

export type MileageEntry = {
  id: string;
  type: "earn" | "spend";
  amount: number;
  reason: string;
  source: string;
  timestamp: string;
};

export type CouponDef = { id: string; title: string; description: string; cost: number };

export const COUPON_CATALOG: CouponDef[] = [
  { id: "cp1", title: "민들레 출판사 신간 10% 할인", description: "전 도서 10% 할인 쿠폰", cost: 100 },
  { id: "cp2", title: "동네책방 음료 교환권", description: "제휴 서점 음료 1잔 무료 교환권", cost: 250 },
  { id: "cp3", title: "이달의 베스트셀러 20% 할인", description: "이달의 베스트셀러 1권 20% 할인", cost: 500 },
];

let nextEntryId = 0;

type MileageState = {
  // `balance` is a cached running total — the ONLY code path that changes
  // it is the push helper below, which always updates it and `history`
  // together, so balance == sum(history) is an invariant, not just a
  // coincidence of the seed data.
  balance: number;
  history: MileageEntry[];
  redeemedCouponIds: string[];

  earnMileage: (amount: number, reason: string, source: string) => void;
  spendMileage: (amount: number, reason: string, source: string) => boolean;
  redeemCoupon: (couponId: string) => boolean;
  totalEarned: () => number;
};

export const useMileageStore = create<MileageState>((set, get) => ({
  balance: 1240,
  history: [
    {
      id: "seed-1",
      type: "earn",
      amount: 1240,
      reason: "가입 축하 마일리지",
      source: "welcome",
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
  redeemedCouponIds: [],

  earnMileage: (amount, reason, source) => {
    nextEntryId += 1;
    const entry: MileageEntry = {
      id: `m-${nextEntryId}`,
      type: "earn",
      amount,
      reason,
      source,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ balance: s.balance + amount, history: [entry, ...s.history] }));
    useToastStore.getState().show(`+${amount} 마일리지 · ${reason}`);
  },

  spendMileage: (amount, reason, source) => {
    if (get().balance < amount) return false;
    nextEntryId += 1;
    const entry: MileageEntry = {
      id: `m-${nextEntryId}`,
      type: "spend",
      amount,
      reason,
      source,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ balance: s.balance - amount, history: [entry, ...s.history] }));
    return true;
  },

  redeemCoupon: (couponId) => {
    const coupon = COUPON_CATALOG.find((c) => c.id === couponId);
    if (!coupon) return false;
    if (get().redeemedCouponIds.includes(couponId)) return false;
    const ok = get().spendMileage(coupon.cost, `쿠폰 교환 · ${coupon.title}`, "coupon");
    if (!ok) return false;
    set((s) => ({ redeemedCouponIds: [...s.redeemedCouponIds, couponId] }));
    useToastStore.getState().show("쿠폰 교환 완료");
    return true;
  },

  totalEarned: () => get().history.filter((h) => h.type === "earn").reduce((sum, h) => sum + h.amount, 0),
}));
