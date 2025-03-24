
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: number
          customer_id: number
          order_date: string
          total_amount: number
          status: string
          delivery_method: 'delivery' | 'pickup'
          created_at: string
        }
        Insert: {
          id?: number
          customer_id: number
          order_date?: string
          total_amount: number
          status?: string
          delivery_method?: 'delivery' | 'pickup'
          created_at?: string
        }
        Update: {
          id?: number
          customer_id?: number
          order_date?: string
          total_amount?: number
          status?: string
          delivery_method?: 'delivery' | 'pickup'
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          item_id: number
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          item_id: number
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          item_id?: number
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      items: {
        Row: {
          id: number
          name: string
          description: string
          category: string
          price: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          category: string
          price: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          category?: string
          price?: number
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: number
          ingredient_id: number
          current_level: number
          unit: string
          last_updated: string
        }
        Insert: {
          id?: number
          ingredient_id: number
          current_level: number
          unit: string
          last_updated?: string
        }
        Update: {
          id?: number
          ingredient_id?: number
          current_level?: number
          unit?: string
          last_updated?: string
        }
      }
      ingredients: {
        Row: {
          id: number
          name: string
          category: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          category: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: string
          created_at?: string
        }
      }
      shifts: {
        Row: {
          id: number
          staff_id: number
          start_time: string
          end_time: string
          hours_worked: number
          hourly_rate: number
          created_at: string
        }
        Insert: {
          id?: number
          staff_id: number
          start_time: string
          end_time: string
          hours_worked: number
          hourly_rate: number
          created_at?: string
        }
        Update: {
          id?: number
          staff_id?: number
          start_time?: string
          end_time?: string
          hours_worked?: number
          hourly_rate?: number
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: number
          name: string
          role: string
          email: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          role: string
          email: string
          phone?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          role?: string
          email?: string
          phone?: string
          created_at?: string
        }
      }
    }
  }
}
