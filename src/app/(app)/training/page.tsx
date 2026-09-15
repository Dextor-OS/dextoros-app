import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Training" };

export default function TrainingPage() {
  return (
    <>
      <PageHeader title="Training" lede="Every practice run makes the skill better. Episodes flow into one dataset and a new version ships back." />
      <ComingSoon phase={6} items={["Sessions: collecting episodes, training, evaluating, published", "Pause and resume while collecting", "Held-out evaluation result"]} />
    </>
  );
}
