import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGroupSession, startSession } from "./actions";
import { SessionTabs } from "@/components/app/SessionTabs";

export default async function SessionsPage() {
  const user = await requireUser();

  const [otherUsers, groups] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: user.id } },
      orderBy: { name: "asc" },
    }),
    prisma.groupSession.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: { book: true, participants: { include: { user: true }, orderBy: { turnOrder: "asc" } } },
      orderBy: { schedule: "desc" },
    }),
  ]);

  const active = groups.filter((g) => g.status === "active");
  const scheduled = groups.filter((g) => g.status === "scheduled");
  const ended = groups.filter((g) => g.status === "ended");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-stone-800">함께 읽기</h1>
        <p className="text-stone-400 text-sm mt-0.5">친구들과 순서대로 소리 내어 읽어요</p>
      </div>

      <SessionTabs active="online" />

      <details className="rounded-2xl bg-white border border-orange-100 p-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-orange-500 list-none flex items-center justify-between">
          + 새 세션 만들기
          <span className="text-stone-300 group-open:rotate-180 transition">⌄</span>
        </summary>
        <form action={createGroupSession} className="mt-4 flex flex-col gap-3">
          <label className="block">
            <span className="text-xs font-bold text-stone-400">책 제목</span>
            <input
              name="bookTitle"
              required
              placeholder="예: 기억 전달자"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-stone-400">시작 페이지</span>
              <input
                type="number"
                name="startPage"
                required
                defaultValue={0}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-stone-400">끝 페이지</span>
              <input
                type="number"
                name="endPage"
                required
                placeholder="60"
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </label>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-400">함께 읽을 친구</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {otherUsers.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-sm has-[:checked]:bg-orange-50 has-[:checked]:border-orange-300 has-[:checked]:text-orange-600"
                >
                  <input type="checkbox" name="participantIds" value={c.id} className="accent-orange-500" />
                  {c.name}
                </label>
              ))}
              {otherUsers.length === 0 && <p className="text-xs text-stone-400">초대할 다른 사용자가 없어요</p>}
            </div>
          </div>
          <button
            type="submit"
            className="mt-1 w-full py-3 rounded-2xl bg-orange-400 text-white font-semibold hover:bg-orange-500 transition"
          >
            세션 만들고 바로 시작하기
          </button>
        </form>
      </details>

      {active.length > 0 && (
        <section>
          <p className="text-xs font-bold text-stone-400 mb-2">진행 중</p>
          <div className="flex flex-col gap-2">
            {active.map((g) => (
              <Link
                key={g.id}
                href={`/sessions/${g.id}`}
                className="block rounded-2xl bg-indigo-50 border border-indigo-100 p-4 hover:bg-indigo-100/70 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800 text-sm">{g.book.title}</p>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-indigo-500 text-white">진행 중</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  참여자 {g.participants.map((p) => p.user.name).join(", ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {scheduled.length > 0 && (
        <section>
          <p className="text-xs font-bold text-stone-400 mb-2">다가오는 세션</p>
          <div className="flex flex-col gap-2">
            {scheduled.map((g) => (
              <div key={g.id} className="rounded-2xl bg-white border border-orange-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800 text-sm">{g.book.title}</p>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-stone-100 text-stone-500">
                    {format(g.schedule, "M월 d일 (E) HH:mm", { locale: ko })}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  참여자 {g.participants.map((p) => p.user.name).join(", ")}
                </p>
                <form action={startSession.bind(null, g.id)} className="mt-3">
                  <button type="submit" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-400 text-white">
                    지금 시작하기
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {ended.length > 0 && (
        <section>
          <p className="text-xs font-bold text-stone-400 mb-2">완료된 세션</p>
          <div className="flex flex-col gap-2">
            {ended.map((g) => (
              <Link
                key={g.id}
                href={`/sessions/${g.id}`}
                className="block rounded-2xl bg-white border border-orange-100 p-4 hover:border-orange-300 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800 text-sm">{g.book.title}</p>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">종료</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  참여자 {g.participants.map((p) => p.user.name).join(", ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {groups.length === 0 && (
        <p className="text-center text-stone-400 text-sm py-8">아직 함께 읽기 세션이 없어요. 새 세션을 만들어보세요!</p>
      )}
    </div>
  );
}
