module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  plugins: [
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'prettier'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/no-use-v-if-with-v-for': 'off',
    'prettier/prettier': 'error'
  },
  parserOptions: {
  }
}
