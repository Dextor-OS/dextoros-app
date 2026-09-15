import type { Metadata } from "next";
import { DemoFleetSettings } from "@/components/fleet/demo-fleet-settings";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Demo fleet" };

export default function Page() {
  return (
    <>
      <PageHeader title="Demo fleet" lede="Simulated robots to learn with. Remove them in one click once your own robots are connected." />
      <DemoFleetSettings />
    </>
  );
}
