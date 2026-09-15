import type { Metadata } from "next";
import { FleetList } from "@/components/fleet/fleet-list";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Fleet" };

export default function FleetPage() {
  return (
    <>
      <PageHeader title="Fleet" lede="Every connected robot with its activity, whatever the maker. Open one for telemetry and history." />
      <FleetList />
    </>
  );
}
