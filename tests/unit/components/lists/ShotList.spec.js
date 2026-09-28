vi.mock('@/store', () => ({ default: {} }))

import ShotList from '@/components/lists/ShotList.vue'

import {
  descriptor,
  filledColumns,
  mountEntityList,
  production,
  stickColumns,
  stickyLeft,
  stubHeaderWidths,
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
        'th-shot': header(300.5),
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
  beforeEach(() => {
    stubHeaderWidths()
    stickColumns('shot')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('hides the sticky metadata columns along with the other infos', async () => {
    const wrapper = await mountEntityList(ShotList, {
      getters: {
        currentProduction: production,
        displayedShotsCount: 1,
        shotFilledColumns: filledColumns,
        shotMetadataDescriptors: [descriptor]
      },
      props: {
        displaySettings: { showInfos: false },
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

    expect(wrapper.find('tbody th.name').exists()).toBe(true)
    expect(wrapper.find('thead metadata-header-stub').exists()).toBe(false)
    expect(wrapper.findAll('tbody td.metadata-descriptor')).toHaveLength(0)
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('200px')

    wrapper.unmount()
  })
})
