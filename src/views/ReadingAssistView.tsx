import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, BarChart3, Loader2 } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useEssayStore } from "../store/essayStore";
import { useToastStore } from "../store/toastStore";
import { useSimulatedAsync } from "../hooks/useSimulatedAsync";
import { useBook } from "../hooks/useBook";
import { CURRENT_BOOK_ID } from "../data/currentBook";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { EmptyState } from "../components/common/EmptyState";
import { ChartSkeleton, Skeleton } from "../components/common/Skeleton";
import { FlashcardReview } from "../components/common/FlashcardReview";

const LAST_MONTH_MINUTES = 145;

const CHART = [
  { label: "월", heightPct: 35, hi: false, minutes: 12, books: ["운수 좋은 날"] },
  { label: "화", heightPct: 55, hi: false, minutes: 19, books: ["운수 좋은 날"] },
  { label: "수", heightPct: 80, hi: true, minutes: 28, books: ["별주부전", "운수 좋은 날"] },
  { label: "목", heightPct: 40, hi: false, minutes: 14, books: [] as string[] },
  { label: "금", heightPct: 65, hi: false, minutes: 22, books: ["별주부전"] },
  { label: "토", heightPct: 90, hi: true, minutes: 31, books: ["별주부전", "운수 좋은 날"] },
  { label: "일", heightPct: 50, hi: false, minutes: 17, books: ["운수 좋은 날"] },
];
const THIS_MONTH_MINUTES = CHART.reduce((sum, b) => sum + b.minutes, 0) * 4;
const QUIZ_SUBMIT_DELAY_MS = 400;

