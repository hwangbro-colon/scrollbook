import type { ReactNode } from "react";

// Wraps each route's rendered view so it fades/slides in on mount. Since
// react-router mounts a fresh element per route match, this naturally
// re-triggers on every navigation without extra plumbing.
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col animate-page-in motion-reduce:animate-none">{children}</div>;
}
