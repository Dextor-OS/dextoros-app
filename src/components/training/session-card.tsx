"use client";

import clsx from "clsx";
import Link from "next/link";
import type { CSSProperties } from "react";
import { platformLabel } from "@/lib/domain/platforms";
import type { SkillState, TrainingSession } from "@/lib/domain/types";
import { PHASE_LABEL, sessionRate, sessionTotal } from "@/lib/engine/skills";
import { robotPath } from "@/lib/routes";
import { fleetActions, useFleet } from "@/lib/store/fleet";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function SessionCard({ session, skill }: { session: TrainingSession; skill: SkillState }) {
  const { robots } = useFleet();
  const { phase, paused } = session;
  const busy = phase === "training" || phase === "evaluating";
  const live = (phase === "collecting" && !paused) || busy;
  const lanes = Object.keys(session.episodes);
  const collected = sessionTotal(session);

  return (
    <div className="panel min-w-0 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/skills/${skill.id}`} className="text-[15px] font-medium text-fog hover:underline">
            {skill.name}
          </Link>
          <p className="text-[12.5px] text-dim">
            Started {session.startedAt} from v{session.baseVersion}
          </p>
        </div>
        <p className="inline-flex items-center gap-2 text-[13px] text-haze" aria-live="polite">
          {live && <span className="live-dot" aria-hidden="true" />}
          {paused ? "Paused" : PHASE_LABEL[phase]}
          {phase === "collecting" && (
            <span className="mono text-[12px] text-dim">
              {collected}/{session.target}
            </span>
          )}
        </p>
      </div>

      <div className="relative mt-3 h-px bg-line" aria-hidden="true">
        <span
          className={clsx("train-progress absolute inset-0 bg-volt", !live && phase !== "published" && "opacity-50")}
          style={{ transform: `scaleX(${phase === "collecting" ? collected / session.target : phase === "published" ? 1 : session.progress})` } as CSSProperties}
        />
      </div>

      <ul className="mt-2">
        {lanes.map((id, i) => {
          const episodes = session.episodes[id];
          const robot = robots.find((r) => r.id === id);
          return (
            <li key={id} className="grid grid-cols-[5.75rem_minmax(0,1fr)_4.5rem] items-center gap-3 border-t border-line py-3 first:border-t-0 sm:grid-cols-[9rem_minmax(0,1fr)_6rem]">
              <div className="min-w-0">
                <Link href={robotPath(id)} className="mono text-[12.5px] text-fog hover:underline">
                  {id}
                </Link>
                <p className="text-[12px] leading-tight text-dim">{robot ? platformLabel(robot.platform) : "Removed"}</p>
              </div>
              <div className="flex h-5 items-end justify-end gap-[3px] overflow-hidden" aria-hidden="true">
                {episodes.map((ok, n) => (
                  <span key={n} className="ep" data-ok={ok} />
                ))}
              </div>
              <div className="text-right">
                {phase === "published" ? (
                  <span className="chip-in mono text-[12px] text-volt-ink" style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                    v{session.publishedVersion} in use
                  </span>
                ) : (
                  <span className="mono text-[12.5px] text-haze">
                    {episodes.length} <span className="text-dim">ep</span>
                  </span>
                )}
              </div>
            </li>
          );
        })}
        {lanes.length === 0 && <li className="py-3 text-[13px] text-dim">No capable robot was online when this session started.</li>}
      </ul>

      <ol className="mono mt-3 rounded-control bg-void/60 p-3 text-[12px] leading-6 text-haze ring-1 ring-line">
        {session.log.map((line) => (
          <li key={line.id} className="break-words">
            {line.text}
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {phase === "collecting" && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => (paused ? fleetActions.resumeSession(session.id) : fleetActions.pauseSession(session.id))}>
            {paused ? "Resume session" : "Pause session"}
          </button>
        )}
        {phase === "published" && session.result && (
          <p className="text-[13px] text-haze">
            v{session.publishedVersion} succeeds <span className="mono text-fog">{pct(session.result.rate)}</span> of held-out episodes, up from {pct(session.result.previous)}.
          </p>
        )}
        {phase === "collecting" && (
          <p className="text-[13px] text-dim">Session success rate {pct(sessionRate(session))}. Failed attempts are kept for training too.</p>
        )}
      </div>
    </div>
  );
}
