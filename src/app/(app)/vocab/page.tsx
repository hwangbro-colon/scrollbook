import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addVocab, deleteVocab, toggleMemorized, updateVocab } from "./actions";

export default async function VocabPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireUser();
  const { edit: editId } = await searchParams;
  const entries = await prisma.vocabEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
  const memorizedCount = entries.filter((e) => e.memorized).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold text-stone-800">어휘 노트</h1>
        <p className="text-stone-400 text-sm mt-0.5">낭독하며 만난 어려운 단어를 모아보세요</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl bg-white border border-orange-100 px-4 py-3 text-center">
          <p className="text-lg font-black text-stone-800">{entries.length}개</p>
          <p className="text-[11px] text-stone-400 mt-1">전체 단어</p>
        </div>
        <div className="flex-1 rounded-2xl bg-white border border-orange-100 px-4 py-3 text-center">
          <p className="text-lg font-black text-emerald-500">{memorizedCount}개</p>
          <p className="text-[11px] text-stone-400 mt-1">암기 완료</p>
        </div>
      </div>

      <form action={addVocab} className="rounded-2xl bg-white border border-orange-100 p-4 flex flex-col gap-2">
        <p className="text-xs font-bold text-stone-400">새 단어 추가</p>
        <div className="flex gap-2">
          <input
            name="word"
            required
            placeholder="단어"
            className="w-24 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            name="meaning"
            required
            placeholder="뜻을 입력하세요"
            className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <button
          type="submit"
          className="self-end px-4 py-2 rounded-xl bg-orange-400 text-white text-sm font-semibold hover:bg-orange-500 transition"
        >
          추가
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="text-center text-stone-400 text-sm py-12">아직 등록한 단어가 없어요.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e) => {
            if (e.id === editId) {
              return (
                <form
                  key={e.id}
                  action={updateVocab}
                  className="rounded-2xl bg-orange-50 border border-orange-200 p-4 flex flex-col gap-2"
                >
                  <input type="hidden" name="id" value={e.id} />
                  <div className="flex gap-2">
                    <input
                      name="word"
                      required
                      defaultValue={e.word}
                      className="w-24 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <input
                      name="meaning"
                      required
                      defaultValue={e.meaning}
                      className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link
                      href="/vocab"
                      className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold hover:bg-stone-200 transition"
                    >
                      취소
                    </Link>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-full bg-orange-400 text-white text-xs font-semibold hover:bg-orange-500 transition"
                    >
                      저장
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={e.id}
                className="rounded-2xl bg-white border border-orange-100 p-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 text-sm">{e.word}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{e.meaning}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <form action={toggleMemorized.bind(null, e.id, !e.memorized)}>
                    <button
                      type="submit"
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                        e.memorized ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      {e.memorized ? "✓ 암기완료" : "암기 전"}
                    </button>
                  </form>
                  <div className="flex items-center gap-2">
                    <Link href={`/vocab?edit=${e.id}`} className="text-[11px] text-stone-400 hover:text-stone-600">
                      수정
                    </Link>
                    <details className="relative">
                      <summary className="cursor-pointer text-[11px] text-red-400 hover:text-red-500 list-none">
                        삭제
                      </summary>
                      <div className="absolute right-0 mt-1 z-10 flex items-center gap-1 rounded-xl border border-red-100 bg-white px-2 py-1.5 shadow-md whitespace-nowrap">
                        <span className="text-[11px] text-stone-500">삭제할까요?</span>
                        <form action={deleteVocab.bind(null, e.id)}>
                          <button type="submit" className="text-[11px] font-semibold text-red-500 hover:text-red-600">
                            확인
                          </button>
                        </form>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
