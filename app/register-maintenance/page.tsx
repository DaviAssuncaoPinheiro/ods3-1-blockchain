"use client";

import { Suspense } from "react";

import { useProductIdParam } from "@/hooks/useProductIdParam";
import { RegisterMaintenanceForm } from "@/components/forms/RegisterMaintenanceForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function RegisterMaintenancePage() {
  return (
    <>
      <PageHeader
        title="Registrar manutenção"
        description="Assistências técnicas adicionam registros de manutenção ao histórico do produto. Cada registro guarda o responsável e o horário do serviço."
      />
      <Panel title="Dados da manutenção" description="Requer o papel Assistência técnica.">
        <Suspense>
          <MaintenanceFormWithParams />
        </Suspense>
      </Panel>
    </>
  );
}

function MaintenanceFormWithParams() {
  return <RegisterMaintenanceForm initialProductId={useProductIdParam()} />;
}
