"use client";

import { useLiveCount } from "@/lib/store/fleet";

export function LiveCount() {
  const { live, total } = useLiveCount();
  if (total === 0) return <span className="text-sm text-dim">No robots connected</span>;
  return (
    <div className="flex items-center gap-2 text-sm text-haze">
      {live > 0 && <span className="live-dot" aria-hidden="true" />}
      <span className="mono text-[13px] text-fog">{live}</span>
      <span>
        of {total} <span className="hidden sm:inline">robots </span>live
      </span>
    </div>
  );
}
