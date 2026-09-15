import type { Metadata } from "next";
import { RobotDetail } from "@/components/fleet/robot-detail";

export async function generateMetadata({ params }: PageProps<"/fleet/[robotId]">): Promise<Metadata> {
  const { robotId } = await params;
  return { title: robotId };
}

export default async function RobotPage({ params }: PageProps<"/fleet/[robotId]">) {
  const { robotId } = await params;
  return <RobotDetail id={robotId} />;
}
