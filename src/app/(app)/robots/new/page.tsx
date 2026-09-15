import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Connect a robot" };

export default function NewRobotPage() {
  return (
    <>
      <PageHeader title="Connect a robot" lede="Name the robot, pick its platform and transport, then run one install command." />
      <ComingSoon phase={5} items={["Name and slug", "Platform and transport", "Download the connector file", "Install on the robot", "Wait for first connection, handshake, live"]} />
    </>
  );
}
