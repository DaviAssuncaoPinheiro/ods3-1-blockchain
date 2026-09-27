"use client";

import { useState } from "react";

import { MAX_TEXT_FIELD_LENGTH } from "@/constants/product";
import { Role } from "@/constants/roles";
import { useFormFields } from "@/hooks/useFormFields";
import { registerProduct } from "@/lib/blockchain/transactions";
import { trimValues } from "@/lib/utils/strings";
import { ProductLink } from "@/components/products/ProductLink";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TextField } from "@/components/ui/FormField";

const TEXT_INPUT_PROPS = { required: true, maxLength: MAX_TEXT_FIELD_LENGTH, autoComplete: "off" };

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
      submitLabel="Register Product"
      onSubmit={(signer) => {
        const input = trimValues(values);
        setSubmittedProductId(input.productId);
        return registerProduct(signer, input);
      }}
      successAction={submittedProductId && <ProductLink productId={submittedProductId} />}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="productId"
          label="Product ID"
          placeholder="PP-0002"
          {...TEXT_INPUT_PROPS}
          {...bindField("productId")}
        />
        <TextField
          id="serialNumber"
          label="Serial number"
          placeholder="SN-2026-000002"
          {...TEXT_INPUT_PROPS}
          {...bindField("serialNumber")}
        />
        <TextField
          id="name"
          label="Product name"
          placeholder="Aurora Smartwatch"
          {...TEXT_INPUT_PROPS}
          {...bindField("name")}
        />
        <TextField
          id="model"
          label="Model"
          placeholder="AW-200"
          {...TEXT_INPUT_PROPS}
          {...bindField("model")}
        />
      </div>
    </TransactionForm>
  );
}
