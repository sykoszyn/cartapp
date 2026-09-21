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
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
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
