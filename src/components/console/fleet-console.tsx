"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { RobotConsole } from "@/components/console/robot-console";
import { platformLabel } from "@/lib/domain/platforms";
import type { FleetFilter } from "@/lib/domain/types";
import { activityLabel, isOnline, lastSeen } from "@/lib/engine/sim";
import { filterRobots, useFleet } from "@/lib/store/fleet";

const FILTERS: FleetFilter[] = ["all", "online", "offline"];

/** The fleet console: pick a robot on the left, talk to it on the right (docs: console-commands.md). */
export function FleetConsole({ initialId }: { initialId?: string }) {
  const { robots } = useFleet();
  const [selectedId, setSelectedId] = useState(initialId ?? robots[0]?.id ?? "");
  const [filter, setFilter] = useState<FleetFilter>("all");

  const selected = robots.find((r) => r.id === selectedId) ?? robots[0];
  const visible = filterRobots(robots, filter);

  if (!selected) {
    return (
      <div className="panel p-6 text-sm text-haze">
        No robots to talk to.{" "}
        <Link href="/robots/new" className="text-fog underline">
          Connect a robot
        </Link>{" "}
        or{" "}
        <Link href="/settings/fleet" className="text-fog underline">
          restore the demo fleet
        </Link>
        .
      </div>
    );
  }

  const online = isOnline(selected);

  return (
    <div className="panel grid grid-cols-1 overflow-hidden lg:grid-cols-[272px_minmax(0,1fr)]">
      <div className="border-b border-line p-3 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-[13px] font-medium text-fog">Fleet</p>
          <div role="radiogroup" aria-label="Filter robots by status" className="flex gap-1">
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={filter === option}
                onClick={() => setFilter(option)}
                className={clsx(
                  "inline-flex h-7 min-w-10 items-center justify-center rounded-tag px-2 text-[12px] capitalize transition-[background-color,color] duration-150",
                  filter === option ? "bg-fog/[0.08] text-fog" : "text-dim hover:text-haze",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
          {visible.map((robot) => {
            const isSelected = robot.id === selected.id;
            return (
              <li key={robot.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(robot.id)}
                  className={clsx(
                    "flex w-[172px] flex-col items-start rounded-control px-3 py-2.5 text-left transition-[background-color] duration-150 lg:w-full",
                    isSelected ? "bg-fog/[0.07]" : "hover:bg-fog/[0.03]",
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="mono text-[12.5px] text-fog">{robot.id}</span>
                    {isOnline(robot) && <span className="live-dot" aria-label="Connected" />}
                  </span>
                  <span className="text-[12px] text-dim">{platformLabel(robot.platform)}</span>
                  <span className="mt-0.5 text-[12.5px] text-haze">{activityLabel(robot)}</span>
                </button>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-3 py-4 text-[13px] text-dim">No robots match this filter.</li>}
        </ul>
      </div>

      <div className="min-w-0 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={`/fleet/${selected.id}`} className="mono text-[15px] text-fog hover:underline">
              {selected.id}
            </Link>
            <p className="text-[13px] text-dim">{platformLabel(selected.platform)}</p>
          </div>
          <p className="inline-flex items-center gap-2 rounded-tag px-2.5 py-1 text-[12.5px] text-haze ring-1 ring-line-strong">
            {online && <span className="live-dot" aria-hidden="true" />}
            {online ? activityLabel(selected) : `Offline, last seen ${lastSeen(selected)}`}
          </p>
        </div>
        <div className="mt-4">
          <RobotConsole robot={selected} logHeight="h-[min(48vh,420px)]" />
        </div>
      </div>
    </div>
  );
}
