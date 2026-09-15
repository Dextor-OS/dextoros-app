/** Placeholder for a screen scheduled in a later phase of PLAN.md. */
export function ComingSoon({ phase, items }: { phase: number; items: string[] }) {
  return (
    <div className="panel p-6">
      <p className="text-sm text-haze">
        Scheduled for phase <span className="mono text-fog">{phase}</span>. This screen will include:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fog">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
