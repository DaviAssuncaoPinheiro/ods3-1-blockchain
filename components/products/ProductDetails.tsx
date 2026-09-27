import Link from "next/link";

import { ROUTES, withProductId } from "@/constants/routes";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import type { Product } from "@/types/product";
import { BUTTON_BASE_CLASSES } from "@/components/ui/Button";
import { DetailList, type DetailItem } from "@/components/ui/DetailList";
import { MonoValue } from "@/components/ui/MonoValue";
import { Panel } from "@/components/ui/Panel";

import { WarrantyStatusText } from "./WarrantyStatusText";

const NOT_AVAILABLE = <span className="text-ink-muted">—</span>;

export function ProductDetails({ product }: { product: Product }) {
  const items: DetailItem[] = [
    { label: "Serial number", value: <MonoValue value={product.serialNumber} /> },
    { label: "Status", value: product.status },
    { label: "Manufacturer", value: <MonoValue value={product.manufacturer} /> },
    { label: "Manufacturing date", value: formatDateTime(product.manufacturedAt) },
    { label: "Sale date", value: product.soldAt ? formatDateTime(product.soldAt) : NOT_AVAILABLE },
    { label: "Warranty status", value: <WarrantyStatusText product={product} /> },
    {
      label: "Warranty expiration",
      value: product.warrantyExpiresAt ? formatDate(product.warrantyExpiresAt) : NOT_AVAILABLE,
    },
    { label: "Maintenance count", value: product.maintenanceCount },
  ];

  return (
    <Panel
      title={product.name}
      description={`Model ${product.model} · Product ID ${product.productId}`}
      action={<ProductActions productId={product.productId} />}
    >
      <DetailList items={items} />
    </Panel>
  );
}

function ProductActions({ productId }: { productId: string }) {
  const linkClasses = `${BUTTON_BASE_CLASSES} bg-sunken text-ink hover:bg-line`;
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={withProductId(ROUTES.registerSale, productId)} className={linkClasses}>
        Register sale
      </Link>
      <Link href={withProductId(ROUTES.registerMaintenance, productId)} className={linkClasses}>
        Register maintenance
      </Link>
    </div>
  );
}
