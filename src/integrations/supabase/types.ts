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
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          available_balance: number | null
          bank_name: string
          branch_name: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          currency: Database["public"]["Enums"]["currency_type"]
          current_balance: number | null
          end_date: string | null
          iban: string | null
          id: string
          interest_rate: number | null
          is_active: boolean | null
          last_transaction_date: string | null
          notes: string | null
          start_date: string
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          available_balance?: number | null
          bank_name: string
          branch_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          currency?: Database["public"]["Enums"]["currency_type"]
          current_balance?: number | null
          end_date?: string | null
          iban?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          last_transaction_date?: string | null
          notes?: string | null
          start_date?: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: Database["public"]["Enums"]["account_type"]
          available_balance?: number | null
          bank_name?: string
          branch_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          currency?: Database["public"]["Enums"]["currency_type"]
          current_balance?: number | null
          end_date?: string | null
          iban?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          last_transaction_date?: string | null
          notes?: string | null
          start_date?: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          description: string | null
          exchange_rate: number | null
          id: string
          metadata: Json | null
          reference_number: string | null
          related_transaction_id: string | null
          status: string | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          value_date: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          exchange_rate?: number | null
          id?: string
          metadata?: Json | null
          reference_number?: string | null
          related_transaction_id?: string | null
          status?: string | null
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          value_date?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          exchange_rate?: number | null
          id?: string
          metadata?: Json | null
          reference_number?: string | null
          related_transaction_id?: string | null
          status?: string | null
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      card_transactions: {
        Row: {
          amount: number
          card_id: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          description: string | null
          id: string
          installment_count: number | null
          merchant_category: string | null
          merchant_name: string | null
          reference_number: string | null
          transaction_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          card_id?: string | null
          created_at?: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          id?: string
          installment_count?: number | null
          merchant_category?: string | null
          merchant_name?: string | null
          reference_number?: string | null
          transaction_date?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          card_id?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          id?: string
          installment_count?: number | null
          merchant_category?: string | null
          merchant_name?: string | null
          reference_number?: string | null
          transaction_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow_forecasts: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          description: string | null
          forecast_date: string
          forecast_type: string
          id: string
          is_recurring: boolean | null
          next_occurrence_date: string | null
          probability: number | null
          recurrence_pattern: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          forecast_date: string
          forecast_type: string
          id?: string
          is_recurring?: boolean | null
          next_occurrence_date?: string | null
          probability?: number | null
          recurrence_pattern?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          forecast_date?: string
          forecast_type?: string
          id?: string
          is_recurring?: boolean | null
          next_occurrence_date?: string | null
          probability?: number | null
          recurrence_pattern?: string | null
          updated_at?: string | null
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
      credit_cards: {
        Row: {
          account_id: string | null
          available_limit: number | null
          card_name: string
          card_number: string | null
          card_type: Database["public"]["Enums"]["card_type"]
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          current_balance: number | null
          expiry_date: string
          id: string
          last_payment_date: string | null
          minimum_payment: number | null
          payment_due_date: string | null
          status: Database["public"]["Enums"]["card_status"] | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          available_limit?: number | null
          card_name: string
          card_number?: string | null
          card_type: Database["public"]["Enums"]["card_type"]
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          expiry_date: string
          id?: string
          last_payment_date?: string | null
          minimum_payment?: number | null
          payment_due_date?: string | null
          status?: Database["public"]["Enums"]["card_status"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          available_limit?: number | null
          card_name?: string
          card_number?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          expiry_date?: string
          id?: string
          last_payment_date?: string | null
          minimum_payment?: number | null
          payment_due_date?: string | null
          status?: Database["public"]["Enums"]["card_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      departments: {
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
      events: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_instruments: {
        Row: {
          amount: number
          bank_account_id: string | null
          bank_name: string | null
          branch_name: string | null
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          due_date: string
          id: string
          instrument_number: string
          instrument_type: Database["public"]["Enums"]["financial_instrument_type"]
          issue_date: string
          issuer_name: string
          notes: string | null
          recipient_name: string
          status: Database["public"]["Enums"]["financial_instrument_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string | null
          created_by?: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          due_date: string
          id?: string
          instrument_number: string
          instrument_type: Database["public"]["Enums"]["financial_instrument_type"]
          issue_date?: string
          issuer_name: string
          notes?: string | null
          recipient_name: string
          status?: Database["public"]["Enums"]["financial_instrument_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          due_date?: string
          id?: string
          instrument_number?: string
          instrument_type?: Database["public"]["Enums"]["financial_instrument_type"]
          issue_date?: string
          issuer_name?: string
          notes?: string | null
          recipient_name?: string
          status?: Database["public"]["Enums"]["financial_instrument_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_instruments_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_notifications: {
        Row: {
          created_at: string | null
          id: string
          notification_type: string
          payment_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_type: string
          payment_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_type?: string
          payment_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_notifications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bank_account_id: string
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          payment_date: string
          recipient_name: string
          reference_note: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_account_id: string
          created_at?: string | null
          created_by?: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id?: string
          payment_date?: string
          recipient_name: string
          reference_note?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          payment_date?: string
          recipient_name?: string
          reference_note?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
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
      search_employees: {
        Args: {
          search_query: string
        }
        Returns: {
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
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
    }
    Enums: {
      account_type: "vadesiz" | "vadeli" | "kredi" | "pos"
      card_status: "active" | "blocked" | "expired" | "cancelled"
      card_type: "credit" | "debit" | "corporate"
      currency_type: "TRY" | "USD" | "EUR" | "GBP"
      customer_status: "aktif" | "pasif" | "potansiyel"
      customer_type: "bireysel" | "kurumsal"
      deal_priority: "low" | "medium" | "high"
      deal_status: "new" | "negotiation" | "follow_up" | "won" | "lost"
      event_type: "technical" | "sales"
      financial_instrument_status: "pending" | "cleared" | "bounced"
      financial_instrument_type: "check" | "promissory_note"
      payment_direction: "incoming" | "outgoing"
      payment_status: "pending" | "completed" | "failed"
      payment_type: "havale" | "eft" | "kredi_karti" | "nakit"
      proposal_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "review"
        | "negotiation"
      sales_event_category: "proposal_deadline" | "sales_meeting" | "follow_up"
      supplier_status: "aktif" | "pasif" | "potansiyel"
      supplier_type: "bireysel" | "kurumsal"
      technical_event_category:
        | "installation"
        | "maintenance"
        | "service_call"
        | "support_ticket"
      transaction_type: "giris" | "cikis" | "havale" | "eft" | "swift" | "pos"
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
