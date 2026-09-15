import type { FleetSource } from "@/lib/api/fleet-source";
import type { FleetSnapshot, LogLine } from "@/lib/domain/types";
import { execute, LOG_LIMIT, SEED_SEQ, SEED_SNAPSHOT, seedDemoLogs, seedDemoRobots, tick } from "@/lib/engine/sim";

const STORAGE_KEY = "dextoros-portal:fleet";

type Persisted = { demoRemoved: boolean };

const clock = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

/** The demo fleet, ticking once a second in the browser. Pauses while the tab is hidden. */
export class SimulatedFleetSource implements FleetSource {
  private state: FleetSnapshot = SEED_SNAPSHOT;
  private seq = SEED_SEQ;
  private t = 0;
  private timer: number | null = null;
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
  };

  sendCommand = (robotId: string, raw: string) => {
    const robot = this.state.robots.find((r) => r.id === robotId);
    if (!robot || !raw.trim()) return;
    const result = execute(robot, raw);
    const time = clock();
    const entries: LogLine[] = [
      this.line(robotId, time, "cmd", raw.trim().replace(/\s+/g, " ")),
      ...result.lines.map(([kind, text]) => this.line(robotId, time, kind, text)),
    ];
    this.commit({
      robots: this.state.robots.map((r) => (r.id === robotId ? result.robot : r)),
      logs: this.append(this.state.logs, entries),
    });
  };

  removeDemoFleet = () => {
    const robots = this.state.robots.filter((r) => !r.demo);
    const logs = Object.fromEntries(robots.map((r) => [r.id, this.state.logs[r.id] ?? []]));
    this.commit({ robots, logs });
    this.save({ demoRemoved: true });
  };

  restoreDemoFleet = () => {
    if (this.state.robots.some((r) => r.demo)) return;
    this.commit({ robots: [...seedDemoRobots(), ...this.state.robots], logs: { ...seedDemoLogs(), ...this.state.logs } });
    this.save({ demoRemoved: false });
  };

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
      if (saved.demoRemoved) {
        const robots = this.state.robots.filter((r) => !r.demo);
        this.commit({ robots, logs: Object.fromEntries(robots.map((r) => [r.id, this.state.logs[r.id] ?? []])) });
      }
    } catch {
      // Blocked storage: start from the seed.
    }
  }

  private save(data: Persisted) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Private mode: the choice lasts for this visit only.
    }
  }
}
