"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { CapabilityMatrix } from "@/components/skills/capability-matrix";
import { HoldToTeach } from "@/components/skills/hold-to-teach";
import { platformLabel } from "@/lib/domain/platforms";
import { capableRobots } from "@/lib/engine/skills";
import { isOnline } from "@/lib/engine/sim";
import { joinLabels } from "@/lib/fleet";
import { fleetActions, useFleet } from "@/lib/store/fleet";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function SkillDetail({ id }: { id: string }) {
  const { robots, skills, sessions } = useFleet();
  const router = useRouter();
  const skill = skills.find((s) => s.id === id);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  if (!skill) {
    return (
      <>
        <PageHeader title={id} lede="This skill does not exist." />
        <Link href="/skills" className="btn btn-ghost">
          Back to skills
        </Link>
      </>
    );
  }

  const capable = capableRobots(robots, skill);
  const teachers = capable.filter(isOnline);
  const teacher = teachers.find((r) => r.id === (teacherId ?? skill.teacher)) ?? teachers[0];
  const running = sessions.find((s) => s.skillId === skill.id && s.phase !== "published");

  const startSession = () => {
    if (running) {
      router.push("/training");
      return;
    }
    fleetActions.startSession(skill.id);
    router.push("/training");
  };

  return (
    <>
      <PageHeader
        title={`${skill.name} v${skill.version}`}
        lede={`Needs ${joinLabels(skill.needs)}. Taught on ${skill.teacher}.`}
        actions={
          <button type="button" onClick={startSession} className="btn btn-ghost btn-sm" disabled={teachers.length === 0}>
            {running ? "Open the running session" : "Start a training session"}
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="panel p-3 sm:p-4" aria-label="Which robots can run it">
          <CapabilityMatrix skill={skill} robots={robots} recordingId={recording ? teacher?.id : null} />
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line px-1 pt-3">
            <HoldToTeach
              version={skill.version}
              disabled={!teacher}
              onHoldChange={setRecording}
              onTeach={() => teacher && fleetActions.teachSkill(skill.id, teacher.id)}
            />
            <label className="flex items-center gap-2 text-[13px] text-haze">
              on
              <select className="field h-8 w-auto py-0 text-[13px]" value={teacher?.id ?? ""} onChange={(event) => setTeacherId(event.target.value)} disabled={teachers.length === 0} aria-label="Teacher robot">
                {teachers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} ({platformLabel(r.platform)})
                  </option>
                ))}
                {teachers.length === 0 && <option value="">No capable robot online</option>}
              </select>
            </label>
            <p className="ml-auto text-[13px] text-haze">
              Learned by <span className="mono text-fog">{capable.length}</span> of {robots.length} robots
            </p>
          </div>
        </section>

        <section className="panel p-4" aria-label="Versions">
          <p className="text-[13px] font-medium text-fog">Versions</p>
          <ol className="mt-3 space-y-3">
            {skill.versions.map((v) => (
              <li key={v.version} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="mono text-[13px] text-fog">v{v.version}</span>
                  <span className="mono text-[11.5px] text-dim">{v.time}</span>
                </div>
                <p className="mt-0.5 text-[12.5px] text-haze">
                  {v.source === "taught" ? (
                    <>
                      Taught on <span className="mono text-fog">{v.teacher}</span>
                    </>
                  ) : (
                    <>
                      Trained. Succeeds <span className="mono text-fog">{pct(v.successRate ?? 0)}</span>
                      {v.previousRate !== undefined && <>, up from {pct(v.previousRate)}</>}
                    </>
                  )}
                </p>
                <p className="text-[12px] text-dim">Learned by {v.learnedBy.length} robots</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
