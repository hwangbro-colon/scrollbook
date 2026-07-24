import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { formatDuration, toDateKey } from "@/lib/stats";
import { ReportChart } from "./ReportChart";

export async function ReportView({ userId }: { userId: string }) {
  const [sessions, vocabs, report] = await Promise.all([
    prisma.readingSession.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { date: "asc" },
    }),
    prisma.vocabEntry.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.monthlyReport.findFirst({ where: { userId }, orderBy: { month: "desc" } }),
  ]);

  const last14 = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    return d;
  });
  const minutesByDate = new Map<string, number>();
  for (const s of sessions) {
    const key = toDateKey(s.date);
    minutesByDate.set(key, (minutesByDate.get(key) ?? 0) + Math.round(s.durationSec / 60));
  }
  const chartData = last14.map((d) => ({
    label: format(d, "M/d"),
    minutes: minutesByDate.get(toDateKey(d)) ?? 0,
  }));

  const bookMap = new Map<string, { title: string; author: string; totalPages: number; maxEndPage: number }>();
  for (const s of sessions) {
    const existing = bookMap.get(s.bookId);
    if (existing) {
      existing.maxEndPage = Math.max(existing.maxEndPage, s.endPage);
    } else {
      bookMap.set(s.bookId, {
        title: s.book.title,
        author: s.book.author,
        totalPages: s.book.totalPages,
        maxEndPage: s.endPage,
      });
    }
  }
  const books = Array.from(bookMap.values());

  const totalSec = sessions.reduce((sum, s) => sum + s.durationSec, 0);
  const memorizedCount = vocabs.filter((v) => v.memorized).length;
  const monthLabel = report
    ? format(new Date(`${report.month}-01`), "yyyy년 M월", { locale: ko })
    : format(new Date(), "yyyy년 M월", { locale: ko });

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5">
      <p className="text-slate-400 text-xs mb-5">{monthLabel}</p>

      <div className="grid grid-cols-3 gap-2 mb-8">
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center">
          <p className="text-base font-black text-slate-800">{formatDuration(totalSec)}</p>
          <p className="text-[11px] text-slate-400 mt-1">총 낭독 시간</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center">
          <p className="text-base font-black text-slate-800">{books.filter((b) => b.maxEndPage >= b.totalPages).length}권</p>
          <p className="text-[11px] text-slate-400 mt-1">완독한 책</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center">
          <p className="text-base font-black text-slate-800">
            {vocabs.length}개 <span className="text-emerald-500">({memorizedCount})</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">어휘 노트</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-600 mb-3">최근 14일 낭독 시간 추이</h2>
        <ReportChart data={chartData} />
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-600 mb-3">읽은 책</h2>
        <div className="flex flex-col gap-2">
          {books.length === 0 && <p className="text-slate-400 text-sm">아직 읽은 책이 없어요.</p>}
          {books.map((b) => {
            const done = b.maxEndPage >= b.totalPages;
            const pct = Math.min(100, Math.round((b.maxEndPage / b.totalPages) * 100));
            return (
              <div key={b.title} className="flex items-center justify-between text-sm rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-700">{b.title}</p>
                  <p className="text-xs text-slate-400">{b.author}</p>
                </div>
                <span className={`text-xs font-semibold ${done ? "text-emerald-600" : "text-slate-400"}`}>
                  {done ? "완독" : `${pct}%`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-600 mb-3">어휘 노트 요약</h2>
        {vocabs.length === 0 ? (
          <p className="text-slate-400 text-sm">등록된 단어가 없어요.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {vocabs.slice(0, 16).map((v) => (
              <span
                key={v.id}
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  v.memorized ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                {v.word}
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold text-slate-600 mb-3">성장 코멘트</h2>
        <div className="rounded-2xl bg-indigo-50 px-5 py-4 text-sm text-slate-700 leading-relaxed">
          {report?.summary ?? "이번 달 낭독 활동 데이터가 아직 충분하지 않아요."}
        </div>
      </section>
    </div>
  );
}
