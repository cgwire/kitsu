vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

import sequenceStore from '@/store/modules/sequences'

import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'
import SequenceList from '@/components/lists/SequenceList.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'

import {
  columnCounts,
  descriptor,
  filledColumns,
  mountEntityList,
  mountEntityListInPage,
  production,
  stickColumns,
  stickyLeft,
  stubHeaderWidths,
  taskTypeId
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

  test('keeps the sticky metadata columns while the infos are hidden', async () => {
    const wrapper = await mountEntityList(SequenceList, {
      getters: {
        currentProduction: production,
        displayedSequencesLength: 1,
        sequenceFilledColumns: filledColumns,
        sequenceMetadataDescriptors: [descriptor]
      },
      props: {
        displaySettings: { showInfos: false },
        displayedSequences: [{ id: 'sequence-1', name: 'SQ01', data: {} }]
      }
    })

    const cells = wrapper.findAll('tbody td.metadata-descriptor')
    expect(cells).toHaveLength(1)
    const { header, row } = columnCounts(wrapper)
    expect(row).toBe(header)
    expect(cells[0].element.style.left).toBe('200px')
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

describe('lists/SequenceList task panel', () => {
  test('unselects the cell of a task the task panel removes', async () => {
    const wrapper = await mountEntityListInPage(SequenceList, {
      getters: {
        currentProduction: production,
        displayedSequencesLength: 2,
        sequenceFilledColumns: filledColumns
      },
      props: {
        displayedSequences: ['sequence-1', 'sequence-2'].map(id => ({ id, name: id, data: {} }))
      }
    })
    const task = {
      id: 'task-sequence-2',
      entity_id: 'sequence-2',
      task_type_id: taskTypeId
    }

    wrapper.vm.$refs.list.unselectTask(task)

    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith(
      'REMOVE_SELECTED_TASK',
      { task, x: 1, y: 0 }
    )

    wrapper.unmount()
  })
})

describe('lists/SequenceList column selection', () => {
  afterEach(() => {
    sequenceStore.cache.result = []
  })

  // The sequences keep their name order, a canceled one included.
  test('selects the cells below a canceled sequence at their rows', async () => {
    const sequences = ['SQ01', 'SQ02', 'SQ03'].map((name, i) => ({
      id: `sequence-${i + 1}`,
      name,
      canceled: i === 0,
      data: {},
      validations: new Map([[taskTypeId, `task-${i + 1}`]])
    }))
    sequenceStore.cache.result = sequences
    const wrapper = await mountEntityList(SequenceList, {
      getters: {
        currentProduction: production,
        displayedSequencesLength: sequences.length,
        sequenceFilledColumns: filledColumns
      },
      props: { displayedSequences: sequences }
    })

    wrapper.findComponent(ValidationHeader).vm.$emit('show-header-menu')
    wrapper.findComponent(TableHeaderMenu).vm.$emit('select-column')
    await nextTick()

    const [selection] = wrapper.vm.$store.commit.mock.calls
      .filter(([name]) => name === 'ADD_SELECTED_TASKS')
      .map(([, payload]) => payload)
    const rowX = entity =>
      wrapper
        .findAllComponents(ValidationCell)
        .find(cell => cell.props('entity').id === entity.id)
        .props('rowX')
    expect(selection.map(({ entity, x }) => [entity.name, x])).toEqual([
      ['SQ02', rowX(sequences[1])],
      ['SQ03', rowX(sequences[2])]
    ])

    wrapper.unmount()
  })
})
