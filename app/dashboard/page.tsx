"use client";

import Link from "next/link";

import { DASHBOARD_ACTIVITY_COUNT } from "@/constants/explorer";
import { ROUTES } from "@/constants/routes";
import { useChainQuery } from "@/hooks/useChainQuery";
import { countUniqueTransactions, fetchApplicationTransactions } from "@/lib/blockchain/explorer";
import { AccountPanel } from "@/components/dashboard/AccountPanel";
import { NetworkMetrics } from "@/components/dashboard/NetworkMetrics";
import { TransactionTable } from "@/components/explorer/TransactionTable";
import { AsyncContent } from "@/components/ui/AsyncContent";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function DashboardPage() {
  const activity = useChainQuery(fetchApplicationTransactions);
  const recentTransactions = {
    ...activity,
    data: activity.data?.slice(0, DASHBOARD_ACTIVITY_COUNT) ?? null,
  };
  const totalTransactions = activity.data ? countUniqueTransactions(activity.data) : null;

  return (
    <>
      <PageHeader
        title="Painel"
        description="Passaportes digitais de produtos compartilhados por fabricantes, varejistas, assistências técnicas e consumidores em uma blockchain local."
      />
      <div className="flex flex-col gap-6">
        <NetworkMetrics totalTransactions={totalTransactions} />
        <AccountPanel />
        <Panel
          title="Atividade recente"
          action={
            <Link
              href={ROUTES.explorer}
              className="text-sm font-medium text-accent hover:text-accent-strong"
            >
              Abrir explorador
            </Link>
          }
        >
          <AsyncContent query={recentTransactions} emptyMessage="Nenhuma transação ainda.">
            {(items) => <TransactionTable transactions={items} />}
          </AsyncContent>
        </Panel>
      </div>
    </>
  );
}
