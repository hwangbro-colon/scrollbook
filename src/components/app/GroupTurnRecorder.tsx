"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAudioRecorder } from "@/lib/audio";
import { formatMMSS } from "@/lib/stats";
import { Waveform } from "./Waveform";

export function GroupTurnRecorder({
  groupSessionId,
  bookTitle,
  startPage,
  endPage,
}: {
  groupSessionId: string;
  bookTitle: string;
  startPage: number;
  endPage: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const recorder = useAudioRecorder();

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      if (recorder.audioBlob) form.set("audio", recorder.audioBlob, "recording.webm");
      form.set("bookTitle", bookTitle);
      form.set("startPage", String(startPage));
      form.set("endPage", String(endPage));
      form.set("durationSec", String(recorder.elapsedSec));
      form.set("groupSessionId", groupSessionId);

      const res = await fetch("/api/recordings", { method: "POST", body: form });
      if (!res.ok) throw new Error("저장 실패");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (recorder.audioBlob) {
    return (
      <div className="text-center">
        <p className="text-2xl font-black text-stone-800 mb-3">{formatMMSS(recorder.elapsedSec)} 녹음됨</p>
        {recorder.audioUrl && <audio controls src={recorder.audioUrl} className="w-full mb-4" />}
        <div className="flex gap-2">
          <button
            onClick={recorder.reset}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition disabled:opacity-50"
          >
            다시 녹음
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {saving ? "저장 중..." : "내 차례 완료"}
          </button>
        </div>
      </div>
    );
  }

  if (recorder.isRecording) {
    return (
      <div className="text-center">
        <p className="text-3xl font-black text-indigo-500 tabular-nums mb-4">{formatMMSS(recorder.elapsedSec)}</p>
        <Waveform active />
        <button
          onClick={recorder.stop}
          className="mt-6 w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition text-white mx-auto flex items-center justify-center shadow-lg shadow-red-200"
          aria-label="녹음 정지"
        >
          <span className="w-6 h-6 rounded-md bg-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      {recorder.error && <p className="text-red-500 text-xs mb-3">{recorder.error}</p>}
      <button
        onClick={recorder.start}
        className="w-24 h-24 rounded-full bg-indigo-500 hover:bg-indigo-600 transition text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 text-4xl"
        aria-label="내 차례 녹음 시작"
      >
        🎙️
      </button>
      <p className="text-xs text-stone-400 mt-3">내 차례예요! 눌러서 낭독을 시작하세요</p>
    </div>
  );
}
