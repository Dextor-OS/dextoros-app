import type { CapabilityId } from "@/lib/fleet";

/** Body kinds decide which commands and telemetry a robot has (docs: console-commands.md). */
export type Kind = "arm" | "mobile" | "legged";

/** The platform list from connect-your-first-robot.md. `id` is what the connector YAML writes as `platform:`. */
export type PlatformId = "six-axis-arm" | "warehouse-amr" | "quadruped" | "mobile-manipulator" | "humanoid" | "delta-picker";

export type Platform = { id: PlatformId; label: string; kind: Kind; defaultCaps: CapabilityId[] };

export const PLATFORMS: Platform[] = [
  { id: "six-axis-arm", label: "6-axis arm", kind: "arm", defaultCaps: ["arm", "gripper", "depth"] },
  { id: "warehouse-amr", label: "Warehouse AMR", kind: "mobile", defaultCaps: ["wheels", "lidar", "depth"] },
  { id: "quadruped", label: "Quadruped", kind: "legged", defaultCaps: ["legs", "depth", "lidar"] },
  { id: "mobile-manipulator", label: "Mobile manipulator", kind: "mobile", defaultCaps: ["wheels", "arm", "gripper", "depth", "lidar"] },
  { id: "humanoid", label: "Humanoid", kind: "legged", defaultCaps: ["legs", "arm", "gripper", "depth"] },
  { id: "delta-picker", label: "Delta picker", kind: "arm", defaultCaps: ["arm", "gripper"] },
];

export function platformOf(id: PlatformId): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

export function platformLabel(id: PlatformId) {
  return platformOf(id).label;
}
