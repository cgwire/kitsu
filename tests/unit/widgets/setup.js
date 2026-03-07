import { config } from '@vue/test-utils'

// Components using useI18n() from the Composition API need the real vue-i18n
// plugin. The global $t mock from unit.setup.js conflicts with it, so we
// remove it for these tests and restore it afterwards.
const savedMocks = { ...config.global.mocks }

beforeAll(() => {
  delete config.global.mocks.$t
})

afterAll(() => {
  config.global.mocks = savedMocks
})
