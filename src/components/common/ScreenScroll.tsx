import type { ReactNode } from "react";

// Equivalent of the reference's `.bb-scroll` — the padded, independently
// scrollable content area used by every view except ScrollView (which
// manages its own full-bleed layout).
export function ScreenScroll({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[88px] pt-[18px]">{children}</div>;
}
