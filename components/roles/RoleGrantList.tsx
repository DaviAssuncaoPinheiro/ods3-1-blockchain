"use client";

import { useParticipants } from "@/components/providers/ParticipantsProvider";
import { ParticipantValue } from "@/components/participants/ParticipantValue";
import { AsyncContent } from "@/components/ui/AsyncContent";
import { DataTable, NUMERIC_CELL_CLASSES, type DataTableColumn } from "@/components/ui/DataTable";
import { Panel } from "@/components/ui/Panel";

const COLUMNS: DataTableColumn[] = [
  { label: "Participante" },
  { label: "Papel" },
  { label: "Nome no registro" },
  { label: "Concedido por" },
  { label: "Bloco", isNumeric: true },
];

export function RoleGrantList() {
  const { grants } = useParticipants();

  return (
    <Panel
      title="Participantes autorizados"
      description="Montado a partir dos eventos RoleGranted. A coluna Participante mostra o nome atual; Nome no registro mostra o nome informado naquela concessão."
    >
      <AsyncContent query={grants} emptyMessage="Nenhum papel concedido ainda.">
        {(items) => (
          <DataTable columns={COLUMNS}>
            {items.map((grant) => (
              <tr key={`${grant.transactionHash}-${grant.roleLabel}`}>
                <td>
                  <ParticipantValue address={grant.account} />
                </td>
                <td className="whitespace-nowrap">{grant.roleLabel}</td>
                <td>{grant.participantName}</td>
                <td>
                  <ParticipantValue address={grant.grantedBy} isCompact className="text-ink-muted" />
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
