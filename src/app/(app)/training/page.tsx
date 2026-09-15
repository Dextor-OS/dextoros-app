import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { TrainingView } from "@/components/training/training-view";

export const metadata: Metadata = { title: "Training" };

export default function TrainingPage() {
  return (
    <>
      <PageHeader title="Training" lede="Every practice run makes the skill better. Episodes flow into one shared dataset and a new version ships back to every capable robot." />
      <TrainingView />
    </>
  );
}
