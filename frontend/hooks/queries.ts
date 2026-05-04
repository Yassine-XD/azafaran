import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Typed query hooks over our REST API. Every hook unwraps the
 * `{ success, data, error }` envelope and surfaces either `data` or a
 * thrown Error so TanStack Query handles success/error states cleanly.
 */

async function unwrap<T>(promise: Promise<{
  success: boolean;
  data?: T;
  meta?: any;
  error?: { message: string; code: string };
}>): Promise<T> {
  const r = await promise;
  if (!r.success) {
    const err: any = new Error(r.error?.message || "Error desconocido");
    err.code = r.error?.code;
    throw err;
  }
  return r.data as T;
}

// ─── Types (loose; tightened per-screen as needed) ────────────────────────────
export interface Variant {
  id: string;
  product_id: string;
  label: string;
  weight_grams: number;
  price: number;
  compare_at_price: number | null;
  stock_qty: number;
  low_stock_threshold: number | null;
  badge_label: string | null;
  sku: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string | null;
  short_desc: string | null;
  price_per_kg: number;
  unit_type: "kg" | "unit" | "pack";
  unit_label_override: string | null;
  halal_cert_id: string | null;
  halal_cert_body: string | null;
  images: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  variants?: Variant[];
  pack_items?: any[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items?: any[];
}

// ─── Query key factories ──────────────────────────────────────────────────────
export const qk = {
  products: (params: ProductListParams) => ["products", params] as const,
  product: (id: string) => ["product", id] as const,
  categories: () => ["categories"] as const,
  featured: () => ["featured"] as const,
  orders: () => ["orders"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────
export interface ProductListParams {
  category?: string;
  search?: string;
  sort?: "date" | "price" | "popularity" | "name";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  in_stock?: boolean;
}

interface ProductListResult {
  products: Product[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}

function buildQuery(params: ProductListParams): string {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.search) q.set("search", params.search);
  if (params.sort) q.set("sort", params.sort);
  if (params.order) q.set("order", params.order);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.in_stock) q.set("in_stock", "true");
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: qk.products(params),
    queryFn: async () => {
      const r = await api.get<Product[]>(`/products${buildQuery(params)}`, false);
      if (!r.success) {
        const err: any = new Error(r.error?.message || "No se pudieron cargar los productos");
        err.code = r.error?.code;
        throw err;
      }
      return {
        products: r.data || [],
        meta: r.meta || { total: 0, page: 1, limit: 20, total_pages: 1 },
      } as ProductListResult;
    },
  });
}

export function useProduct(id: string | undefined, options?: Omit<UseQueryOptions<Product>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: qk.product(id || ""),
    enabled: !!id,
    queryFn: () => unwrap<Product>(api.get<Product>(`/products/${id}`, false)),
    ...options,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.categories(),
    queryFn: () => unwrap<Category[]>(api.get<Category[]>("/categories", false)),
    // Categories don't change often; allow them to live longer.
    staleTime: 30 * 60 * 1000,
  });
}

interface FeaturedResult {
  featured: Product[];
  bestsellers: Product[];
}

export function useFeatured() {
  return useQuery({
    queryKey: qk.featured(),
    queryFn: () => unwrap<FeaturedResult>(api.get<FeaturedResult>("/products/featured", false)),
  });
}

/**
 * Authenticated user's order history. The hook stays disabled when the caller
 * passes `enabled: false` so guest screens don't fire it.
 */
export function useOrders(opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.orders(),
    enabled: opts.enabled !== false,
    queryFn: () => unwrap<OrderSummary[]>(api.get<OrderSummary[]>("/orders")),
  });
}
