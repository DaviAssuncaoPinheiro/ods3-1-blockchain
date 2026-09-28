"use client";

import { useState } from "react";

import { MAX_DESCRIPTION_LENGTH, MAX_TEXT_FIELD_LENGTH } from "@/constants/product";
import { Role } from "@/constants/roles";
import { useFormFields } from "@/hooks/useFormFields";
import { registerMaintenance } from "@/lib/blockchain/transactions";
import { byteLength, trimValues } from "@/lib/utils/strings";
import { requireValidText } from "@/lib/utils/validation";
import { ProductLink } from "@/components/products/ProductLink";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TextAreaField, TextField } from "@/components/ui/FormField";

export function RegisterMaintenanceForm({ initialProductId }: { initialProductId: string }) {
  const { values, bindField } = useFormFields({ productId: initialProductId, description: "" });
  const [submittedProductId, setSubmittedProductId] = useState<string | null>(null);
  const descriptionBytes = byteLength(values.description.trim());

  return (
    <TransactionForm
      requiredRole={Role.ServiceCenter}
      submitLabel="Registrar manutenção"
      onSubmit={(signer) => {
        const input = trimValues(values);
        requireValidText(input.productId, "ID do produto", MAX_TEXT_FIELD_LENGTH);
        requireValidText(input.description, "Descrição da manutenção", MAX_DESCRIPTION_LENGTH);
        setSubmittedProductId(input.productId);
        return registerMaintenance(signer, input);
      }}
      successAction={submittedProductId && <ProductLink productId={submittedProductId} />}
    >
      <TextField
        id="productId"
        label="ID do produto"
        placeholder="PP-0001"
        required
        maxLength={MAX_TEXT_FIELD_LENGTH}
        autoComplete="off"
        {...bindField("productId")}
      />
      <TextAreaField
        id="description"
        label="Descrição da manutenção"
        placeholder="Bateria substituída na garantia"
        required
        maxLength={MAX_DESCRIPTION_LENGTH}
        hint={
          <span className={descriptionBytes > MAX_DESCRIPTION_LENGTH ? "text-danger" : undefined}>
            {descriptionBytes}/{MAX_DESCRIPTION_LENGTH} bytes. Letras acentuadas contam como 2.
          </span>
        }
        {...bindField("description")}
      />
    </TransactionForm>
  );
}
