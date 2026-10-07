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
import { useNumberField } from '../../fixtures/number-input'

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

describe('lists/ShotList number cells', () => {
  // The shots page saves each key: the new value comes back to the list at
  // once.
  const mountList = async () => {
    let wrapper
    const update = changes => {
      const [[shot]] = wrapper.props('displayedShots')
      return wrapper.setProps({ displayedShots: [[{ ...shot, ...changes }]] })
    }
    wrapper = await mountEntityList(ShotList, {
      getters: {
        currentProduction: production,
        displayedShotsCount: 1,
        isCurrentUserProductionManager: true,
        isFps: true,
        isFrameIn: true,
        isFrames: true
      },
      props: {
        displayedShots: [
          [{ id: 'shot-1', name: 'Shot 1', data: {}, validations: new Map() }]
        ],
        onFieldChanged: ({ fieldName, value }) =>
          update({ [fieldName]: value }),
        onMetadataChanged: ({ entry, descriptor, value }) =>
          update({ data: { ...entry.data, [descriptor.field_name]: value } })
      }
    })
    return wrapper
  }

  const savedValues = (wrapper, event = 'metadata-changed') =>
    wrapper.emitted(event).map(([{ value }]) => value)

  // Written back from the number saved, "25.0" turned into "25": typing
  // 25.05 key by key saved 255.
  test('keeps the zero typed after the decimal point of an FPS', async () => {
    const wrapper = await mountList()
    const field = useNumberField(wrapper.find('td.fps input').element)

    expect(await field.type('25.05')).toEqual([
      '2',
      '25',
      '25.',
      '25.0',
      '25.05'
    ])
    expect(savedValues(wrapper)).toEqual([2, 25, 25, 25.05])

    wrapper.unmount()
  })

  // 12.05 is no frame: it stays as typed, unsaved, instead of saving 125.
  test('keeps a decimal point typed in a frame in', async () => {
    const wrapper = await mountList()
    const field = useNumberField(wrapper.find('td.framein input').element)

    expect(await field.type('12.05')).toEqual([
      '1',
      '12',
      '12.',
      '12.0',
      '12.05'
    ])
    expect(savedValues(wrapper)).toEqual([1, 12, 12])

    wrapper.unmount()
  })

  // Read digit by digit, "12." saved no frame count and 12.5 saved 125.
  test('saves no frame count for an entry that is no whole number', async () => {
    const wrapper = await mountList()
    const field = useNumberField(wrapper.find('td.frames input').element)

    expect(await field.type('12.5')).toEqual(['1', '12', '12.', '12.5'])
    expect(savedValues(wrapper, 'field-changed')).toEqual([1, 12])

    wrapper.unmount()
  })

  test('saves no frame count for an emptied field', async () => {
    const wrapper = await mountList()
    const field = useNumberField(wrapper.find('td.frames input').element)
    await field.type('12')

    await field.clear()

    expect(savedValues(wrapper, 'field-changed')).toEqual([1, 12, null])

    wrapper.unmount()
  })
})
