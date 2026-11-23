import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import AssetLibrary from '@/components/pages/AssetLibrary.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'

const production = { id: 'production-1', name: 'School' }

const SearchFieldStub = {
  template: '<div />',
  data: () => ({ value: '' }),
  methods: {
    focus() {},
    getValue() {
      return this.value
    },
    setValue(value) {
      this.value = value ?? ''
    }
  }
}

const PageLayoutStub = {
  template: '<div><slot name="main" /><slot name="side" /></div>'
}

const mountPage = async query => {
  const store = createStore({
    getters: {
      displayedSharedAssets: () => [],
      displayedSharedAssetsByType: () => [],
      isCurrentUserManager: () => true,
      openProductions: () => [production],
      productionMap: () => new Map([[production.id, production]]),
      selectedAssets: () => new Map()
    },
    actions: {
      loadSharedAssets: vi.fn(),
      setAssetSelection: vi.fn(),
      setSharedAssetSearch: vi.fn()
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/asset-library', component: { template: '<div />' } }]
  })
  await router.push({ path: '/asset-library', query })
  const wrapper = shallowMount(AssetLibrary, {
    global: {
      plugins: [store, router],
      stubs: { PageLayout: PageLayoutStub, SearchField: SearchFieldStub }
    }
  })
  await flushPromises()
  return wrapper
}

describe('AssetLibrary page', () => {
  // unmounted after each test, a failed one included
  let wrapper = null

  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {}
      }))
    )
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.unstubAllGlobals()
  })

  describe('URL', () => {
    it('keeps the search when a production is picked', async () => {
      wrapper = await mountPage({ search: 'chair' })

      wrapper
        .findComponent(ComboboxProduction)
        .vm.$emit('update:modelValue', production.id)
      await flushPromises()

      expect(wrapper.vm.$route.query).toEqual({
        search: 'chair',
        production: production.id
      })
    })

    it('keeps the production when a search is typed', async () => {
      wrapper = await mountPage({ production: production.id })

      const field = wrapper.findComponent(SearchFieldStub)
      field.vm.setValue('chair')
      field.vm.$emit('change', 'chair')
      await flushPromises()

      expect(wrapper.vm.$route.query).toEqual({
        production: production.id,
        search: 'chair'
      })
    })
  })
})
