import type { ReactNode } from "react";

export interface DataTableColumn {
  label: string;
  isNumeric?: boolean;
}

interface DataTableProps {
  columns: DataTableColumn[];
  children: ReactNode;
}

export const NUMERIC_CELL_CLASSES = "text-right tabular-nums";

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[42rem] text-left text-sm [&_td]:px-5 [&_td]:py-3 sm:[&_td]:px-6 [&_th]:px-5 sm:[&_th]:px-6 [&_tbody_tr]:border-t [&_tbody_tr]:border-line">
        <thead>
          <tr className="text-ink-muted">
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`pb-3 font-normal whitespace-nowrap ${column.isNumeric ? "text-right" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
