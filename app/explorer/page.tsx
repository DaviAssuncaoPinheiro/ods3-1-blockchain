"use client";

import { LATEST_BLOCKS_COUNT, LATEST_TRANSACTIONS_COUNT } from "@/constants/explorer";
import { useChainQuery } from "@/hooks/useChainQuery";
import { fetchApplicationTransactions, fetchLatestBlocks } from "@/lib/blockchain/explorer";
import { BlockTable } from "@/components/explorer/BlockTable";
import { TransactionTable } from "@/components/explorer/TransactionTable";
import { AsyncContent } from "@/components/ui/AsyncContent";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function ExplorerPage() {
  const blocks = useChainQuery(() => fetchLatestBlocks(LATEST_BLOCKS_COUNT));
  const transactions = useChainQuery(async () =>
    (await fetchApplicationTransactions()).slice(0, LATEST_TRANSACTIONS_COUNT),
  );

  return (
    <>
      <PageHeader
        title="Blockchain Explorer"
        description="Each block stores the hash of the previous one. Changing an old record would change every hash after it, which is what makes the history tamper-evident."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Latest blocks" description="Updates automatically when a new block is mined.">
          <AsyncContent query={blocks} emptyMessage="No blocks yet.">
            {(items) => <BlockTable blocks={items} />}
          </AsyncContent>
        </Panel>
        <Panel
          title="Application transactions"
          description="Most recent ProductPass contract events, newest first."
        >
          <AsyncContent query={transactions} emptyMessage="No transactions yet.">
            {(items) => <TransactionTable transactions={items} />}
          </AsyncContent>
        </Panel>
      </div>
    </>
  );
}
