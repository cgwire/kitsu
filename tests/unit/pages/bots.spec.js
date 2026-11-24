import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import Bots from '@/components/pages/Bots.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const bots = [
  { id: 'bot-1', full_name: 'Active Bot', active: true, is_bot: true },
  { id: 'bot-2', full_name: 'Old Bot', active: false, is_bot: true }
]

const SearchFieldStub = {
  template: '<div />',
  methods: {
    focus: () => {},
    getValue: () => '',
    setValue: () => {}
  }
}

const mountPage = async (query, { people = bots, stubs = {} } = {}) => {
  const store = createStore({
    getters: {
      displayedPeople: () => people,
      isCurrentUserAdmin: () => true,
      isPeopleLoading: () => false,
      isPeopleLoadingError: () => false,
      people: () => people
    },
    actions: {
      // answered after the page navigations land, as the API does
      loadPeople: () => new Promise(resolve => setTimeout(resolve)),
      setPeopleSearch: vi.fn()
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/bots', component: { template: '<div />' } }]
  })
  await router.push({ path: '/bots', query })
  const wrapper = shallowMount(Bots, {
    global: {
      plugins: [store, router],
      stubs: { SearchField: SearchFieldStub, ...stubs }
    }
  })
  await flushPromises()
  return wrapper
}

describe('Bots page', () => {
  describe('URL', () => {
    // unmounted after each test, a failed one included
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
    })

    const activeTab = () => wrapper.findComponent(RouteTabs).props('activeTab')

    it('keeps the tab when a role is picked', async () => {
      wrapper = await mountPage({ tab: 'unactive' })

      wrapper
        .findAllComponents(ComboboxStyled)
        .find(combo => combo.props('label') === 'people.fields.role')
        .vm.$emit('update:modelValue', 'manager')
      await flushPromises()

      expect(wrapper.vm.$route.query).toEqual({
        tab: 'unactive',
        role: 'manager'
      })
      expect(activeTab()).toBe('unactive')
    })

    it('opens a link on its tab', async () => {
      wrapper = await mountPage({ tab: 'unactive', role: 'manager' })

      expect(wrapper.vm.$route.query).toEqual({
        tab: 'unactive',
        role: 'manager'
      })
      expect(activeTab()).toBe('unactive')
    })
  })

  describe('empty list', () => {
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
    })

    // A responsive button hides its text below 1000 px wide, and this one has
    // no icon to show instead.
    it('keeps the text of its new bot button on narrow screens', async () => {
      wrapper = await mountPage(
        {},
        { people: [], stubs: { ButtonSimple: false } }
      )
      const button = wrapper.find('.has-text-centered .new-button')

      expect(button.text()).toBe('bots.new_bot')
      expect(button.find('span').classes()).not.toContain(
        'visuallyhidden-touch'
      )
    })
  })
})
