"use client";

import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { CopyButton } from "@/components/connect/copy-button";
import type { Robot } from "@/lib/domain/types";
import { CONNECTOR_FILENAME, connectorYaml, installCommand } from "@/lib/engine/connector";

function download(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/yaml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = CONNECTOR_FILENAME;
  a.click();
  URL.revokeObjectURL(url);
}

/** The connector YAML with download and copy, and the one-line install command. */
export function ConnectorFile({ robot, revealKey }: { robot: Robot; revealKey: boolean }) {
  const yaml = connectorYaml(robot);
  const shown = revealKey ? yaml : yaml.replace(robot.pairingKey, "<filled in for you>");
  const install = installCommand(robot.slug);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="mono text-[13px] text-fog">{CONNECTOR_FILENAME}</p>
          <div className="flex gap-2">
            <CopyButton text={yaml} label="Copy" />
            <button type="button" onClick={() => download(yaml)} className="btn btn-primary btn-sm">
              <DownloadSimple size={14} weight="bold" aria-hidden="true" />
              Download
            </button>
          </div>
        </div>
        <pre className="mono mt-2 overflow-x-auto rounded-control bg-void/60 p-3 text-[12px] leading-5 text-haze ring-1 ring-line">{shown}</pre>
        {!revealKey && <p className="mt-2 text-[12.5px] text-dim">The pairing key is hidden here. The downloaded file includes it.</p>}
      </div>

      <div>
        <p className="text-[13px] text-fog">Run this once on the robot&apos;s onboard computer</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="mono block flex-1 overflow-x-auto rounded-control bg-void/60 px-3 py-2.5 text-[12.5px] text-haze ring-1 ring-line">{install}</code>
          <CopyButton text={install} label="Copy command" />
        </div>
      </div>
    </div>
  );
}
