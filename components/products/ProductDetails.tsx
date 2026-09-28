import Link from "next/link";

import { PRODUCT_STATUS_LABELS } from "@/constants/product";
import { ROUTES, withProductId } from "@/constants/routes";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import type { Product, ProductHistoryEvent, ProductStatus } from "@/types/product";
import { ParticipantValue } from "@/components/participants/ParticipantValue";
import { BUTTON_BASE_CLASSES } from "@/components/ui/Button";
import { DetailList, type DetailItem } from "@/components/ui/DetailList";
import { MonoValue } from "@/components/ui/MonoValue";
import { Panel } from "@/components/ui/Panel";

import { WarrantyStatusText } from "./WarrantyStatusText";

const NOT_AVAILABLE = <span className="text-ink-muted">Não disponível</span>;

interface ProductDetailsProps {
  product: Product;
  history: ProductHistoryEvent[];
}

export function ProductDetails({ product, history }: ProductDetailsProps) {
  const items: DetailItem[] = [
    { label: "Número de série", value: <MonoValue value={product.serialNumber} /> },
    { label: "Status atual", value: PRODUCT_STATUS_LABELS[product.status] },
    { label: "Status percorridos", value: <StatusPath statuses={toStatusPath(history)} /> },
    { label: "Fabricante", value: <ParticipantValue address={product.manufacturer} /> },
    { label: "Data de fabricação", value: formatDateTime(product.manufacturedAt) },
    { label: "Data da venda", value: product.soldAt ? formatDateTime(product.soldAt) : NOT_AVAILABLE },
    { label: "Situação da garantia", value: <WarrantyStatusText product={product} /> },
    {
      label: "Fim da garantia",
      value: product.warrantyExpiresAt ? formatDate(product.warrantyExpiresAt) : NOT_AVAILABLE,
    },
    { label: "Manutenções realizadas", value: product.maintenanceCount },
  ];

  return (
    <Panel
      title={product.name}
      description={`Modelo ${product.model} · ID do produto ${product.productId}`}
      action={<ProductActions productId={product.productId} />}
    >
      <DetailList items={items} />
    </Panel>
  );
}

/** Statuses in the order the product went through them, without consecutive repeats. */
function toStatusPath(history: ProductHistoryEvent[]): ProductStatus[] {
  return history
    .map((event) => event.status)
    .filter((status, index, statuses) => index === 0 || status !== statuses[index - 1]);
}

function StatusPath({ statuses }: { statuses: ProductStatus[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {statuses.map((status, index) => (
        <li key={`${status}-${index}`} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-ink-muted" aria-hidden="true">
              →
            </span>
          )}
          <span className="rounded-lg bg-sunken px-2 py-0.5">{PRODUCT_STATUS_LABELS[status]}</span>
        </li>
      ))}
    </ol>
  );
}

function ProductActions({ productId }: { productId: string }) {
  const linkClasses = `${BUTTON_BASE_CLASSES} bg-sunken text-ink hover:bg-line`;
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={withProductId(ROUTES.registerSale, productId)} className={linkClasses}>
        Registrar venda
      </Link>
      <Link href={withProductId(ROUTES.registerMaintenance, productId)} className={linkClasses}>
        Registrar manutenção
      </Link>
    </div>
  );
}
