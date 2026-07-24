import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDuration } from "@/lib/stats";
import { simulateTurn } from "../actions";
import { GroupTurnRecorder } from "@/components/app/GroupTurnRecorder";

export default async function GroupSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const group = await prisma.groupSession.findUnique({
    where: { id },
    include: {
      book: true,
      participants: { include: { user: true }, orderBy: { turnOrder: "asc" } },
      sessions: true,
    },
  });
  if (!group) notFound();

  const n = group.participants.length;
  const totalPages = group.planEndPage - group.planStartPage;
  const chunk = n > 0 ? Math.ceil(totalPages / n) : 0;
  const ranges = group.participants.map((_, idx) => ({
    start: group.planStartPage + idx * chunk,
    end: Math.min(group.planStartPage + (idx + 1) * chunk, group.planEndPage),
  }));

  const doneByUser = new Map(group.sessions.map((s) => [s.userId, s]));
  const currentIndex = group.participants.findIndex((p) => !doneByUser.has(p.userId));
  const isEnded = group.status === "ended" || currentIndex === -1;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold text-stone-800">{group.book.title}</h1>
        <p className="text-stone-400 text-sm mt-0.5">
          {group.planStartPage}~{group.planEndPage}쪽 · 참여자 {n}명
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-indigo-100 p-4">
        <p className="text-xs font-bold text-stone-400 mb-3">낭독 순서</p>
        <div className="flex flex-col gap-2">
          {group.participants.map((p, idx) => {
            const done = doneByUser.get(p.userId);
            const isCurrent = !isEnded && idx === currentIndex;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                  isCurrent ? "bg-indigo-50 border border-indigo-200" : "bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      done ? "bg-emerald-500 text-white" : isCurrent ? "bg-indigo-500 text-white" : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <span className="text-sm font-medium text-stone-700">
                    {p.user.name}
                    {p.userId === user.id ? " (나)" : ""}
                  </span>
                </div>
                <span className="text-xs text-stone-400">
                  {done ? formatDuration(done.durationSec) : `${ranges[idx].start}~${ranges[idx].end}쪽`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isEnded ? (
        <div className="rounded-3xl bg-white border border-emerald-100 p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-lg font-bold text-stone-800">세션이 끝났어요!</h2>
          <p className="text-stone-500 text-sm mt-1 mb-4">모두 함께 「{group.book.title}」를 낭독했어요</p>
          <div className="flex flex-col gap-2">
            {group.participants.map((p) => {
              const done = doneByUser.get(p.userId);
              return (
                <div key={p.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-stone-50">
                  <span className="font-medium text-stone-700">{p.user.name}</span>
                  <span className="text-stone-400">{done ? formatDuration(done.durationSec) : "-"}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-indigo-100 p-6">
          {group.participants[currentIndex].userId === user.id ? (
            <GroupTurnRecorder
              groupSessionId={group.id}
              bookTitle={group.book.title}
              startPage={ranges[currentIndex].start}
              endPage={ranges[currentIndex].end}
            />
          ) : (
            <div className="text-center">
              <p className="text-sm text-stone-500 mb-1">지금 차례</p>
              <p className="text-lg font-bold text-stone-800 mb-4">
                {group.participants[currentIndex].user.name} 학생이 낭독 중이에요
              </p>
              <p className="text-xs text-stone-400 mb-4">
                다른 기기에서 낭독하고 있어요. (시연용: 아래 버튼으로 진행을 시뮬레이션할 수 있어요)
              </p>
              <form
                action={simulateTurn.bind(
                  null,
                  group.id,
                  group.participants[currentIndex].userId,
                  group.bookId,
                  ranges[currentIndex].start,
                  ranges[currentIndex].end,
                )}
              >
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-indigo-100 text-indigo-600 text-sm font-semibold hover:bg-indigo-200 transition"
                >
                  다음 차례로 진행하기 (시뮬레이션)
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
