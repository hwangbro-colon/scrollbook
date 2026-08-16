import { BOOKS } from "../data/books";
import type { Book, Chunk } from "../types/book";

export type FeedItem = {
  book: Book;
  chapterTitle: string;
  chunk: Chunk;
  indexInBook: number; // 0-based position of this chunk within the book
  totalInBook: number;
};

// 완독스크롤 피드 — 원래 bookbook-scroll의 getFeedItems()와 같은 발상: 여러
// 책의 청크를 책 순서대로 이어붙인 하나의 평탄화 리스트. BB 데이터 모델엔
// bookbook-scroll처럼 "티저용 재구성 문장(bits)"과 "완독용 원문"이 분리돼
// 있지 않고 chunk 자체가 이미 (발췌든 전문이든) 실제 텍스트라서, 피드와
// 완독모드가 같은 chunk 배열을 공유한다 — 피드는 죽 훑어보는 용도, 완독모드는
// 거기서 처음부터 끝까지 순서대로 읽는 용도로 UI/네비게이션만 다름.
// 콘텐츠가 아직 없는 책(예: 티저만 있는 흥부전)은 피드에서 제외.
export function buildFeed(): FeedItem[] {
  const items: FeedItem[] = [];
  for (const book of BOOKS) {
    const chunks = book.chapters.flatMap((chapter) => chapter.chunks.map((chunk) => ({ chunk, chapterTitle: chapter.chapterTitle })));
    chunks.forEach(({ chunk, chapterTitle }, i) => {
      items.push({ book, chapterTitle, chunk, indexInBook: i, totalInBook: chunks.length });
    });
  }
  return items;
}

// 한 책의 전체 청크(장 경계 포함) — 완독모드 페이지네이션용.
export function flattenChapters(book: Book): { chunk: Chunk; chapterNumber: number; chapterTitle: string }[] {
  return book.chapters.flatMap((chapter) =>
    chapter.chunks.map((chunk) => ({ chunk, chapterNumber: chapter.chapterNumber, chapterTitle: chapter.chapterTitle })),
  );
}
