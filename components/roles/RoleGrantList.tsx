"use client";

import { useChainQuery } from "@/hooks/useChainQuery";
import { fetchRoleGrants } from "@/lib/blockchain/roles";
import { AsyncContent } from "@/components/ui/AsyncContent";
import { DataTable, NUMERIC_CELL_CLASSES, type DataTableColumn } from "@/components/ui/DataTable";
import { MonoValue } from "@/components/ui/MonoValue";
import { Panel } from "@/components/ui/Panel";

const COLUMNS: DataTableColumn[] = [
  { label: "Account" },
  { label: "Role" },
  { label: "Granted by" },
  { label: "Block", isNumeric: true },
];

export function RoleGrantList() {
  const grants = useChainQuery(fetchRoleGrants);

  return (
    <Panel title="Authorized participants" description="Built from the RoleGranted events.">
      <AsyncContent query={grants} emptyMessage="No roles granted yet.">
        {(items) => (
          <DataTable columns={COLUMNS}>
            {items.map((grant) => (
              <tr key={`${grant.transactionHash}-${grant.roleLabel}`}>
                <td>
                  <MonoValue value={grant.account} />
                </td>
                <td className="whitespace-nowrap">{grant.roleLabel}</td>
                <td>
                  <MonoValue value={grant.grantedBy} format="address" className="text-ink-muted" />
                </td>
                <td className={NUMERIC_CELL_CLASSES}>#{grant.blockNumber}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </AsyncContent>
    </Panel>
  );
}
