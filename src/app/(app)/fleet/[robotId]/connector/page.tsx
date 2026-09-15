import type { Metadata } from "next";
import { decodeParam } from "@/lib/routes";
import { ConnectorPanel } from "@/components/connect/connector-panel";

export async function generateMetadata({ params }: PageProps<"/fleet/[robotId]/connector">): Promise<Metadata> {
  const robotId = decodeParam((await params).robotId);
  return { title: `${robotId} connector` };
}

export default async function ConnectorPage({ params }: PageProps<"/fleet/[robotId]/connector">) {
  const robotId = decodeParam((await params).robotId);
  return <ConnectorPanel id={robotId} />;
}
