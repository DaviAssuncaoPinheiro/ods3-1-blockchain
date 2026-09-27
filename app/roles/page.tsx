import { GrantRoleForm } from "@/components/forms/GrantRoleForm";
import { RoleGrantList } from "@/components/roles/RoleGrantList";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function RolesPage() {
  return (
    <>
      <PageHeader
        title="Participants"
        description="The admin authorizes the addresses of manufacturers, retailers and service centers. Consumers need no role to consult products."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Grant a role" description="Requires the Admin role.">
          <GrantRoleForm />
        </Panel>
        <RoleGrantList />
      </div>
    </>
  );
}