export function ReadingAssistView() {
  const vocabList = useAppStore((s) => s.vocabList);
  const addVocab = useAppStore((s) => s.addVocab);
  const wrongQuizCounts = useAppStore((s) => s.wrongQuizCounts);
  const recordQuizAnswer = useAppStore((s) => s.recordQuizAnswer);
  const showToast = useToastStore((s) => s.show);
  const addEssay = useEssayStore((s) => s.addEssay);
  const book = useBook(CURRENT_BOOK_ID);

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [creativeText, setCreativeText] = useState("");
  const [shareEssay, setShareEssay] = useState(false);
  const [creativeSubmitted, setCreativeSubmitted] = useState(false);

  const vocabAsync = useSimulatedAsync({ delayMs: 600 });
  const reportAsync = useSimulatedAsync({ delayMs: 750 });
  const hasReportData = CHART.some((b) => b.heightPct > 0);
  const monthDiff = THIS_MONTH_MINUTES - LAST_MONTH_MINUTES;

  const suggestedWords = (book?.vocabCandidates ?? []).filter(
    (c) => !vocabList.some((v) => v.word === c.word),
  );

  const wrongCount = book ? (wrongQuizCounts[book.id] ?? 0) : 0;
  const usingEasyQuiz = wrongCount >= 2 && !!book?.comprehensionQuizEasy;
  const activeQuiz = usingEasyQuiz ? book!.comprehensionQuizEasy! : book?.comprehensionQuiz;

  const handleAdd = () => {
    if (!word.trim() || !meaning.trim()) {
      const message = "단어와 뜻을 모두 입력해 주세요";
      setFormError(message);
      showToast(message);
      return;
    }
    setFormError(null);
    addVocab({ word: word.trim(), meaning: meaning.trim() });
    setWord("");
    setMeaning("");
  };

  const handleQuizSelect = (idx: number) => {
    if (quizAnswered || quizSubmitting || !book) return;
    setQuizSubmitting(true);
    setTimeout(() => {
      setQuizSelected(idx);
      setQuizAnswered(true);
      setQuizSubmitting(false);
      recordQuizAnswer(book.id, !!activeQuiz?.options[idx]?.correct);
    }, QUIZ_SUBMIT_DELAY_MS);
  };

  const handleSubmitCreative = () => {
    if (!creativeText.trim() || !book) return;
    if (shareEssay) addEssay({ bookId: book.id, bookTitle: book.title, text: creativeText.trim() });
    setCreativeSubmitted(true);
    showToast(shareEssay ? "감상문으로 공유했어요" : "기록했어요");
  };

  return (
    <ScreenScroll>
      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        독서보조
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">어휘노트 · 리포트 · AI 복습퀴즈</p>

      <SectionHead first title="어휘노트" action="더보기" />

      {vocabAsync.status === "loading" && (
        <div className="flex flex-col gap-2.5 border-[1.5px] border-[var(--color-line)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
          <Skeleton height={14} />
          <Skeleton height={14} width="80%" />
          <Skeleton height={14} width="65%" />
        </div>
      )}
      {vocabAsync.status === "success" && (
        <div className="border-[1.5px] border-[var(--color-ink)] px-4 py-3" style={{ borderRadius: "var(--radius-card)" }}>
          <div className="mb-2.5 flex gap-2">
            <input
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="새 단어"
              aria-invalid={!!formError}
              className="min-w-0 flex-1 border-0 border-b-[1.5px] bg-transparent py-1.5 text-[12px] text-[var(--color-ink)] outline-none"
              style={{ borderColor: formError ? "#D64545" : "var(--color-line)" }}
            />
            <input
              value={meaning}
              onChange={(e) => {
                setMeaning(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="뜻"
              aria-invalid={!!formError}
              className="min-w-0 flex-1 border-0 border-b-[1.5px] bg-transparent py-1.5 text-[12px] text-[var(--color-ink)] outline-none"
              style={{ borderColor: formError ? "#D64545" : "var(--color-line)" }}
            />
            <button
              type="button"
              onClick={handleAdd}
              aria-label="어휘 추가"
              className="flex-none bg-[var(--color-accent)] px-3.5 text-[11px] font-extrabold text-white"
              style={{ borderRadius: "var(--radius-btn)" }}
            >
              추가
            </button>
          </div>
          {formError && <p className="mb-2 text-[11px] font-semibold text-[#D64545]">{formError}</p>}

          {vocabList.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="아직 저장한 단어가 없어요"
              description="낭독이나 스크롤을 하며 모르는 단어를 저장해보세요"
              action={
                <div className="mt-1 flex gap-2">
                  <Link
                    to="/reading"
                    className="border-[1.5px] border-[var(--color-ink)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-ink)]"
                    style={{ borderRadius: "var(--radius-btn)" }}
                  >
                    낭독하러 가기
                  </Link>
                  <Link
                    to="/scroll"
                    className="bg-[var(--color-ink)] px-3 py-1.5 text-[11px] font-bold text-white"
                    style={{ borderRadius: "var(--radius-btn)" }}
                  >
                    스크롤 읽기
                  </Link>
                </div>
              }
            />
          ) : (
            <>
              {vocabList.map((v, i) => (
                <div
                  key={`${v.word}-${i}`}
                  className={`flex items-center justify-between py-2.5 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}
                >
                  <div>
                    <b className="text-[13px] text-[var(--color-ink)]">{v.word}</b>
                    {v.sourceBookTitle && (
                      <span
                        className="ml-2 inline-block text-[9px] font-bold"
                        style={{ padding: "2px 6px", borderRadius: "var(--radius-chip)", background: "var(--color-accent-tint)", color: "var(--color-accent)" }}
                      >
                        📖 {v.sourceBookTitle}
                        {v.sourceChapter ? ` ${v.sourceChapter}장` : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-[11.5px] text-[var(--color-ink-soft)]">{v.meaning}</span>
                </div>
              ))}
              {!flashcardsOpen && (
                <button
                  type="button"
                  onClick={() => setFlashcardsOpen(true)}
                  className="mt-3 w-full border-[1.5px] border-[var(--color-ink)] py-2 text-[11.5px] font-bold text-[var(--color-ink)]"
                  style={{ borderRadius: "var(--radius-btn)" }}
                >
                  🔁 플래시카드로 복습하기
                </button>
              )}
            </>
          )}
        </div>
      )}

      {flashcardsOpen && vocabList.length > 0 && (
        <div className="mt-3">
          <FlashcardReview entries={vocabList} onClose={() => setFlashcardsOpen(false)} />
        </div>
      )}

      {suggestedWords.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-[10.5px] font-bold text-[var(--color-ink-soft)]">
            {book?.title}에서 추천하는 단어
          </p>
          {suggestedWords.map((c) => (
            <div
              key={c.word}
              className="flex items-center justify-between border border-dashed border-[var(--color-line)] px-4 py-2.5"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <div>
                <b className="text-[12.5px] text-[var(--color-ink)]">{c.word}</b>
                <span className="ml-2 text-[11px] text-[var(--color-ink-soft)]">{c.meaning}</span>
              </div>
              <button
                type="button"
                onClick={() => addVocab({ word: c.word, meaning: c.meaning, sourceBookTitle: book?.title })}
                aria-label={`${c.word} 어휘노트에 추가`}
                className="flex-none border-[1.5px] border-[var(--color-ink)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--color-ink)]"
                style={{ borderRadius: "var(--radius-btn)" }}
              >
                추가
              </button>
            </div>
          ))}
        </div>
      )}

      <SectionHead title="이번달 리포트" />
      {reportAsync.status === "loading" && (
        <div className="border-[1.5px] border-[var(--color-line)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
          <ChartSkeleton />
        </div>
      )}
      {reportAsync.status === "success" &&
        (!hasReportData ? (
          <EmptyState icon={BarChart3} title="완독한 책이 없어서 리포트가 비어있어요" description="첫 낭독을 완료하면 리포트가 채워져요" />
        ) : (
          <div className="border-[1.5px] border-[var(--color-ink)] p-4" style={{ borderRadius: "var(--radius-card)" }}>
            <p className="mb-3 text-[12px] font-bold" style={{ color: monthDiff >= 0 ? "var(--color-accent)" : "var(--color-ink-soft)" }}>
              {monthDiff >= 0 ? `지난달보다 ${monthDiff}분 더 읽었어요 📈` : `지난달보다 ${Math.abs(monthDiff)}분 적게 읽었어요`}
            </p>
            <div className="flex h-16 items-end gap-2">
              {CHART.map((bar, i) => (
                <button
                  key={bar.label}
                  type="button"
                  onClick={() => setSelectedDay(i)}
                  className="flex-1"
                  style={{
                    height: `${bar.heightPct}%`,
                    background: selectedDay === i ? "var(--color-ink)" : bar.hi ? "var(--color-accent)" : "var(--color-paper-dim)",
                    borderRadius: "3px 3px 1px 1px",
                  }}
                  aria-label={`${bar.label}요일 ${bar.minutes}분`}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {CHART.map((bar) => (
                <span key={bar.label} className="flex-1 text-center text-[9.5px] font-semibold text-[var(--color-ink-soft)]">
                  {bar.label}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-center text-[10px] text-[var(--color-ink-soft)]">막대를 탭하면 그날 읽은 책을 볼 수 있어요</p>
            {selectedDay !== null && (
              <div className="mt-2.5 bg-[var(--color-paper-dim)] px-3.5 py-2.5" style={{ borderRadius: "var(--radius-btn)" }}>
                <p className="text-[10.5px] font-bold text-[var(--color-ink)]">
                  {CHART[selectedDay].label}요일 · {CHART[selectedDay].minutes}분
                </p>
                {CHART[selectedDay].books.length === 0 ? (
                  <p className="mt-1 text-[10.5px] text-[var(--color-ink-soft)]">이 날은 기록이 없어요.</p>
                ) : (
                  <p className="mt-1 text-[10.5px] text-[var(--color-ink-soft)]">{CHART[selectedDay].books.join(", ")}</p>
                )}
              </div>
            )}
          </div>
        ))}

      <SectionHead title="AI 자동생성 복습퀴즈" />
      {book && (
        <div className="border-[1.5px] border-[var(--color-ink)] px-4" style={{ borderRadius: "var(--radius-card)" }}>
          <div className="py-3.5">
            <div className="mb-2 flex items-center gap-1.5">
              <span
                className="inline-block text-[9px] font-extrabold uppercase tracking-[.04em]"
                style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-paper-dim)", color: "var(--color-ink-soft)" }}
              >
                오답 복습
              </span>
              {usingEasyQuiz && (
                <span
                  className="inline-block text-[9px] font-extrabold uppercase tracking-[.04em]"
                  style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-accent-tint)", color: "var(--color-accent)" }}
                >
                  쉬운 문제로 바꿨어요
                </span>
              )}
            </div>
            <p className="mb-3 text-[12.5px] font-semibold leading-[1.4] text-[var(--color-ink)]">{activeQuiz?.question}</p>
            <div className="flex flex-col gap-2">
              {activeQuiz?.options.map((opt, i) => {
                const showCorrect = quizAnswered && opt.correct;
                const isSelected = quizSelected === i;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={quizAnswered || quizSubmitting}
                    onClick={() => handleQuizSelect(i)}
                    className="flex items-center justify-between border-[1.5px] px-3 py-2 text-left text-[12px] font-semibold"
                    style={{
                      borderRadius: "var(--radius-btn)",
                      borderColor: showCorrect ? "var(--color-accent)" : "var(--color-line)",
                      background: showCorrect ? "var(--color-accent-tint)" : "var(--color-paper)",
                      color: showCorrect ? "var(--color-accent)" : "var(--color-ink)",
                      opacity: quizAnswered && !isSelected && !showCorrect ? 0.55 : 1,
                    }}
                  >
                    {opt.text}
                    {quizSubmitting && isSelected && <Loader2 size={13} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {quizAnswered && (
              <p className="mt-2.5 text-[11.5px] font-bold" style={{ color: quizSelected !== null && activeQuiz?.options[quizSelected]?.correct ? "var(--color-accent)" : "var(--color-ink-soft)" }}>
                {quizSelected !== null && activeQuiz?.options[quizSelected]?.correct ? "정답이에요! 👏" : "괜찮아요, 다음에 또 만나요"}
              </p>
            )}
          </div>
          <div className="border-t border-[var(--color-line)] py-3.5">
            <span
              className="mb-2 inline-block text-[9px] font-extrabold uppercase tracking-[.04em]"
              style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-accent-tint)", color: "var(--color-accent)" }}
            >
              작가의 의도 · 평가가 아니라 기록이에요
            </span>
            <p className="mb-2.5 text-[12.5px] font-semibold leading-[1.4] text-[var(--color-ink)]">{book.creativeQuiz.question}</p>
            {creativeSubmitted ? (
              <p className="text-[11.5px] font-semibold text-[var(--color-accent)]">기록해주셔서 고마워요!</p>
            ) : (
              <>
                <textarea
                  value={creativeText}
                  onChange={(e) => setCreativeText(e.target.value)}
                  rows={3}
                  placeholder="정답은 없어요. 자유롭게 적어보세요"
                  className="w-full border-[1.5px] border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-[12px] text-[var(--color-ink)] outline-none"
                  style={{ borderRadius: "var(--radius-btn)" }}
                />
                <label className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--color-ink-soft)]">
                  <input type="checkbox" checked={shareEssay} onChange={(e) => setShareEssay(e.target.checked)} />
                  그룹원과 감상문으로 공유하기
                </label>
                <button
                  type="button"
                  disabled={!creativeText.trim()}
                  onClick={handleSubmitCreative}
                  className="mt-2.5 w-full bg-[var(--color-accent)] py-2 text-[11.5px] font-extrabold text-white disabled:opacity-50"
                  style={{ borderRadius: "var(--radius-btn)" }}
                >
                  기록하기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </ScreenScroll>
  );
}
