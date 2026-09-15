import type { Metadata } from "next";
import { ConnectWizard } from "@/components/connect/connect-wizard";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Connect a robot" };

export default function NewRobotPage() {
  return (
    <>
      <PageHeader title="Connect a robot" lede="Name the robot, pick its platform and transport, then run one install command on its onboard computer." />
      <div className="panel p-5 md:p-6">
        <ConnectWizard />
      </div>
    </>
  );
}
