/*
  The simulated fleet: telemetry ticks, command parsing and replies, all as pure functions on Robot.
  Ported from the landing page's console demo and extended to the six-robot demo fleet in the docs.
  Replies match fleet-and-console/console-commands.md word for word.
*/

import { platformOf } from "@/lib/domain/platforms";
import type { Kind, PlatformId } from "@/lib/domain/platforms";
import type { Activity, FleetSnapshot, LogKind, LogLine, Point, Robot, Transport } from "@/lib/domain/types";
import { FLEET, type RobotSpec } from "@/lib/fleet";

export const SAMPLES = 48;
export const LOG_LIMIT = 200;
export const DOCK: Point = { x: 0, y: 0, label: "dock" };
const BAY_ROWS = ["A", "B", "C", "D"];

const round1 = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function bay(label: string): Point | null {
  const match = /^([A-D])([1-9])$/.exec(label);
  if (!match) return null;
  return { x: Number(match[2]) * 3, y: (BAY_ROWS.indexOf(match[1]) + 1) * 4, label };
}

export function seedLatency(base: number) {
  return Array.from({ length: SAMPLES }, (_, i) => Math.round(base + Math.sin(i * 0.7) * 4 + Math.cos(i * 1.9) * 2));
}

/** Robot name to slug, as the docs describe: lowercase letters and numbers, everything else becomes "-". */
export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const COMMANDS: Record<Kind, string[]> = {
  arm: ["status", "home", "gripper open", "gripper close", "pause", "resume"],
  mobile: ["status", "move_to B3", "dock", "pause", "resume"],
  legged: ["status", "move_to C5", "dock", "pause", "resume"],
};

export const QUICK: Record<Kind, string[]> = {
  arm: ["status", "home", "gripper open", "pause"],
  mobile: ["status", "move_to D7", "dock", "pause"],
  legged: ["status", "move_to C5", "dock", "pause"],
};

export const isOnline = (robot: Robot) => robot.activity !== "offline";

export function lastLatency(robot: Robot) {
  return robot.latency[robot.latency.length - 1];
}

export function location(robot: Robot) {
  if (robot.x === 0 && robot.y === 0) return "On dock";
  for (const row of BAY_ROWS) {
    for (let n = 1; n <= 9; n++) {
      const point = bay(`${row}${n}`);
      if (point && point.x === robot.x && point.y === robot.y) return `Bay ${point.label}`;
    }
  }
  return `${robot.x.toFixed(1)}, ${robot.y.toFixed(1)} m`;
}

/** "14 min" or "2 h" for an offline duration in seconds. */
export function duration(seconds: number) {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  return `${round1(seconds / 3600)} h`;
}

export function lastSeen(robot: Robot) {
  return `${duration(robot.offlineFor)} ago`;
}

export function activityLabel(robot: Robot) {
  switch (robot.activity) {
    case "working":
      return "Working";
    case "idle":
      return "Idle";
    case "moving":
      return `Moving to ${robot.target?.label ?? "bay"}`;
    case "docking":
      return "Docking";
    case "charging":
      return `Charging, ${Math.round(robot.battery)}%`;
    case "homing":
      return "Homing";
    case "paused":
      return "Paused";
    default:
      return `Offline for ${duration(robot.offlineFor)}`;
  }
}

export function describe(robot: Robot) {
  if (!isOnline(robot)) return `${robot.id} is offline. Last seen ${lastSeen(robot)}`;
  if (robot.kind === "arm") {
    return `${activityLabel(robot)}. Motor ${robot.temp.toFixed(1)} °C, cycle ${robot.cycle.toFixed(1)} s, gripper ${robot.gripper}, ${lastLatency(robot)} ms`;
  }
  return `${activityLabel(robot)}. Battery ${Math.round(robot.battery)}%, ${location(robot).toLowerCase()}, ${lastLatency(robot)} ms`;
}

