module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:prettier/recommended'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-use-v-if-with-v-for': 'off',
    'prefer-const': [
      'error',
      {
        destructuring: 'all'
      }
    ]
  },
  globals: {
    Canny: true
  }
}
