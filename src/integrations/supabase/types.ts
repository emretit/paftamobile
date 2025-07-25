export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      veriban_incoming_invoices: {
        Row: {
          allowance_total_amount: number | null
          answer_note: string | null
          answer_type: string | null
          created_at: string | null
          currency_code: string | null
          customer_register_number: string | null
          customer_title: string | null
          exchange_rate: number | null
          id: number
          invoice_number: string
          invoice_profile: string | null
          invoice_type: string | null
          invoice_uuid: string
          is_answered: boolean | null
          is_read: boolean | null
          is_transferred: boolean | null
          issue_time: string | null
          line_extension_amount: number | null
          payable_amount: number | null
          processed_at: string | null
          raw_xml_content: string | null
          tax_exclusive_amount: number | null
          tax_total_amount: number | null
          updated_at: string | null
          veriban_response_data: Json | null
        }
        Insert: {
          allowance_total_amount?: number | null
          answer_note?: string | null
          answer_type?: string | null
          created_at?: string | null
          currency_code?: string | null
          customer_register_number?: string | null
          customer_title?: string | null
          exchange_rate?: number | null
          id?: number
          invoice_number: string
          invoice_profile?: string | null
          invoice_type?: string | null
          invoice_uuid: string
          is_answered?: boolean | null
          is_read?: boolean | null
          is_transferred?: boolean | null
          issue_time?: string | null
          line_extension_amount?: number | null
          payable_amount?: number | null
          processed_at?: string | null
          raw_xml_content?: string | null
          tax_exclusive_amount?: number | null
          tax_total_amount?: number | null
          updated_at?: string | null
          veriban_response_data?: Json | null
        }
        Update: {
          allowance_total_amount?: number | null
          answer_note?: string | null
          answer_type?: string | null
          created_at?: string | null
          currency_code?: string | null
          customer_register_number?: string | null
          customer_title?: string | null
          exchange_rate?: number | null
          id?: number
          invoice_number?: string
          invoice_profile?: string | null
          invoice_type?: string | null
          invoice_uuid?: string
          is_answered?: boolean | null
          is_read?: boolean | null
          is_transferred?: boolean | null
          issue_time?: string | null
          line_extension_amount?: number | null
          payable_amount?: number | null
          processed_at?: string | null
          raw_xml_content?: string | null
          tax_exclusive_amount?: number | null
          tax_total_amount?: number | null
          updated_at?: string | null
          veriban_response_data?: Json | null
        }
        Relationships: []
      }
      veriban_invoice_line_items: {
        Row: {
          created_at: string | null
          id: number
          invoice_id: number | null
          item_description: string | null
          item_name: string | null
          line_number: number | null
          line_total: number | null
          quantity: number | null
          tax_amount: number | null
          tax_rate: number | null
          unit_code: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          invoice_id?: number | null
          item_description?: string | null
          item_name?: string | null
          line_number?: number | null
          line_total?: number | null
          quantity?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          unit_code?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          invoice_id?: number | null
          item_description?: string | null
          item_name?: string | null
          line_number?: number | null
          line_total?: number | null
          quantity?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          unit_code?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "veriban_invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "veriban_incoming_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      veriban_operation_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number
          ip_address: unknown | null
          is_successful: boolean | null
          operation_type: string
          request_data: Json | null
          response_data: Json | null
          response_time_ms: number | null
          session_code: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          ip_address?: unknown | null
          is_successful?: boolean | null
          operation_type: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          session_code?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          ip_address?: unknown | null
          is_successful?: boolean | null
          operation_type?: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          session_code?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      // ... diğer tablolar buraya eklenebilir
      [key: string]: any
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      [key: string]: any
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["vadesiz", "vadeli", "kredi", "pos"],
      card_status: ["active", "blocked", "expired", "cancelled"],
      card_type: ["credit", "debit", "corporate"],
      currency_type: ["TRY", "USD", "EUR", "GBP"],
      customer_status: ["aktif", "pasif", "potansiyel"],
      customer_type: ["bireysel", "kurumsal"],
      deal_priority: ["low", "medium", "high"],
      deal_status: ["new", "negotiation", "follow_up", "won", "lost"],
      employee_status: ["aktif", "pasif"],
      event_type: ["technical", "sales"],
      financial_instrument_status: ["pending", "cleared", "bounced"],
      financial_instrument_type: ["check", "promissory_note"],
      gender_type: ["male", "female", "other"],
      invoice_status: [
        "pending",
        "paid",
        "partially_paid",
        "overdue",
        "cancelled",
      ],
      marital_status_type: ["single", "married", "divorced", "widowed"],
      payment_direction: ["incoming", "outgoing"],
      payment_status: ["pending", "completed", "failed"],
      payment_type: ["havale", "eft", "kredi_karti", "nakit"],
      proposal_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "review",
        "negotiation",
      ],
      purchase_order_status: [
        "draft",
        "sent",
        "confirmed",
        "received",
        "partially_received",
        "cancelled",
      ],
      purchase_request_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "converted",
      ],
      sales_event_category: ["proposal_deadline", "sales_meeting", "follow_up"],
      service_priority: ["low", "medium", "high", "urgent"],
      service_status: [
        "new",
        "assigned",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
      ],
      supplier_status: ["aktif", "pasif", "potansiyel"],
      supplier_type: ["bireysel", "kurumsal"],
      task_priority: ["low", "medium", "high"],
      task_status: ["todo", "in_progress", "completed", "postponed"],
      task_type: ["opportunity", "proposal", "general"],
      technical_event_category: [
        "installation",
        "maintenance",
        "service_call",
        "support_ticket",
      ],
      transaction_type: ["giris", "cikis", "havale", "eft", "swift", "pos"],
      user_role: ["admin", "sales", "manager", "viewer"],
    },
  },
} as const
