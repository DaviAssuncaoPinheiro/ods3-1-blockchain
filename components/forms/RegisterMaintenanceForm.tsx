"use client";

import { useState } from "react";

import { MAX_DESCRIPTION_LENGTH, MAX_TEXT_FIELD_LENGTH } from "@/constants/product";
import { Role } from "@/constants/roles";
import { useFormFields } from "@/hooks/useFormFields";
import { registerMaintenance } from "@/lib/blockchain/transactions";
import { trimValues } from "@/lib/utils/strings";
import { ProductLink } from "@/components/products/ProductLink";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TextAreaField, TextField } from "@/components/ui/FormField";

export function RegisterMaintenanceForm({ initialProductId }: { initialProductId: string }) {
  const { values, bindField } = useFormFields({ productId: initialProductId, description: "" });
  const [submittedProductId, setSubmittedProductId] = useState<string | null>(null);

  return (
    <TransactionForm
      requiredRole={Role.ServiceCenter}
      submitLabel="Register Maintenance"
      onSubmit={(signer) => {
        const input = trimValues(values);
        setSubmittedProductId(input.productId);
        return registerMaintenance(signer, input);
      }}
      successAction={submittedProductId && <ProductLink productId={submittedProductId} />}
    >
      <TextField
        id="productId"
        label="Product ID"
        placeholder="PP-0001"
        required
        maxLength={MAX_TEXT_FIELD_LENGTH}
        autoComplete="off"
        {...bindField("productId")}
      />
      <TextAreaField
        id="description"
        label="Maintenance description"
        placeholder="Battery replaced under warranty"
        required
        maxLength={MAX_DESCRIPTION_LENGTH}
        hint={`${values.description.length}/${MAX_DESCRIPTION_LENGTH} characters`}
        {...bindField("description")}
      />
    </TransactionForm>
  );
}
