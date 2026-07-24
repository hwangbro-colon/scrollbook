import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStreak, formatDuration, toDateKey } from "@/lib/stats";
import { SoloRecordingFlow } from "@/components/app/SoloRecordingFlow";

export default async function HomePage() {
  const user = await requireUser();

  const sessions = await prisma.readingSession.findMany({
    where: { userId: user.id },
    include: { book: true },
    orderBy: { date: "desc" },
    take: 30,
  });

  const recentBooksMap = new Map<string, number>();
  for (const s of sessions) {
    if (!recentBooksMap.has(s.book.title)) recentBooksMap.set(s.book.title, s.endPage);
  }
  const recentBooks = Array.from(recentBooksMap.entries())
    .slice(0, 3)
    .map(([title, lastEndPage]) => ({ title, lastEndPage }));

  const streak = calcStreak(sessions.map((s) => s.date));
  const todayKey = toDateKey(new Date());
  const todaysSessions = sessions.filter((s) => toDateKey(s.date) === todayKey);
  const todaysSeconds = todaysSessions.reduce((sum, s) => sum + s.durationSec, 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold text-stone-800">오늘의 낭독</h1>
        <p className="text-stone-400 text-sm mt-0.5">소리 내어 읽고 목소리로 기록을 남겨보세요</p>
      </div>

      {(streak > 0 || todaysSeconds > 0) && (
        <div className="flex gap-3">
          {streak > 0 && (
            <div className="flex-1 rounded-2xl bg-orange-400 text-white px-4 py-3">
              <p className="text-2xl font-black leading-none">🔥 {streak}</p>
              <p className="text-xs mt-1 opacity-90">연속 낭독일</p>
            </div>
          )}
          {todaysSeconds > 0 && (
            <div className="flex-1 rounded-2xl bg-white border border-orange-100 px-4 py-3">
              <p className="text-2xl font-black leading-none text-stone-800">{formatDuration(todaysSeconds)}</p>
              <p className="text-xs mt-1 text-stone-400">오늘 읽은 시간</p>
            </div>
          )}
        </div>
      )}

      <SoloRecordingFlow recentBooks={recentBooks} />
    </div>
  );
}
