import type { Kind, PlatformId } from "@/lib/domain/platforms";
import type { CapabilityId } from "@/lib/fleet";

export type Transport = "websocket" | "mqtt" | "ros2" | "serial" | "test";

/** Pairing states from keys-and-pairing.md, plus "revoked" for a robot cut off until it gets a new connector. */
export type PairingState = "waiting" | "handshake" | "live" | "revoked";

export type Activity = "working" | "idle" | "moving" | "docking" | "charging" | "homing" | "paused" | "offline";

export type Point = { x: number; y: number; label: string };

/** A connected robot with its live telemetry. Telemetry fields that do not fit the body stay at their zero value. */
export type Robot = {
  id: string;
  slug: string;
  platform: PlatformId;
  kind: Kind;
  caps: CapabilityId[];
  transport: Transport;
  pairing: PairingState;
  /** Written into the connector file. Treat like a password. */
  pairingKey: string;
  /** Part of the demo fleet, removable in one click from settings. */
  demo: boolean;

  activity: Activity;
  resumeTo: Activity | null;
  battery: number;
  speed: number;
  temp: number;
  cycle: number;
  joints: number[];
  gripper: "open" | "closed";
  x: number;
  y: number;
  target: Point | null;
  /** Link latency samples in ms, oldest first, at most SAMPLES long. Empty while offline. */
  latency: number[];
  /** Seconds since the last heartbeat. 0 while online. */
  offlineFor: number;
};

export type LogKind = "cmd" | "ack" | "event" | "error";

export type LogLine = { id: number; robotId: string; time: string; kind: LogKind; text: string };

export type FleetSnapshot = {
  robots: Robot[];
  /** Per-robot history, oldest first. */
  logs: Record<string, LogLine[]>;
};

export type FleetFilter = "all" | "online" | "offline";
