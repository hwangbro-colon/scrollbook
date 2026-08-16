import { create } from "zustand";
import { BOOKS } from "../data/books";

// Which book 홈 탭's scroll reader currently shows. 홈 IS the reader in this
// scope (no separate book-detail screen) — picking a book on 책장 just sets
// this and sends the user to 홈. Defaults to the first book that actually
// has content, since a teaser-only entry (empty chapters) can't be read.
const firstReadable = BOOKS.find((b) => b.chapters.length > 0);

type ReadingSelectionState = {
  selectedBookId: string | null;
  selectBook: (bookId: string) => void;
};

export const useReadingSelectionStore = create<ReadingSelectionState>((set) => ({
  selectedBookId: firstReadable?.id ?? null,
  selectBook: (bookId) => set({ selectedBookId: bookId }),
}));
