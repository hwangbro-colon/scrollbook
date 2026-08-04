export type CopyrightStatus = "public_domain";

export type BookGenre = "고전소설" | "수필" | "동화" | "시";

export type Chunk = {
  chunkId: string;
  sentences: string[];
};

export type Chapter = {
  chapterNumber: number;
  chapterTitle: string;
  chunks: Chunk[];
};

export type VocabCandidate = { word: string; meaning: string };

export type ComprehensionQuizOption = { text: string; correct: boolean };

export type ComprehensionQuiz = {
  question: string;
  options: ComprehensionQuizOption[];
};

export type CreativeQuiz = { question: string };

export type Book = {
  id: string;
  title: string;
  author: string;
  yearPublished: number;
  copyrightStatus: CopyrightStatus;
  /** Required — where the text was sourced from. Surfaced in the UI. */
  source: string;
  genre: BookGenre;
  coverColor: string;
  estimatedReadMinutes: number;
  chapters: Chapter[];
  vocabCandidates: VocabCandidate[];
  comprehensionQuiz: ComprehensionQuiz;
  /** Easier fallback shown by 복습퀴즈 after 2+ consecutive wrong answers on `comprehensionQuiz`. */
  comprehensionQuizEasy?: ComprehensionQuiz;
  creativeQuiz: CreativeQuiz;

  // Mock fields simulating fields a real backend would compute —
  // "신간", "인기순" etc. are simulated here rather than derived from any
  // real signal.
  isNew?: boolean;
  readCount?: number;
  addedAt?: string;
  /** Mock ranking deltas for the 홈 trending list's 일간/주간 toggle. */
  rankChangeDaily?: number;
  rankChangeWeekly?: number;
};
