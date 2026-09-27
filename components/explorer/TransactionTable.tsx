import { APPLICATION_EVENT_LABELS } from "@/constants/explorer";
import type { ApplicationTransaction } from "@/types/blockchain";
import { DataTable, NUMERIC_CELL_CLASSES, type DataTableColumn } from "@/components/ui/DataTable";
import { MonoValue } from "@/components/ui/MonoValue";

const COLUMNS: DataTableColumn[] = [
  { label: "Event" },
  { label: "Details" },
  { label: "Sender" },
  { label: "Transaction hash" },
  { label: "Block", isNumeric: true },
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
            <MonoValue value={transaction.actor} format="address" />
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
