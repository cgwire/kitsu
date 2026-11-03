import { config, mount, shallowMount } from '@vue/test-utils'

import i18n from '@/lib/i18n'

// Mount with the app's real i18n: the global $t mock of unit.setup.js would
// shadow the $t the plugin injects, and mask the rendered strings.
const withI18n =
  mountComponent =>
  (component, { global = {}, ...options } = {}) => {
    const globalT = config.global.mocks.$t
    delete config.global.mocks.$t
    try {
      return mountComponent(component, {
        ...options,
        global: { ...global, plugins: [i18n, ...(global.plugins ?? [])] }
      })
    } finally {
      config.global.mocks.$t = globalT
    }
  }

export const mountWithI18n = withI18n(mount)
export const shallowMountWithI18n = withI18n(shallowMount)
