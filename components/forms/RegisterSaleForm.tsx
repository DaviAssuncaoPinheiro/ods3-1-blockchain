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
import { requireValidText } from "@/lib/utils/validation";
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
      submitLabel="Registrar venda"
      onSubmit={(signer) => {
        const productId = values.productId.trim();
        requireValidText(productId, "ID do produto", MAX_TEXT_FIELD_LENGTH);
        setSubmittedProductId(productId);
        return registerSale(signer, { productId, warrantyMonths: Number(values.warrantyMonths) });
      }}
      successAction={submittedProductId && <ProductLink productId={submittedProductId} />}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="productId"
          label="ID do produto"
          placeholder="PP-0001"
          required
          maxLength={MAX_TEXT_FIELD_LENGTH}
          autoComplete="off"
          {...bindField("productId")}
        />
        <TextField
          id="warrantyMonths"
          label="Duração da garantia (meses)"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_WARRANTY_MONTHS}
          step={1}
          required
          hint={`Entre 1 e ${MAX_WARRANTY_MONTHS} meses, contados a partir da venda (1 mês = 30 dias).`}
          {...bindField("warrantyMonths")}
        />
      </div>
    </TransactionForm>
  );
}
