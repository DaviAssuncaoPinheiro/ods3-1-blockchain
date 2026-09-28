import type { ReactNode } from "react";

import type { AsyncData } from "@/hooks/useAsyncData";

interface AsyncContentProps<T> {
  query: AsyncData<T[]>;
  emptyMessage: string;
  children: (items: T[]) => ReactNode;
}

export function AsyncContent<T>({ query, emptyMessage, children }: AsyncContentProps<T>) {
  if (query.error) return <p className="text-sm text-danger">{query.error}</p>;
  if (!query.data) {
    return <Placeholder>{query.isLoading ? "Carregando…" : "Aguardando a blockchain."}</Placeholder>;
  }
  if (query.data.length === 0) return <Placeholder>{emptyMessage}</Placeholder>;
  return <>{children(query.data)}</>;
}

function Placeholder({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-ink-muted">{children}</p>;
}
