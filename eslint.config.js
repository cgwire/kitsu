import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginPromise from 'eslint-plugin-promise'
import pluginVue from 'eslint-plugin-vue'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig([
  // Global ignores
  {
    name: 'global-ignores',
    ignores: [
      'build/*.js',
      'config/*.js',
      'src/locales/*',
      '!src/locales/en.js',
      '!src/locales/en_nft.js',
      '!src/locales/en_video-game.js',
      'src/stories/*'
    ]
  },

  // ESLint recommended rules
  js.configs.recommended,

  // Vue 3 recommended rules
  ...pluginVue.configs['flat/recommended'],

  // Promise recommended rules
  pluginPromise.configs['flat/recommended'],

  // Prettier recommended rules
  pluginPrettierRecommended,

  // Source files configuration
  {
    name: 'source-files',
    files: ['src/**/*.{js,vue}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020
      }
    },
    rules: {
      // Console & debugger (production only)
      'no-console': isProduction
        ? ['error', { allow: ['error', 'warn'] }]
        : 'off',
      'no-debugger': isProduction ? 'error' : 'off',

      // Code quality
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-constant-binary-expression': 'off',
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],

      // Promise rules
      'promise/always-return': 'off',
      'promise/catch-or-return': 'off',
      'promise/no-callback-in-promise': 'off',
      'promise/no-nesting': 'off',
      'promise/no-promise-in-callback': 'off',
      'promise/no-return-wrap': 'error',

      // Additional rules for Vue
      'vue/component-definition-name-casing': ['error', 'kebab-case'],
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/eqeqeq': ['error', 'always', { null: 'ignore' }],
      'vue/no-unused-emit-declarations': 'error',
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/require-explicit-emits': 'error',

      // Disabled vue/recommended rules
      'vue/attributes-order': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-required-prop-with-default': 'off',
      'vue/no-v-html': 'off',
      'vue/order-in-components': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',
      'vue/no-template-shadow': 'off'
    }
  },

  // Test files configuration
  {
    name: 'test-files',
    files: ['tests/**/*.{js,vue}'],
    languageOptions: {
      globals: {
        ...globals.vitest,
        cy: 'readonly'
      }
    }
  },

  // ESM config files
  {
    name: 'config-esm',
    files: ['*.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  }
])
