import { APPLICATION_EVENT_LABELS } from "@/constants/explorer";
import type { ApplicationTransaction } from "@/types/blockchain";
import { DataTable, NUMERIC_CELL_CLASSES, type DataTableColumn } from "@/components/ui/DataTable";
import { ParticipantValue } from "@/components/participants/ParticipantValue";
import { MonoValue } from "@/components/ui/MonoValue";

const COLUMNS: DataTableColumn[] = [
  { label: "Evento" },
  { label: "Detalhes" },
  { label: "Remetente" },
  { label: "Hash da transação" },
  { label: "Bloco", isNumeric: true },
];

export function TransactionTable({ transactions }: { transactions: ApplicationTransaction[] }) {
  return (
    <DataTable columns={COLUMNS}>
      {transactions.map((transaction) => (
        <tr key={transaction.id}>
          <td className="font-medium whitespace-nowrap">
            {APPLICATION_EVENT_LABELS[transaction.eventName]}
          </td>
          <td>{transaction.summary}</td>
          <td>
            <ParticipantValue address={transaction.actor} isCompact />
          </td>
          <td>
            <MonoValue value={transaction.transactionHash} format="hash" />
          </td>
          <td className={NUMERIC_CELL_CLASSES}>#{transaction.blockNumber}</td>
        </tr>
      ))}
    </DataTable>
  );
}
