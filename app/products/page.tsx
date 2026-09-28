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
        title="Consulta de produto"
        description="Qualquer pessoa pode verificar o passaporte digital de um produto. Não é preciso carteira nem papel para consultar a blockchain."
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
  if (error) return <Notice tone="danger" title="Não foi possível carregar o produto">{error}</Notice>;
  if (isLoading && passport === null) {
    return <p className="text-sm text-ink-muted">Buscando na blockchain…</p>;
  }
  if (!passport) {
    return (
      <Notice tone="warning" title={`Nenhum produto registrado com o ID "${productId}"`}>
        Este produto não tem registro na blockchain. Ele não foi registrado por um fabricante
        autorizado, ou o ID está incorreto. O ID diferencia maiúsculas de minúsculas.
      </Notice>
    );
  }

  return (
    <>
      <ProductDetails product={passport.product} history={passport.history} />
      <ProductTimeline events={passport.history} />
    </>
  );
}