/** One second of simulated time. Returns the new robot and any events it raised. */
export function tick(robot: Robot, t: number): { robot: Robot; events: string[] } {
  if (!isOnline(robot)) return { robot: { ...robot, offlineFor: robot.offlineFor + 1 }, events: [] };
  const events: string[] = [];
  const u: Robot = { ...robot };
  const previous = lastLatency(u) ?? 35;
  u.latency = [...u.latency.slice(1 - SAMPLES), clamp(Math.round(previous + (Math.random() - 0.5) * 8), 22, 64)];

  if (u.kind === "arm") {
    if (u.activity === "working") {
      const base = u.cycle < 3 ? 1.1 : 6.1;
      u.joints = u.joints.map((j, i) => round1(j + Math.sin(t * 0.9 + i) * 1.8));
      u.cycle = round1(base + Math.random() * 0.6);
      u.temp = clamp(round1(u.temp + (Math.random() - 0.45) * 0.3), 36, 46);
    } else if (u.activity === "homing") {
      u.joints = u.joints.map((j) => (Math.abs(j) < 1 ? 0 : round1(j * 0.55)));
      if (u.joints.every((j) => j === 0)) {
        u.activity = "idle";
        events.push("Reached home position");
      }
    } else {
      u.temp = clamp(round1(u.temp - 0.1), 34, 46);
    }
    return { robot: u, events };
  }

  if (u.activity === "moving" || u.activity === "docking") {
    const target = u.target ?? DOCK;
    const dx = target.x - u.x;
    const dy = target.y - u.y;
    const distance = Math.hypot(dx, dy);
    const stride = u.kind === "legged" ? 0.8 : 1.1;
    if (distance <= stride) {
      u.x = target.x;
      u.y = target.y;
      u.speed = 0;
      u.target = null;
      if (u.activity === "docking") {
        u.activity = "charging";
        events.push("Docked. Charging");
      } else {
        u.activity = "idle";
        events.push(`Arrived at bay ${target.label}`);
      }
    } else {
      u.x = round1(u.x + (dx / distance) * stride);
      u.y = round1(u.y + (dy / distance) * stride);
      u.speed = stride;
    }
    u.battery = Math.max(0, round1(u.battery - 0.06));
  } else if (u.activity === "charging") {
    u.speed = 0;
    u.battery = Math.min(100, round1(u.battery + 0.4));
    if (u.battery >= 100) {
      u.activity = "idle";
      events.push("Fully charged");
    }
  } else {
    u.speed = 0;
    u.battery = Math.max(0, round1(u.battery - 0.01));
  }
  return { robot: u, events };
}

/** Parse and apply one console command. Commands are case-insensitive and extra spaces are ignored. */
export function execute(robot: Robot, raw: string): { robot: Robot; lines: [LogKind, string][] } {
  const input = raw.trim().replace(/\s+/g, " ");
  const [head = "", ...rest] = input.split(" ");
  const command = head.toLowerCase();
  const arg = rest.join(" ");
  const u: Robot = { ...robot };
  const accepted = (text: string): [LogKind, string] => ["ack", `${text}. Accepted in ${lastLatency(u)} ms`];
  const failed = (text: string): [LogKind, string] => ["error", text];

  if (command === "help") return { robot: u, lines: [["event", `${u.id} accepts ${COMMANDS[u.kind].join(", ")}`]] };
  if (command === "status") return { robot: u, lines: [["event", describe(u)]] };
  if (!isOnline(u)) {
    return { robot: u, lines: [failed(`${u.id} is offline, so nothing was sent. Last seen ${lastSeen(u)}`)] };
  }

  switch (command) {
    case "pause":
      if (u.activity === "paused") return { robot: u, lines: [["event", "Already paused"]] };
      u.resumeTo = u.activity;
      u.activity = "paused";
      u.speed = 0;
      return { robot: u, lines: [accepted("Paused")] };
    case "resume":
      if (u.activity !== "paused") return { robot: u, lines: [["event", "Nothing to resume"]] };
      u.activity = u.resumeTo ?? "idle";
      u.resumeTo = null;
      return { robot: u, lines: [accepted("Resumed")] };
    case "home":
      if (u.kind !== "arm") return { robot: u, lines: [failed(`${u.id} has no arm to home`)] };
      u.activity = "homing";
      return { robot: u, lines: [accepted("Homing all joints")] };
    case "gripper": {
      if (u.kind !== "arm") return { robot: u, lines: [failed(`${u.id} has no gripper`)] };
      const state = arg.toLowerCase();
      if (state !== "open" && state !== "close") return { robot: u, lines: [failed("Use gripper open or gripper close")] };
      u.gripper = state === "open" ? "open" : "closed";
      return { robot: u, lines: [accepted(state === "open" ? "Gripper open" : "Gripper closed")] };
    }
    case "dock":
      if (u.kind === "arm") return { robot: u, lines: [failed(`${u.id} is a fixed arm with no dock`)] };
      if (u.activity === "charging") return { robot: u, lines: [["event", "Already on the dock"]] };
      u.activity = "docking";
      u.target = DOCK;
      return { robot: u, lines: [accepted("Heading to the dock")] };
    case "move_to": {
      if (u.kind === "arm") return { robot: u, lines: [failed(`${u.id} is a fixed arm and cannot drive to a bay`)] };
      const target = bay(arg.toUpperCase());
      if (!target) {
        return {
          robot: u,
          lines: [failed(arg ? `Unknown bay "${arg}". Bays run from A1 to D9` : "Add a bay, for example move_to B3")],
        };
      }
      u.activity = "moving";
      u.target = target;
      return { robot: u, lines: [accepted(`Moving to bay ${target.label}`)] };
    }
    default:
      return { robot: u, lines: [failed(`Unknown command "${head}". Type help to see what ${u.id} accepts`)] };
  }
}

