import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    type: 'lib',
    gitignore: true,
    jsdoc: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
    vue: {
      a11y: true,
      overrides: {
        'vue/singleline-html-element-content-newline': 'warn',
      },
    },
    typescript: {
      overrides: {
        'ts/explicit-function-return-type': 'off',
      },
    },
    unocss: true,
    rules: {
      'no-console': 'off',
      'no-async-promise-executor': 'off',
    },
  }, {
    files: [
      'app/pages/**/*.vue',
      'app/layouts/**/*.vue',
      'app/app.vue',
      'app/error.vue',
    ],
    rules: { 'vue/multi-word-component-names': 'off' },
  }),
)
