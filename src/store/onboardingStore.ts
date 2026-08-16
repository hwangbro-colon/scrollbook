import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingState = {
  // No real auth — this just gates the 회원가입/로그인 screen out of the way
  // once "logged in" once, per spec ("실제 인증 없이 다음 화면으로 이동").
  loggedIn: boolean;
  // 북북 홈 진입 시 최초 1회만 보여주는 사용법 팝업 — 한 번 닫으면 다시 안 뜸.
  hasSeenTutorial: boolean;
  login: () => void;
  dismissTutorial: () => void;
};

// Persisted so a page reload doesn't re-show the signup/login screen or the
// tutorial popup — matches how a real "seen this before" flag would behave.
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      loggedIn: false,
      hasSeenTutorial: false,
      login: () => set({ loggedIn: true }),
      dismissTutorial: () => set({ hasSeenTutorial: true }),
    }),
    { name: "bb-onboarding" },
  ),
);
