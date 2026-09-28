"use client";

import { Suspense } from "react";

import { useProductIdParam } from "@/hooks/useProductIdParam";
import { RegisterSaleForm } from "@/components/forms/RegisterSaleForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function RegisterSalePage() {
  return (
    <>
      <PageHeader
        title="Registrar venda"
        description="Varejistas registram a venda de um produto já registrado. A garantia começa na venda e cada produto só pode ser vendido uma vez."
      />
      <Panel title="Dados da venda" description="Requer o papel Varejista.">
        <Suspense>
          <SaleFormWithParams />
        </Suspense>
      </Panel>
    </>
  );
}

function SaleFormWithParams() {
  return <RegisterSaleForm initialProductId={useProductIdParam()} />;
}
