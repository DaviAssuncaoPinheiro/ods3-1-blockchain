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
        title="Register Maintenance"
        description="Service centers add maintenance records to a product's history. Each record keeps the responsible address and the time of the service."
      />
      <Panel title="Maintenance data" description="Requires the Service Center role.">
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
