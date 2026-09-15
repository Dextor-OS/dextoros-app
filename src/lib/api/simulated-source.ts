import type { FleetSource } from "@/lib/api/fleet-source";
import type { PlatformId } from "@/lib/domain/platforms";
import type { FleetSnapshot, LogLine, PairingState, Robot, Transport } from "@/lib/domain/types";
import { newPairingKey } from "@/lib/engine/connector";
import {
  bringLive,
  createRobot,
  disconnect,
  execute,
  LOG_LIMIT,
  type NewRobotInput,
  SEED_SEQ,
  SEED_SNAPSHOT,
  seedDemoLogs,
  seedDemoRobots,
  tick,
} from "@/lib/engine/sim";

const STORAGE_KEY = "dextoros-app:fleet";

/** What survives a reload: the demo-fleet choice and the robots the user connected. Telemetry and logs do not. */
type StoredRobot = { id: string; platform: PlatformId; transport: Transport; pairingKey: string; pairing: PairingState };
type Persisted = { demoRemoved: boolean; robots: StoredRobot[] };

const clock = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

/** The demo fleet, ticking once a second in the browser. Pauses while the tab is hidden. */
export class SimulatedFleetSource implements FleetSource {
  private state: FleetSnapshot = SEED_SNAPSHOT;
  private seq = SEED_SEQ;
  private t = 0;
  private timer: number | null = null;
  private pairingTimers = new Map<string, number[]>();
  private listeners = new Set<() => void>();

  snapshot = () => this.state;
  serverSnapshot = () => SEED_SNAPSHOT;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  start = () => {
    if (this.timer !== null || typeof window === "undefined") return;
    this.load();
    this.timer = window.setInterval(() => {
      if (document.hidden) return;
      this.t += 1;
      this.tickAll();
    }, 1000);
  };

  stop = () => {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    for (const timers of this.pairingTimers.values()) timers.forEach((id) => window.clearTimeout(id));
    this.pairingTimers.clear();
  };

  sendCommand = (robotId: string, raw: string) => {
    const robot = this.find(robotId);
    if (!robot || !raw.trim()) return;
    const result = execute(robot, raw);
    const time = clock();
    const entries: LogLine[] = [
      this.line(robotId, time, "cmd", raw.trim().replace(/\s+/g, " ")),
      ...result.lines.map(([kind, text]) => this.line(robotId, time, kind, text)),
    ];
    this.commit({ robots: this.replace(result.robot), logs: this.append(this.state.logs, entries) });
  };

  addRobot = (input: Omit<NewRobotInput, "pairingKey">) => {
    const robot = createRobot({ ...input, pairingKey: newPairingKey() });
    const entry = this.line(robot.id, clock(), "event", "Connector generated. Waiting for first connection");
    this.commit({ robots: [...this.state.robots, robot], logs: this.append(this.state.logs, [entry]) });
    this.save();
    return robot;
  };

  removeRobot = (robotId: string) => {
    this.cancelPairing(robotId);
    const robots = this.state.robots.filter((r) => r.id !== robotId);
    const logs = { ...this.state.logs };
    delete logs[robotId];
    this.commit({ robots, logs });
    this.save();
  };

  rotateKey = (robotId: string) => {
    this.cancelPairing(robotId);
    this.update(robotId, (r) => ({ ...disconnect(r, "waiting"), pairingKey: newPairingKey() }), "Key rotated. Reinstall the connector with the new file");
  };

  revokeKey = (robotId: string) => {
    this.cancelPairing(robotId);
    this.update(robotId, (r) => disconnect(r, "revoked"), "Key revoked. The robot was disconnected");
  };

  regenerateConnector = (robotId: string) => {
    this.update(robotId, (r) => ({ ...disconnect(r, "waiting"), pairingKey: newPairingKey() }), "New connector generated. Waiting for first connection");
  };

