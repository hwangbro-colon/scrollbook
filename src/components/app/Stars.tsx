export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={`text-amber-400 tracking-tight ${className}`}>
      {"★".repeat(rounded)}
      <span className="text-stone-200">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}
