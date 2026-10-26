// @vitest-environment node

import { SHARED_GLOBAL, publishSharedModules } from '@/lib/plugins/shared'

describe('plugin shared modules', () => {
  afterEach(() => {
    delete globalThis[SHARED_GLOBAL]
  })

  test('publishes vue, vue-router, vuex and vue-i18n on the bridge global', () => {
    publishSharedModules()

    const bridge = globalThis[SHARED_GLOBAL]
    expect(bridge).toBeTruthy()
    expect(Object.keys(bridge.modules).sort()).toEqual([
      'vue',
      'vue-i18n',
      'vue-router',
      'vuex'
    ])
    expect(bridge.modules.vue).toHaveProperty('ref')
    expect(bridge.modules.vuex).toHaveProperty('createStore')
    expect(bridge.modules['vue-router']).toHaveProperty('createRouter')
    expect(bridge.modules['vue-i18n']).toHaveProperty('createI18n')
  })
})
