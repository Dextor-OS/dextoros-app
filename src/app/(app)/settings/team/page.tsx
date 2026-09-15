import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return (
    <>
      <PageHeader title="Team" lede="Give each teammate the access they need." />
      <ComingSoon phase={8} items={["Members and roles: owner, operator, viewer", "Invitations"]} />
    </>
  );
}
