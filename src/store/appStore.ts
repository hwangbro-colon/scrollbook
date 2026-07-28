import { create } from "zustand";

export type VocabEntry = { word: string; meaning: string };
export type Club = { id: string; emoji: string; name: string; caption: string; joined: boolean };
export type Friend = { id: string; name: string; streakLabel: string };

let friendCounter = 0;
const DUMMY_FRIENDS = [
  { name: "최다인", streakLabel: "1일 연속 참여중" },
  { name: "오세훈", streakLabel: "1일 연속 참여중" },
  { name: "장예린", streakLabel: "1일 연속 참여중" },
];

type AppState = {
  dailyChallengeDone: boolean;
  streak: number;
  vocabList: VocabEntry[];
  clubs: Club[];
  friends: Friend[];

  // Only sets the "done today" flag and bumps streak — mileage rewards for
  // completing it (and any streak-bonus) are handled by the caller via
  // mileageStore, so this store stays unaware of mileage entirely.
  completeDailyChallenge: () => void;
  addVocab: (entry: VocabEntry) => void;
  toggleClub: (id: string) => void;
  addFriend: () => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  dailyChallengeDone: false,
  // Set one below the 7-day bonus threshold so completing today's
  // challenge in a fresh session demonstrates the streak bonus too.
  streak: 6,
  vocabList: [
    { word: "아득하다", meaning: "거리가 매우 멀다" },
    { word: "여울", meaning: "물살이 빠른 곳" },
    { word: "어스름", meaning: "조금 어두운 상태" },
  ],
  clubs: [
    { id: "c1", emoji: "🌈", name: "무지개 독서단", caption: "멤버 3명 · 오늘 활동 있음", joined: true },
    { id: "c2", emoji: "📖", name: "고전문학 탐구반", caption: "멤버 5명", joined: false },
  ],
  friends: [
    { id: "f1", name: "휘람", streakLabel: "7일 연속 참여중" },
    { id: "f2", name: "윤우", streakLabel: "3일 연속 참여중" },
  ],

  completeDailyChallenge: () => {
    if (get().dailyChallengeDone) return;
    set((s) => ({ dailyChallengeDone: true, streak: s.streak + 1 }));
  },
  addVocab: (entry) => set((s) => ({ vocabList: [entry, ...s.vocabList] })),
  toggleClub: (id) =>
    set((s) => ({
      clubs: s.clubs.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c)),
    })),
  addFriend: () => {
    const dummy = DUMMY_FRIENDS[friendCounter % DUMMY_FRIENDS.length];
    friendCounter += 1;
    set((s) => ({ friends: [...s.friends, { id: `f-new-${Date.now()}`, ...dummy }] }));
  },
}));
