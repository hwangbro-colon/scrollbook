import { prisma } from "@/lib/db";
import { loginAs } from "./actions";

// This page lists live user data and must never be statically prerendered
// at build time (which would require a reachable DB during `next build`).
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img
            src="/logo-icon.svg"
            alt="북북 BookBook"
            className="w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-orange-200 mx-auto"
          />
          <h1 className="text-2xl font-extrabold text-stone-800">북북 BookBook</h1>
          <p className="text-stone-500 mt-1 text-sm">함께 소리 내어 읽어요</p>
        </div>

        <section>
          <h2 className="text-xs font-bold text-stone-400 mb-3 tracking-wide">사용자로 시작하기</h2>
          <div className="grid grid-cols-2 gap-3">
            {users.map((u) => (
              <form key={u.id} action={loginAs.bind(null, u.id)}>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition p-4 text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-2">
                    {u.name[0]}
                  </div>
                  <p className="font-semibold text-stone-800 text-sm">{u.name}</p>
                  {u.email && <p className="text-xs text-stone-400 truncate">{u.email}</p>}
                </button>
              </form>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
