module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
    'no-unused-vars': ['error', { args: 'none' }],
    'no-var': 'error',
    'prefer-const': [
      'error',
      {
        destructuring: 'all'
      }
    ],

    // additional rules for Vue
    'vue/component-definition-name-casing': ['error', 'kebab-case'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/prop-name-casing': ['error', 'camelCase'],

    // disabled vue/recommended rules
    'vue/attributes-order': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-lone-template': 'off',
    'vue/no-use-v-if-with-v-for': 'off',
    'vue/no-v-html': 'off',
    'vue/order-in-components': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/no-template-shadow': 'off'
  }
}
