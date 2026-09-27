"use client";

import { Suspense } from "react";

import { useChainQuery } from "@/hooks/useChainQuery";
import { useIsContractReady } from "@/components/providers/ChainStatusProvider";
import { useProductIdParam } from "@/hooks/useProductIdParam";
import { fetchProductPassport } from "@/lib/blockchain/products";
import { ProductDetails } from "@/components/products/ProductDetails";
import { ProductSearchForm } from "@/components/products/ProductSearchForm";
import { ProductTimeline } from "@/components/products/ProductTimeline";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Product Lookup"
        description="Anyone can verify a product's digital passport. No wallet or role is needed to consult the blockchain."
      />
      <Suspense>
        <ProductLookup />
      </Suspense>
    </>
  );
}

function ProductLookup() {
  const productId = useProductIdParam();
  return (
    <div className="flex flex-col gap-6">
      <ProductSearchForm key={`search-${productId}`} initialQuery={productId} />
      {productId && <ProductResult key={`result-${productId}`} productId={productId} />}
    </div>
  );
}

function ProductResult({ productId }: { productId: string }) {
  const isContractReady = useIsContractReady();
  const { data: passport, error, isLoading } = useChainQuery(
    () => fetchProductPassport(productId),
    [productId],
  );

  if (!isContractReady) return null;
  if (error) return <Notice tone="danger" title="Could not load the product">{error}</Notice>;
  if (isLoading && passport === null) {
    return <p className="text-sm text-ink-muted">Searching the blockchain…</p>;
  }
  if (!passport) {
    return (
      <Notice tone="warning" title={`No product registered with ID "${productId}"`}>
        This product has no record on the blockchain. It was not registered by an authorized
        manufacturer, or the ID is wrong.
      </Notice>
    );
  }

  return (
    <>
      <ProductDetails product={passport.product} />
      <ProductTimeline events={passport.history} />
    </>
  );
}
