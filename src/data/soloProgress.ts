// Mock "혼자읽기" progress, shared between ReadingView (the 낭독 practice
// list) and HomeView (the "지금 읽고 있는 책" card) so both surfaces agree
// on the same in-progress book instead of drifting apart as separate mocks.
export type SoloProgress = { bookId: string; title: string; pct: number; lastReadAt: string };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const SOLO_BOOKS_MOCK: SoloProgress[] = [
  { bookId: "unsu-joheun-nal-1924", title: "운수 좋은 날", pct: 42, lastReadAt: daysAgo(1) },
  { bookId: "byeoljubujeon-classic", title: "별주부전", pct: 15, lastReadAt: daysAgo(9) },
];
