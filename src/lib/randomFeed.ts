import { BOOKS } from "../data/books";
import { useEssayStore } from "../store/essayStore";

export type QuoteFeedItem = {
  kind: "quote";
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  text: string;
};

export type AdFeedItem = {
  kind: "ad";
  id: string;
  partnerName: string;
  headline: string;
  body: string;
};

export type ReviewFeedItem = {
  kind: "review";
  id: string;
  essayId: string;
};

export type FeedItem = QuoteFeedItem | AdFeedItem | ReviewFeedItem;

// Mock sponsor placeholders — spec calls for a dashed-border "협찬" card with
// no real ad system behind it, so these are static and non-clickable beyond
// a toast (see AdCard in RandomReelFeed.tsx).
const AD_MOCKS: Omit<AdFeedItem, "kind" | "id">[] = [
  { partnerName: "은행나무출판사", headline: "요즘 청소년 필독서, 다시 만나보세요", body: "베스트셀러 고전 시리즈 소장판 20% 할인 중" },
  { partnerName: "문학동네", headline: "이 가을, 낭독으로 완독해보세요", body: "북북 회원 전용 신간 사전예약 진행 중" },
];

function seededShuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function collectQuotes(): QuoteFeedItem[] {
  const quotes: QuoteFeedItem[] = [];
  for (const book of BOOKS) {
    for (const chapter of book.chapters) {
      for (const chunk of chapter.chunks) {
        if (chunk.sentences.length === 0) continue;
        // One quote per chunk, picking a single representative sentence so
        // cards stay reel-sized (a "구절") rather than a full reading page.
        const text = chunk.sentences[Math.floor(Math.random() * chunk.sentences.length)];
        quotes.push({ kind: "quote", id: `q-${chunk.chunkId}`, bookId: book.id, bookTitle: book.title, bookAuthor: book.author, text });
      }
    }
  }
  return quotes;
}

// Builds one shuffled, interleaved 릴스 feed: 구절 카드 mostly, with a 감상문
// card dropped in roughly every 4th slot and an 광고 카드 every 7th. Review
// cards only carry an essayId — RandomReelFeed looks the live essay up from
// essayStore at render time so likes stay in sync without reshuffling.
export function buildRandomFeed(): FeedItem[] {
  const essays = useEssayStore.getState().essays;
  const quotes = seededShuffle(collectQuotes());
  const reviews: ReviewFeedItem[] = essays.map((e) => ({ kind: "review", id: `r-${e.id}`, essayId: e.id }));
  const ads: AdFeedItem[] = AD_MOCKS.map((a, i) => ({ ...a, kind: "ad", id: `ad-${i}` }));

  const result: FeedItem[] = [];
  let reviewI = 0;
  let adI = 0;
  quotes.forEach((q, i) => {
    result.push(q);
    if ((i + 1) % 4 === 0 && reviewI < reviews.length) {
      result.push(reviews[reviewI]);
      reviewI += 1;
    }
    if ((i + 1) % 7 === 0 && adI < ads.length) {
      result.push(ads[adI]);
      adI += 1;
    }
  });
  result.push(...reviews.slice(reviewI), ...ads.slice(adI));
  return result;
}
