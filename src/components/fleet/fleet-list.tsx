"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { platformLabel } from "@/lib/domain/platforms";
import type { FleetFilter, Robot } from "@/lib/domain/types";
import { activityLabel, isOnline, lastLatency } from "@/lib/engine/sim";
import { filterRobots, useFleet } from "@/lib/store/fleet";

const FILTERS: FleetFilter[] = ["all", "online", "offline"];

function signal(robot: Robot) {
  if (!isOnline(robot)) return "No signal";
  return `${lastLatency(robot)} ms`;
}

function power(robot: Robot) {
  if (robot.kind === "arm") return isOnline(robot) ? `${robot.temp.toFixed(1)} °C` : "No data";
  return `${Math.round(robot.battery)}%`;
}

export function FleetList() {
  const { robots } = useFleet();
  const [filter, setFilter] = useState<FleetFilter>("all");
  const visible = filterRobots(robots, filter);

  return (
    <div>
      <div role="radiogroup" aria-label="Filter robots by status" className="mb-3 flex gap-1">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={filter === option}
            onClick={() => setFilter(option)}
            className={clsx(
              "inline-flex h-8 min-w-11 items-center justify-center rounded-tag px-2.5 text-[13px] capitalize transition-[background-color,color] duration-150",
              filter === option ? "bg-fog/[0.08] text-fog" : "text-dim hover:text-haze",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[12px] text-dim">
              <th className="px-4 py-3 font-medium">Robot</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 text-right font-medium">Battery or motor</th>
              <th className="px-4 py-3 text-right font-medium">Latency</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((robot) => {
              const online = isOnline(robot);
              return (
                <tr key={robot.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/fleet/${robot.id}`} className="inline-flex items-center gap-2 rounded-tag hover:underline">
                      {online ? <span className="live-dot" aria-label="Connected" /> : <span className="inline-block size-[7px] rounded-full ring-1 ring-inset ring-line-strong" aria-label="Offline" />}
                      <span className="mono font-medium text-fog">{robot.id}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-haze">{platformLabel(robot.platform)}</td>
                  <td className={clsx("px-4 py-3", online ? "text-fog" : "text-dim")}>{activityLabel(robot)}</td>
                  <td className={clsx("mono px-4 py-3 text-right text-[13px]", online ? "text-fog" : "text-dim")}>{power(robot)}</td>
                  <td className={clsx("mono px-4 py-3 text-right text-[13px]", online ? "text-fog" : "text-dim")}>{signal(robot)}</td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr className="border-t border-line">
                <td colSpan={5} className="px-4 py-8 text-center text-dim">
                  {robots.length === 0 ? "No robots connected yet." : "No robots match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
