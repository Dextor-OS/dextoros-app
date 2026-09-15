import type { Metadata } from "next";
import { decodeParam } from "@/lib/routes";
import { RobotDetail } from "@/components/fleet/robot-detail";

export async function generateMetadata({ params }: PageProps<"/fleet/[robotId]">): Promise<Metadata> {
  const robotId = decodeParam((await params).robotId);
  return { title: robotId };
}

export default async function RobotPage({ params }: PageProps<"/fleet/[robotId]">) {
  const robotId = decodeParam((await params).robotId);
  return <RobotDetail id={robotId} />;
}
