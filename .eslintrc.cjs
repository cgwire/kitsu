module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'no-console':
      process.env.NODE_ENV === 'production'
        ? ['error', { allow: ['error', 'warn'] }]
        : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
    'no-unused-vars': ['error', { args: 'none' }],
    'no-var': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'prefer-const': [
      'error',
      {
        destructuring: 'all'
      }
    ],

    // additional rules for Vue
    'vue/component-definition-name-casing': ['error', 'kebab-case'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/custom-event-name-casing': ['error', 'kebab-case'],
    'vue/eqeqeq': ['error', 'always', { null: 'ignore' }],
    'vue/no-unused-emit-declarations': 'error',
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/require-explicit-emits': 'error',

    // disabled vue/recommended rules
    'vue/attributes-order': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'vue/order-in-components': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/no-template-shadow': 'off'
  }
}