/* Seed: the demo fleet with a plausible morning on the floor. Deterministic, so server and client render the same. */

type Seed = Partial<Robot> & { transport: Transport };

const SEEDS: Record<string, Seed> = {
  "ARM-02": { transport: "ros2", activity: "working", temp: 42.6, cycle: 6.4, joints: [12.4, -48.2, 63.9, -15.7, 90.3, 4.1], gripper: "closed", latency: seedLatency(31) },
  "AMR-11": { transport: "websocket", activity: "moving", battery: 64.2, speed: 1.1, temp: 36.1, x: 15, y: 8, target: bay("B3"), latency: seedLatency(38) },
  "QDR-04": { transport: "mqtt", activity: "charging", battery: 23.7, temp: 33.8, latency: seedLatency(44) },
  "MM-01": { transport: "websocket", activity: "idle", battery: 88.4, temp: 35.2, x: 6, y: 12, joints: [0, 0, 0, 0, 0, 0], gripper: "open", latency: seedLatency(35) },
  "HUM-03": { transport: "websocket", activity: "offline", battery: 51, x: 12, y: 16, latency: [], offlineFor: 14 * 60 },
  "DLT-07": { transport: "serial", activity: "working", temp: 38.9, cycle: 1.2, joints: [8.2, -12.4, 5.1], gripper: "open", latency: seedLatency(27) },
};

export function makeRobot(spec: RobotSpec, overrides: Partial<Robot> & { transport: Transport; demo: boolean }): Robot {
  const platform = platformOf(spec.platform);
  return {
    id: spec.id,
    slug: slugify(spec.id),
    platform: spec.platform,
    kind: platform.kind,
    caps: spec.caps,
    pairing: "live",
    activity: "idle",
    resumeTo: null,
    battery: 100,
    speed: 0,
    temp: 0,
    cycle: 0,
    joints: [],
    gripper: "open",
    x: 0,
    y: 0,
    target: null,
    latency: seedLatency(35),
    offlineFor: 0,
    ...overrides,
  };
}

export function seedDemoRobots(): Robot[] {
  return FLEET.map((spec) => makeRobot(spec, { ...SEEDS[spec.id], demo: true }));
}

const line = (id: number, robotId: string, time: string, kind: LogKind, text: string): LogLine => ({ id, robotId, time, kind, text });

export function seedDemoLogs(): Record<string, LogLine[]> {
  return {
    "ARM-02": [
      line(1, "ARM-02", "09:38:12", "event", "Connected over ROS 2, 3 capabilities reported"),
      line(2, "ARM-02", "09:40:47", "event", "Cycle 1,284 complete in 6.4 s"),
    ],
    "AMR-11": [
      line(3, "AMR-11", "09:36:02", "event", "Picked up tote at bay A4"),
      line(4, "AMR-11", "09:41:15", "cmd", "move_to B3"),
      line(5, "AMR-11", "09:41:15", "ack", "Moving to bay B3. Accepted in 38 ms"),
    ],
    "QDR-04": [
      line(6, "QDR-04", "09:29:40", "event", "Battery below 25%. Automation sent it to the dock"),
      line(7, "QDR-04", "09:33:08", "event", "Docked. Charging"),
    ],
    "MM-01": [
      line(8, "MM-01", "09:31:55", "event", "Connected over WebSocket, 5 capabilities reported"),
      line(9, "MM-01", "09:39:20", "event", "Arrived at bay C2"),
    ],
    "HUM-03": [
      line(10, "HUM-03", "09:27:31", "error", "No heartbeat for 60 s. Connection lost"),
      line(11, "HUM-03", "09:27:32", "event", "Offline alert sent to the on-call operator"),
    ],
    "DLT-07": [
      line(12, "DLT-07", "09:35:10", "event", "Connected over serial, 2 capabilities reported"),
      line(13, "DLT-07", "09:41:02", "event", "Cycle 3,912 complete in 1.2 s"),
    ],
  };
}

export const SEED_SNAPSHOT: FleetSnapshot = { robots: seedDemoRobots(), logs: seedDemoLogs() };
export const SEED_SEQ = 100;

export type { Activity, PlatformId };
