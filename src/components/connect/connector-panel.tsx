"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConnectorFile } from "@/components/connect/connector-file";
import { CopyButton } from "@/components/connect/copy-button";
import { PairingStatus } from "@/components/connect/pairing-status";
import { PageHeader } from "@/components/shell/page-header";
import { platformLabel } from "@/lib/domain/platforms";
import { maskKey, transportLabel } from "@/lib/engine/connector";
import { fleetActions, useRobot } from "@/lib/store/fleet";
import { robotPath } from "@/lib/routes";

/** Keys and pairing for one robot (docs: keys-and-pairing.md). */
export function ConnectorPanel({ id }: { id: string }) {
  const robot = useRobot(id);
  const router = useRouter();
  const [reveal, setReveal] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!robot) {
    return (
      <>
        <PageHeader title={id} lede="This robot is not in the fleet." />
        <Link href="/fleet" className="btn btn-ghost">
          Back to the fleet
        </Link>
      </>
    );
  }

  const remove = () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    fleetActions.removeRobot(robot.id);
    router.push("/fleet");
  };

  return (
    <>
      <PageHeader
        title={`${robot.id} connector`}
        lede={`${platformLabel(robot.platform)} over ${transportLabel(robot.transport)}`}
        actions={
          <Link href={robotPath(robot.id)} className="btn btn-ghost btn-sm">
            Telemetry
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel p-4 md:p-5" aria-label="Connector file">
          <ConnectorFile robot={robot} revealKey={reveal} />
        </section>

        <div className="space-y-4">
          <section className="panel p-4 md:p-5" aria-label="Pairing">
            <p className="mb-3 text-[13px] font-medium text-fog">Pairing</p>
            <PairingStatus robot={robot} />
          </section>

          <section className="panel p-4 md:p-5" aria-label="Pairing key">
            <p className="text-[13px] font-medium text-fog">Pairing key</p>
            <p className="mt-1 text-[12.5px] text-dim">Anyone with this key can connect as {robot.id}. Do not commit it or share it in chat.</p>
            <div className="mt-3 flex items-center gap-2">
              <code className="mono flex-1 truncate rounded-control bg-void/60 px-3 py-2 text-[12.5px] text-haze ring-1 ring-line">
                {reveal ? robot.pairingKey : maskKey(robot.pairingKey)}
              </code>
              <button type="button" onClick={() => setReveal((v) => !v)} className="btn btn-ghost btn-sm w-9 px-0" aria-label={reveal ? "Hide key" : "Show key"} aria-pressed={reveal}>
                {reveal ? <EyeSlash size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
              <CopyButton text={robot.pairingKey} label="Copy" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {robot.pairing === "revoked" ? (
                <button type="button" onClick={() => fleetActions.regenerateConnector(robot.id)} className="btn btn-primary btn-sm">
                  Generate a new connector
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => fleetActions.rotateKey(robot.id)} className="btn btn-ghost btn-sm">
                    Rotate key
                  </button>
                  <button type="button" onClick={() => fleetActions.revokeKey(robot.id)} className="btn btn-danger btn-sm">
                    Revoke key
                  </button>
                </>
              )}
            </div>
            <p className="mt-3 text-[12.5px] text-dim">
              Rotating stops the old key at once, so reinstall the connector with the new file. Revoking disconnects the robot until it gets a new connector.
            </p>
          </section>

          {!robot.demo && (
            <section className="panel p-4 md:p-5" aria-label="Remove robot">
              <p className="text-[13px] font-medium text-fog">Remove {robot.id}</p>
              <p className="mt-1 text-[12.5px] text-dim">Removes the robot, its key and its history from the fleet.</p>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={remove} className="btn btn-danger btn-sm">
                  {confirmRemove ? "Yes, remove it" : "Remove robot"}
                </button>
                {confirmRemove && (
                  <button type="button" onClick={() => setConfirmRemove(false)} className="btn btn-ghost btn-sm">
                    Keep it
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
