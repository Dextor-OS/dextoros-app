"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ConnectorFile } from "@/components/connect/connector-file";
import { PairingStatus } from "@/components/connect/pairing-status";
import { type PlatformId, PLATFORMS } from "@/lib/domain/platforms";
import type { Transport } from "@/lib/domain/types";
import { NAME_MAX, TRANSPORTS } from "@/lib/engine/connector";
import { slugify } from "@/lib/engine/sim";
import { fleetActions, useFleet, useRobot } from "@/lib/store/fleet";
import { robotPath } from "@/lib/routes";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-line py-6 first:border-t-0 first:pt-0 md:grid-cols-[200px_minmax(0,1fr)]" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="flex items-start gap-3 text-[15px] font-semibold text-fog">
        <span className="mono inline-flex size-6 flex-none items-center justify-center rounded-full bg-fog/10 text-[12px]">{n}</span>
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Connect a robot, in the five steps from connect-your-first-robot.md. Steps 3 to 5 appear once the connector exists. */
export function ConnectWizard() {
  const { robots } = useFleet();
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<PlatformId>("warehouse-amr");
  const [transport, setTransport] = useState<Transport>("websocket");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const created = useRobot(createdId ?? "");

  const trimmed = name.trim();
  const slug = slugify(trimmed);
  const taken = robots.some((r) => r.id.toLowerCase() === trimmed.toLowerCase());
  const error = !trimmed ? "" : trimmed.length > NAME_MAX ? `Use at most ${NAME_MAX} characters.` : !slug ? "Use at least one letter or number." : taken ? "A robot with this name already exists." : "";
  const canSubmit = trimmed.length > 0 && !error;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const robot = fleetActions.addRobot({ name: trimmed, platform, transport });
    setCreatedId(robot.id);
  };

  if (created) {
    return (
      <div>
        <Step n={1} title="Robot named">
          <p className="text-[14px] text-fog">
            <span className="mono">{created.id}</span> <span className="text-dim">as</span> <span className="mono text-haze">{created.slug}</span>
          </p>
        </Step>
        <Step n={2} title="Platform and transport">
          <p className="text-[14px] text-haze">
            {PLATFORMS.find((p) => p.id === created.platform)?.label} over {TRANSPORTS.find((t) => t.id === created.transport)?.label}
          </p>
        </Step>
        <Step n={3} title="Download the connector file">
          <ConnectorFile robot={created} revealKey={false} />
        </Step>
        <Step n={4} title="Install on the robot">
          <p className="text-[13.5px] text-haze">Run the command above once. It fetches the connector for this robot and starts it.</p>
        </Step>
        <Step n={5} title="Wait for the first connection">
          <PairingStatus robot={created} />
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={robotPath(created.id)} className="btn btn-primary btn-sm">
              Open {created.id}
            </Link>
            <Link href={robotPath(created.id, "connector")} className="btn btn-ghost btn-sm">
              Keys and pairing
            </Link>
            <button type="button" onClick={() => { setCreatedId(null); setName(""); }} className="btn btn-ghost btn-sm">
              Connect another
            </button>
          </div>
        </Step>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Step n={1} title="Name the robot">
        <label htmlFor="robot-name" className="text-[13px] text-haze">
          Robot name, up to {NAME_MAX} characters
        </label>
        <input
          id="robot-name"
          className="field mono mt-2 max-w-sm text-[13px]"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="AMR-11"
          maxLength={NAME_MAX + 8}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? "true" : undefined}
          aria-describedby="robot-name-hint"
        />
        <p id="robot-name-hint" className={error ? "mt-2 text-[12.5px] text-danger" : "mt-2 text-[12.5px] text-dim"}>
          {error || (slug ? <>Files and endpoints will use <span className="mono text-haze">{slug}</span>.</> : "Lowercase letters and numbers are kept; everything else becomes a dash.")}
        </p>
      </Step>

      <Step n={2} title="Choose the platform and transport">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="robot-platform" className="text-[13px] text-haze">
              Platform
            </label>
            <select id="robot-platform" className="field mt-2" value={platform} onChange={(event) => setPlatform(event.target.value as PlatformId)}>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="robot-transport" className="text-[13px] text-haze">
              Transport
            </label>
            <select id="robot-transport" className="field mt-2" value={transport} onChange={(event) => setTransport(event.target.value as Transport)}>
              {TRANSPORTS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[12.5px] text-dim">{TRANSPORTS.find((t) => t.id === transport)?.hint}</p>
          </div>
        </div>
        <button type="submit" disabled={!canSubmit} className="btn btn-primary mt-5">
          Generate the connector
        </button>
      </Step>
    </form>
  );
}
