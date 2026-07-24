import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGroup, joinGroup } from "./actions";

export default async function GroupsPage() {
  const user = await requireUser();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: { group: { include: { members: true } } },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-stone-800">그룹</h1>
        <p className="text-stone-400 text-sm mt-0.5">함께 낭독하는 사람들을 그룹으로 모아보세요</p>
      </div>

      <details className="rounded-2xl bg-white border border-orange-100 p-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-orange-500 list-none flex items-center justify-between">
          + 그룹 만들기 / 참여하기
          <span className="text-stone-300 group-open:rotate-180 transition">⌄</span>
        </summary>

        <form action={createGroup} className="mt-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-stone-400">새 그룹 만들기</span>
          <div className="flex gap-2">
            <input
              name="name"
              required
              placeholder="예: 3반 낭독모임"
              className="flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-orange-400 text-white text-sm font-semibold hover:bg-orange-500 transition"
            >
              만들기
            </button>
          </div>
        </form>

        <form action={joinGroup} className="mt-4 flex flex-col gap-2 pt-4 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400">초대 코드로 참여하기</span>
          <div className="flex gap-2">
            <input
              name="inviteCode"
              required
              placeholder="예: READ-3TQ9"
              className="flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-stone-800 text-white text-sm font-semibold hover:bg-stone-700 transition"
            >
              참여
            </button>
          </div>
        </form>
      </details>

      <div className="flex flex-col gap-2">
        {memberships.length === 0 && (
          <p className="text-center text-stone-400 text-sm py-8">아직 속한 그룹이 없어요. 그룹을 만들거나 초대 코드로 참여해보세요!</p>
        )}
        {memberships.map(({ group }) => {
          const isHost = group.hostUserId === user.id;
          return (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block rounded-2xl bg-white border border-orange-100 p-4 hover:border-orange-300 transition"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-stone-800 text-sm">{group.name}</p>
                {isHost && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-orange-400 text-white">방장</span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1">멤버 {group.members.length}명</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
