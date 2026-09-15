import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return (
    <>
      <PageHeader title="Profile" lede="Your name, email and theme." />
      <ComingSoon phase={8} items={["Name and email", "Theme preference"]} />
    </>
  );
}
