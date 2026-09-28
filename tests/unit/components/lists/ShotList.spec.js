vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

import ShotList from '@/components/lists/ShotList.vue'

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

const updateOffsets = ShotList.methods.updateOffsets

// Sticky offsets add up full header widths: clientWidth leaves out the
// border and rounds, so each sticky column overlapped the previous one.
const header = (width, clientWidth = Math.floor(width) - 1) => ({
  clientWidth,
  getBoundingClientRect: () => ({ width })
})

describe('lists/ShotList sticky offsets', () => {
  test('places the sticky columns after the full width of the previous ones', () => {
    const context = {
      isLoading: false,
      displaySettings: { showInfos: true },
      $refs: {
        'th-name': header(300.5),
        'editor-0': [{ $el: header(121) }],
        'validation-0': [{ $el: header(151) }]
      },
      stickedVisibleMetadataDescriptors: [{ id: 'descriptor-1' }],
      stickedDisplayedValidationColumns: ['task-type-1']
    }
    context.$nextTick = callback => callback.call(context)

    updateOffsets.call(context)

    expect(context.offsets).toEqual({
      'editor-0': 300.5,
      'validation-0': 421.5
    })
  })
})

describe('lists/ShotList sticky columns', () => {
  const mountList = displaySettings =>
    mountEntityList(ShotList, {
      getters: {
        currentProduction: production,
        displayedShotsCount: 1,
        shotFilledColumns: filledColumns,
        shotMetadataDescriptors: [descriptor]
      },
      props: {
        displaySettings,
        displayedShots: [
          [
            {
              id: 'shot-1',
              name: 'Shot 1',
              data: {},
              validations: new Map([[taskTypeId, 'task-1']])
            }
          ]
        ]
      }
    })

  beforeEach(() => {
    stubHeaderWidths()
    stickColumns('shot')
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
