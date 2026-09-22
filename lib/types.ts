export type UserRole = "business" | "customer";

export type FormState = { error?: string; success?: string } | undefined;

export type DiscountDay =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export const DISCOUNT_DAYS: DiscountDay[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export type TransactionType = "earn" | "redeem" | "adjustment";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  member_code: string | null;
  created_at: string;
}

export type BusinessPlan = "free" | "pro";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  phone: string | null;
  schedule: string | null;
  points_per_amount: number;
  amount_per_point: number;
  points_label: string;
  active: boolean;
  plan: BusinessPlan;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  business_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Reward {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  stock: number | null;
  active: boolean;
  created_at: string;
}

export interface Discount {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  days: DiscountDay[];
  payment_method: string | null;
  banner_url: string | null;
  active: boolean;
  created_at: string;
}

export interface CustomerPoints {
  customer_id: string;
  business_id: string;
  points: number;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  customer_id: string;
  business_id: string;
  type: TransactionType;
  points: number;
  amount: number | null;
  reward_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface Order {
  id: string;
  business_id: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  note: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  unit_price: number;
  quantity: number;
}

export interface BusinessPaymentSettings {
  business_id: string;
  mp_access_token: string | null;
  mp_refresh_token: string | null;
  mp_user_id: string | null;
  mp_public_key: string | null;
  mp_token_expires_at: string | null;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}
