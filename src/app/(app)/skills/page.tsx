import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { SkillList } from "@/components/skills/skill-list";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <>
      <PageHeader title="Skills" lede="A skill runs on any robot that has every capability it needs. Pick one to see who can run it and what stands in the way." />
      <SkillList />
    </>
  );
}
