import Link from "next/link";

export function SessionTabs({ active }: { active: "online" | "offline" }) {
  const tabs = [
    { key: "online", label: "온라인 세션", href: "/sessions" },
    { key: "offline", label: "오프라인 북클럽", href: "/sessions/offline" },
  ] as const;

  return (
    <div className="flex gap-2 rounded-2xl bg-white border border-orange-100 p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`flex-1 text-center text-sm font-semibold py-2 rounded-xl transition ${
            active === t.key ? "bg-orange-400 text-white" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
