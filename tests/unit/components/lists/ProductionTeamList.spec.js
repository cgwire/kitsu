import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import ProductionTeamList from '@/components/lists/ProductionTeamList.vue'
import Combobox from '@/components/widgets/Combobox.vue'

const ann = { id: 'ann', name: 'Ann', role: 'user', departments: [] }

const createTeamStore = () =>
  createStore({
    getters: {
      isCurrentUserManager: () => true,
      isCurrentUserProductionManager: () => true,
      user: () => ({ id: 'me' })
    }
  })

const mountList = (entries, { store = createTeamStore(), stubs = {} } = {}) =>
  shallowMount(ProductionTeamList, {
    props: { entries },
    global: { plugins: [store], stubs }
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

  // The page tells a removal Zou refuses.
  it('leaves the removal of a member to the page', async () => {
    const store = createTeamStore()
    vi.spyOn(store, 'dispatch')
    const wrapper = mountList([ann], { store })

    await wrapper.find('td.actions button').trigger('click')

    expect(wrapper.emitted('remove-person')).toEqual([[ann]])
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  // Vue patches a selected option only when its value changes: a role Zou
  // refuses stays chosen until the select is drawn again.
  it('draws the role select again with the stored role', async () => {
    const wrapper = mountList([ann], { stubs: { Combobox: false } })
    const select = () => wrapper.find('td.role select')

    await select().setValue('people.role.manager')
    expect(wrapper.emitted('update-role')).toEqual([
      [{ person: ann, role: 'manager' }]
    ])
    await wrapper.setProps({ roleRedraws: { ann: 1 } })

    expect(select().element.value).toBe('people.role.user')
  })
})
