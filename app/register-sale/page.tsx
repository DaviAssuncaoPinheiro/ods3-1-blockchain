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
        title="Register Sale"
        description="Retailers record the sale of a registered product. The warranty period starts at the sale and each product can be sold only once."
      />
      <Panel title="Sale data" description="Requires the Retailer role.">
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
