import { formatDateTime } from "@/lib/utils/format";
import type { BlockSummary } from "@/types/blockchain";
import { DataTable, NUMERIC_CELL_CLASSES, type DataTableColumn } from "@/components/ui/DataTable";
import { MonoValue } from "@/components/ui/MonoValue";

const COLUMNS: DataTableColumn[] = [
  { label: "Block" },
  { label: "Hash" },
  { label: "Previous hash" },
  { label: "Timestamp" },
  { label: "Transactions", isNumeric: true },
];

export function BlockTable({ blocks }: { blocks: BlockSummary[] }) {
  return (
    <DataTable columns={COLUMNS}>
      {blocks.map((block) => (
        <tr key={block.hash}>
          <td className="font-medium tabular-nums">#{block.number}</td>
          <td>
            <MonoValue value={block.hash} format="hash" />
          </td>
          <td>
            <MonoValue value={block.parentHash} format="hash" className="text-ink-muted" />
          </td>
          <td className="whitespace-nowrap">{formatDateTime(block.timestamp)}</td>
          <td className={NUMERIC_CELL_CLASSES}>{block.transactionCount}</td>
        </tr>
      ))}
    </DataTable>
  );
}
