import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Rules" };

export default function RulesPage() {
  return (
    <>
      <PageHeader title="Rules" lede="Set a rule once and it acts on any robot that reports the signal, whatever the maker." />
      <ComingSoon phase={7} items={["Triggers: battery below threshold, offline for 5 minutes", "Actions: send to dock, alert on-call", "Threshold 5 to 60 percent", "Preview: how many robots would respond"]} />
    </>
  );
}
