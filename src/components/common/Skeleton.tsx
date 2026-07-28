export function Skeleton({
  width = "100%",
  height = 14,
  radius,
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  radius?: string;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-paper-dim)] motion-reduce:animate-none ${className}`}
      style={{ width, height, borderRadius: radius ?? "var(--radius-chip)" }}
      aria-hidden="true"
    />
  );
}

// Ready-made skeleton shapes for the sections that load asynchronously.
export function BookRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-28 flex-none">
          <Skeleton height={140} radius="8px" />
          <Skeleton height={10} width="70%" className="mt-1.5" />
        </div>
      ))}
    </div>
  );
}

export function EssayRowSkeleton({ first = false }: { first?: boolean }) {
  return (
    <div className={`flex gap-2.5 py-3 ${first ? "" : "border-t border-[var(--color-line)]"}`}>
      <Skeleton width={30} height={30} radius="var(--radius-avatar)" />
      <div className="flex-1">
        <Skeleton height={11} width="30%" />
        <Skeleton height={12} className="mt-1.5" />
        <Skeleton height={12} width="60%" className="mt-1" />
      </div>
    </div>
  );
}

export function RowSkeleton({ first = false }: { first?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 py-[11px] ${first ? "" : "border-t border-[var(--color-line)]"}`}>
      <Skeleton width={38} height={38} radius="10px" />
      <div className="flex-1">
        <Skeleton height={12} width="50%" />
        <Skeleton height={10} width="35%" className="mt-1.5" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex h-16 items-end gap-2">
      {[35, 55, 80, 40, 65, 90, 50].map((h, i) => (
        <Skeleton key={i} height={`${h}%`} className="flex-1" radius="3px 3px 1px 1px" />
      ))}
    </div>
  );
}
