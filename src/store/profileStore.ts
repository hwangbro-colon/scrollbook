import { create } from "zustand";
import { DEMO_USER_NAME } from "../data/homeMock";

export type StatsPeriod = "month" | "year" | "all";

// Mock 완독 통계 by period — shaped like a real `{ period, completedCount }`
// API response so swapping in real data later is a one-line change.
export const COMPLETED_STATS_MOCK: Record<StatsPeriod, number> = { month: 3, year: 18, all: 24 };

type ProfileState = {
  nickname: string;
  avatarUrl: string | null;
  setNickname: (v: string) => void;
  setAvatarUrl: (v: string | null) => void;
};

// Nickname/avatar live here (not local component state) so editing them in
// ProfileView is reflected everywhere else they're shown — ProfilePanel's
// header, HomeView's greeting.
export const useProfileStore = create<ProfileState>((set) => ({
  nickname: DEMO_USER_NAME,
  avatarUrl: null,
  setNickname: (v) => set({ nickname: v }),
  setAvatarUrl: (v) => set({ avatarUrl: v }),
}));
