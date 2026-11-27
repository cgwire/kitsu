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

const savedSearches = [{ id: 'search-1', name: 'Chairs' }]

const mountPage = async (query, { isManager = true } = {}) => {
  const setSharedAssetSearch = vi.fn()
  const store = createStore({
    getters: {
      assetLibrarySearchQueries: () => savedSearches,
      displayedSharedAssets: () => [],
      displayedSharedAssetsByType: () => [],
      isCurrentUserManager: () => isManager,
      openProductions: () => [production],
      productionMap: () => new Map([[production.id, production]]),
      selectedAssets: () => new Map()
    },
    actions: {
      loadSharedAssets: vi.fn(),
      setAssetSelection: vi.fn(),
      setSharedAssetSearch
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
      stubs: { PanelLayout: false, SearchField: SearchFieldStub }
    }
  })
  await flushPromises()
  wrapper.setSharedAssetSearch = setSharedAssetSearch
  return wrapper
}

const resetButton = wrapper =>
  wrapper
    .findAllComponents({ name: 'ButtonSimple' })
    .find(button => button.props('icon') === 'remove')

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

  describe('panel layout', () => {
    it('lays its filters and its list out in the two panels', async () => {
      wrapper = await mountPage()

      expect(
        wrapper.find('.filters-panel').findComponent(ComboboxProduction).exists()
      ).toBe(true)
      expect(wrapper.find('.list-panel .entities').exists()).toBe(true)
    })

    it('keeps the library panel for the managers', async () => {
      wrapper = await mountPage()
      expect(
        wrapper
          .find('.side-column')
          .findComponent({ name: 'ManageLibrary' })
          .exists()
      ).toBe(true)
      wrapper.unmount()

      wrapper = await mountPage({}, { isManager: false })
      expect(wrapper.find('.side-column').exists()).toBe(false)
    })
  })

  describe('saved searches', () => {
    it('saves the filters of the URL', async () => {
      wrapper = await mountPage()

      expect(
        wrapper
          .find('.list-panel')
          .findComponent({ name: 'SearchQueryList' })
          .props()
      ).toMatchObject({
        queries: savedSearches,
        type: 'assetLibrary',
        withRouteQuery: true
      })
    })

    it('follows the filters of the URL', async () => {
      wrapper = await mountPage()

      await wrapper.vm.$router.push({
        query: { production: production.id, search: 'chair' }
      })
      await flushPromises()

      expect(
        wrapper.findComponent(ComboboxProduction).props('modelValue')
      ).toBe(production.id)
      expect(wrapper.findComponent(SearchFieldStub).vm.getValue()).toBe('chair')
      expect(wrapper.setSharedAssetSearch).toHaveBeenLastCalledWith(
        expect.anything(),
        'chair'
      )
      expect(wrapper.vm.$route.query).toEqual({
        production: production.id,
        search: 'chair'
      })
    })
  })

  describe('filters reset', () => {
    it('shows only when a filter is set', async () => {
      wrapper = await mountPage()
      expect(resetButton(wrapper)).toBeUndefined()
      wrapper.unmount()

      wrapper = await mountPage({ search: 'chair' })
      expect(resetButton(wrapper).exists()).toBe(true)
    })

    it('clears the filters', async () => {
      wrapper = await mountPage({ production: production.id, search: 'chair' })

      await resetButton(wrapper).vm.$emit('click')
      await flushPromises()

      expect(wrapper.vm.$route.query).toEqual({})
      expect(
        wrapper.findComponent(ComboboxProduction).props('modelValue')
      ).toBeFalsy()
      expect(wrapper.findComponent(SearchFieldStub).vm.getValue()).toBe('')
      expect(wrapper.setSharedAssetSearch).toHaveBeenLastCalledWith(
        expect.anything(),
        ''
      )
    })
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
