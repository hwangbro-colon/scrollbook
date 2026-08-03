import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, BarChart3 } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useToastStore } from "../store/toastStore";
import { useSimulatedAsync } from "../hooks/useSimulatedAsync";
import { useBook } from "../hooks/useBook";
import { CURRENT_BOOK_ID } from "../data/currentBook";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";
import { EmptyState } from "../components/common/EmptyState";
import { ChartSkeleton, Skeleton } from "../components/common/Skeleton";

const CHART = [
  { label: "월", heightPct: 35, hi: false },
  { label: "화", heightPct: 55, hi: false },
  { label: "수", heightPct: 80, hi: true },
  { label: "목", heightPct: 40, hi: false },
  { label: "금", heightPct: 65, hi: false },
  { label: "토", heightPct: 90, hi: true },
  { label: "일", heightPct: 50, hi: false },
];

export function ReadingAssistView() {
  const vocabList = useAppStore((s) => s.vocabList);
  const addVocab = useAppStore((s) => s.addVocab);
  const showToast = useToastStore((s) => s.show);
  const book = useBook(CURRENT_BOOK_ID);

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const vocabAsync = useSimulatedAsync({ delayMs: 600 });
  const reportAsync = useSimulatedAsync({ delayMs: 750 });
  const hasReportData = CHART.some((b) => b.heightPct > 0);

  const suggestedWords = (book?.vocabCandidates ?? []).filter(
    (c) => !vocabList.some((v) => v.word === c.word),
  );

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
            vocabList.map((v, i) => (
              <div
                key={`${v.word}-${i}`}
                className={`flex items-center justify-between py-2.5 ${i === 0 ? "" : "border-t border-[var(--color-line)]"}`}
              >
                <b className="text-[13px] text-[var(--color-ink)]">{v.word}</b>
                <span className="text-[11.5px] text-[var(--color-ink-soft)]">{v.meaning}</span>
              </div>
            ))
          )}
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
                onClick={() => addVocab({ word: c.word, meaning: c.meaning })}
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
            <div className="flex h-16 items-end gap-2">
              {CHART.map((bar) => (
                <div
                  key={bar.label}
                  className="flex-1"
                  style={{
                    height: `${bar.heightPct}%`,
                    background: bar.hi ? "var(--color-accent)" : "var(--color-paper-dim)",
                    borderRadius: "3px 3px 1px 1px",
                  }}
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
          </div>
        ))}

      <SectionHead title="AI 자동생성 복습퀴즈" />
      {book && (
        <div className="border-[1.5px] border-[var(--color-ink)] px-4" style={{ borderRadius: "var(--radius-card)" }}>
          <div className="py-3.5">
            <span
              className="mb-2 inline-block text-[9px] font-extrabold uppercase tracking-[.04em]"
              style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-paper-dim)", color: "var(--color-ink-soft)" }}
            >
              오답 복습
            </span>
            <p className="text-[12.5px] font-semibold leading-[1.4] text-[var(--color-ink)]">{book.comprehensionQuiz.question}</p>
          </div>
          <div className="border-t border-[var(--color-line)] py-3.5">
            <span
              className="mb-2 inline-block text-[9px] font-extrabold uppercase tracking-[.04em]"
              style={{ padding: "3px 8px", borderRadius: "var(--radius-chip)", background: "var(--color-accent-tint)", color: "var(--color-accent)" }}
            >
              작가의 의도
            </span>
            <p className="text-[12.5px] font-semibold leading-[1.4] text-[var(--color-ink)]">{book.creativeQuiz.question}</p>
          </div>
        </div>
      )}
    </ScreenScroll>
  );
}
