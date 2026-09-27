"use client";

import { ALL_ROLES, Role, ROLE_LABELS, toRole } from "@/constants/roles";
import { useFormFields } from "@/hooks/useFormFields";
import { grantRole } from "@/lib/blockchain/transactions";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { SelectField, TextField } from "@/components/ui/FormField";

const ROLE_OPTIONS = ALL_ROLES.map((role) => ({ value: String(role), label: ROLE_LABELS[role] }));
const ADDRESS_PATTERN = "^0x[a-fA-F0-9]{40}$";

export function GrantRoleForm() {
  const { values, bindField } = useFormFields({
    account: "",
    role: String(Role.Manufacturer),
  });

  return (
    <TransactionForm
      requiredRole={Role.Admin}
      submitLabel="Grant Role"
      onSubmit={(signer) =>
        grantRole(signer, {
          account: values.account.trim(),
          role: toRole(Number(values.role)) ?? Role.Manufacturer,
        })
      }
    >
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <TextField
          id="account"
          label="Account address"
          placeholder="0x…"
          required
          pattern={ADDRESS_PATTERN}
          title="An Ethereum address: 0x followed by 40 hexadecimal characters"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          {...bindField("account")}
        />
        <SelectField id="role" label="Role" options={ROLE_OPTIONS} {...bindField("role")} />
      </div>
    </TransactionForm>
  );
}
