/*
  Connector files and install commands, as documented in connect-your-first-robot.md and transports.md.
*/

import type { PlatformId } from "@/lib/domain/platforms";
import type { Transport } from "@/lib/domain/types";
import { site } from "@/lib/site";

export const TRANSPORTS: { id: Transport; label: string; hint: string }[] = [
  { id: "websocket", label: "WebSocket", hint: "The robot has a network connection and no preferred messaging system." },
  { id: "mqtt", label: "MQTT", hint: "The robot already uses an MQTT broker." },
  { id: "ros2", label: "ROS 2", hint: "The robot runs ROS 2." },
  { id: "serial", label: "Serial", hint: "The robot is reached over a serial link from a nearby computer." },
  { id: "test", label: "Test mode", hint: "Try the setup without real hardware." },
];

export function transportLabel(id: Transport) {
  return TRANSPORTS.find((t) => t.id === id)?.label ?? id;
}

export const NAME_MAX = 32;

/** A pairing key. Random in the browser; callers pass a fixed one for the deterministic demo seed. */
export function newPairingKey() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `dxk_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function maskKey(key: string) {
  return `${key.slice(0, 8)}${"•".repeat(12)}${key.slice(-4)}`;
}

function transportBlock(transport: Transport, slug: string) {
  const host = site.connectorHost;
  switch (transport) {
    case "websocket":
      return [`transport: websocket`, `endpoint: wss://${host}/robots/${slug}`];
    case "mqtt":
      return [`transport: mqtt`, `broker: mqtts://${host}:8883`, `topic: robots/${slug}`];
    case "ros2":
      return [`transport: ros2`, `bridge: wss://${host}/ros2/${slug}`, `ros_domain_id: 0`];
    case "serial":
      return [`transport: serial`, `device: /dev/ttyUSB0`, `baud_rate: 115200`, `relay: wss://${host}/robots/${slug}`];
    case "test":
      return [`transport: test`, `endpoint: wss://${host}/test/${slug}`, `simulate: true`];
  }
}

export function connectorYaml(input: { slug: string; platform: PlatformId; transport: Transport; pairingKey: string }) {
  return [
    `# DextorOS connector for ${input.slug}`,
    `robot: ${input.slug}`,
    `platform: ${input.platform}`,
    ...transportBlock(input.transport, input.slug),
    `pairing_key: ${input.pairingKey}`,
    `report:`,
    `  - capabilities`,
    `  - telemetry`,
    `  - events`,
    ``,
  ].join("\n");
}

export function installCommand(slug: string) {
  return `curl -fsSL https://${site.connectorHost}/install/${slug}.sh | sh`;
}

export const CONNECTOR_FILENAME = "dextoros-connector.yaml";
