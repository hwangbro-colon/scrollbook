import Link from "next/link";
import { notFound } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStreak, formatDuration } from "@/lib/stats";
import { leaveGroup } from "../actions";

function activityLabel(d: Date) {
  if (isToday(d)) return "오늘";
  if (isYesterday(d)) return "어제";
  return format(d, "M월 d일 (E)", { locale: ko });
}

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const group = await prisma.group.findUnique({
    where: { id },
    include: { members: { include: { user: true }, orderBy: { joinedAt: "asc" } } },
  });
  if (!group) notFound();

  const isMember = group.members.some((m) => m.userId === user.id);
  if (!isMember) notFound();

  const isHost = group.hostUserId === user.id;
  const memberIds = group.members.map((m) => m.userId);

  const sessions = await prisma.readingSession.findMany({
    where: { userId: { in: memberIds } },
    orderBy: { date: "desc" },
  });

  const statsByUser = new Map(
    group.members.map((m) => {
      const own = sessions.filter((s) => s.userId === m.userId);
      return [
        m.userId,
        {
          count: own.length,
          totalSec: own.reduce((sum, s) => sum + s.durationSec, 0),
          streak: calcStreak(own.map((s) => s.date)),
          lastDate: own[0]?.date ?? null,
        },
      ];
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-stone-800">{group.name}</h1>
          {isHost && <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-orange-400 text-white">방장</span>}
        </div>
        <p className="text-stone-400 text-sm mt-0.5">멤버 {group.members.length}명이 함께 읽고 있어요</p>
      </div>

      <div className="rounded-2xl bg-white border border-orange-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400">초대 코드</p>
          <p className="font-mono font-bold text-stone-800 tracking-wider">{group.inviteCode}</p>
        </div>
        {!isHost && (
          <form action={leaveGroup.bind(null, group.id)}>
            <button type="submit" className="text-xs text-stone-400 hover:text-red-500">
              그룹 나가기
            </button>
          </form>
        )}
      </div>

      <section>
        <h2 className="text-xs font-bold text-stone-400 mb-2">멤버별 낭독 현황</h2>
        <div className="flex flex-col gap-2">
          {group.members.map((m) => {
            const stat = statsByUser.get(m.userId)!;
            const memberIsHost = m.userId === group.hostUserId;
            const card = (
              <div
                className={`rounded-2xl bg-white border p-4 transition ${
                  isHost ? "border-orange-100 hover:border-orange-300" : "border-orange-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800 text-sm">
                    {m.user.name}
                    {m.userId === user.id && <span className="text-stone-400 font-normal"> (나)</span>}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {memberIsHost && (
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-500">방장</span>
                    )}
                    {isHost && <span className="text-indigo-600 font-semibold text-xs">리포트 →</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 mt-3 text-xs">
                  <div>
                    <span className="text-stone-400">참여 횟수 </span>
                    <span className="text-stone-700 font-medium">{stat.count}회</span>
                  </div>
                  <div>
                    <span className="text-stone-400">총 낭독 </span>
                    <span className="text-stone-700 font-medium">{formatDuration(stat.totalSec)}</span>
                  </div>
                  <div>
                    <span className="text-stone-400">연속 낭독 </span>
                    <span className="text-stone-700 font-medium">{stat.streak > 0 ? `🔥 ${stat.streak}일` : "-"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400">최근 활동 </span>
                    <span className="text-stone-700 font-medium">{stat.lastDate ? activityLabel(stat.lastDate) : "없음"}</span>
                  </div>
                </div>
              </div>
            );

            return isHost ? (
              <Link key={m.id} href={`/groups/${group.id}/members/${m.userId}`}>
                {card}
              </Link>
            ) : (
              <div key={m.id}>{card}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
