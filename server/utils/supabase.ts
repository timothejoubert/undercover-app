import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

export function useSupabaseAdmin(event: H3Event) {
    return serverSupabaseServiceRole(event)
}
