import type { Metadata } from "next";
import { FleetConsole } from "@/components/console/fleet-console";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Console" };

export default async function ConsolePage({ searchParams }: PageProps<"/console">) {
  const { robot } = await searchParams;
  return (
    <>
      <PageHeader title="Console" lede="Pick a robot, type a command and press Send. Type help to see what it accepts." />
      <FleetConsole initialId={typeof robot === "string" ? robot : undefined} />
    </>
  );
}
