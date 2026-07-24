export const VENUE_CATEGORY_LABEL: Record<string, string> = {
  study_cafe: "스터디카페",
  library: "도서관",
  bookstore: "독립서점",
  cafe: "카페",
};

export const VENUE_CATEGORY_ICON: Record<string, string> = {
  study_cafe: "✏️",
  library: "📚",
  bookstore: "📖",
  cafe: "☕",
};

export function avgStars(ratings: { stars: number }[]): number | null {
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
}
