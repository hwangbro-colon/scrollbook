"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home", label: "오늘의 낭독", icon: "🎙️" },
  { href: "/history", label: "기록", icon: "📖" },
  { href: "/vocab", label: "어휘 노트", icon: "📝" },
  { href: "/sessions", label: "함께 읽기", icon: "👥" },
  { href: "/groups", label: "그룹", icon: "🏠" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed sm:absolute bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-orange-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/home" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                active ? "text-orange-500" : "text-stone-400"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
