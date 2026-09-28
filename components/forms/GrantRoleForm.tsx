"use client";

import { MAX_TEXT_FIELD_LENGTH } from "@/constants/product";
import { ALL_ROLES, Role, ROLE_LABELS, toRole } from "@/constants/roles";
import { useFormFields } from "@/hooks/useFormFields";
import { grantRole } from "@/lib/blockchain/transactions";
import { trimValues } from "@/lib/utils/strings";
import { requireValidText } from "@/lib/utils/validation";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { SelectField, TextField } from "@/components/ui/FormField";

const ROLE_OPTIONS = ALL_ROLES.map((role) => ({ value: String(role), label: ROLE_LABELS[role] }));
const ADDRESS_PATTERN = "^0x[a-fA-F0-9]{40}$";

export function GrantRoleForm() {
  const { values, bindField } = useFormFields({
    account: "",
    name: "",
    role: String(Role.Manufacturer),
  });

  return (
    <TransactionForm
      requiredRole={Role.Admin}
      submitLabel="Conceder papel"
      onSubmit={(signer) => {
        const input = trimValues(values);
        requireValidText(input.name, "Nome do participante", MAX_TEXT_FIELD_LENGTH);
        return grantRole(signer, {
          account: input.account,
          name: input.name,
          role: toRole(Number(input.role)) ?? Role.Manufacturer,
        });
      }}
    >
      <TextField
        id="account"
        label="Endereço da conta"
        placeholder="0x…"
        required
        pattern={ADDRESS_PATTERN}
        title="Um endereço Ethereum: 0x seguido de 40 caracteres hexadecimais"
        autoComplete="off"
        spellCheck={false}
        className="font-mono"
        {...bindField("account")}
      />
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <TextField
          id="name"
          label="Nome do participante"
          placeholder="Aurora Eletrônicos S.A."
          required
          maxLength={MAX_TEXT_FIELD_LENGTH}
          autoComplete="off"
          hint="Nome público exibido aos consumidores. Substitui o nome anterior da conta, se houver."
          {...bindField("name")}
        />
        <SelectField id="role" label="Papel" options={ROLE_OPTIONS} {...bindField("role")} />
      </div>
    </TransactionForm>
  );
}
