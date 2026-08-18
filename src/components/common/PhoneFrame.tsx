import type { ReactNode } from "react";

// Wraps whatever's currently on screen (splash / login / the tab app) in a
// CSS-only iPhone bezel for desktop/tablet viewers — spec calls for the
// prototype to live "iPhone 목업 프레임 안에서." This owns the one device
// viewport box (size + rounded corners + overflow clip); children just fill
// it with h-full, they don't each define their own sizing. Below the `sm`
// breakpoint (real phones) the bezel/notch/home-indicator don't render and
// the viewport box fills the real viewport edge-to-edge, so this is
// presentation-only chrome, never something the app depends on.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-frame flex items-center justify-center sm:p-12">
      <div className="relative w-full max-w-md sm:w-[390px]">
        <div className="phone-frame__notch hidden sm:block" aria-hidden="true" />
        <div
          className="hidden sm:block"
          style={{ position: "absolute", inset: "-20px", borderRadius: "48px", border: "20px solid #050505", pointerEvents: "none" }}
          aria-hidden="true"
        />
        <div
          className="relative mx-auto flex h-svh w-full flex-col overflow-hidden bg-[var(--color-paper)] sm:my-4 sm:h-[calc(100vh-2rem)]"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          {children}
        </div>
        <div className="phone-frame__home-indicator hidden sm:block" aria-hidden="true" />
      </div>
    </div>
  );
}
