export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          position?: number
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          listing_id: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          listing_id: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          path: string
          position: number
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          path: string
          position?: number
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          path?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          advertiser_id: string
          brand: string | null
          category_id: string | null
          city: string | null
          condition: string
          created_at: string
          description: string | null
          hours_used: number | null
          id: string
          mileage_km: number | null
          model: string | null
          price_cents: number
          rejection_reason: string | null
          slug: string
          state: string | null
          status: string
          title: string
          updated_at: string
          views: number
          whatsapp: string | null
          year: number | null
        }
        Insert: {
          advertiser_id: string
          brand?: string | null
          category_id?: string | null
          city?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          hours_used?: number | null
          id?: string
          mileage_km?: number | null
          model?: string | null
          price_cents?: number
          rejection_reason?: string | null
          slug: string
          state?: string | null
          status?: string
          title: string
          updated_at?: string
          views?: number
          whatsapp?: string | null
          year?: number | null
        }
        Update: {
          advertiser_id?: string
          brand?: string | null
          category_id?: string | null
          city?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          hours_used?: number | null
          id?: string
          mileage_km?: number | null
          model?: string | null
          price_cents?: number
          rejection_reason?: string | null
          slug?: string
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
          views?: number
          whatsapp?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number | null
          created_at: string
          id: string
          mercadopago_payment_id: string | null
          raw: Json | null
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          mercadopago_payment_id?: string | null
          raw?: Json | null
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          mercadopago_payment_id?: string | null
          raw?: Json | null
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          billing_interval: string
          created_at: string
          description: string | null
          features: Json
          id: string
          max_listings: number
          mercadopago_plan_id: string | null
          name: string
          position: number
          price_cents: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          max_listings?: number
          mercadopago_plan_id?: string | null
          name: string
          position?: number
          price_cents?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          max_listings?: number
          mercadopago_plan_id?: string | null
          name?: string
          position?: number
          price_cents?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          company_name: string | null
          created_at: string
          document: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          state: string | null
          status: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          created_at?: string
          document?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          company_name?: string | null
          created_at?: string
          document?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          commission_percent: number
          id: boolean
          support_email: string | null
          support_phone: string | null
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          id?: boolean
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          id?: boolean
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          advertiser_id: string
          created_at: string
          current_period_end: string | null
          id: string
          mercadopago_preapproval_id: string | null
          plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          mercadopago_preapproval_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          mercadopago_preapproval_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_listing_views: {
        Args: { p_listing_id: string }
        Returns: undefined
      }
      create_pending_subscription: {
        Args: { p_plan_id: string }
        Returns: string
      }
      attach_preapproval_to_subscription: {
        Args: { p_subscription_id: string; p_preapproval_id: string }
        Returns: undefined
      }
      cancel_own_subscription: {
        Args: { p_subscription_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
