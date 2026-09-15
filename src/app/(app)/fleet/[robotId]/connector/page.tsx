import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";

export default async function ConnectorPage({ params }: PageProps<"/fleet/[robotId]/connector">) {
  const { robotId } = await params;
  return (
    <>
      <PageHeader title={`${robotId} connector`} lede="Connector file, install command and pairing key." />
      <ComingSoon phase={5} items={["dextoros-connector.yaml preview and download", "Install command", "Pairing state", "Rotate and revoke key"]} />
    </>
  );
}
