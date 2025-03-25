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
      address: {
        Row: {
          add_id: number
          delivery_address1: string | null
          delivery_address2: string | null
          delivery_city: string | null
          delivery_postcode: string | null
        }
        Insert: {
          add_id: number
          delivery_address1?: string | null
          delivery_address2?: string | null
          delivery_city?: string | null
          delivery_postcode?: string | null
        }
        Update: {
          add_id?: number
          delivery_address1?: string | null
          delivery_address2?: string | null
          delivery_city?: string | null
          delivery_postcode?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          cust_firstname: string | null
          cust_id: number
          cust_lastname: string | null
        }
        Insert: {
          cust_firstname?: string | null
          cust_id: number
          cust_lastname?: string | null
        }
        Update: {
          cust_firstname?: string | null
          cust_id?: number
          cust_lastname?: string | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          ing_id: string
          ing_meas: string | null
          ing_name: string | null
          ing_price: number | null
          ing_weight: number | null
        }
        Insert: {
          ing_id: string
          ing_meas?: string | null
          ing_name?: string | null
          ing_price?: number | null
          ing_weight?: number | null
        }
        Update: {
          ing_id?: string
          ing_meas?: string | null
          ing_name?: string | null
          ing_price?: number | null
          ing_weight?: number | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          ing_id: string | null
          inv_id: string
          quantity: number | null
        }
        Insert: {
          ing_id?: string | null
          inv_id: string
          quantity?: number | null
        }
        Update: {
          ing_id?: string | null
          inv_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ing_id_fkey"
            columns: ["ing_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["ing_id"]
          },
        ]
      }
      items: {
        Row: {
          item_cat: string | null
          item_id: string
          item_name: string | null
          item_price: number | null
          item_size: string | null
          pizza_id: string | null
        }
        Insert: {
          item_cat?: string | null
          item_id: string
          item_name?: string | null
          item_price?: number | null
          item_size?: string | null
          pizza_id?: string | null
        }
        Update: {
          item_cat?: string | null
          item_id?: string
          item_name?: string | null
          item_price?: number | null
          item_size?: string | null
          pizza_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          add_id: number | null
          created_at: string | null
          cust_id: number | null
          delivery: number | null
          item_id: string | null
          order_id: number
          quantity: number | null
          row_id: number
        }
        Insert: {
          add_id?: number | null
          created_at?: string | null
          cust_id?: number | null
          delivery?: number | null
          item_id?: string | null
          order_id: number
          quantity?: number | null
          row_id: number
        }
        Update: {
          add_id?: number | null
          created_at?: string | null
          cust_id?: number | null
          delivery?: number | null
          item_id?: string | null
          order_id?: number
          quantity?: number | null
          row_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_add_id_fkey"
            columns: ["add_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["add_id"]
          },
          {
            foreignKeyName: "orders_cust_id_fkey"
            columns: ["cust_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["cust_id"]
          },
          {
            foreignKeyName: "orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["item_id"]
          },
        ]
      }
      recipies: {
        Row: {
          ing_id: string | null
          pizza_id: string
          quantity: number | null
          row_id: number
        }
        Insert: {
          ing_id?: string | null
          pizza_id: string
          quantity?: number | null
          row_id: number
        }
        Update: {
          ing_id?: string | null
          pizza_id?: string
          quantity?: number | null
          row_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipies_ing_id_fkey"
            columns: ["ing_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["ing_id"]
          },
        ]
      }
      rota: {
        Row: {
          date: string | null
          rota_id: string | null
          row_id: number
          shift_id: string | null
          staff_id: string | null
        }
        Insert: {
          date?: string | null
          rota_id?: string | null
          row_id: number
          shift_id?: string | null
          staff_id?: string | null
        }
        Update: {
          date?: string | null
          rota_id?: string | null
          row_id?: number
          shift_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rota_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "rota_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staffs"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      shifts: {
        Row: {
          day_of_week: string | null
          end_time: string | null
          shift_id: string
          start_time: string | null
        }
        Insert: {
          day_of_week?: string | null
          end_time?: string | null
          shift_id: string
          start_time?: string | null
        }
        Update: {
          day_of_week?: string | null
          end_time?: string | null
          shift_id?: string
          start_time?: string | null
        }
        Relationships: []
      }
      staffs: {
        Row: {
          first_name: string | null
          hourly_rate: number | null
          last_name: string | null
          position: string | null
          staff_id: string
        }
        Insert: {
          first_name?: string | null
          hourly_rate?: number | null
          last_name?: string | null
          position?: string | null
          staff_id: string
        }
        Update: {
          first_name?: string | null
          hourly_rate?: number | null
          last_name?: string | null
          position?: string | null
          staff_id?: string
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
