"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAudioRecorder } from "@/lib/audio";
import { formatDuration, formatMMSS } from "@/lib/stats";
import { Waveform } from "./Waveform";

type RecentBook = { title: string; lastEndPage: number };

export function SoloRecordingFlow({ recentBooks }: { recentBooks: RecentBook[] }) {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "recording" | "review" | "saved">("setup");
  const [bookTitle, setBookTitle] = useState("");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSummary, setSavedSummary] = useState<{ title: string; durationSec: number } | null>(null);

  const recorder = useAudioRecorder();

  const canRecord = bookTitle.trim().length > 0 && startPage !== "" && endPage !== "" && Number(endPage) > Number(startPage);

  const applyRecentBook = (b: RecentBook) => {
    setBookTitle(b.title);
    setStartPage(String(b.lastEndPage));
    setEndPage("");
  };

  const handleStart = async () => {
    await recorder.start();
    setStep("recording");
  };

  const handleStop = () => {
    recorder.stop();
    setStep("review");
  };

  const handleReRecord = () => {
    recorder.reset();
    setStep("setup");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const form = new FormData();
      if (recorder.audioBlob) form.set("audio", recorder.audioBlob, "recording.webm");
      form.set("bookTitle", bookTitle.trim());
      form.set("startPage", startPage);
      form.set("endPage", endPage);
      form.set("durationSec", String(recorder.elapsedSec));

      const res = await fetch("/api/recordings", { method: "POST", body: form });
      if (!res.ok) throw new Error("저장에 실패했습니다.");

      setSavedSummary({ title: bookTitle.trim(), durationSec: recorder.elapsedSec });
      setStep("saved");
      router.refresh();
    } catch {
      setSaveError("저장 중 문제가 발생했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleReadMore = () => {
    recorder.reset();
    setBookTitle("");
    setStartPage("");
    setEndPage("");
    setSavedSummary(null);
    setStep("setup");
  };

  const bookDatalistId = useMemo(() => "book-titles", []);

  if (step === "saved" && savedSummary) {
    return (
      <div className="rounded-3xl bg-white border border-orange-100 shadow-sm p-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-lg font-bold text-stone-800">오늘의 낭독 완료!</h2>
        <p className="text-stone-500 text-sm mt-1">
          「{savedSummary.title}」를 {formatDuration(savedSummary.durationSec)} 동안 읽었어요.
        </p>
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={handleReadMore}
            className="w-full py-3 rounded-2xl bg-orange-400 text-white font-semibold hover:bg-orange-500 transition"
          >
            더 읽기
          </button>
          <a
            href="/history"
            className="w-full py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition"
          >
            낭독 기록 보러가기
          </a>
        </div>
      </div>
    );
  }

  if (step === "recording") {
    return (
      <div className="rounded-3xl bg-white border border-orange-100 shadow-sm p-6 text-center">
        <p className="text-stone-400 text-sm mb-1">「{bookTitle}」 낭독 중</p>
        <p className="text-3xl font-black text-orange-500 tabular-nums mb-4">{formatMMSS(recorder.elapsedSec)}</p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-500 font-semibold">녹음 중</span>
        </div>
        <Waveform active />
        <button
          onClick={handleStop}
          className="mt-6 w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition text-white mx-auto flex items-center justify-center shadow-lg shadow-red-200"
          aria-label="녹음 정지"
        >
          <span className="w-6 h-6 rounded-md bg-white" />
        </button>
        <p className="text-xs text-stone-400 mt-3">다 읽었으면 눌러서 정지하세요</p>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="rounded-3xl bg-white border border-orange-100 shadow-sm p-6 text-center">
        <p className="text-stone-400 text-sm mb-1">「{bookTitle}」</p>
        <p className="text-2xl font-black text-stone-800 mb-4">{formatMMSS(recorder.elapsedSec)} 녹음됨</p>
        <Waveform active={false} />
        {recorder.audioUrl && (
          <audio controls src={recorder.audioUrl} className="w-full mt-4" />
        )}
        {saveError && <p className="text-red-500 text-xs mt-3">{saveError}</p>}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleReRecord}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition disabled:opacity-50"
          >
            다시 녹음
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-orange-400 text-white font-semibold hover:bg-orange-500 transition disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-orange-100 shadow-sm p-6">
      {recentBooks.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-stone-400 mb-2">최근에 읽은 책</p>
          <div className="flex flex-wrap gap-2">
            {recentBooks.map((b) => (
              <button
                key={b.title}
                onClick={() => applyRecentBook(b)}
                className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100 transition"
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="block mb-3">
        <span className="text-xs font-bold text-stone-400">책 제목</span>
        <input
          list={bookDatalistId}
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="예: 아몬드"
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <datalist id={bookDatalistId}>
          {recentBooks.map((b) => (
            <option key={b.title} value={b.title} />
          ))}
        </datalist>
      </label>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <label className="block">
          <span className="text-xs font-bold text-stone-400">시작 페이지</span>
          <input
            type="number"
            min={0}
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
            placeholder="0"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-400">끝 페이지</span>
          <input
            type="number"
            min={0}
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            placeholder="20"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </label>
      </div>

      {recorder.error && <p className="text-red-500 text-xs mb-3 text-center">{recorder.error}</p>}

      <button
        onClick={handleStart}
        disabled={!canRecord}
        className="w-24 h-24 rounded-full bg-orange-400 hover:bg-orange-500 disabled:bg-stone-200 disabled:cursor-not-allowed transition text-white mx-auto flex items-center justify-center shadow-lg shadow-orange-200 text-4xl"
        aria-label="낭독 녹음 시작"
      >
        🎙️
      </button>
      <p className="text-xs text-stone-400 text-center mt-3">
        {canRecord ? "눌러서 낭독을 시작하세요" : "책 제목과 페이지 범위를 입력해주세요"}
      </p>
    </div>
  );
}
