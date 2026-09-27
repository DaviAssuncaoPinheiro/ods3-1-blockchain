"use client";

import { useState } from "react";

import {
  DEFAULT_WARRANTY_MONTHS,
  MAX_TEXT_FIELD_LENGTH,
  MAX_WARRANTY_MONTHS,
} from "@/constants/product";
import { Role } from "@/constants/roles";
import { useFormFields } from "@/hooks/useFormFields";
import { registerSale } from "@/lib/blockchain/transactions";
import { ProductLink } from "@/components/products/ProductLink";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TextField } from "@/components/ui/FormField";

export function RegisterSaleForm({ initialProductId }: { initialProductId: string }) {
  const { values, bindField } = useFormFields({
    productId: initialProductId,
    warrantyMonths: String(DEFAULT_WARRANTY_MONTHS),
  });
  const [submittedProductId, setSubmittedProductId] = useState<string | null>(null);

  return (
    <TransactionForm
      requiredRole={Role.Retailer}
      submitLabel="Register Sale"
      onSubmit={(signer) => {
        const productId = values.productId.trim();
        setSubmittedProductId(productId);
        return registerSale(signer, { productId, warrantyMonths: Number(values.warrantyMonths) });
      }}
      successAction={submittedProductId && <ProductLink productId={submittedProductId} />}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="productId"
          label="Product ID"
          placeholder="PP-0001"
          required
          maxLength={MAX_TEXT_FIELD_LENGTH}
          autoComplete="off"
          {...bindField("productId")}
        />
        <TextField
          id="warrantyMonths"
          label="Warranty duration (months)"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_WARRANTY_MONTHS}
          step={1}
          required
          hint={`Between 1 and ${MAX_WARRANTY_MONTHS} months, starting at the sale.`}
          {...bindField("warrantyMonths")}
        />
      </div>
    </TransactionForm>
  );
}
