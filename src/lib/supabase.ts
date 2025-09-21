import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          status: 'waiting' | 'active' | 'finished' | 'abandoned'
          max_players: number
          current_players: number
          score_limit: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'waiting' | 'active' | 'finished' | 'abandoned'
          max_players?: number
          current_players?: number
          score_limit?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'waiting' | 'active' | 'finished' | 'abandoned'
          max_players?: number
          current_players?: number
          score_limit?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      game_players: {
        Row: {
          id: string
          game_id: string
          user_id: string
          player_name: string
          is_host: boolean
          is_ready: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          player_name: string
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          player_name?: string
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
        }
      }
      game_states: {
        Row: {
          id: string
          game_id: string
          state_data: any
          current_player_index: number
          turn_timer: number
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          state_data: any
          current_player_index?: number
          turn_timer?: number
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          state_data?: any
          current_player_index?: number
          turn_timer?: number
          updated_at?: string
        }
      }
    }
  }
}

