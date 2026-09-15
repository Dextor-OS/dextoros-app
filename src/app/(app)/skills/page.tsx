import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { FLEET, joinLabels, missingCapabilities, SKILLS } from "@/lib/fleet";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <>
      <PageHeader title="Skills" lede="A skill runs on any robot that has every capability it needs. The full matrix and Hold to teach arrive in phase 6." />
      <div className="grid gap-3 sm:grid-cols-2">
        {SKILLS.map((skill) => {
          const capable = FLEET.filter((r) => missingCapabilities(r, skill).length === 0).length;
          return (
            <Link key={skill.id} href={`/skills/${skill.id}`} className="panel block p-5 transition-[background-color] hover:bg-fog/[0.03]">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[17px] font-semibold">{skill.name}</h2>
                <span className="mono text-[12px] text-volt-ink">v{skill.version}</span>
              </div>
              <p className="mt-1 text-sm text-haze">Needs {joinLabels(skill.needs)}</p>
              <p className="mt-3 text-sm text-dim">
                Learned by <span className="mono text-fog">{capable}</span> of {FLEET.length} robots. Taught on{" "}
                <span className="mono text-fog">{skill.teacher}</span>
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
