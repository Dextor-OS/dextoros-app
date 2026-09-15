import { SAMPLES } from "@/lib/engine/sim";

/** Link latency over the last 48 samples. A volt dot marks the newest sample only while the robot is live. */
export function Sparkline({ values, live, height = 44 }: { values: number[]; live: boolean; height?: number }) {
  if (values.length < 2) {
    return (
      <p className="mono flex items-center text-[12px] text-dim" style={{ height }}>
        No signal
      </p>
    );
  }
  const width = 240;
  const min = 15;
  const max = 70;
  const step = width / (SAMPLES - 1);
  const offset = SAMPLES - values.length;
  const points = values.map((v, i) => [(i + offset) * step, height - ((v - min) / (max - min)) * height] as const);
  const path = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const lastY = points[points.length - 1][1];

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        <path d={path} fill="none" stroke="var(--color-haze)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      </svg>
      {live && (
        <span
          className="absolute right-0 size-[6px] -translate-y-1/2 translate-x-1/2 rounded-full bg-volt"
          style={{ top: `${(lastY / height) * 100}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
