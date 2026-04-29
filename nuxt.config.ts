import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
    modules: [
        '@nuxt/ui',
        '@nuxtjs/supabase',
        '@vueuse/nuxt',
        '@nuxt/eslint',
    ],
    devtools: { enabled: false },
    app: {
        head: {
            htmlAttrs: { lang: 'fr' },
            title: 'Undercover',
            meta: [
                { name: 'description', content: 'Jeu Undercover en ligne entre amis' },
            ],
        },
    },
    css: [
        '~/assets/css/main.css',  // Tailwind + NuxtUI
        '~/assets/scss/main.scss', // styles globaux custom
    ],
    runtimeConfig: {
        public: {
            supabaseUrl: '',
            supabaseKey: '',
        },
    },
    compatibilityDate: '2025-04-29',
    vite: {
        optimizeDeps: {
            include: [],
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "${fileURLToPath(new URL('./app/assets/scss/_resources.scss', import.meta.url))}" as *;`,
                    loadPaths: [fileURLToPath(new URL('./app', import.meta.url))],
                    quietDeps: true,
                },
            },
        },
    },
    // https://eslint.nuxt.com/packages/module
    eslint: {
        config: {
            stylistic: {
                indent: 4,
            },
        },
    },
    // https://supabase.nuxtjs.org/get-started
    supabase: {
        redirect: false,
        types: '~/types/database.types.ts',
    },
})
