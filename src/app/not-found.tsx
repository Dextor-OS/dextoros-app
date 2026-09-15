import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="display text-[28px]">Nothing here</h1>
      <p className="text-haze">That robot, skill or page does not exist.</p>
      <Link href="/fleet" className="btn btn-ghost">
        Back to the fleet
      </Link>
    </div>
  );
}
