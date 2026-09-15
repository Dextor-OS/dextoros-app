import type { FleetSource } from "@/lib/api/fleet-source";
import { SimulatedFleetSource } from "@/lib/api/simulated-source";

let source: FleetSource | null = null;

/** The app's one fleet source. Swap the constructor here when the live backend lands (phase 9). */
export function getFleetSource(): FleetSource {
  if (!source) source = new SimulatedFleetSource();
  return source;
}

export type { FleetSource };
