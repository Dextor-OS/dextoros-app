"use client";

import { CommandInput } from "@/components/console/command-input";
import { LogList } from "@/components/console/log-list";
import type { Robot } from "@/lib/domain/types";
import { fleetActions, useRobotLogs } from "@/lib/store/fleet";

/** Log plus command line for one robot. Used on the robot page and inside the fleet console. */
export function RobotConsole({ robot, logHeight = "h-56", autoFocus }: { robot: Robot; logHeight?: string; autoFocus?: boolean }) {
  const logs = useRobotLogs(robot.id);
  return (
    <div>
      <LogList lines={logs} label={`History for ${robot.id}`} className={logHeight} />
      <div className="mt-4">
        <CommandInput key={robot.id} robotId={robot.id} kind={robot.kind} autoFocus={autoFocus} onSend={(raw) => fleetActions.sendCommand(robot.id, raw)} />
      </div>
    </div>
  );
}
