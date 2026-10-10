import { config } from '@vue/test-utils'

// For the specs that mount with the real vue-i18n plugin: the global $t mock
// from unit.setup.js would shadow the $t the plugin injects, so remove it for
// these tests and restore it afterwards.
const savedMocks = { ...config.global.mocks }

beforeAll(() => {
  delete config.global.mocks.$t
})

afterAll(() => {
  config.global.mocks = savedMocks
})
