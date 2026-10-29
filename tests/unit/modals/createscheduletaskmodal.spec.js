import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from the modules.
import '@/lib/auth'

import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

import CreateScheduleTaskModal from '@/components/modals/CreateScheduleTaskModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import DateField from '@/components/widgets/DateField.vue'

const taskTypes = [
  { id: 'tt-modeling', name: 'Modeling', for_entity: 'Asset' },
  { id: 'tt-rigging', name: 'Rigging', for_entity: 'Asset' },
  { id: 'tt-layout', name: 'Layout', for_entity: 'Shot' },
  { id: 'tt-sound', name: 'Sound Design', for_entity: 'Untracked' }
]

const assetTypes = [
  { id: 'at-chars', name: 'Characters', task_types: [] },
  { id: 'at-props', name: 'Props', task_types: ['tt-modeling'] }
]

const mountModal = async ({
  assetTypeWorkflows = {},
  episodeId = null,
  isMainPack = false
} = {}) => {
  const actions = { loadSequences: vi.fn(), loadShots: vi.fn() }
  const store = createStore({
    getters: {
      assetTypeMap: () => new Map(assetTypes.map(type => [type.id, type])),
      currentEpisode: () => (episodeId ? { id: episodeId, name: 'E01' } : null),
      currentProduction: () => ({
        id: 'production-1',
        asset_type_workflows: assetTypeWorkflows
      }),
      departmentMap: () =>
        new Map([['dep-sound', { id: 'dep-sound', color: '#123456' }]]),
      productionAssetTypeOptions: () =>
        assetTypes.map(type => ({ label: type.name, value: type.id })),
      productionTaskTypes: () => taskTypes
    },
    actions
  })
  const wrapper = shallowMount(CreateScheduleTaskModal, {
    global: {
      plugins: [store],
      mocks: { $t: key => key },
      stubs: {
        BaseModal: { template: '<div><slot /></div>' },
        // the modal focuses the name field once open
        TextField: {
          name: 'TextField',
          props: ['label', 'modelValue'],
          template: '<input />',
          methods: { focus: vi.fn() }
        }
      }
    },
    props: { episodeId, isMainPack, startDate: '2026-10-27' }
  })
  await flushPromises()
  return { actions, wrapper }
}

const findCombobox = (wrapper, label) =>
  wrapper
    .findAllComponents(Combobox)
    .find(combobox => combobox.props('label') === label)

const pick = async (wrapper, label, value) => {
  findCombobox(wrapper, label).vm.$emit('update:modelValue', value)
  await flushPromises()
}

const setName = async (wrapper, name) => {
  wrapper
    .findAllComponents({ name: 'TextField' })
    .find(field => field.props('label') === 'schedule.create_task.name')
    .vm.$emit('update:modelValue', name)
  await flushPromises()
}

const checkedTaskTypes = wrapper =>
  wrapper
    .findAllComponents(Checkbox)
    .filter(checkbox => checkbox.props('modelValue'))
    .map(checkbox => checkbox.props('label'))

const footer = wrapper => wrapper.findComponent(ModalFooter)

const confirm = async wrapper => {
  footer(wrapper).vm.$emit('confirm')
  await flushPromises()
}

