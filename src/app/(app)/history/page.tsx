import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStreak, formatDuration, toDateKey } from "@/lib/stats";

function dateLabel(d: Date) {
  if (isToday(d)) return "오늘";
  if (isYesterday(d)) return "어제";
  return format(d, "M월 d일 (E)", { locale: ko });
}

export default async function HistoryPage() {
  const user = await requireUser();

  const [sessions, books] = await Promise.all([
    prisma.readingSession.findMany({
      where: { userId: user.id },
      include: { book: true },
      orderBy: { date: "desc" },
    }),
    prisma.book.findMany(),
  ]);

  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSec, 0);
  const streak = calcStreak(sessions.map((s) => s.date));

  const maxEndPageByBook = new Map<string, number>();
  for (const s of sessions) {
    maxEndPageByBook.set(s.bookId, Math.max(maxEndPageByBook.get(s.bookId) ?? 0, s.endPage));
  }
  const booksCompleted = Array.from(maxEndPageByBook.entries()).filter(([bookId, endPage]) => {
    const book = books.find((b) => b.id === bookId);
    return book && endPage >= book.totalPages;
  }).length;

  const groups = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const key = toDateKey(s.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-stone-800">낭독 기록</h1>
          <p className="text-stone-400 text-sm mt-0.5">지금까지 쌓아온 낭독의 흔적이에요</p>
        </div>
        <Link
          href="/report"
          className="shrink-0 text-xs font-semibold px-3 py-2 rounded-full bg-orange-50 text-orange-500 hover:bg-orange-100 transition"
        >
          내 리포트 →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white border border-orange-100 px-3 py-3 text-center">
          <p className="text-lg font-black text-stone-800">{formatDuration(totalSeconds)}</p>
          <p className="text-[11px] text-stone-400 mt-1">총 낭독 시간</p>
        </div>
        <div className="rounded-2xl bg-white border border-orange-100 px-3 py-3 text-center">
          <p className="text-lg font-black text-stone-800">{booksCompleted}권</p>
          <p className="text-[11px] text-stone-400 mt-1">완독한 책</p>
        </div>
        <div className="rounded-2xl bg-white border border-orange-100 px-3 py-3 text-center">
          <p className="text-lg font-black text-orange-500">🔥 {streak}일</p>
          <p className="text-[11px] text-stone-400 mt-1">연속 낭독</p>
        </div>
      </div>

      {sessions.length === 0 && (
        <p className="text-center text-stone-400 text-sm py-12">아직 낭독 기록이 없어요. 오늘의 낭독을 시작해보세요!</p>
      )}

      <div className="flex flex-col gap-5">
        {Array.from(groups.entries()).map(([dateKey, daySessions]) => (
          <div key={dateKey}>
            <p className="text-xs font-bold text-stone-400 mb-2">{dateLabel(daySessions[0].date)}</p>
            <div className="flex flex-col gap-2">
              {daySessions.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white border border-orange-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{s.book.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {s.startPage}~{s.endPage}쪽 · {formatDuration(s.durationSec)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${
                        s.type === "solo" ? "bg-orange-50 text-orange-500" : "bg-indigo-50 text-indigo-500"
                      }`}
                    >
                      {s.type === "solo" ? "혼자 읽기" : s.type === "online" ? "함께 읽기" : "오프라인"}
                    </span>
                  </div>
                  {s.audioUrl && <audio controls src={s.audioUrl} className="w-full mt-3 h-9" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
