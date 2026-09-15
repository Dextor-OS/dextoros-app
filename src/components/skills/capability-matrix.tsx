"use client";

import clsx from "clsx";
import Link from "next/link";
import type { CSSProperties } from "react";
import { platformLabel } from "@/lib/domain/platforms";
import type { Robot, SkillState } from "@/lib/domain/types";
import { canRun, rankRobots, statusFor } from "@/lib/engine/skills";
import { CAPABILITIES } from "@/lib/fleet";
import { robotPath } from "@/lib/routes";

const ROW_MS = 150;

/** Robots against the capabilities a skill needs. A scan line checks the fleet whenever the skill or version changes. */
export function CapabilityMatrix({ skill, robots, recordingId }: { skill: SkillState; robots: Robot[]; recordingId?: string | null }) {
  const rows = rankRobots(robots, skill);
  // The scan line replays whenever this key changes: a different skill or a new version.
  const scanKey = `${skill.id}-v${skill.version}`;

  return (
    <div className="fm relative overflow-x-auto">
      <table className="fm-table">
        <caption className="sr-only">Robots that can run {skill.name}</caption>
        <colgroup>
          <col className="w-[38%] sm:w-[28%]" />
          {CAPABILITIES.map((c) => (
            <col key={c.id} />
          ))}
          <col className="hidden sm:table-column sm:w-[26%]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="pl-2 text-left text-[12px] font-normal text-dim sm:pl-3">
              Robot
            </th>
            {CAPABILITIES.map((c) => (
              <th
                key={c.id}
                scope="col"
                data-need={skill.needs.includes(c.id)}
                className="fm-col-head mono text-center text-[10px] font-normal uppercase text-dim [font-stretch:75%] sm:text-[11px]"
              >
                <abbr title={c.label} className="no-underline">
                  {c.short}
                </abbr>
              </th>
            ))}
            <th scope="col" className="hidden pr-3 text-left text-[12px] font-normal text-dim sm:table-cell">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((robot, i) => {
            const status = statusFor(robot, skill);
            const result = canRun(robot, skill) ? "learned" : "blocked";
            const recording = robot.id === recordingId;
            const text = (
              <StatusText key={`${scanKey}-${recording}-${status.text}`} kind={recording ? "recording" : status.kind} text={status.text} />
            );
            return (
              <tr
                key={robot.id}
                className="fm-row"
                data-result={result}
                data-recording={recording}
                style={{ "--reveal": recording ? "0ms" : `${i * ROW_MS + 110}ms` } as CSSProperties}
              >
                <th scope="row" className="pl-2 text-left font-normal sm:pl-3">
                  <span className="flex items-center gap-2">
                    <Link href={robotPath(robot.id)} className="mono text-[12.5px] text-fog hover:underline">
                      {robot.id}
                    </Link>
                    {robot.id === skill.teacher && (
                      <span className="hidden rounded-tag px-1.5 py-px text-[11px] text-haze ring-1 ring-line-strong sm:inline-block">Teacher</span>
                    )}
                  </span>
                  <span className="hidden text-[12px] leading-tight text-dim sm:block">{platformLabel(robot.platform)}</span>
                  <span className="block text-[11.5px] leading-tight sm:hidden">{text}</span>
                </th>
                {CAPABILITIES.map((c) => {
                  const has = robot.caps.includes(c.id);
                  const need = skill.needs.includes(c.id);
                  return (
                    <td key={c.id} className="fm-td" data-need={need}>
                      <span className="fm-cell" data-has={has} data-need={need} aria-hidden="true" />
                      <span className="sr-only">{has ? `Has ${c.label}` : `No ${c.label}`}</span>
                    </td>
                  );
                })}
                <td className="hidden pr-3 text-[12.5px] sm:table-cell">{text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div key={scanKey} aria-hidden="true" className="fm-scan" style={{ "--rows": rows.length } as CSSProperties} />
    </div>
  );
}

function StatusText({ kind, text }: { kind: "learned" | "taught" | "pending" | "blocked" | "recording"; text: string }) {
  if (kind === "recording") {
    return (
      <span className="fm-status text-fog">
        <span className="live-dot" aria-hidden="true" />
        Recording demo
      </span>
    );
  }
  return (
    <span
      className={clsx(
        "fm-status",
        kind === "learned" || kind === "taught" ? "mono text-[11.5px] text-volt-ink" : kind === "pending" ? "text-dim" : "text-haze",
      )}
    >
      {text}
    </span>
  );
}
