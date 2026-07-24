const DELAYS = [0, 0.12, 0.24, 0.36, 0.48, 0.36, 0.24, 0.12, 0];
const HEIGHTS = [14, 24, 34, 44, 54, 44, 34, 24, 14];

export function Waveform({ active = true }: { active?: boolean }) {
  return (
    <div className="flex items-end justify-center gap-1.5 h-14">
      {DELAYS.map((delay, i) => (
        <div
          key={i}
          className={`w-2 rounded-full bg-orange-400 ${active ? "wave-bar" : ""}`}
          style={{
            height: HEIGHTS[i],
            animationDelay: `${delay}s`,
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
