"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { LogLine } from "@/lib/domain/types";

/** History for one robot, newest at the bottom. Follows new lines unless the reader has scrolled up. */
export function LogList({ lines, label, className }: { lines: LogLine[]; label: string; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const onScroll = () => {
    const el = ref.current;
    if (el) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
  };

  return (
    <ol
      ref={ref}
      onScroll={onScroll}
      aria-live="polite"
      aria-label={label}
      className={clsx("mono overflow-y-auto rounded-control bg-void/60 p-3 text-[12px] leading-6 ring-1 ring-line", className)}
    >
      {lines.map((line) => (
        <li key={line.id} className="grid grid-cols-[4.5rem_2.75rem_minmax(0,1fr)] gap-2">
          <span className="text-dim">{line.time}</span>
          <span className={line.kind === "error" ? "text-danger" : "text-dim"}>{line.kind}</span>
          <span className={clsx("break-words", line.kind === "cmd" ? "text-fog" : "text-haze")}>
            {line.kind === "cmd" ? `> ${line.text}` : line.text}
          </span>
        </li>
      ))}
      {lines.length === 0 && <li className="text-dim">Nothing logged yet. Type help to start.</li>}
    </ol>
  );
}
