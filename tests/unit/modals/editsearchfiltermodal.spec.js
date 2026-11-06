import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'

// Labels render as their locale keys.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const mountModal = ({ isManager = true, productionId } = {}) => {
  const store = createStore({
    getters: {
      // Set on every page, out of a production too.
      currentProduction: () => ({ id: 'production-1' }),
      isCurrentUserManager: () => isManager,
      personMap: () => new Map()
    }
  })
  return shallowMount(EditSearchFilterModal, {
    props: { active: true, productionId },
    global: {
      plugins: [store, i18n],
      stubs: { BaseModal: { template: '<div><slot /></div>' } }
    }
  })
}

describe('EditSearchFilterModal', () => {
  // The modal focuses its name field 100 ms after it opens.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('lets a manager share a search of a production', () => {
    const wrapper = mountModal({ productionId: 'production-1' })

    expect(wrapper.findComponent(BooleanField).exists()).toBe(true)
  })

  test('keeps the sharing from anyone else', () => {
    const wrapper = mountModal({
      isManager: false,
      productionId: 'production-1'
    })

    expect(wrapper.findComponent(BooleanField).exists()).toBe(false)
  })

  // Zou would turn it off without a word.
  test('offers no sharing for a search out of any production', () => {
    const wrapper = mountModal()

    expect(wrapper.findComponent(BooleanField).exists()).toBe(false)
  })
})
