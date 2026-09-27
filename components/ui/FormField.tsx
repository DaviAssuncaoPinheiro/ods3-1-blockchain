import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const CONTROL_CLASSES =
  "w-full rounded-xl bg-sunken px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 outline-none transition-shadow focus:bg-surface focus:ring-2 focus:ring-accent";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}

function FieldShell({ id, label, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: ReactNode;
}

export function TextField({ id, label, hint, className = "", ...props }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <input id={id} className={`${CONTROL_CLASSES} ${className}`} {...props} />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: ReactNode;
}

export function TextAreaField({ id, label, hint, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <textarea id={id} rows={3} className={`${CONTROL_CLASSES} resize-none`} {...props} />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
}

export function SelectField({ id, label, options, ...props }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label}>
      <select id={id} className={CONTROL_CLASSES} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
