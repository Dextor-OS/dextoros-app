import clsx from "clsx";

// A 3x3 capability grid with the lit cells tracing a D.
const CELLS = [
  [1, 1, 0],
  [1, 0, 1],
  [1, 1, 0],
];

export function LogoMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true" className={className}>
      {CELLS.flatMap((row, y) =>
        row.map((on, x) => (
          <rect
            key={`${x}-${y}`}
            x={x * 6.5}
            y={y * 6.5}
            width="5"
            height="5"
            rx="1.2"
            fill="currentColor"
            opacity={on ? 1 : 0.2}
          />
        )),
      )}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5 text-fog", className)}>
      <LogoMark />
      {/* Wordmark from the brand logo: regular "Dextor", heavy "OS". */}
      <span className="logo-word font-sans text-[18px] font-medium leading-none tracking-[-0.015em]">
        Dextor<span className="font-extrabold tracking-[-0.02em]">OS</span>
      </span>
    </span>
  );
}
