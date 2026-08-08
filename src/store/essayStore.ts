import { create } from "zustand";

export type Essay = {
  id: string;
  bookId: string;
  bookTitle: string;
  initial: string;
  name: string;
  text: string;
  likes: number;
  likedByMe: boolean;
};

let nextEssayId = 0;

// Seeded from the former `TOP_ESSAYS` mock in data/homeMock.ts — moved here
// so likes can actually be toggled and new essays (from a shared creative
// quiz answer) can be appended, instead of living as static display-only data.
const SEED_ESSAYS: Essay[] = [
  {
    id: "e1",
    bookId: "byeoljubujeon-classic",
    bookTitle: "별주부전",
    initial: "준",
    name: "준서",
    text: "토끼가 결국 용궁까지 따라갈지 마음 졸이며 읽었어요…",
    likes: 48,
    likedByMe: false,
  },
  {
    id: "e2",
    bookId: "unsu-joheun-nal-1924",
    bookTitle: "운수 좋은 날",
    initial: "휘",
    name: "휘람",
    text: "김 첨지의 하루가 계속 마음에 남네요",
    likes: 31,
    likedByMe: false,
  },
];

// Essays shown in the 홈/그룹 "공감 많이 받은 감상문" sections — spec's
// own threshold, kept as-is since both seed essays already clear it.
export const ESSAY_HIGHLIGHT_LIKE_THRESHOLD = 30;

type EssayState = {
  essays: Essay[];
  toggleLike: (id: string) => void;
  addEssay: (input: { bookId: string; bookTitle: string; text: string }) => void;
};

export const useEssayStore = create<EssayState>((set) => ({
  essays: SEED_ESSAYS,
  toggleLike: (id) =>
    set((s) => ({
      essays: s.essays.map((e) =>
        e.id === id ? { ...e, likedByMe: !e.likedByMe, likes: e.likes + (e.likedByMe ? -1 : 1) } : e,
      ),
    })),
  addEssay: ({ bookId, bookTitle, text }) => {
    nextEssayId += 1;
    const entry: Essay = {
      id: `e-new-${nextEssayId}`,
      bookId,
      bookTitle,
      initial: "나",
      name: "나",
      text,
      likes: 0,
      likedByMe: false,
    };
    set((s) => ({ essays: [entry, ...s.essays] }));
  },
}));
