import { redirect } from "next/navigation";

// The portal opens on the fleet. Onboarding (demo fleet or connect a robot) arrives in phase 8.
export default function Home() {
  redirect("/fleet");
}
