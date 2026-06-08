import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

function isPlaceholder(value: string) {
    return !value || value.includes('xxxx') || value.startsWith('your-') || value.startsWith('placeholder')
}

export function useSupabaseAdmin(event: H3Event) {
    const config = useRuntimeConfig()
    const url = config.public.supabaseUrl as string
    const key = config.supabaseSecretKey as string

    if (isPlaceholder(url) || isPlaceholder(key)) {
        throw createError({
            statusCode: 503,
            message: 'Base de données non configurée — renseigne les variables Supabase dans .env',
        })
    }

    return serverSupabaseServiceRole(event)
}
