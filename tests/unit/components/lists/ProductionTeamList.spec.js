import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import ProductionTeamList from '@/components/lists/ProductionTeamList.vue'
import Combobox from '@/components/widgets/Combobox.vue'

const mountList = entries =>
  shallowMount(ProductionTeamList, {
    props: { entries },
    global: {
      plugins: [
        createStore({
          getters: {
            isCurrentUserManager: () => true,
            isCurrentUserProductionManager: () => true,
            user: () => ({ id: 'me' })
          }
        })
      ]
    }
  })

describe('ProductionTeamList', () => {
  it('shows the role of a client as text, without a role select', () => {
    const wrapper = mountList([
      { id: 'cli', name: 'Cli', role: 'client', departments: [] }
    ])

    expect(wrapper.findComponent(Combobox).exists()).toBe(false)
    expect(wrapper.find('td.role').text()).toContain('people.role.client')
  })

  it('offers a role select for a team member', () => {
    const wrapper = mountList([
      { id: 'ann', name: 'Ann', role: 'user', departments: [] }
    ])

    expect(wrapper.findComponent(Combobox).exists()).toBe(true)
  })
})
