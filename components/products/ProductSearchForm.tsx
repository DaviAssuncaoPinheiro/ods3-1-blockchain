"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { MAX_TEXT_FIELD_LENGTH } from "@/constants/product";
import { productLookupPath } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/icons";

export function ProductSearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const productId = query.trim();
    if (productId) router.push(productLookupPath(productId));
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="product-search" className="sr-only">
        Product ID
      </label>
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted" />
        <input
          id="product-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter a product ID, e.g. PP-0001"
          maxLength={MAX_TEXT_FIELD_LENGTH}
          autoComplete="off"
          className="h-12 w-full rounded-xl bg-surface pr-4 pl-11 text-base shadow-panel outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <Button type="submit" className="h-12 px-6">
        Search
      </Button>
    </form>
  );
}
