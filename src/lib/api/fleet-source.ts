import type { FleetSnapshot } from "@/lib/domain/types";

/*
  The one door between screens and fleet data. The simulated source implements it today; the live source
  (Supabase rows plus the robot gateway) implements it in phase 9. Screens never import either directly.
  Snapshots are immutable: a new object on every change, so useSyncExternalStore can compare by reference.
*/
export interface FleetSource {
  /** Current state. Stable reference until something changes. */
  snapshot(): FleetSnapshot;
  /** What the server renders. Must equal the first client snapshot so hydration matches. */
  serverSnapshot(): FleetSnapshot;
  subscribe(listener: () => void): () => void;
  /** Begin streaming. Idempotent. Browser only. */
  start(): void;
  stop(): void;
  sendCommand(robotId: string, raw: string): void;
  removeDemoFleet(): void;
  restoreDemoFleet(): void;
}
