import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions";
import { BottomNav } from "@/components/app/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-orange-50 via-amber-50/40 to-white">
      <header className="no-print sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-orange-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="북북" className="w-8 h-8 rounded-xl" />
            <span className="font-bold text-stone-700 text-sm">{user.name}님</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-xs text-stone-400 hover:text-stone-600">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5 pb-24">{children}</main>

      <BottomNav />
    </div>
  );
}
