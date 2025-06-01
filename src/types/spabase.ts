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
      appointments: {
        Row: {
          id: number
          customer_id: number
          service_id: number
          staff_id: number
          date: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          customer_id: number
          service_id: number
          staff_id: number
          date: string
          start_time: string
          end_time: string
          status: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          customer_id?: number
          service_id?: number
          staff_id?: number
          date?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: number
          first_name: string
          last_name: string
          email: string
          phone: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          first_name: string
          last_name: string
          email: string
          phone: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          notes?: string | null
          created_at?: string
        }
      }
      services: {
        Row: {
          id: number
          name: string
          description: string | null
          duration: number
          price: number
          category: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          duration: number
          price: number
          category: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          duration?: number
          price?: number
          category?: string
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: number
          first_name: string
          last_name: string
          email: string
          phone: string
          role: string
          created_at: string
        }
        Insert: {
          id?: number
          first_name: string
          last_name: string
          email: string
          phone: string
          role: string
          created_at?: string
        }
        Update: {
          id?: number
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          role?: string
          created_at?: string
        }
      }
    }
  }
}