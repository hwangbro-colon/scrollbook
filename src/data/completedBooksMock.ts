// 프로필 탭 "총 기록" 섹션용 완독 기록 목업. 실제 앱의 BOOKS 카탈로그에 있는
// 책(콘텐츠가 실제로 존재하는 것)만 참조 — 실제로 읽을 수 없는 책이 완독
// 기록에 뜨는 모순을 피하기 위함. 나중에 실 데이터 연동 시 이 파일을
// "완독 이벤트 로그 조회" API 호출로 교체하면 됨(화면 코드는 그대로).
export type CompletedBookEntry = { bookId: string; completedAt: string };

export const COMPLETED_BOOKS_MOCK: CompletedBookEntry[] = [{ bookId: "unsu-joheun-nal-1924", completedAt: "2026-08-12" }];

// 책장 탭 "거의 다 읽은" 태그용 — 완독까지는 아니지만 진행 중인 것으로 보여줄
// 책. COMPLETED_BOOKS_MOCK과 겹치지 않게 유지.
export const ALMOST_DONE_BOOK_IDS: string[] = ["byeoljubujeon-classic"];
