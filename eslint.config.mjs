import withNuxt from './.nuxt/eslint.config.mjs'
import stylistic from '@stylistic/eslint-plugin'

export default withNuxt(
    {
        ignores: [
            'dist',
            '.output',
            '.nuxt',
            'node_modules',
        ],
    },
).append({
    plugins: { '@stylistic': stylistic },
    rules: {
        '@stylistic/function-paren-newline': ['error', 'consistent'],
    },
}).override('nuxt/vue/rules', {
    rules: {
        'vue/max-len': ['warn', {
            code: 120,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreTrailingComments: true,
            ignoreHTMLAttributeValues: true,
        }],
    },
}).override('nuxt/typescript/rules', {
    rules: {
        '@typescript-eslint/no-empty-object-type': ['error', {
            allowInterfaces: 'with-single-extends',
        }],
    },
}).append({
    files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.jsx', '**/*.tsx'],
    plugins: { '@stylistic': stylistic },
    rules: {
        '@stylistic/max-len': ['warn', {
            code: 120,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreTrailingComments: true,
        }],
    },
})
