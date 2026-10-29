import { flushPromises, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'

import csv from '@/lib/csv'

import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

export const production = {
  id: 'production-1',
  name: 'Production',
  descriptors: [],
  task_types: []
}

export const allVisible = {
  isStatsVisible: true,
  isTaskListVisible: true,
  isTaskPanelVisible: true,
  isTaskTypeVisible: () => true
}

const neutralValue = name => {
  if (name.endsWith('Map') || name.startsWith('selected')) return new Map()
  if (name === 'clientAccess') return allVisible
  if (name.startsWith('is')) return false
  if (name.startsWith('nb') || name.endsWith('ScrollPosition')) return 0
  if (name.endsWith('SearchText')) return ''
  if (name.endsWith('FilledColumns') || name.endsWith('FormData')) return {}
  if (name.endsWith('LoadingKey')) return `${production.id}/`
  if (name === 'currentProduction') return production
  if (name === 'currentEpisode' || name === 'currentSection') return null
  if (name === 'user') return { departments: [] }
  return []
}

// The store answers every getter with a neutral value unless the test
// provides one, and routes the actions to the given mocks.
const buildStore = (getters, actions) => ({
  getters: new Proxy(getters, {
    has: () => true,
    get: (target, name) =>
      typeof name !== 'string' || name in target
        ? target[name]
        : neutralValue(name)
  }),
  commit: vi.fn(),
  dispatch: vi.fn((name, payload) =>
    Promise.resolve(actions[name] ? actions[name](payload) : undefined)
  )
})

// The search field and the list are driven through refs: their stubs carry
// the methods the page calls. The search value is readable from the test.
const buildSearchFieldStub = () => {
  const state = { value: '' }
  return {
    state,
    stub: {
      name: 'SearchField',
      template: '<div />',
      methods: {
        getValue: () => state.value,
        setValue: value => {
          state.value = value
        },
        focus: () => {}
      }
    }
  }
}

// The thumbnails modal is driven through a ref too: its stub records the
// entities the page marks while their previews upload.
export const buildAddThumbnailsModalStub = () => ({
  name: 'AddThumbnailsModal',
  props: { isError: Boolean, isLoading: Boolean },
  template: '<div />',
  methods: { markLoading: vi.fn(), markUploaded: vi.fn() }
})

export const mountEntityPage = async (
  page,
  {
    listName,
    config = {},
    getters = {},
    actions = {},
    props = {},
    query = {},
    stubs = {},
    // The script reads these, the template keeps the key mock.
    locale = 'en',
    messages = {}
  }
) => {
  const store = buildStore(getters, actions)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  await router.push({ path: '/', query })
  const i18n = createI18n({
    legacy: false,
    locale,
    messages: { [locale]: messages },
    missingWarn: false,
    fallbackWarn: false
  })
  const searchField = buildSearchFieldStub()
  const list = {
    name: listName,
    props: {
      departmentFilter: { type: Array, default: () => [] },
      isError: { type: Boolean, default: false },
      isLoading: { type: Boolean, default: false },
      validationColumns: { type: Array, default: () => [] }
    },
    template: '<div />',
    methods: { setScrollPosition: vi.fn(), selectTaskFromQuery: vi.fn() }
  }
  const wrapper = shallowMount(page, {
    props,
    global: {
      config,
      mocks: { $store: store, $t: key => key },
      plugins: [router, i18n],
      provide: { store },
      stubs: { SearchField: searchField.stub, [listName]: list, ...stubs }
    }
  })
  await flushPromises()
  return {
    wrapper,
    store,
    router,
    searchField: searchField.state,
    list: list.methods,
    dispatched: name =>
      store.dispatch.mock.calls.filter(([action]) => action === name)
  }
}

// Exports the list, then imports the exported file back as is: returns the
// headers of the file and the ones the import preview gets.
export const reimportExport = async wrapper => {
  const buildCsvFile = vi.spyOn(csv, 'buildCsvFile').mockReturnValue('')
  await wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('icon') === 'export')
    .vm.$emit('click')
  await flushPromises()
  const [, entries] = buildCsvFile.mock.calls[0]
  buildCsvFile.mockRestore()
  await wrapper
    .findComponent(ImportModal)
    .vm.$emit('confirm', csv.turnEntriesToCsvString(entries), 'text')
  await flushPromises()
  return {
    exported: entries[0],
    imported: wrapper.findComponent(ImportRenderModal).props('parsedCsv')[0]
  }
}
