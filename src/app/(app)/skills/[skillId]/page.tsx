import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";
import { joinLabels, SKILLS } from "@/lib/fleet";

export default async function SkillPage({ params }: PageProps<"/skills/[skillId]">) {
  const { skillId } = await params;
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) notFound();
  return (
    <>
      <PageHeader title={`${skill.name} v${skill.version}`} lede={`Needs ${joinLabels(skill.needs)}. Taught on ${skill.teacher}.`} />
      <ComingSoon phase={6} items={["Which robots can run it and what each is missing", "Version history", "Hold to teach"]} />
    </>
  );
}
