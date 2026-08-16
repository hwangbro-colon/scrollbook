import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BookProgress = {
  // Index (0-based, across all chapters) of the last chunk the reader
  // reached in ReadFullView. Independent of the feed — browsing the feed
  // never touches this, only actually reading a book does.
  lastChunkIndex: number;
  totalChunks: number;
  completed: boolean;
  completedAt: string | null;
};

type ReadingProgressState = {
  progress: Record<string, BookProgress>;
  setProgress: (bookId: string, chunkIndex: number, totalChunks: number) => void;
  isCompleted: (bookId: string) => boolean;
  isInProgress: (bookId: string) => boolean;
};

// Seeded with a couple of demo entries so 프로필/책장 aren't empty on first
// load — 운수 좋은 날은 완독, 별주부전은 읽던 중인 상태. Real reading in
// ReadFullView overwrites these the same way it would any other book.
const SEED_PROGRESS: Record<string, BookProgress> = {
  "unsu-joheun-nal-1924": { lastChunkIndex: 1, totalChunks: 2, completed: true, completedAt: "2026-08-12" },
  "byeoljubujeon-classic": { lastChunkIndex: 2, totalChunks: 6, completed: false, completedAt: null },
};

export const useReadingProgressStore = create<ReadingProgressState>()(
  persist(
    (set, get) => ({
      progress: SEED_PROGRESS,

      setProgress: (bookId, chunkIndex, totalChunks) =>
        set((s) => {
          const isLast = chunkIndex >= totalChunks - 1;
          const prev = s.progress[bookId];
          return {
            progress: {
              ...s.progress,
              [bookId]: {
                lastChunkIndex: chunkIndex,
                totalChunks,
                completed: isLast || !!prev?.completed,
                completedAt: isLast ? (prev?.completedAt ?? new Date().toISOString().slice(0, 10)) : (prev?.completedAt ?? null),
              },
            },
          };
        }),

      isCompleted: (bookId) => !!get().progress[bookId]?.completed,
      isInProgress: (bookId) => {
        const p = get().progress[bookId];
        return !!p && !p.completed && p.lastChunkIndex > 0;
      },
    }),
    { name: "bb-reading-progress" },
  ),
);
