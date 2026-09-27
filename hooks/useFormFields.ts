"use client";

import { useState, type ChangeEvent } from "react";

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function useFormFields<Values extends Record<string, string>>(initialValues: Values) {
  const [values, setValues] = useState<Values>(initialValues);

  function bindField<Name extends keyof Values & string>(name: Name) {
    return {
      name,
      value: values[name],
      onChange: (event: ChangeEvent<FieldElement>) =>
        setValues((previous) => ({ ...previous, [name]: event.target.value })),
    };
  }

  return { values, bindField };
}
