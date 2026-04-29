export default {
    extends: [
        'stylelint-config-standard-scss',
        'stylelint-config-standard-vue/scss',
        'stylelint-config-idiomatic-order',
        'stylelint-config-css-modules',
    ],
    rules: {
        'no-descending-specificity': null,
        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': true,
        'no-invalid-position-at-import-rule': null,
        'selector-class-pattern': '^[a-z]([-]?[a-z0-9]+)*(__[a-z0-9]([-]?[a-z0-9]+)*)*(--[a-z0-9]([-]?[a-z0-9]+)*)?$',
        'function-no-unknown': null,
        'scss/function-no-unknown': [
            true,
            {
                ignoreFunctions: ['v-bind'],
            },
        ],
        'declaration-property-value-no-unknown': null,
        'scss/comment-no-empty': null,
        'color-function-notation': null,
        'no-duplicate-selectors': null,
        'at-rule-empty-line-before': [
            'always',
            {
                except: ['blockless-after-same-name-blockless', 'first-nested'],
                ignore: ['after-comment', 'blockless-after-same-name-blockless'],
                ignoreAtRules: ['else'],
            },
        ],
    },
    defaultSeverity: 'warning',
    ignoreFiles: ['./dist/**/*.css', './.nuxt/**/*.css'],
}
