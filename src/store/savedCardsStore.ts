import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedCard = {
  id: string; // `${bookId}:${chunkId}`
  bookId: string;
  bookTitle: string;
  author: string;
  chunkId: string;
  sentences: string[];
  savedAt: string;
};

type SavedCardsState = {
  cards: SavedCard[];
  isSaved: (id: string) => boolean;
  toggleSave: (card: Omit<SavedCard, "savedAt">) => boolean; // returns new saved state
  removeCard: (id: string) => void;
};

// 프로필 > 보관함 섹션에서 읽는 저장된 문장카드 목록. 피드 카드의 "저장" 버튼이
// 여기다 쓰고, 완독스크롤 원본 스펙의 "보관함: 저장한 문장카드 리스트"에 해당.
export const useSavedCardsStore = create<SavedCardsState>()(
  persist(
    (set, get) => ({
      cards: [],
      isSaved: (id) => get().cards.some((c) => c.id === id),
      toggleSave: (card) => {
        const exists = get().cards.some((c) => c.id === card.id);
        if (exists) {
          set((s) => ({ cards: s.cards.filter((c) => c.id !== card.id) }));
          return false;
        }
        set((s) => ({ cards: [{ ...card, savedAt: new Date().toISOString() }, ...s.cards] }));
        return true;
      },
      removeCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
    }),
    { name: "bb-saved-cards" },
  ),
);
