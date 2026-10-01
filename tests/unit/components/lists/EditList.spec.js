vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

import EditList from '@/components/lists/EditList.vue'

import {
  descriptor,
  filledColumns,
  mountEntityList,
  production,
  setHeaderWidth,
  stickColumns,
  stickyLeft,
  stubHeaderWidths,
  stubResizeObserver,
  taskTypeId
} from '../../fixtures/entity-list'

const showsEmptyState = async ({ editSearchText = '', ...props } = {}) => {
  const wrapper = await mountEntityList(EditList, {
    getters: { currentProduction: production, editSearchText },
    props: { displayedEdits: [], ...props }
  })
  const isShown = wrapper.find('empty-list-stub').exists()
  wrapper.unmount()
  return isShown
}

describe('lists/EditList', () => {
  describe('empty state', () => {
    test('a production without any edit shows the empty state', async () => {
      expect(await showsEmptyState()).toBe(true)
    })

    test('a production with edits hides the empty state', async () => {
      const displayedEdits = [{ id: 'edit-1', name: 'Edit 1', data: {} }]
      expect(await showsEmptyState({ displayedEdits })).toBe(false)
    })

    test('a search returning nothing keeps the empty state hidden', async () => {
      expect(await showsEmptyState({ editSearchText: 'unknown' })).toBe(false)
    })

    test('the empty state waits for the loading to end', async () => {
      expect(await showsEmptyState({ isLoading: true })).toBe(false)
    })

    test('the empty state stays hidden on error', async () => {
      expect(await showsEmptyState({ isError: true })).toBe(false)
    })
  })
})

describe('lists/EditList sticky columns', () => {
  const mountList = displaySettings =>
    mountEntityList(EditList, {
      getters: {
        currentProduction: production,
        displayedEditsCount: 1,
        editFilledColumns: filledColumns,
        editMetadataDescriptors: [descriptor]
      },
      props: {
        displaySettings,
        displayedEdits: [
          {
            id: 'edit-1',
            name: 'Edit 1',
            data: {},
            validations: new Map([[taskTypeId, 'task-1']])
          }
        ]
      }
    })

  beforeEach(() => {
    stubHeaderWidths()
    stickColumns('edit')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  test('hides the sticky metadata columns along with the other infos', async () => {
    const wrapper = await mountList({ showInfos: false })

    expect(wrapper.find('tbody th.name').exists()).toBe(true)
    expect(wrapper.find('thead metadata-header-stub').exists()).toBe(false)
    expect(wrapper.findAll('tbody td.metadata-descriptor')).toHaveLength(0)
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('200px')

    wrapper.unmount()
  })

  test('moves the sticky columns along with a resized name column', async () => {
    const resize = stubResizeObserver()
    const wrapper = await mountList({ showInfos: true })

    setHeaderWidth('name', 250)
    resize(wrapper.find('thead th.name').element)
    await flushPromises()

    expect(stickyLeft(wrapper, 'metadata-header-stub')).toBe('250px')
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('370px')

    wrapper.unmount()
  })
})
