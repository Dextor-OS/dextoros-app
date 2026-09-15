"use client";

import clsx from "clsx";
import type { Robot } from "@/lib/domain/types";
import { PAIRING_LABEL } from "@/lib/engine/sim";
import { fleetActions } from "@/lib/store/fleet";

const STEPS = ["waiting", "handshake", "live"] as const;

/** The three pairing states from the docs, with a simulated install for test mode and demo robots. */
export function PairingStatus({ robot }: { robot: Robot }) {
  const index = robot.pairing === "revoked" ? -1 : STEPS.indexOf(robot.pairing);
  const canSimulate = (robot.transport === "test" || robot.demo) && robot.pairing !== "live";

  return (
    <div className="@container">
      {/* Three across when there is room (the wizard), stacked in the narrow connector sidebar. */}
      <ol className="grid gap-2 @[540px]:grid-cols-3">
        {STEPS.map((step, i) => {
          const done = i < index;
          const current = i === index;
          return (
            <li
              key={step}
              aria-current={current ? "step" : undefined}
              className={clsx(
                "flex items-center gap-2.5 rounded-control px-3 py-2.5 text-[13px] ring-1 ring-inset",
                current ? "text-fog ring-line-strong" : done ? "text-haze ring-line" : "text-dim ring-line",
              )}
            >
              <span
                className={clsx(
                  "mono inline-flex size-5 flex-none items-center justify-center rounded-full text-[11px]",
                  current && step === "live" ? "bg-volt text-on-volt" : current ? "bg-fog text-void" : done ? "bg-fog/20 text-fog" : "ring-1 ring-inset ring-line-strong",
                )}
              >
                {i + 1}
              </span>
              {PAIRING_LABEL[step]}
              {current && step === "handshake" && <span className="waiting-dot ml-auto" aria-hidden="true" />}
              {current && step === "waiting" && <span className="waiting-dot ml-auto" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {robot.pairing === "revoked" && (
        <p className="mt-3 text-[13px] text-danger">Key revoked. This robot needs a new connector before it can connect again.</p>
      )}
      {robot.pairing === "live" && (
        <p className="mt-3 text-[13px] text-haze">
          The robot reported {robot.caps.length} capabilities and is streaming telemetry.
        </p>
      )}
      {canSimulate && robot.pairing !== "revoked" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => fleetActions.simulatePairing(robot.id)} className="btn btn-ghost btn-sm">
            Simulate the install
          </button>
          <p className="text-[12.5px] text-dim">{robot.transport === "test" ? "Test mode has no hardware, so play the connection here." : "This is a demo robot."}</p>
        </div>
      )}
      {!canSimulate && robot.pairing === "waiting" && (
        <p className="mt-3 text-[12.5px] text-dim">Waiting for the robot to run the install command. Nothing to do here until it connects.</p>
      )}
    </div>
  );
}
