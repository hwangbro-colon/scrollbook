# 북북 (BookBook)

청소년 문해력 저하 문제를, **낭독(소리내어 함께 읽기)**과 **텍스트릴스형 독서("북북 스크롤")**로 풀어보는 독서 플랫폼의 클릭 가능한 프론트엔드 프로토타입입니다.

백엔드/실제 API 연동 없이 목업 데이터 + 로컬 상태(Zustand)로 동작하는 인터랙티브 프로토타입 수준으로 만들어졌습니다.

## 팀 정보

**팀 정민우**

| 이름 | 역할 |
|---|---|
| 황준민 | CTO / CFO |
| 정휘람 | CEO / CMO |
| 신윤우 | COO / CIO |

## 실행 방법

```bash
npm install
npm run dev
```

그 외 스크립트:

```bash
npm run build   # 타입체크 + 프로덕션 빌드
npm run lint    # oxlint
npm run preview # 빌드 결과 미리보기
```

## 폴더 구조

- `src/config/theme.ts` — 브랜드 컬러·코너 반경·폰트·로고 경로·앱 카피를 관리하는 단일 설정 파일. 여기 값만 바꾸면 앱 전체에 반영됩니다.
- `public/image.files/logo.png` — 앱 전체에서 참조하는 로고 이미지(교체하면 전체 반영).
- `src/data/books/` — 책 콘텐츠 데이터(JSON, 공공도메인 콘텐츠만). `src/types/book.ts`의 스키마를 따르며, `src/data/books/index.ts`에서 저작권 상태를 필터링해 로드합니다.
- `src/hooks/` — `useBook`/`useBookList` 등 데이터 조회 훅, `useCountUp`/`useSimulatedAsync` 등 UI 유틸 훅.
- `src/store/` — Zustand 전역 스토어 (`appStore`: 데일리 챌린지/스트릭/어휘/소모임/친구, `mileageStore`: 마일리지 적립·사용·쿠폰, `toastStore`: 토스트 큐).
- `src/components/common/` — 재사용 공용 컴포넌트(카드, 스켈레톤, 빈 화면, 에러 카드, 모달 등).
- `src/views/` — 5개 탭 화면(홈/낭독/스크롤/그룹/독서보조)과 마일리지·쿠폰함 화면.

## TODO

- [ ] 스크린샷/데모 GIF 추가
