import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Toast } from "./Toast";

// No shared Topbar anymore — the new 4-tab scope has each view own its
// header (홈 has the logo + N/N counter, 책장 has the logo + search, 프로필
// has the settings gear), since they're different enough that a single
// generic bar no longer fits all of them. See individual views.
// Sizing/frame is owned by PhoneFrame now — this just fills it.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      <BottomNav />
      <Toast />
    </div>
  );
}
