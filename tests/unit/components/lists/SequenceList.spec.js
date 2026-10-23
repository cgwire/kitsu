vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

import SequenceList from '@/components/lists/SequenceList.vue'

import {
  descriptor,
  filledColumns,
  mountEntityList,
  production,
  stickColumns,
  stickyLeft,
  stubHeaderWidths
} from '../../fixtures/entity-list'

const mountList = props =>
  mountEntityList(SequenceList, {
    getters: {
      currentProduction: production,
      sequenceFilledColumns: filledColumns,
      sequenceMetadataDescriptors: [descriptor]
    },
    props
  })

// The page keeps the rows of the production left when the list of the new
// one fails: nothing may build on them.
describe('lists/SequenceList on error', () => {
  const mountWithRows = props =>
    mountEntityList(SequenceList, {
      getters: {
        currentProduction: production,
        displayedSequencesLength: 1,
        isCurrentUserProductionManager: true
      },
      props: {
        displayedSequences: [{ id: 'sequence-1', name: 'SQ01' }],
        ...props
      }
    })

  const createTasksSelector =
    'th.actions button-simple-stub[text="tasks.create_tasks"]'

  test('shows the count and the create tasks button with rows', async () => {
    const wrapper = await mountWithRows()

    expect(wrapper.find('.nb-sequences').exists()).toBe(true)
    expect(wrapper.find(createTasksSelector).exists()).toBe(true)

    wrapper.unmount()
  })

  test('hides the count and the create tasks button on error', async () => {
    const wrapper = await mountWithRows({ isError: true })

    expect(wrapper.find('.nb-sequences').exists()).toBe(false)
    expect(wrapper.find(createTasksSelector).exists()).toBe(false)

    wrapper.unmount()
  })
})

describe('lists/SequenceList sticky columns', () => {
  beforeEach(() => {
    stubHeaderWidths()
    stickColumns('sequence')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('places the sticky columns right after the sequence names', async () => {
    const wrapper = await mountList()

    expect(stickyLeft(wrapper, 'metadata-header-stub')).toBe('200px')
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('320px')

    wrapper.unmount()
  })

  test('places the sticky metadata columns once the infos show', async () => {
    const wrapper = await mountList({ displaySettings: { showInfos: false } })

    await wrapper.setProps({ displaySettings: { showInfos: true } })
    await flushPromises()

    expect(stickyLeft(wrapper, 'metadata-header-stub')).toBe('200px')
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('320px')

    wrapper.unmount()
  })
})
