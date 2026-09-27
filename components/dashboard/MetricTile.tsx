import type { ReactNode } from "react";

interface MetricTileProps {
  label: string;
  value: ReactNode;
  detail: string;
}

export function MetricTile({ label, value, detail }: MetricTileProps) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-panel sm:p-6">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
    </div>
  );
}
