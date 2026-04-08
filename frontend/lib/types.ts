// ─── User & Auth ───────────────────────────────────────────
export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  family_size?: number;
  preferred_lang?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  date_of_birth?: string | null;
  accepts_terms?: boolean;
  accepts_marketing?: boolean;
  created_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  postcode: string;
  province: string;
  country: string;
  instructions?: string;
  is_default: boolean;
};

// ─── Products ──────────────────────────────────────────────
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
};

export type ProductImage = {
  url: string;
  alt?: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  label: string;
  weight_grams: number;
  price: number;
  compare_at_price?: number;
  stock_qty: number;
  is_active: boolean;
  sort_order?: number;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  short_desc?: string;
  price_per_kg: number;
  unit_type: string;
  is_featured: boolean;
  is_active: boolean;
  halal_cert_id?: string;
  halal_cert_body?: string;
  images: ProductImage[];
  tags?: string[];
  sort_order?: number;
  avg_rating?: number;
  review_count?: number;
  variants?: ProductVariant[];
  // Joined fields
  category_name?: string;
  category_slug?: string;
  created_at?: string;
  updated_at?: string;
};

// Helper to get the first image URL from a product
export function getProductImage(product: Product | null | undefined): string {
  return product?.images?.[0]?.url || "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400";
}

// Helper to get the cheapest variant price
export function getMinPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) return product.price_per_kg;
  return Math.min(...product.variants.map((v) => v.price));
}

// ─── Cart ──────────────────────────────────────────────────
export type CartItem = {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  // Joined fields
  product_id?: string;
  product_name?: string;
  product_image?: string;
  weight_label?: string;
  price?: number;
  compare_at_price?: number;
  stock_qty?: number;
};

export type Cart = {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  item_count: number;
};

// ─── Orders ────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderItem = {
  id: string;
  order_id: string;
  variant_id: string;
  product_name?: string;
  weight_label?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_image?: string;
  product_snapshot?: {
    name?: string;
    variant_label?: string;
    weight_grams?: number;
    halal_cert_id?: string;
    images?: ProductImage[];
  };
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: "card" | "cash" | "bizum";
  payment_ref?: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  delivery_notes?: string;
  promo_code?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  items?: OrderItem[];
  address?: Address;
  delivery_slot?: DeliverySlot;
};

// ─── Delivery Slots ────────────────────────────────────────
export type DeliverySlot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  booked_count: number;
};

// ─── Promotions & Banners ──────────────────────────────────
export type Promotion = {
  id: string;
  title: string;
  description?: string;
  discount_pct?: number;
  discount_amount?: number;
  min_order_amount?: number;
  image_url?: string;
  start_date: string;
  end_date: string;
  show_on_home: boolean;
};

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  link_type?: string;
  link_value?: string;
  bg_color?: string;
  content?: string;
  sort_order: number;
  is_active: boolean;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_pct?: number;
  discount_amount?: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
};

// ─── Notifications ─────────────────────────────────────────
export type NotificationPreferences = {
  order_updates: boolean;
  reorder_reminders: boolean;
  promotions: boolean;
  ai_suggestions: boolean;
};

export type NotificationLog = {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  body: string;
  opened_at?: string;
  created_at: string;
};