  simulatePairing = (robotId: string) => {
    const robot = this.find(robotId);
    if (!robot || robot.pairing === "live" || typeof window === "undefined") return;
    this.cancelPairing(robotId);
    const handshake = window.setTimeout(() => {
      this.update(robotId, (r) => ({ ...r, pairing: "handshake" }), "First connection with pairing key. Checking the key");
    }, 1400);
    const live = window.setTimeout(() => {
      this.pairingTimers.delete(robotId);
      const current = this.find(robotId);
      if (!current) return;
      const result = bringLive(current);
      this.update(robotId, () => result.robot, ...result.events);
    }, 3200);
    this.pairingTimers.set(robotId, [handshake, live]);
  };

  removeDemoFleet = () => {
    const robots = this.state.robots.filter((r) => !r.demo);
    const logs = Object.fromEntries(robots.map((r) => [r.id, this.state.logs[r.id] ?? []]));
    this.commit({ robots, logs });
    this.save();
  };

  restoreDemoFleet = () => {
    if (this.state.robots.some((r) => r.demo)) return;
    this.commit({ robots: [...seedDemoRobots(), ...this.state.robots], logs: { ...seedDemoLogs(), ...this.state.logs } });
    this.save();
  };

  private find(robotId: string) {
    return this.state.robots.find((r) => r.id === robotId);
  }

  private replace(robot: Robot) {
    return this.state.robots.map((r) => (r.id === robot.id ? robot : r));
  }

  private update(robotId: string, change: (robot: Robot) => Robot, ...events: string[]) {
    const robot = this.find(robotId);
    if (!robot) return;
    const time = clock();
    const entries = events.map((text) => this.line(robotId, time, "event", text));
    this.commit({ robots: this.replace(change(robot)), logs: entries.length ? this.append(this.state.logs, entries) : this.state.logs });
    this.save();
  }

  private cancelPairing(robotId: string) {
    this.pairingTimers.get(robotId)?.forEach((id) => window.clearTimeout(id));
    this.pairingTimers.delete(robotId);
  }

  private tickAll() {
    const entries: LogLine[] = [];
    const time = clock();
    const robots = this.state.robots.map((robot) => {
      const result = tick(robot, this.t);
      for (const text of result.events) entries.push(this.line(robot.id, time, "event", text));
      return result.robot;
    });
    this.commit({ robots, logs: entries.length ? this.append(this.state.logs, entries) : this.state.logs });
  }

  private line(robotId: string, time: string, kind: LogLine["kind"], text: string): LogLine {
    return { id: this.seq++, robotId, time, kind, text };
  }

  private append(logs: FleetSnapshot["logs"], entries: LogLine[]) {
    const next = { ...logs };
    for (const entry of entries) {
      next[entry.robotId] = [...(next[entry.robotId] ?? []), entry].slice(-LOG_LIMIT);
    }
    return next;
  }

  private commit(next: FleetSnapshot) {
    this.state = next;
    for (const listener of this.listeners) listener();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Persisted>;
      let robots = this.state.robots;
      let logs = this.state.logs;
      if (saved.demoRemoved) {
        robots = robots.filter((r) => !r.demo);
        logs = Object.fromEntries(robots.map((r) => [r.id, logs[r.id] ?? []]));
      }
      for (const stored of saved.robots ?? []) {
        if (robots.some((r) => r.id === stored.id)) continue;
        let robot = createRobot({ name: stored.id, platform: stored.platform, transport: stored.transport, pairingKey: stored.pairingKey });
        // A robot that was live when the page closed comes back live with fresh telemetry.
        robot = stored.pairing === "live" ? bringLive(robot).robot : { ...robot, pairing: stored.pairing };
        robots = [...robots, robot];
        logs = { ...logs, [robot.id]: [] };
      }
      this.commit({ robots, logs });
    } catch {
      // Blocked storage: start from the seed.
    }
  }

  private save() {
    const data: Persisted = {
      demoRemoved: !this.state.robots.some((r) => r.demo),
      robots: this.state.robots
        .filter((r) => !r.demo)
        .map((r) => ({ id: r.id, platform: r.platform, transport: r.transport, pairingKey: r.pairingKey, pairing: r.pairing })),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Private mode: the choice lasts for this visit only.
    }
  }
}
