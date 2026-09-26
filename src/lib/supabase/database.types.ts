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
      admins: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          pin_hash: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          pin_hash: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          pin_hash?: string
        }
        Relationships: []
      }
      barbers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string | null
          pin_hash: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          pin_hash?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          pin_hash?: string | null
        }
        Relationships: []
      }
      cuts: {
        Row: {
          amount: number
          barber_id: string
          client_name: string | null
          created_at: string
          cut_date: string
          id: string
          notes: string | null
          payment_method: string
          service_id: string | null
        }
        Insert: {
          amount: number
          barber_id: string
          client_name?: string | null
          created_at?: string
          cut_date?: string
          id?: string
          notes?: string | null
          payment_method?: string
          service_id?: string | null
        }
        Update: {
          amount?: number
          barber_id?: string
          client_name?: string | null
          created_at?: string
          cut_date?: string
          id?: string
          notes?: string | null
          payment_method?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuts_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          price?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          price?: number
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

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
