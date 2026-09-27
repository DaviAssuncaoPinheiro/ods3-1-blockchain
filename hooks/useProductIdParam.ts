"use client";

import { useSearchParams } from "next/navigation";

import { PRODUCT_ID_PARAM } from "@/constants/routes";

/** Reads the product ID from the URL; pages using it must render inside a Suspense boundary. */
export function useProductIdParam(): string {
  return useSearchParams().get(PRODUCT_ID_PARAM) ?? "";
}
