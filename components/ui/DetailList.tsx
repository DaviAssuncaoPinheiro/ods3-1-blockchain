import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode;
}

export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-sm text-ink-muted">{item.label}</dt>
          <dd className="mt-1 text-base">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
