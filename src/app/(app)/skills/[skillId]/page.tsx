import type { Metadata } from "next";
import { SkillDetail } from "@/components/skills/skill-detail";
import { decodeParam } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/skills/[skillId]">): Promise<Metadata> {
  const skillId = decodeParam((await params).skillId);
  return { title: skillId };
}

export default async function SkillPage({ params }: PageProps<"/skills/[skillId]">) {
  const skillId = decodeParam((await params).skillId);
  return <SkillDetail id={skillId} />;
}
