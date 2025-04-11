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
      activities: {
        Row: {
          activity_type: string | null
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          activity_type?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          audience: string
          created_at: string
          delivered: number | null
          id: string
          name: string
          read: number | null
          responded: number | null
          scheduled: string | null
          sent: number | null
          status: string
          template: string | null
          updated_at: string
        }
        Insert: {
          audience: string
          created_at?: string
          delivered?: number | null
          id?: string
          name: string
          read?: number | null
          responded?: number | null
          scheduled?: string | null
          sent?: number | null
          status: string
          template?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          delivered?: number | null
          id?: string
          name?: string
          read?: number | null
          responded?: number | null
          scheduled?: string | null
          sent?: number | null
          status?: string
          template?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chatbots: {
        Row: {
          created_at: string
          description: string
          device_id: string | null
          flow: Json
          id: string
          name: string
          status: string
          triggers: string[]
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          description: string
          device_id?: string | null
          flow?: Json
          id?: string
          name: string
          status: string
          triggers?: string[]
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          description?: string
          device_id?: string | null
          flow?: Json
          id?: string
          name?: string
          status?: string
          triggers?: string[]
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          avatar_url: string | null
          company: string | null
          email: string | null
          id: string
          join_date: string | null
          name: string
          notes: string | null
          phone: string | null
          plan_details: string | null
          referred_by: string | null
          renewal_date: string | null
          tags: string[] | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          plan_details?: string | null
          referred_by?: string | null
          renewal_date?: string | null
          tags?: string[] | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          plan_details?: string | null
          referred_by?: string | null
          renewal_date?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          id: string
          last_message: string | null
          last_message_timestamp: string | null
          lead_id: string | null
          status: string | null
          tags: string[] | null
          team_member_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_timestamp?: string | null
          lead_id?: string | null
          status?: string | null
          tags?: string[] | null
          team_member_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_timestamp?: string | null
          lead_id?: string | null
          status?: string | null
          tags?: string[] | null
          team_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_members"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_departments_lead"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      device_accounts: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          last_active: string | null
          name: string
          organization_id: string | null
          phone: string
          plan_tier: string | null
          status: string
          type: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          last_active?: string | null
          name: string
          organization_id?: string | null
          phone: string
          plan_tier?: string | null
          status: string
          type: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          last_active?: string | null
          name?: string
          organization_id?: string | null
          phone?: string
          plan_tier?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          next_followup: string | null
          notes: string | null
          phone: string | null
          referrer_name: string | null
          source: string | null
          status: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          next_followup?: string | null
          notes?: string | null
          phone?: string | null
          referrer_name?: string | null
          source?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          next_followup?: string | null
          notes?: string | null
          phone?: string | null
          referrer_name?: string | null
          source?: string | null
          status?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          id: string
          is_outbound: boolean | null
          media_duration: number | null
          media_filename: string | null
          media_type: string | null
          media_url: string | null
          message_type: string | null
          sender: string | null
          status: string | null
          timestamp: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          id?: string
          is_outbound?: boolean | null
          media_duration?: number | null
          media_filename?: string | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          sender?: string | null
          status?: string | null
          timestamp?: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          id?: string
          is_outbound?: boolean | null
          media_duration?: number | null
          media_filename?: string | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          sender?: string | null
          status?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_branding: {
        Row: {
          accent_color: string | null
          created_at: string
          custom_domain: string | null
          custom_domain_verified: boolean | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          organization_id: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_domain_verified?: boolean | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          organization_id: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_domain_verified?: boolean | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          organization_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          payment_provider: string | null
          payment_provider_subscription_id: string | null
          plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          organization_id: string
          payment_provider?: string | null
          payment_provider_subscription_id?: string | null
          plan_id: string
          status: string
          updated_at?: string
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          payment_provider?: string | null
          payment_provider_subscription_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          owner_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          owner_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          interval: string | null
          is_active: boolean
          is_custom: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          interval?: string | null
          is_active?: boolean
          is_custom?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          interval?: string | null
          is_active?: boolean
          is_custom?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      team_member_whatsapp_accounts: {
        Row: {
          created_at: string
          id: string
          team_member_id: string
          whatsapp_account_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          team_member_id: string
          whatsapp_account_id: string
        }
        Update: {
          created_at?: string
          id?: string
          team_member_id?: string
          whatsapp_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_whatsapp_accounts_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_whatsapp_accounts_whatsapp_account_id_fkey"
            columns: ["whatsapp_account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          address: string | null
          avatar: string | null
          company: string | null
          created_at: string
          custom_id: string | null
          department_id: string | null
          email: string
          id: string
          is_super_admin: boolean | null
          last_active: string | null
          name: string
          phone: string | null
          position: string | null
          role: string
          status: string
          updated_at: string
          whatsapp_permissions: Json | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          company?: string | null
          created_at?: string
          custom_id?: string | null
          department_id?: string | null
          email: string
          id?: string
          is_super_admin?: boolean | null
          last_active?: string | null
          name: string
          phone?: string | null
          position?: string | null
          role: string
          status: string
          updated_at?: string
          whatsapp_permissions?: Json | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          company?: string | null
          created_at?: string
          custom_id?: string | null
          department_id?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean | null
          last_active?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          role?: string
          status?: string
          updated_at?: string
          whatsapp_permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_members_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          buttons: Json | null
          content: string
          created_at: string
          id: string
          language: string
          last_used: string | null
          media_url: string | null
          name: string
          status: string
          type: string
          variables: Json | null
        }
        Insert: {
          buttons?: Json | null
          content: string
          created_at?: string
          id?: string
          language: string
          last_used?: string | null
          media_url?: string | null
          name: string
          status: string
          type: string
          variables?: Json | null
        }
        Update: {
          buttons?: Json | null
          content?: string
          created_at?: string
          id?: string
          language?: string
          last_used?: string | null
          media_url?: string | null
          name?: string
          status?: string
          type?: string
          variables?: Json | null
        }
        Relationships: []
      }
      whatsapp_accounts: {
        Row: {
          account_name: string
          api_key: string | null
          business_id: string | null
          connection_type: string | null
          created_at: string
          id: string
          last_active: string | null
          phone_number: string
          status: string | null
          team_member_id: string
          updated_at: string
        }
        Insert: {
          account_name: string
          api_key?: string | null
          business_id?: string | null
          connection_type?: string | null
          created_at?: string
          id?: string
          last_active?: string | null
          phone_number: string
          status?: string | null
          team_member_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          api_key?: string | null
          business_id?: string | null
          connection_type?: string | null
          created_at?: string
          id?: string
          last_active?: string | null
          phone_number?: string
          status?: string | null
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_accounts_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_team_member_whatsapp_accounts: {
        Args: { member_id: string }
        Returns: undefined
      }
      generate_custom_user_id: {
        Args: { role_type: string }
        Returns: string
      }
      get_organization_limits: {
        Args: { org_id: string }
        Returns: Json
      }
      get_team_member_whatsapp_accounts: {
        Args: Record<PropertyKey, never>
        Returns: {
          team_member_id: string
          whatsapp_account_id: string
        }[]
      }
      get_team_member_whatsapp_accounts_by_id: {
        Args: { member_id: string }
        Returns: {
          team_member_id: string
          whatsapp_account_id: string
        }[]
      }
      insert_team_member_whatsapp_accounts: {
        Args: { accounts: Json }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
