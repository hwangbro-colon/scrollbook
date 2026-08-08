import { create } from "zustand";

export type Memo = { id: string; text: string; createdAt: string };

let nextId = 0;

type MemoState = {
  memos: Memo[];
  addMemo: (text: string) => void;
  removeMemo: (id: string) => void;
};

// Free-form reading notes — local only, no book/chapter association (unlike
// vocabList, which is always tied to a source book).
export const useMemoStore = create<MemoState>((set) => ({
  memos: [],
  addMemo: (text) => {
    nextId += 1;
    set((s) => ({ memos: [{ id: `memo-${nextId}`, text, createdAt: new Date().toISOString() }, ...s.memos] }));
  },
  removeMemo: (id) => set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),
}));
