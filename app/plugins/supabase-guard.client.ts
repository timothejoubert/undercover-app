export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const url = config.public.supabaseUrl as string
    const key = config.public.supabaseKey as string

    const isPlaceholder = !url || !key || url.includes('placeholder') || key.includes('placeholder')

    if (isPlaceholder) {
        console.warn(
            '[Supabase] Running without real credentials — database features are disabled.\n'
            + 'Copy .env.example to .env and fill in NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_KEY.',
        )
    }

    return {
        provide: {
            supabaseReady: !isPlaceholder,
        },
    }
})
