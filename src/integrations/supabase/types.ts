export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_impact: number | null
          human_required: boolean | null
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["action_priority"] | null
          status: Database["public"]["Enums"]["action_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_impact?: number | null
          human_required?: boolean | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["action_priority"] | null
          status?: Database["public"]["Enums"]["action_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_impact?: number | null
          human_required?: boolean | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["action_priority"] | null
          status?: Database["public"]["Enums"]["action_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_approvals: {
        Row: {
          action_id: string | null
          approved_by: string | null
          created_at: string
          decided_at: string | null
          dispute_id: string | null
          id: string
          notes: string | null
          requested_by: string
          status: string | null
        }
        Insert: {
          action_id?: string | null
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          dispute_id?: string | null
          id?: string
          notes?: string | null
          requested_by: string
          status?: string | null
        }
        Update: {
          action_id?: string | null
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          dispute_id?: string | null
          id?: string
          notes?: string | null
          requested_by?: string
          status?: string | null
        }
        Relationships: []
      }
      business_entities: {
        Row: {
          bank_account_opened: boolean | null
          business_address: string | null
          business_name: string | null
          business_phone: string | null
          created_at: string
          ein: string | null
          entity_type: string | null
          formation_date: string | null
          id: string
          state_of_formation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_opened?: boolean | null
          business_address?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          ein?: string | null
          entity_type?: string | null
          formation_date?: string | null
          id?: string
          state_of_formation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_opened?: boolean | null
          business_address?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          ein?: string | null
          entity_type?: string | null
          formation_date?: string | null
          id?: string
          state_of_formation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_steps: {
        Row: {
          business_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          status: string | null
          step_description: string | null
          step_number: number
          step_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          step_description?: string | null
          step_number: number
          step_title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          step_description?: string | null
          step_number?: number
          step_title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_steps_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_text: string
          consent_type: string
          id: string
          ip_address: string | null
          signed_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_text: string
          consent_type: string
          id?: string
          ip_address?: string | null
          signed_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_text?: string
          consent_type?: string
          id?: string
          ip_address?: string | null
          signed_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_report_uploads: {
        Row: {
          bureau: string | null
          created_at: string
          error_message: string | null
          extracted_score: number | null
          file_name: string
          file_size: number | null
          id: string
          processed_at: string | null
          status: string | null
          tradelines_count: number | null
          user_id: string
        }
        Insert: {
          bureau?: string | null
          created_at?: string
          error_message?: string | null
          extracted_score?: number | null
          file_name: string
          file_size?: number | null
          id?: string
          processed_at?: string | null
          status?: string | null
          tradelines_count?: number | null
          user_id: string
        }
        Update: {
          bureau?: string | null
          created_at?: string
          error_message?: string | null
          extracted_score?: number | null
          file_name?: string
          file_size?: number | null
          id?: string
          processed_at?: string | null
          status?: string | null
          tradelines_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      credit_reports: {
        Row: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          created_at: string
          id: string
          parsed_data: Json | null
          raw_data: Json | null
          report_date: string
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          created_at?: string
          id?: string
          parsed_data?: Json | null
          raw_data?: Json | null
          report_date: string
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bureau?: Database["public"]["Enums"]["credit_bureau"]
          created_at?: string
          id?: string
          parsed_data?: Json | null
          raw_data?: Json | null
          report_date?: string
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          consent_id: string | null
          created_at: string
          evidence: Json | null
          human_required: boolean | null
          id: string
          letter_content: string | null
          reason: string
          resolved_at: string | null
          response: string | null
          status: Database["public"]["Enums"]["dispute_status"] | null
          submitted_at: string | null
          tradeline_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          consent_id?: string | null
          created_at?: string
          evidence?: Json | null
          human_required?: boolean | null
          id?: string
          letter_content?: string | null
          reason: string
          resolved_at?: string | null
          response?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          submitted_at?: string | null
          tradeline_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bureau?: Database["public"]["Enums"]["credit_bureau"]
          consent_id?: string | null
          created_at?: string
          evidence?: Json | null
          human_required?: boolean | null
          id?: string
          letter_content?: string | null
          reason?: string
          resolved_at?: string | null
          response?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          submitted_at?: string | null
          tradeline_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_tradeline_id_fkey"
            columns: ["tradeline_id"]
            isOneToOne: false
            referencedRelation: "tradelines"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_projections: {
        Row: {
          assumptions: Json | null
          confidence: string | null
          created_at: string
          id: string
          probability_pct: number | null
          requirements: Json | null
          target_amount: number
          target_date: string | null
          user_id: string
        }
        Insert: {
          assumptions?: Json | null
          confidence?: string | null
          created_at?: string
          id?: string
          probability_pct?: number | null
          requirements?: Json | null
          target_amount: number
          target_date?: string | null
          user_id: string
        }
        Update: {
          assumptions?: Json | null
          confidence?: string | null
          created_at?: string
          id?: string
          probability_pct?: number | null
          requirements?: Json | null
          target_amount?: number
          target_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      score_history: {
        Row: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          id: string
          recorded_at: string
          score: number
          source: string | null
          user_id: string
        }
        Insert: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          id?: string
          recorded_at?: string
          score: number
          source?: string | null
          user_id: string
        }
        Update: {
          bureau?: Database["public"]["Enums"]["credit_bureau"]
          id?: string
          recorded_at?: string
          score?: number
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tradelines: {
        Row: {
          account_number_masked: string | null
          account_type: string | null
          bureau: Database["public"]["Enums"]["credit_bureau"] | null
          created_at: string
          credit_limit: number | null
          credit_report_id: string | null
          creditor_name: string
          current_balance: number | null
          date_opened: string | null
          date_reported: string | null
          id: string
          is_negative: boolean | null
          payment_status: string | null
          raw_data: Json | null
          user_id: string
        }
        Insert: {
          account_number_masked?: string | null
          account_type?: string | null
          bureau?: Database["public"]["Enums"]["credit_bureau"] | null
          created_at?: string
          credit_limit?: number | null
          credit_report_id?: string | null
          creditor_name: string
          current_balance?: number | null
          date_opened?: string | null
          date_reported?: string | null
          id?: string
          is_negative?: boolean | null
          payment_status?: string | null
          raw_data?: Json | null
          user_id: string
        }
        Update: {
          account_number_masked?: string | null
          account_type?: string | null
          bureau?: Database["public"]["Enums"]["credit_bureau"] | null
          created_at?: string
          credit_limit?: number | null
          credit_report_id?: string | null
          creditor_name?: string
          current_balance?: number | null
          date_opened?: string | null
          date_reported?: string | null
          id?: string
          is_negative?: boolean | null
          payment_status?: string | null
          raw_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tradelines_credit_report_id_fkey"
            columns: ["credit_report_id"]
            isOneToOne: false
            referencedRelation: "credit_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wealth_plans: {
        Row: {
          created_at: string
          goals: Json | null
          id: string
          plan_type: string
          projected_outcome: Json | null
          strategies: Json | null
          timeline_months: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goals?: Json | null
          id?: string
          plan_type: string
          projected_outcome?: Json | null
          strategies?: Json | null
          timeline_months?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goals?: Json | null
          id?: string
          plan_type?: string
          projected_outcome?: Json | null
          strategies?: Json | null
          timeline_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_priority: "critical" | "high" | "medium" | "low"
      action_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "requires_approval"
      app_role: "admin" | "user"
      credit_bureau: "experian" | "equifax" | "transunion"
      dispute_status:
        | "draft"
        | "pending_review"
        | "submitted"
        | "in_progress"
        | "resolved"
        | "rejected"
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
      action_priority: ["critical", "high", "medium", "low"],
      action_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
        "requires_approval",
      ],
      app_role: ["admin", "user"],
      credit_bureau: ["experian", "equifax", "transunion"],
      dispute_status: [
        "draft",
        "pending_review",
        "submitted",
        "in_progress",
        "resolved",
        "rejected",
      ],
    },
  },
} as const
