import Link from "next/link";

import { productLookupPath } from "@/constants/routes";
import { ArrowRightIcon } from "@/components/ui/icons";

export function ProductLink({ productId }: { productId: string }) {
  return (
    <Link
      href={productLookupPath(productId)}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-strong"
    >
      View product
      <ArrowRightIcon width={16} height={16} />
    </Link>
  );
}
