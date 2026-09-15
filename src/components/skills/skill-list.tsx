"use client";

import Link from "next/link";
import { useState } from "react";
import { CapabilityMatrix } from "@/components/skills/capability-matrix";
import { capableRobots } from "@/lib/engine/skills";
import { joinLabels } from "@/lib/fleet";
import { useFleet } from "@/lib/store/fleet";

/** Skill picker and the matrix for the chosen skill, then one card per skill. */
export function SkillList() {
  const { robots, skills } = useFleet();
  const [selectedId, setSelectedId] = useState(skills[0]?.id ?? "");
  const skill = skills.find((s) => s.id === selectedId) ?? skills[0];

  if (!skill) return <p className="text-haze">No skills yet.</p>;
  const learned = capableRobots(robots, skill).length;

  return (
    <div className="space-y-6">
      <div className="panel p-3 sm:p-4">
        <div role="radiogroup" aria-label="Skill" className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {skills.map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={s.id === skill.id} onClick={() => setSelectedId(s.id)} className="fm-chip">
              {s.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
          <p className="text-[13px] text-haze">
            Needs <span className="text-fog">{joinLabels(skill.needs)}</span>
          </p>
          <p className="mono text-[12px] text-haze">
            Skill version <span className="text-fog">v{skill.version}</span>
          </p>
        </div>
        <div className="mt-2">
          <CapabilityMatrix skill={skill} robots={robots} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line px-1 pt-3">
          <p className="text-[13px] text-haze">
            Learned by <span className="mono text-fog">{learned}</span> of {robots.length} robots
          </p>
          <Link href={`/skills/${skill.id}`} className="btn btn-ghost btn-sm">
            Open {skill.name}
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {skills.map((s) => (
          <Link key={s.id} href={`/skills/${s.id}`} className="panel block p-5 transition-[background-color] hover:bg-fog/[0.03]">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[17px] font-semibold">{s.name}</h2>
              <span className="mono text-[12px] text-volt-ink">v{s.version}</span>
            </div>
            <p className="mt-1 text-sm text-haze">Needs {joinLabels(s.needs)}</p>
            <p className="mt-3 text-sm text-dim">
              Learned by <span className="mono text-fog">{capableRobots(robots, s).length}</span> of {robots.length} robots. Taught on{" "}
              <span className="mono text-fog">{s.teacher}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
