import { useState } from "react";
import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { ProfilePanel } from "./ProfilePanel";
import { Toast } from "./Toast";

export function AppShell({ children }: { children: ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div
      className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[var(--color-paper)] shadow-xl sm:my-4 sm:min-h-[calc(100vh-2rem)]"
      style={{ borderRadius: "var(--radius-card)" }}
    >

      <Topbar onProfileClick={() => setProfileOpen(true)} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      <BottomNav />
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      <Toast />
    </div>
  );
}
