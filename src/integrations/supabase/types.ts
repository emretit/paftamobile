export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          company_name: string | null
          default_currency: string | null
          email: string | null
          email_settings: Json | null
          id: string
          logo_url: string | null
          phone: string | null
          tax_number: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          default_currency?: string | null
          email?: string | null
          email_settings?: Json | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          default_currency?: string | null
          email?: string | null
          email_settings?: Json | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          balance: number
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_interaction: string | null
          mobile_phone: string | null
          name: string
          office_phone: string | null
          representative: string | null
          status: Database["public"]["Enums"]["customer_status"]
          tax_number: string | null
          tax_office: string | null
          type: Database["public"]["Enums"]["customer_type"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          balance?: number
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_interaction?: string | null
          mobile_phone?: string | null
          name: string
          office_phone?: string | null
          representative?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tax_number?: string | null
          tax_office?: string | null
          type: Database["public"]["Enums"]["customer_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          balance?: number
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_interaction?: string | null
          mobile_phone?: string | null
          name?: string
          office_phone?: string | null
          representative?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tax_number?: string | null
          tax_office?: string | null
          type?: Database["public"]["Enums"]["customer_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          actual_value: number | null
          contact_history: Json | null
          created_at: string | null
          customer_id: string | null
          department: string | null
          description: string | null
          employee_id: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          internal_comments: string | null
          last_contact_date: string | null
          next_steps: Json | null
          notes: string | null
          priority: Database["public"]["Enums"]["deal_priority"]
          product_services: Json | null
          proposal_date: string | null
          proposal_files: Json | null
          reminders: Json | null
          status: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at: string | null
          validity_period: unknown | null
          value: number
        }
        Insert: {
          actual_value?: number | null
          contact_history?: Json | null
          created_at?: string | null
          customer_id?: string | null
          department?: string | null
          description?: string | null
          employee_id?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          internal_comments?: string | null
          last_contact_date?: string | null
          next_steps?: Json | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["deal_priority"]
          product_services?: Json | null
          proposal_date?: string | null
          proposal_files?: Json | null
          reminders?: Json | null
          status?: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at?: string | null
          validity_period?: unknown | null
          value?: number
        }
        Update: {
          actual_value?: number | null
          contact_history?: Json | null
          created_at?: string | null
          customer_id?: string | null
          department?: string | null
          description?: string | null
          employee_id?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          internal_comments?: string | null
          last_contact_date?: string | null
          next_steps?: Json | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["deal_priority"]
          product_services?: Json | null
          proposal_date?: string | null
          proposal_files?: Json | null
          reminders?: Json | null
          status?: Database["public"]["Enums"]["deal_status"]
          title?: string
          updated_at?: string | null
          validity_period?: unknown | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string
          email: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string | null
          position: string
          status: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department: string
          email: string
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          phone?: string | null
          position: string
          status: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string
          email?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          phone?: string | null
          position?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          category_type: string | null
          created_at: string | null
          description: string | null
          discount_rate: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_order_quantity: number | null
          min_order_quantity: number | null
          name: string
          notes: string | null
          product_type: string
          purchase_price: number | null
          sku: string | null
          status: string
          stock_quantity: number | null
          stock_threshold: number | null
          tax_rate: number
          unit: string | null
          unit_price: number
          updated_at: string | null
          warranty_period: unknown | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          category_type?: string | null
          created_at?: string | null
          description?: string | null
          discount_rate?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          name: string
          notes?: string | null
          product_type?: string
          purchase_price?: number | null
          sku?: string | null
          status?: string
          stock_quantity?: number | null
          stock_threshold?: number | null
          tax_rate?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          warranty_period?: unknown | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          category_type?: string | null
          created_at?: string | null
          description?: string | null
          discount_rate?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          name?: string
          notes?: string | null
          product_type?: string
          purchase_price?: number | null
          sku?: string | null
          status?: string
          stock_quantity?: number | null
          stock_threshold?: number | null
          tax_rate?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          warranty_period?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proposal_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          product_id: string | null
          proposal_id: string | null
          quantity: number
          tax_rate: number
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          product_id?: string | null
          proposal_id?: string | null
          quantity?: number
          tax_rate?: number
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          product_id?: string | null
          proposal_id?: string | null
          quantity?: number
          tax_rate?: number
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          additional_charges: number | null
          created_at: string | null
          customer_id: string | null
          customer_segment: string | null
          deal_id: string | null
          discounts: number | null
          employee_id: string | null
          files: Json | null
          id: string
          internal_notes: string | null
          items: Json | null
          payment_term: string | null
          proposal_number: number
          sent_date: string | null
          status: string | null
          supplier_id: string | null
          title: string
          total_value: number
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          additional_charges?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_segment?: string | null
          deal_id?: string | null
          discounts?: number | null
          employee_id?: string | null
          files?: Json | null
          id?: string
          internal_notes?: string | null
          items?: Json | null
          payment_term?: string | null
          proposal_number?: number
          sent_date?: string | null
          status?: string | null
          supplier_id?: string | null
          title: string
          total_value?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          additional_charges?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_segment?: string | null
          deal_id?: string | null
          discounts?: number | null
          employee_id?: string | null
          files?: Json | null
          id?: string
          internal_notes?: string | null
          items?: Json | null
          payment_term?: string | null
          proposal_number?: number
          sent_date?: string | null
          status?: string | null
          supplier_id?: string | null
          title?: string
          total_value?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          balance: number
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          mobile_phone: string | null
          name: string
          office_phone: string | null
          representative: string | null
          status: Database["public"]["Enums"]["supplier_status"]
          tax_number: string | null
          tax_office: string | null
          type: Database["public"]["Enums"]["supplier_type"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          balance?: number
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          mobile_phone?: string | null
          name: string
          office_phone?: string | null
          representative?: string | null
          status?: Database["public"]["Enums"]["supplier_status"]
          tax_number?: string | null
          tax_office?: string | null
          type: Database["public"]["Enums"]["supplier_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          balance?: number
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          mobile_phone?: string | null
          name?: string
          office_phone?: string | null
          representative?: string | null
          status?: Database["public"]["Enums"]["supplier_status"]
          tax_number?: string | null
          tax_office?: string | null
          type?: Database["public"]["Enums"]["supplier_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      sales_performance: {
        Row: {
          accepted_proposals: number | null
          employee_id: string | null
          employee_name: string | null
          month: string | null
          success_rate: number | null
          total_proposals: number | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      check_stock_status: {
        Args: {
          current_quantity: number
          threshold: number
        }
        Returns: string
      }
      has_role: {
        Args: {
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      record_audit_log: {
        Args: {
          action: string
          entity_type: string
          entity_id: string
          changes: Json
        }
        Returns: undefined
      }
      request_password_reset: {
        Args: {
          email: string
        }
        Returns: undefined
      }
    }
    Enums: {
      customer_status: "aktif" | "pasif" | "potansiyel"
      customer_type: "bireysel" | "kurumsal"
      deal_priority: "low" | "medium" | "high"
      deal_status: "new" | "negotiation" | "follow_up" | "won" | "lost"
      proposal_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "review"
        | "negotiation"
      supplier_status: "aktif" | "pasif" | "potansiyel"
      supplier_type: "bireysel" | "kurumsal"
      user_role: "admin" | "sales" | "manager" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
