export const ROUTES = {
  dashboard: "/dashboard",
  registerProduct: "/register-product",
  registerSale: "/register-sale",
  registerMaintenance: "/register-maintenance",
  products: "/products",
  explorer: "/explorer",
  roles: "/roles",
} as const;

export const PRODUCT_ID_PARAM = "id";

export function withProductId(route: string, productId: string): string {
  return `${route}?${PRODUCT_ID_PARAM}=${encodeURIComponent(productId)}`;
}

export function productLookupPath(productId: string): string {
  return withProductId(ROUTES.products, productId);
}