describe('modals/CreateScheduleTaskModal', () => {
  beforeEach(() => {
    sequenceStore.cache.sequenceMap = new Map([
      ['seq-1', { id: 'seq-1', name: 'SQ01', episode_id: 'ep-1' }],
      ['seq-2', { id: 'seq-2', name: 'SQ02', episode_id: 'ep-2' }]
    ])
    shotStore.cache.shotMap = new Map([
      ['shot-1', { id: 'shot-1', name: 'SH010', sequence_id: 'seq-1' }],
      ['shot-2', { id: 'shot-2', name: 'SH020', sequence_id: 'seq-2' }]
    ])
  })

  afterEach(() => {
    sequenceStore.cache.sequenceMap = new Map()
    shotStore.cache.shotMap = new Map()
  })

  it('checks every task type of the picked kind', async () => {
    const { wrapper } = await mountModal()

    expect(checkedTaskTypes(wrapper)).toEqual(['Modeling', 'Rigging'])

    await pick(wrapper, 'schedule.create_task.kind', 'Shot')

    expect(checkedTaskTypes(wrapper)).toEqual(['Layout'])
  })

  // the server creates the task type of the department when needed
  it('asks an untracked item for a department, not task types', async () => {
    const { wrapper } = await mountModal()

    await pick(wrapper, 'schedule.create_task.kind', 'Untracked')
    expect(wrapper.findAllComponents(Checkbox)).toHaveLength(0)
    expect(footer(wrapper).props('isDisabled')).toBe(true)

    wrapper
      .findComponent({ name: 'ComboboxDepartment' })
      .vm.$emit('update:model-value', 'dep-sound')
    await setName(wrapper, 'Foley')
    expect(footer(wrapper).props('isDisabled')).toBe(false)
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      kind: 'Untracked',
      departmentId: 'dep-sound',
      taskTypeIds: []
    })
  })

  it('colours an untracked item after its department, or as picked', async () => {
    const { wrapper } = await mountModal()
    await pick(wrapper, 'schedule.create_task.kind', 'Untracked')
    const colorField = () => wrapper.findComponent({ name: 'ColorField' })

    // nothing picked: the server chooses
    expect(colorField().props('modelValue')).toBeNull()

    wrapper
      .findComponent({ name: 'ComboboxDepartment' })
      .vm.$emit('update:model-value', 'dep-sound')
    await flushPromises()
    expect(colorField().props('modelValue')).toBe('#123456')

    colorField().vm.$emit('update:model-value', '#F06292')
    await setName(wrapper, 'Foley')
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      departmentId: 'dep-sound',
      color: '#F06292'
    })
  })

  it('keeps an asset type to the task types of its workflow', async () => {
    const { wrapper } = await mountModal()

    await pick(wrapper, 'schedule.create_task.asset_type', 'at-props')

    expect(checkedTaskTypes(wrapper)).toEqual(['Modeling'])
  })

  it('keeps an asset type to the workflow of the production first', async () => {
    const { wrapper } = await mountModal({
      assetTypeWorkflows: { 'at-props': ['tt-rigging'] }
    })

    await pick(wrapper, 'schedule.create_task.asset_type', 'at-props')

    expect(checkedTaskTypes(wrapper)).toEqual(['Rigging'])
  })

  it('needs a name and a task type before confirming', async () => {
    const { wrapper } = await mountModal()

    expect(footer(wrapper).props('isDisabled')).toBe(true)

    await setName(wrapper, 'Hero')
    expect(footer(wrapper).props('isDisabled')).toBe(false)

    wrapper
      .findAllComponents(Checkbox)
      .forEach(checkbox => checkbox.vm.$emit('update:model-value', false))
    await flushPromises()
    expect(footer(wrapper).props('isDisabled')).toBe(true)
  })

  it('gives a task without due date its start day', async () => {
    const { wrapper } = await mountModal()

    await setName(wrapper, 'Hero')
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      kind: 'Asset',
      name: 'Hero',
      assetTypeId: 'at-chars',
      taskTypeIds: ['tt-modeling', 'tt-rigging'],
      startDate: '2026-10-27',
      dueDate: '2026-10-27'
    })
  })

  it('keeps a due date before the start date from confirming', async () => {
    const { wrapper } = await mountModal()

    await setName(wrapper, 'Hero')
    const [, dueDate] = wrapper.findAllComponents(DateField)
    dueDate.vm.$emit('update:modelValue', '2026-10-01')
    await flushPromises()

    expect(footer(wrapper).props('isDisabled')).toBe(true)
  })

  it('creates a shot in a sequence of the current episode', async () => {
    const { actions, wrapper } = await mountModal({ episodeId: 'ep-1' })

    expect(actions.loadSequences).toHaveBeenCalled()
    await pick(wrapper, 'schedule.create_task.kind', 'Shot')
    expect(
      findCombobox(wrapper, 'schedule.create_task.sequence').props('options')
    ).toEqual([
      { label: 'SQ01', value: 'seq-1' },
      { label: 'schedule.create_task.new_sequence', value: 'new-sequence' }
    ])

    await setName(wrapper, 'SH030')
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      kind: 'Shot',
      sequenceId: 'seq-1',
      newSequenceName: null,
      taskTypeIds: ['tt-layout']
    })
  })

  it('creates a shot in a new sequence when there is none', async () => {
    sequenceStore.cache.sequenceMap = new Map()
    const { wrapper } = await mountModal()
    await pick(wrapper, 'schedule.create_task.kind', 'Shot')
    const sequenceNameField = () =>
      wrapper
        .findAllComponents({ name: 'TextField' })
        .find(
          field =>
            field.props('label') === 'schedule.create_task.new_sequence_name'
        )

    expect(
      findCombobox(wrapper, 'schedule.create_task.sequence').props(
        'modelValue'
      )
    ).toBe('new-sequence')
    await setName(wrapper, 'SH010')
    // the new sequence needs its name
    expect(footer(wrapper).props('isDisabled')).toBe(true)

    sequenceNameField().vm.$emit('update:modelValue', 'SQ01')
    await flushPromises()
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      kind: 'Shot',
      sequenceId: null,
      newSequenceName: 'SQ01'
    })
  })

  // shots, sequences and edits all belong to an episode
  it('only creates assets and untracked items in the main pack', async () => {
    const { wrapper } = await mountModal({ isMainPack: true })

    expect(
      findCombobox(wrapper, 'schedule.create_task.kind')
        .props('options')
        .map(option => option.value)
    ).toEqual(['Asset', 'Untracked'])

    await pick(wrapper, 'schedule.create_task.kind', 'Untracked')
    expect(
      findCombobox(wrapper, 'schedule.create_task.link')
        .props('options')
        .map(option => option.value)
    ).toEqual([null])
  })

  it('links an untracked item to a shot of a sequence', async () => {
    const { wrapper } = await mountModal({ episodeId: 'ep-1' })

    await pick(wrapper, 'schedule.create_task.kind', 'Untracked')
    expect(
      findCombobox(wrapper, 'schedule.create_task.link')
        .props('options')
        .map(option => option.value)
    ).toEqual([null, 'ep-1', 'seq-1'])

    await pick(wrapper, 'schedule.create_task.link', 'seq-1')
    await pick(wrapper, 'schedule.create_task.shot', 'shot-1')
    await setName(wrapper, 'Foley')
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      kind: 'Untracked',
      parentId: 'shot-1'
    })
  })

  it('leaves an untracked item to the whole production by default', async () => {
    const { wrapper } = await mountModal()

    await pick(wrapper, 'schedule.create_task.kind', 'Untracked')
    await setName(wrapper, 'Music')
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      parentId: null,
      departmentId: null
    })
  })
})
