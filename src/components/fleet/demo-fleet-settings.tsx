"use client";

import { fleetActions, useFleet } from "@/lib/store/fleet";

/** Team and access docs: remove the demo fleet in one click once your own robots are connected. */
export function DemoFleetSettings() {
  const { robots } = useFleet();
  const demo = robots.filter((r) => r.demo);
  const own = robots.length - demo.length;

  return (
    <div className="panel p-5">
      {demo.length > 0 ? (
        <>
          <p className="text-fog">
            The demo fleet has <span className="mono">{demo.length}</span> simulated robots:{" "}
            <span className="mono text-haze">{demo.map((r) => r.id).join(", ")}</span>.
          </p>
          <p className="mt-1 text-sm text-haze">
            {own === 0 ? "Connect a real robot first if you want to keep something in the fleet." : `You have ${own} of your own robots connected.`}
          </p>
          <button type="button" onClick={fleetActions.removeDemoFleet} className="btn btn-danger mt-4">
            Remove the demo fleet
          </button>
        </>
      ) : (
        <>
          <p className="text-fog">The demo fleet is removed.</p>
          <p className="mt-1 text-sm text-haze">Bring it back any time to learn the console, skills and rules without hardware.</p>
          <button type="button" onClick={fleetActions.restoreDemoFleet} className="btn btn-ghost mt-4">
            Restore the demo fleet
          </button>
        </>
      )}
    </div>
  );
}
