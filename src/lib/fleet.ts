import type { PlatformId } from "@/lib/domain/platforms";

export type CapabilityId = "arm" | "gripper" | "depth" | "lidar" | "wheels" | "legs";

export const CAPABILITIES: { id: CapabilityId; short: string; label: string }[] = [
  { id: "arm", short: "Arm", label: "arm" },
  { id: "gripper", short: "Grip", label: "gripper" },
  { id: "depth", short: "Depth", label: "depth camera" },
  { id: "lidar", short: "Lidar", label: "LiDAR" },
  { id: "wheels", short: "Wheel", label: "wheeled base" },
  { id: "legs", short: "Legs", label: "legs" },
];

/** A robot's identity and parts. The live state on top of this is `Robot` in domain/types.ts. */
export type RobotSpec = {
  id: string;
  platform: PlatformId;
  caps: CapabilityId[];
};

/** The demo fleet from the docs (skills-and-training/capabilities.md). */
export const FLEET: RobotSpec[] = [
  { id: "ARM-02", platform: "six-axis-arm", caps: ["arm", "gripper", "depth"] },
  { id: "AMR-11", platform: "warehouse-amr", caps: ["wheels", "lidar", "depth"] },
  { id: "QDR-04", platform: "quadruped", caps: ["legs", "depth", "lidar"] },
  { id: "MM-01", platform: "mobile-manipulator", caps: ["wheels", "arm", "gripper", "depth", "lidar"] },
  { id: "HUM-03", platform: "humanoid", caps: ["legs", "arm", "gripper", "depth"] },
  { id: "DLT-07", platform: "delta-picker", caps: ["arm", "gripper"] },
];

export type Skill = {
  id: string;
  name: string;
  needs: CapabilityId[];
  version: number;
  teacher: string;
};

export const SKILLS: Skill[] = [
  { id: "pick-place", name: "Pick and place", needs: ["arm", "gripper", "depth"], version: 4, teacher: "ARM-02" },
  { id: "shelf-scan", name: "Shelf scan", needs: ["wheels", "lidar", "depth"], version: 2, teacher: "AMR-11" },
  { id: "stairs", name: "Stair inspection", needs: ["legs", "depth"], version: 7, teacher: "QDR-04" },
  { id: "handoff", name: "Object handoff", needs: ["arm", "gripper"], version: 3, teacher: "HUM-03" },
];

export function missingCapabilities(robot: { caps: CapabilityId[] }, skill: Skill) {
  return skill.needs.filter((need) => !robot.caps.includes(need));
}

export function capabilityLabel(id: CapabilityId) {
  return CAPABILITIES.find((c) => c.id === id)?.label ?? id;
}

export function joinLabels(ids: CapabilityId[]) {
  const labels = ids.map(capabilityLabel);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
