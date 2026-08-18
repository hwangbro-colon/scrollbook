import { BOOKS } from "../data/books";
import { splitIntoPhrases } from "./textSplit";
import type { Book, Chunk } from "../types/book";

export type FeedItem = {
  book: Book;
  chapterTitle: string;
  chunk: Chunk; // full source chunk — kept for 저장/공유 (a saved/shared card still captures the whole excerpt, not just the one phrase on screen)
  phraseKey: string; // unique per phrase page — chunkId + sentence/phrase index
  text: string; // the short phrase (~10-20자) shown on this page
  indexInBook: number; // 0-based position of this PHRASE within the book's flattened phrase list
  totalInBook: number;
};

// 완독스크롤 피드 — 원래 bookbook-scroll의 getFeedItems()와 같은 발상: 여러
// 책의 청크를 책 순서대로 이어붙인 하나의 평탄화 리스트. 다만 한 페이지에
// 청크 전체(문장 여러 개)를 보여주던 것에서, 한 페이지 = 문장 하나를 더 짧게
// 쪼갠 구절(10~20자) 하나로 세분화함 — 스크롤 리듬을 더 잘게, 더 가볍게.
// 콘텐츠가 아직 없는 책(예: 티저만 있는 흥부전)은 피드에서 제외.
export function buildFeed(): FeedItem[] {
  const items: FeedItem[] = [];
  for (const book of BOOKS) {
    const phraseUnits = book.chapters.flatMap((chapter) =>
      chapter.chunks.flatMap((chunk) =>
        chunk.sentences.flatMap((sentence, sIdx) =>
          splitIntoPhrases(sentence).map((text, pIdx) => ({
            chapterTitle: chapter.chapterTitle,
            chunk,
            text,
            phraseKey: `${chunk.chunkId}-${sIdx}-${pIdx}`,
          })),
        ),
      ),
    );
    phraseUnits.forEach((u, i) => {
      items.push({ book, chapterTitle: u.chapterTitle, chunk: u.chunk, text: u.text, phraseKey: u.phraseKey, indexInBook: i, totalInBook: phraseUnits.length });
    });
  }
  return items;
}

export type ReadPage = { chapterNumber: number; chapterTitle: string; chunkId: string; phraseKey: string; text: string };

// 한 책의 전체 페이지(장 경계 포함, 구절 단위) — 완독모드 페이지네이션용.
export function flattenChapters(book: Book): ReadPage[] {
  return book.chapters.flatMap((chapter) =>
    chapter.chunks.flatMap((chunk) =>
      chunk.sentences.flatMap((sentence, sIdx) =>
        splitIntoPhrases(sentence).map((text, pIdx) => ({
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.chapterTitle,
          chunkId: chunk.chunkId,
          phraseKey: `${chunk.chunkId}-${sIdx}-${pIdx}`,
          text,
        })),
      ),
    ),
  );
}
