import { create } from "zustand";

export type VocabEntry = { word: string; meaning: string; sourceBookTitle?: string; sourceChapter?: number };
export type Club = {
  id: string;
  emoji: string;
  name: string;
  caption: string;
  joined: boolean;
  isHost?: boolean;
  nextSchedule?: string;
  maxMembers?: number;
  currentMembers?: number;
};
export type Friend = { id: string; name: string; streakLabel: string; activeToday?: boolean };
export type SoloRecording = { id: string; bookTitle: string; timestamp: string };
export type LastActivity = { type: "read" | "scroll"; bookId: string; bookTitle: string; position: string };

let friendCounter = 0;
const DUMMY_FRIENDS = [
  { name: "최다인", streakLabel: "1일 연속 참여중" },
  { name: "오세훈", streakLabel: "1일 연속 참여중" },
  { name: "장예린", streakLabel: "1일 연속 참여중" },
];

let recordingCounter = 0;

// Last 12 weeks of mock activity dates (YYYY-MM-DD), for the 프로필 > 내 활동
// 내역 heatmap. A handful of gaps are left in on purpose so the heatmap
// isn't a solid block.
function seedActivityLog(): string[] {
  const dates: string[] = [];
  const skip = new Set([2, 5, 6, 11, 15, 20, 27, 33, 40, 44, 51, 58, 65, 72]);
  for (let i = 0; i < 84; i++) {
    if (skip.has(i)) continue;
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

type AppState = {
  dailyChallengeDone: boolean;
  // When the daily challenge was last completed (YYYY-MM-DD) — drives the
  // "내일 오전 6시 초기화" countdown and the streak grace-day banner
  // (grace day = a streak already underway but today not done yet).
  dailyChallengeCompletedDate: string | null;
  streak: number;
  vocabList: VocabEntry[];
  clubs: Club[];
  friends: Friend[];
  dismissedBookIds: string[];
  lastActivity: LastActivity | null;
  groupStreak: number;
  groupCompletedToday: boolean;
  reminderHour: number | null;
  activityLog: string[];
  wrongQuizCounts: Record<string, number>;
  soloRecordings: SoloRecording[];

  // Only sets the "done today" flag and bumps streak — mileage rewards for
  // completing it (and any streak-bonus) are handled by the caller via
  // mileageStore, so this store stays unaware of mileage entirely.
  completeDailyChallenge: () => void;
  addVocab: (entry: VocabEntry) => void;
  toggleClub: (id: string) => void;
  createClub: (name: string) => void;
  setClubSchedule: (id: string, nextSchedule: string) => void;
  addFriend: () => void;
  dismissBook: (bookId: string) => void;
  setLastActivity: (activity: LastActivity) => void;
  setReminderHour: (hour: number | null) => void;
  recordQuizAnswer: (bookId: string, isCorrect: boolean) => void;
  addSoloRecording: (bookTitle: string) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  dailyChallengeDone: false,
  dailyChallengeCompletedDate: null,
  // Set one below the 7-day bonus threshold so completing today's
  // challenge in a fresh session demonstrates the streak bonus too.
  streak: 6,
  vocabList: [
    { word: "아득하다", meaning: "거리가 매우 멀다" },
    { word: "여울", meaning: "물살이 빠른 곳" },
    { word: "어스름", meaning: "조금 어두운 상태" },
  ],
  clubs: [
    {
      id: "c1",
      emoji: "🌈",
      name: "무지개 독서단",
      caption: "멤버 3명 · 오늘 활동 있음",
      joined: true,
      isHost: true,
      nextSchedule: new Date(Date.now() + 2 * 86400000).toISOString(),
      maxMembers: 8,
      currentMembers: 3,
    },
    {
      id: "c2",
      emoji: "📖",
      name: "고전문학 탐구반",
      caption: "멤버 5명",
      joined: false,
      maxMembers: 5,
      currentMembers: 5,
    },
  ],
  friends: [
    { id: "f1", name: "휘람", streakLabel: "7일 연속 참여중", activeToday: true },
    { id: "f2", name: "윤우", streakLabel: "3일 연속 참여중", activeToday: false },
  ],
  dismissedBookIds: [],
  lastActivity: { type: "scroll", bookId: "byeoljubujeon-classic", bookTitle: "별주부전", position: "2장부터" },
  groupStreak: 4,
  groupCompletedToday: false,
  reminderHour: null,
  activityLog: seedActivityLog(),
  wrongQuizCounts: {},
  soloRecordings: [],

  completeDailyChallenge: () => {
    if (get().dailyChallengeDone) return;
    set((s) => ({
      dailyChallengeDone: true,
      dailyChallengeCompletedDate: new Date().toISOString().slice(0, 10),
      streak: s.streak + 1,
    }));
  },
  addVocab: (entry) => set((s) => ({ vocabList: [entry, ...s.vocabList] })),
  toggleClub: (id) =>
    set((s) => ({
      clubs: s.clubs.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c)),
    })),
  setClubSchedule: (id, nextSchedule) =>
    set((s) => ({ clubs: s.clubs.map((c) => (c.id === id ? { ...c, nextSchedule } : c)) })),
  createClub: (name) =>
    set((s) => ({
      clubs: [
        { id: `c-new-${Date.now()}`, emoji: "✨", name, caption: "멤버 1명 · 방금 만들어짐", joined: true, isHost: true, currentMembers: 1 },
        ...s.clubs,
      ],
    })),
  addFriend: () => {
    const dummy = DUMMY_FRIENDS[friendCounter % DUMMY_FRIENDS.length];
    friendCounter += 1;
    set((s) => ({ friends: [...s.friends, { id: `f-new-${Date.now()}`, ...dummy }] }));
  },
  dismissBook: (bookId) => set((s) => ({ dismissedBookIds: [...s.dismissedBookIds, bookId] })),
  setLastActivity: (activity) => set({ lastActivity: activity }),
  setReminderHour: (hour) => set({ reminderHour: hour }),
  recordQuizAnswer: (bookId, isCorrect) =>
    set((s) => ({
      wrongQuizCounts: { ...s.wrongQuizCounts, [bookId]: isCorrect ? 0 : (s.wrongQuizCounts[bookId] ?? 0) + 1 },
    })),
  addSoloRecording: (bookTitle) => {
    recordingCounter += 1;
    set((s) => ({
      soloRecordings: [{ id: `rec-${recordingCounter}`, bookTitle, timestamp: new Date().toISOString() }, ...s.soloRecordings],
    }));
  },
}));
