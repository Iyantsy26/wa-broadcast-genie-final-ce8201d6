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
          updated_at?: string
        }
        Relationships: []
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
      team_members: {
        Row: {
          avatar: string | null
          created_at: string
          department_id: string | null
          email: string
          id: string
          last_active: string | null
          name: string
          phone: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          id?: string
          last_active?: string | null
          name: string
          phone?: string | null
          role: string
          status: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          id?: string
          last_active?: string | null
          name?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
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
      whatsapp_accounts: {
        Row: {
          account_name: string
          created_at: string
          id: string
          phone_number: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          account_name: string
          created_at?: string
          id?: string
          phone_number: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          created_at?: string
          id?: string
          phone_number?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
