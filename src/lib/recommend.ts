import type { Book } from "../types/book";

export type RecommendReason = "similar_genre" | "friends_read" | "new";

export const RECOMMEND_REASON_LABEL: Record<RecommendReason, string> = {
  similar_genre: "최근 읽은 책과 비슷한 장르",
  friends_read: "친구들이 많이 읽은 책",
  new: "신간",
};

// No per-user reading history exists in this prototype, so "similar genre"
// falls back to the genre of the most popular book as a stand-in for "what
// this user has been reading." Still real logic, just a mocked signal.
export function getRecommendReason(book: Book, allBooks: Book[]): RecommendReason {
  if (book.isNew) return "new";

  const topGenre = allBooks.slice().sort((a, b) => (b.readCount ?? 0) - (a.readCount ?? 0))[0]?.genre;
  if (topGenre && book.genre === topGenre) return "similar_genre";

  return "friends_read";
}
