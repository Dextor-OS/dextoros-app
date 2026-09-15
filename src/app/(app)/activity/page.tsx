import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Activity" };

export default function ActivityPage() {
  return (
    <>
      <PageHeader title="Activity" lede="A searchable record of commands and events across every robot." />
      <ComingSoon phase={7} items={["Search", "Filter by robot and by type: cmd, ack, event, error"]} />
    </>
  );
}
