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
        title="Explorador da blockchain"
        description="Cada bloco guarda o hash do bloco anterior. Alterar um registro antigo mudaria todos os hashes seguintes, e é isso que torna qualquer adulteração do histórico detectável."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Últimos blocos" description="Atualiza automaticamente quando um novo bloco é minerado.">
          <AsyncContent query={blocks} emptyMessage="Nenhum bloco ainda.">
            {(items) => <BlockTable blocks={items} />}
          </AsyncContent>
        </Panel>
        <Panel
          title="Transações da aplicação"
          description="Eventos mais recentes do contrato ProductPass, do mais novo para o mais antigo."
        >
          <AsyncContent query={transactions} emptyMessage="Nenhuma transação ainda.">
            {(items) => <TransactionTable transactions={items} />}
          </AsyncContent>
        </Panel>
      </div>
    </>
  );
}
