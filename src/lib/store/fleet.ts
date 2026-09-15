"use client";

import { useSyncExternalStore } from "react";
import { getFleetSource } from "@/lib/api";
import type { FleetFilter, Robot } from "@/lib/domain/types";
import { isOnline, type NewRobotInput } from "@/lib/engine/sim";

/** The live fleet snapshot. Re-renders once a second while robots stream. */
export function useFleet() {
  const source = getFleetSource();
  return useSyncExternalStore(source.subscribe, source.snapshot, source.serverSnapshot);
}

export function useRobot(id: string): Robot | undefined {
  return useFleet().robots.find((r) => r.id === id);
}

export function useRobotLogs(id: string) {
  return useFleet().logs[id] ?? [];
}

export function useLiveCount() {
  const { robots } = useFleet();
  return { live: robots.filter(isOnline).length, total: robots.length };
}

export function filterRobots(robots: Robot[], filter: FleetFilter) {
  if (filter === "all") return robots;
  return robots.filter((r) => (filter === "online" ? isOnline(r) : !isOnline(r)));
}

/** Actions. Thin wrappers so components never touch the source. */
export const fleetActions = {
  sendCommand: (robotId: string, raw: string) => getFleetSource().sendCommand(robotId, raw),
  addRobot: (input: Omit<NewRobotInput, "pairingKey">) => getFleetSource().addRobot(input),
  removeRobot: (robotId: string) => getFleetSource().removeRobot(robotId),
  rotateKey: (robotId: string) => getFleetSource().rotateKey(robotId),
  revokeKey: (robotId: string) => getFleetSource().revokeKey(robotId),
  regenerateConnector: (robotId: string) => getFleetSource().regenerateConnector(robotId),
  simulatePairing: (robotId: string) => getFleetSource().simulatePairing(robotId),
  removeDemoFleet: () => getFleetSource().removeDemoFleet(),
  restoreDemoFleet: () => getFleetSource().restoreDemoFleet(),
};
