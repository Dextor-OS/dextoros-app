"use client";

import { useState } from "react";
import { SessionCard } from "@/components/training/session-card";
import { capableRobots } from "@/lib/engine/skills";
import { isOnline } from "@/lib/engine/sim";
import { fleetActions, useFleet } from "@/lib/store/fleet";

export function TrainingView() {
  const { robots, skills, sessions } = useFleet();
  const [skillId, setSkillId] = useState(skills[0]?.id ?? "");
  const skill = skills.find((s) => s.id === skillId) ?? skills[0];
  const online = skill ? capableRobots(robots, skill).filter(isOnline).length : 0;
  const running = skill ? sessions.some((s) => s.skillId === skill.id && s.phase !== "published") : false;
  const active = sessions.filter((s) => s.phase !== "published");
  const past = sessions.filter((s) => s.phase === "published");

  return (
    <div className="space-y-6">
      <div className="panel flex flex-wrap items-end gap-3 p-4">
        <label className="flex-1 basis-56 text-[13px] text-haze">
          Skill
          <select className="field mt-2" value={skill?.id ?? ""} onChange={(event) => setSkillId(event.target.value)}>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} v{s.version}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary" disabled={!skill || online === 0 || running} onClick={() => skill && fleetActions.startSession(skill.id)}>
          {skill ? `Train v${skill.version + 1}` : "Start session"}
        </button>
        <p className="basis-full text-[12.5px] text-dim">
          {running
            ? "A session for this skill is already running."
            : online === 0
              ? "No capable robot is online, so there is nobody to collect episodes from."
              : `${online} capable robots online will add their practice runs to the shared dataset.`}
        </p>
      </div>

      {active.length > 0 && (
        <section aria-label="Running sessions" className="space-y-4">
          {active.map((session) => {
            const s = skills.find((k) => k.id === session.skillId);
            return s ? <SessionCard key={session.id} session={session} skill={s} /> : null;
          })}
        </section>
      )}

      {past.length > 0 && (
        <section aria-label="Published sessions" className="space-y-4">
          <h2 className="text-[13px] font-medium text-dim">Published</h2>
          {past.map((session) => {
            const s = skills.find((k) => k.id === session.skillId);
            return s ? <SessionCard key={session.id} session={session} skill={s} /> : null;
          })}
        </section>
      )}

      {sessions.length === 0 && (
        <p className="text-[13px] text-dim">No sessions yet. Pick a skill and train the next version.</p>
      )}
    </div>
  );
}
