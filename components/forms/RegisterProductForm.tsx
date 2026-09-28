"use client";

import { useState } from "react";

import { MAX_TEXT_FIELD_LENGTH } from "@/constants/product";
import { Role } from "@/constants/roles";
import { useFormFields } from "@/hooks/useFormFields";
import { registerProduct } from "@/lib/blockchain/transactions";
import { trimValues } from "@/lib/utils/strings";
import { requireValidText } from "@/lib/utils/validation";
import { ProductLink } from "@/components/products/ProductLink";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TextField } from "@/components/ui/FormField";

const TEXT_INPUT_PROPS = { required: true, maxLength: MAX_TEXT_FIELD_LENGTH, autoComplete: "off" };

const FIELD_LABELS = {
  productId: "ID do produto",
  serialNumber: "Número de série",
  name: "Nome do produto",
  model: "Modelo",
};

export function RegisterProductForm() {
  const { values, bindField } = useFormFields({
    productId: "",
    serialNumber: "",
    name: "",
    model: "",
  });
  const [submittedProductId, setSubmittedProductId] = useState<string | null>(null);

  return (
    <TransactionForm
      requiredRole={Role.Manufacturer}
      submitLabel="Registrar produto"
      onSubmit={(signer) => {
        const input = trimValues(values);
        for (const field of Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[]) {
          requireValidText(input[field], FIELD_LABELS[field], MAX_TEXT_FIELD_LENGTH);
        }
        setSubmittedProductId(input.productId);
        return registerProduct(signer, input);
      }}
      successAction={submittedProductId && <ProductLink productId={submittedProductId} />}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="productId"
          label={FIELD_LABELS.productId}
          placeholder="PP-0002"
          {...TEXT_INPUT_PROPS}
          {...bindField("productId")}
        />
        <TextField
          id="serialNumber"
          label={FIELD_LABELS.serialNumber}
          placeholder="SN-2026-000002"
          {...TEXT_INPUT_PROPS}
          {...bindField("serialNumber")}
        />
        <TextField
          id="name"
          label={FIELD_LABELS.name}
          placeholder="Smartwatch Aurora"
          {...TEXT_INPUT_PROPS}
          {...bindField("name")}
        />
        <TextField
          id="model"
          label={FIELD_LABELS.model}
          placeholder="AW-200"
          {...TEXT_INPUT_PROPS}
          {...bindField("model")}
        />
      </div>
    </TransactionForm>
  );
}
