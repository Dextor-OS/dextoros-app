import type { FleetSnapshot, Robot } from "@/lib/domain/types";
import type { NewRobotInput } from "@/lib/engine/sim";

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

  /** Generate a connector for a new robot. Returns the robot, waiting for its first connection. */
  addRobot(input: Omit<NewRobotInput, "pairingKey">): Robot;
  removeRobot(robotId: string): void;
  /** Replace the pairing key. The robot drops to waiting until the connector is reinstalled. */
  rotateKey(robotId: string): void;
  /** Cut a robot off. It needs a new connector before it can connect again. */
  revokeKey(robotId: string): void;
  /** After a revoke: a fresh key, back to waiting. */
  regenerateConnector(robotId: string): void;
  /** Test mode and demo robots only: play the waiting, handshake, live sequence. */
  simulatePairing(robotId: string): void;

  /** Hold to teach: a new demonstration on the teacher robot, shared with every capable robot. */
  teachSkill(skillId: string, teacherId: string): void;
  /** Collect episodes from every capable, online robot, train, evaluate and publish a new version. */
  startSession(skillId: string): string;
  pauseSession(sessionId: string): void;
  resumeSession(sessionId: string): void;

  removeDemoFleet(): void;
  restoreDemoFleet(): void;
}
