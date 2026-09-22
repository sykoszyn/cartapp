// Tipos mínimos de la base para el cliente tipado de Supabase.
// Reflejan supabase/migrations/0001_init.sql

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "business" | "customer";
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          member_code: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: "business" | "customer";
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          member_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "business" | "customer";
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          member_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
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
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          category?: string | null;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          address?: string | null;
          phone?: string | null;
          schedule?: string | null;
          points_per_amount?: number;
          amount_per_point?: number;
          points_label?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          category?: string | null;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          address?: string | null;
          phone?: string | null;
          schedule?: string | null;
          points_per_amount?: number;
          amount_per_point?: number;
          points_label?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          category_id?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          category_id?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      rewards: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          points_cost: number;
          image_url: string | null;
          stock: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          points_cost?: number;
          image_url?: string | null;
          stock?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          points_cost?: number;
          image_url?: string | null;
          stock?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      discounts: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          description: string | null;
          days: string[];
          payment_method: string | null;
          banner_url: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          description?: string | null;
          days?: string[];
          payment_method?: string | null;
          banner_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title?: string;
          description?: string | null;
          days?: string[];
          payment_method?: string | null;
          banner_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      customer_points: {
        Row: {
          customer_id: string;
          business_id: string;
          points: number;
          updated_at: string;
        };
        Insert: {
          customer_id: string;
          business_id: string;
          points?: number;
          updated_at?: string;
        };
        Update: {
          customer_id?: string;
          business_id?: string;
          points?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      points_transactions: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          type: "earn" | "redeem" | "adjustment";
          points: number;
          amount: number | null;
          reward_id: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          type: "earn" | "redeem" | "adjustment";
          points: number;
          amount?: number | null;
          reward_id?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          business_id?: string;
          type?: "earn" | "redeem" | "adjustment";
          points?: number;
          amount?: number | null;
          reward_id?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      add_points_by_member_code: {
        Args: {
          p_business_id: string;
          p_member_code: string;
          p_amount: number;
          p_note?: string | null;
        };
        Returns: { points_added: number; new_balance: number; customer_name: string }[];
      };
      redeem_reward: {
        Args: { p_reward_id: string };
        Returns: { new_balance: number }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
