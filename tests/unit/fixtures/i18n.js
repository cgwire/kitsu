import { config, mount } from '@vue/test-utils'

import i18n from '@/lib/i18n'

// Mount with the app's real i18n: the global $t mock of unit.setup.js would
// shadow the $t the plugin injects, and mask the rendered strings.
export const mountWithI18n = component => {
  const globalT = config.global.mocks.$t
  delete config.global.mocks.$t
  try {
    return mount(component, { global: { plugins: [i18n] } })
  } finally {
    config.global.mocks.$t = globalT
  }
}
