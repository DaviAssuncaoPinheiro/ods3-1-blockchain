import { GrantRoleForm } from "@/components/forms/GrantRoleForm";
import { RoleGrantList } from "@/components/roles/RoleGrantList";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function RolesPage() {
  return (
    <>
      <PageHeader
        title="Participantes"
        description="O administrador autoriza os endereços de fabricantes, varejistas e assistências técnicas. Consumidores não precisam de papel para consultar produtos."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Conceder papel" description="Requer o papel Administrador.">
          <GrantRoleForm />
        </Panel>
        <RoleGrantList />
      </div>
    </>
  );
}
