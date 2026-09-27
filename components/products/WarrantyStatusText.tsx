import { getWarrantyStatus } from "@/lib/utils/warranty";
import type { Product, WarrantyStatus } from "@/types/product";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "@/components/ui/icons";

const WARRANTY_DISPLAY: Record<
  WarrantyStatus,
  { label: string; className: string; icon: typeof InfoIcon }
> = {
  Active: { label: "Active", className: "text-success", icon: CheckCircleIcon },
  Expired: { label: "Expired", className: "text-danger", icon: AlertIcon },
  NotStarted: { label: "Not started — product not sold yet", className: "text-ink-muted", icon: InfoIcon },
};

export function WarrantyStatusText({ product }: { product: Product }) {
  const { label, className, icon: StatusIcon } = WARRANTY_DISPLAY[getWarrantyStatus(product)];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <StatusIcon width={18} height={18} />
      {label}
    </span>
  );
}
