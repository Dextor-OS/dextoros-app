"use client";

import { Plugs } from "@phosphor-icons/react/dist/ssr";
import clsx from "clsx";
import Link from "next/link";
import { RobotConsole } from "@/components/console/robot-console";
import { Sparkline } from "@/components/fleet/sparkline";
import { PageHeader } from "@/components/shell/page-header";
import { platformLabel } from "@/lib/domain/platforms";
import type { Robot } from "@/lib/domain/types";
import { CAPABILITIES } from "@/lib/fleet";
import { isLive, isOnline, lastLatency, lastSeen, location, PAIRING_LABEL, SAMPLES } from "@/lib/engine/sim";
import { useRobot } from "@/lib/store/fleet";
import { robotPath } from "@/lib/routes";

const TRANSPORT_LABEL: Record<Robot["transport"], string> = {
  websocket: "WebSocket",
  mqtt: "MQTT",
  ros2: "ROS 2",
  serial: "Serial",
  test: "Test mode",
};

/** Telemetry that fits the body (docs: fleet-dashboard.md). Offline robots show No data or No signal. */
function metrics(robot: Robot) {
  const online = isOnline(robot);
  if (!isLive(robot)) {
    const labels = robot.kind === "arm" ? ["Motor temp", "Cycle time", "Gripper", "Latency"] : ["Battery", "Speed", "Location", "Latency"];
    return labels.map((label) => ({ label, value: label === "Latency" ? "No signal" : "No data" }));
  }
  if (robot.kind === "arm") {
    return [
      { label: "Motor temp", value: online ? `${robot.temp.toFixed(1)} °C` : "No data" },
      { label: "Cycle time", value: online ? `${robot.cycle.toFixed(1)} s` : "No data" },
      { label: "Gripper", value: robot.gripper === "open" ? "Open" : "Closed" },
      { label: "Latency", value: online ? `${lastLatency(robot)} ms` : "No signal" },
    ];
  }
  return [
    { label: "Battery", value: online ? `${Math.round(robot.battery)}%` : `${robot.battery}% last seen` },
    { label: "Speed", value: online ? `${robot.speed.toFixed(1)} m/s` : "No data" },
    { label: "Location", value: location(robot) },
    { label: "Latency", value: online ? `${lastLatency(robot)} ms` : "No signal" },
  ];
}

export function RobotDetail({ id }: { id: string }) {
  const robot = useRobot(id);

  if (!robot) {
    return (
      <>
        <PageHeader title={id} lede="This robot is not in the fleet." />
        <Link href="/fleet" className="btn btn-ghost">
          Back to the fleet
        </Link>
      </>
    );
  }

  const online = isOnline(robot);

  return (
    <>
      <PageHeader
        title={robot.id}
        lede={`${platformLabel(robot.platform)} over ${TRANSPORT_LABEL[robot.transport]}`}
        actions={
          <Link href={robotPath(robot.id, "connector")} className="btn btn-ghost btn-sm">
            <Plugs size={14} aria-hidden="true" />
            Connector
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="panel p-4 md:p-5" aria-label="Telemetry">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 rounded-tag px-2.5 py-1 text-[12.5px] text-haze ring-1 ring-line-strong">
              {online && <span className="live-dot" aria-hidden="true" />}
              {online ? "Streaming telemetry" : isLive(robot) ? `Offline, last seen ${lastSeen(robot)}` : PAIRING_LABEL[robot.pairing]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CAPABILITIES.filter((c) => robot.caps.includes(c.id)).map((c) => (
                <span key={c.id} className="tag">
                  {c.short}
                </span>
              ))}
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-control bg-line md:grid-cols-4">
            {metrics(robot).map((metric) => (
              <div key={metric.label} className="bg-deck px-3 py-2.5">
                <dt className="text-[12px] text-dim">{metric.label}</dt>
                <dd className={clsx("mono mt-1 text-[14.5px]", online ? "text-fog" : "text-dim")}>{metric.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5">
            <p className="text-[12px] text-dim">Link latency, last {SAMPLES} s</p>
            <div className="mt-1">
              <Sparkline values={robot.latency} live={online} height={56} />
            </div>
          </div>

          {robot.kind === "arm" && (
            <div className="mt-5">
              <p className="text-[12px] text-dim">Joints</p>
              <p className="mono mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-haze">
                {robot.joints.map((joint, i) => (
                  <span key={i}>
                    <span className="text-dim">J{i + 1}</span> {joint.toFixed(1)}°
                  </span>
                ))}
              </p>
            </div>
          )}

        </section>

        <section className="panel p-4" aria-label={`Console for ${robot.id}`}>
          <p className="mb-3 text-[13px] font-medium text-fog">Console</p>
          <RobotConsole robot={robot} logHeight="h-[280px]" />
        </section>
      </div>
    </>
  );
}
