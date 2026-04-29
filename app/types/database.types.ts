// Auto-generated from Supabase CLI: supabase gen types typescript --local > app/types/database.types.ts
// Regenerate after each schema change.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            rooms: {
                Row: {
                    id: string
                    code: string
                    host_id: string
                    status: 'lobby' | 'playing' | 'voting' | 'result' | 'ended'
                    options: Json
                    word_pair: Json | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'created_at'>
                Update: Partial<Database['public']['Tables']['rooms']['Insert']>
            }
            players: {
                Row: {
                    id: string
                    room_id: string
                    name: string
                    role: 'civil' | 'undercover' | 'mr_white' | null
                    word: string | null
                    is_alive: boolean
                    joined_at: string
                }
                Insert: Omit<Database['public']['Tables']['players']['Row'], 'joined_at' | 'role' | 'word'>
                Update: Partial<Database['public']['Tables']['players']['Insert']>
            }
            rounds: {
                Row: {
                    id: string
                    room_id: string
                    number: number
                    status: 'describing' | 'voting' | 'ended'
                }
                Insert: Database['public']['Tables']['rounds']['Row']
                Update: Partial<Database['public']['Tables']['rounds']['Insert']>
            }
            descriptions: {
                Row: {
                    id: string
                    round_id: string
                    player_id: string
                    content: string
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['descriptions']['Row'], 'created_at'>
                Update: Partial<Database['public']['Tables']['descriptions']['Insert']>
            }
            votes: {
                Row: {
                    id: string
                    round_id: string
                    voter_id: string
                    target_id: string
                }
                Insert: Database['public']['Tables']['votes']['Row']
                Update: Partial<Database['public']['Tables']['votes']['Insert']>
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
    }
}
