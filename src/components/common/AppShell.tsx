import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { Toast } from "./Toast";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto flex h-svh w-full max-w-md flex-col overflow-hidden bg-[var(--color-paper)] shadow-xl sm:my-4 sm:h-[calc(100vh-2rem)]"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <Topbar />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      <BottomNav />
      <Toast />
    </div>
  );
}
