import { mount, RouterLinkStub } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'

describe('ProductionNameCell', () => {
  const mountCell = props => {
    const store = createStore({
      getters: {
        isCurrentUserClient: () => false
      }
    })
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: { en: {} },
      missingWarn: false,
      fallbackWarn: false
    })
    return mount(ProductionNameCell, {
      global: {
        plugins: [store, i18n],
        stubs: { RouterLink: RouterLinkStub }
      },
      props
    })
  }

  // The task lists pass productionMap.get(task.project_id), so a production
  // missing from the map arrives as undefined.
  test('renders nothing for a production missing from the map', () => {
    const wrapper = mountCell({ entry: undefined, onlyAvatar: true })

    expect(wrapper.find('.production-name').exists()).toBe(false)
  })

  test('renders the avatar of a known production', () => {
    const wrapper = mountCell({
      entry: { id: 'production-1', name: 'Agent 327' },
      onlyAvatar: true
    })

    expect(wrapper.find('.avatar').text()).toBe('A')
  })
})
