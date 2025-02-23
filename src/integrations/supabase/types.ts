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
      active_games: {
        Row: {
          created_at: string
          creator_did: string
          id: string
          opponent_did: string | null
          selected_move: string
          stake_amount: number
          status: string | null
          winner_did: string | null
        }
        Insert: {
          created_at?: string
          creator_did: string
          id?: string
          opponent_did?: string | null
          selected_move: string
          stake_amount: number
          status?: string | null
          winner_did?: string | null
        }
        Update: {
          created_at?: string
          creator_did?: string
          id?: string
          opponent_did?: string | null
          selected_move?: string
          stake_amount?: number
          status?: string | null
          winner_did?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_games_creator_did_fkey"
            columns: ["creator_did"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["did"]
          },
          {
            foreignKeyName: "active_games_opponent_did_fkey"
            columns: ["opponent_did"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["did"]
          },
          {
            foreignKeyName: "active_games_winner_did_fkey"
            columns: ["winner_did"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["did"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          expiration_date: string
          id: string
          is_ranked: boolean | null
          loser_did: string | null
          loser_rating_change: number | null
          player1_claimed_at: string | null
          player1_did: string
          player1_hidden: boolean | null
          player1_move: string | null
          player1_move_timestamp: string | null
          player2_claimed_at: string | null
          player2_did: string | null
          player2_hidden: boolean | null
          player2_move: string | null
          player2_move_timestamp: string | null
          stake_amount: number
          status: string
          winner_did: string | null
          winner_rating_change: number | null
        }
        Insert: {
          created_at?: string
          expiration_date?: string
          id?: string
          is_ranked?: boolean | null
          loser_did?: string | null
          loser_rating_change?: number | null
          player1_claimed_at?: string | null
          player1_did: string
          player1_hidden?: boolean | null
          player1_move?: string | null
          player1_move_timestamp?: string | null
          player2_claimed_at?: string | null
          player2_did?: string | null
          player2_hidden?: boolean | null
          player2_move?: string | null
          player2_move_timestamp?: string | null
          stake_amount: number
          status?: string
          winner_did?: string | null
          winner_rating_change?: number | null
        }
        Update: {
          created_at?: string
          expiration_date?: string
          id?: string
          is_ranked?: boolean | null
          loser_did?: string | null
          loser_rating_change?: number | null
          player1_claimed_at?: string | null
          player1_did?: string
          player1_hidden?: boolean | null
          player1_move?: string | null
          player1_move_timestamp?: string | null
          player2_claimed_at?: string | null
          player2_did?: string | null
          player2_hidden?: boolean | null
          player2_move?: string | null
          player2_move_timestamp?: string | null
          stake_amount?: number
          status?: string
          winner_did?: string | null
          winner_rating_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_loser_did_fkey"
            columns: ["loser_did"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["did"]
          },
          {
            foreignKeyName: "matches_player1_did_fkey"
            columns: ["player1_did"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["did"]
          },
          {
            foreignKeyName: "matches_player2_did_fkey"
            columns: ["player2_did"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["did"]
          },
          {
            foreignKeyName: "matches_winner_did_fkey"
            columns: ["winner_did"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["did"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          did: string
          display_name: string | null
          matches_drawn: number | null
          matches_lost: number | null
          matches_played: number | null
          matches_won: number | null
          off_chain_balance: number | null
          paper_count: number
          rating: number
          rock_count: number
          scissors_count: number
          updated_at: string
          wallet_address: string | null
          web_push_subscription: string | null
          safari_push_subscription: string | null
          rock_count_last_update: number | null
          paper_count_last_update: number | null
          scissors_count_last_update: number | null
          off_chain_balance_last_update: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          did: string
          display_name?: string | null
          matches_drawn?: number | null
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          off_chain_balance?: number | null
          paper_count?: number
          rating?: number
          rock_count?: number
          scissors_count?: number
          updated_at?: string
          wallet_address?: string | null
          web_push_subscription?: string | null
          safari_push_subscription?: string | null
          rock_count_last_update?: number | null
          paper_count_last_update?: number | null
          scissors_count_last_update?: number | null
          off_chain_balance_last_update?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          did?: string
          display_name?: string | null
          matches_drawn?: number | null
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          off_chain_balance?: number | null
          paper_count?: number
          rating?: number
          rock_count?: number
          scissors_count?: number
          updated_at?: string
          wallet_address?: string | null
          web_push_subscription?: string | null
          safari_push_subscription?: string | null
          rock_count_last_update?: number | null
          paper_count_last_update?: number | null
          scissors_count_last_update?: number | null
          off_chain_balance_last_update?: number | null
        }
        Relationships: []
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
