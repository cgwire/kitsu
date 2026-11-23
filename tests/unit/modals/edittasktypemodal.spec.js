import { flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'

import { markRequestFailure } from '@/lib/errors'

import { shallowMountWithI18n } from '../fixtures/i18n'

import EditTaskTypeModal from '@/components/modals/EditTaskTypeModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

const taskType = (id, name, forEntity, archived = false) => ({
  id,
  name,
  for_entity: forEntity,
  archived
})

const compositing = taskType('task-type-1', 'Compositing', 'Shot')
const lighting = taskType('task-type-2', 'Lighting', 'Shot')
const concept = taskType('task-type-3', 'Concept', 'Concept')
const lookdev = taskType('task-type-4', 'Lookdev', 'Asset', true)

// The task types as Zou answers their reload, by default the ones the store
// already holds. As in the real store, loadTaskTypes puts them in the store
// and getTaskTypes only returns them.
const mountModal = (
  props = {},
  { taskTypes = [compositing, lighting, concept], reload } = {}
) => {
  const store = createStore({
    state: { taskTypes: [...taskTypes, lookdev] },
    getters: {
      archivedTaskTypes: state =>
        state.taskTypes.filter(taskType => taskType.archived),
      taskTypes: state => state.taskTypes.filter(taskType => !taskType.archived)
    },
    mutations: {
      LOAD_TASK_TYPES_END: (state, list) => {
        state.taskTypes = list
      }
    },
    actions: {
      getTaskTypes: async ({ state }) =>
        reload ? await reload() : state.taskTypes,
      loadTaskTypes: async ({ commit, state }) => {
        commit('LOAD_TASK_TYPES_END', reload ? await reload() : state.taskTypes)
      }
    }
  })
  return shallowMountWithI18n(EditTaskTypeModal, {
    props: { active: false, ...props },
    global: {
      plugins: [store],
      stubs: {
        BaseModal: { template: '<div><slot /></div>' },
        TextField: {
          props: ['errored', 'errorText', 'label', 'modelValue'],
          template: '<input />'
        }
      }
    }
  })
}

// The form fills in and the task types reload when the modal opens.
const open = async wrapper => {
  await wrapper.setProps({ active: true })
  await flushPromises()
}

const nameField = wrapper => wrapper.findAllComponents(TextField)[0]
const footer = wrapper => wrapper.findComponent(ModalFooter)

const typeName = async (wrapper, name) => {
  await nameField(wrapper).vm.$emit('update:modelValue', name)
}

describe('EditTaskTypeModal', () => {
  // Zou refuses a name any other task type holds, whatever its entity,
  // archived ones included, compared regardless of case.
  describe('on a name another task type holds', () => {
    test.each([
      [
        'compositing',
        'Another task type already uses this name: Compositing (Shots).'
      ],
      [
        'LOOKDEV',
        'An archived task type already uses this name: Lookdev (Assets).'
      ],
      [
        'Concept',
        'Another task type already uses this name: Concept (Concepts).'
      ]
    ])('refuses %s and names the task type holding it', async (name, text) => {
      const wrapper = mountModal({ forEntity: 'Asset' })
      await open(wrapper)

      await typeName(wrapper, name)

      expect(nameField(wrapper).props('errored')).toBe(true)
      expect(nameField(wrapper).props('errorText')).toBe(text)
      expect(footer(wrapper).props('isDisabled')).toBe(true)
      nameField(wrapper).vm.$emit('enter')
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    test('refuses it on a rename', async () => {
      const wrapper = mountModal({ taskTypeToEdit: lighting })
      await open(wrapper)

      await typeName(wrapper, 'Compositing')

      expect(nameField(wrapper).props('errored')).toBe(true)
      expect(footer(wrapper).props('isDisabled')).toBe(true)
    })

    // As in Zou, an unchanged name is not checked: a task type with a
    // legacy case twin stays editable.
    test('leaves an unchanged name alone', async () => {
      const twin = taskType('task-type-5', 'lighting', 'Asset')
      const wrapper = mountModal(
        { taskTypeToEdit: lighting },
        { taskTypes: [compositing, lighting, twin] }
      )
      await open(wrapper)

      expect(nameField(wrapper).props('errored')).toBe(false)
      expect(footer(wrapper).props('isDisabled')).toBe(false)
    })
  })

  // Kitsu does not follow the task type updates made elsewhere: the list
  // reloads when the modal opens.
  describe('with the task types reloaded on opening', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('accepts the former name of a task type renamed elsewhere', async () => {
      const renamed = { ...compositing, name: 'Comp' }
      const wrapper = mountModal(
        { forEntity: 'Asset' },
        { reload: () => [renamed, lighting, concept, lookdev] }
      )
      await open(wrapper)

      await typeName(wrapper, 'Compositing')

      expect(nameField(wrapper).props('errored')).toBe(false)
      expect(footer(wrapper).props('isDisabled')).toBe(false)
    })

    test('refuses the name of a task type archived elsewhere', async () => {
      const archived = { ...compositing, archived: true }
      const wrapper = mountModal(
        { forEntity: 'Asset' },
        { reload: () => [archived, lighting, concept, lookdev] }
      )
      await open(wrapper)

      await typeName(wrapper, 'Compositing')

      expect(nameField(wrapper).props('errorText')).toBe(
        'An archived task type already uses this name: Compositing (Shots).'
      )
    })

    test('checks against the store list when the reload fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const failure = new Error('Bad Gateway')
      markRequestFailure(failure)
      const wrapper = mountModal(
        { forEntity: 'Asset' },
        { reload: () => Promise.reject(failure) }
      )
      await open(wrapper)

      await typeName(wrapper, 'LOOKDEV')

      expect(nameField(wrapper).props('errorText')).toBe(
        'An archived task type already uses this name: Lookdev (Assets).'
      )
      expect(consoleError).toHaveBeenCalledWith(failure)
    })

    // A reorder of the Task Types page commits the new order before Zou
    // saves it: a list read meanwhile would put the rows back.
    test('leaves the store as it is', async () => {
      const renamed = { ...compositing, name: 'Comp' }
      const wrapper = mountModal(
        { forEntity: 'Asset' },
        { reload: () => [renamed, lighting, concept, lookdev] }
      )
      const storeList = wrapper.vm.$store.state.taskTypes

      await open(wrapper)

      expect(wrapper.vm.$store.state.taskTypes).toBe(storeList)
    })

    test('ignores the reload of a previous opening', async () => {
      const answers = []
      const wrapper = mountModal(
        { forEntity: 'Asset' },
        { reload: () => new Promise(resolve => answers.push(resolve)) }
      )
      await wrapper.setProps({ active: true })
      await wrapper.setProps({ active: false })
      await wrapper.setProps({ active: true })
      answers[1]([{ ...compositing, name: 'Comp' }, lighting, concept, lookdev])
      await flushPromises()
      answers[0]([compositing, lighting, concept, lookdev])
      await flushPromises()

      await typeName(wrapper, 'Compositing')

      expect(nameField(wrapper).props('errored')).toBe(false)
    })

    // A task type saved by this tab after the last reload is in the store
    // only: until the next answer, the check reads the store again.
    test('reads the store while the reload of a new opening runs', async () => {
      const answers = []
      const wrapper = mountModal(
        { forEntity: 'Asset' },
        { reload: () => new Promise(resolve => answers.push(resolve)) }
      )
      await wrapper.setProps({ active: true })
      answers[0]([compositing, lighting, concept, lookdev])
      await flushPromises()
      await wrapper.setProps({ active: false })
      wrapper.vm.$store.commit('LOAD_TASK_TYPES_END', [
        compositing,
        lighting,
        concept,
        lookdev,
        taskType('task-type-7', 'Grooming', 'Asset')
      ])

      await open(wrapper)
      await typeName(wrapper, 'Grooming')

      expect(nameField(wrapper).props('errored')).toBe(true)
    })

    // As in Zou, an edit is compared with the name the task type holds now:
    // the page may still list it under a name changed elsewhere.
    test('checks an edit against the name the task type holds now', async () => {
      const staging = { ...lighting, name: 'Staging' }
      const twin = taskType('task-type-6', 'Lighting', 'Shot')
      const wrapper = mountModal(
        { taskTypeToEdit: lighting },
        { reload: () => [compositing, staging, twin, concept, lookdev] }
      )

      await open(wrapper)

      expect(nameField(wrapper).props('errorText')).toBe(
        'Another task type already uses this name: Lighting (Shots).'
      )
    })
  })

  test('lets a task type change the case of its own name', async () => {
    const wrapper = mountModal({ taskTypeToEdit: lighting })
    await open(wrapper)

    await typeName(wrapper, 'LIGHTING')

    expect(nameField(wrapper).props('errored')).toBe(false)
    nameField(wrapper).vm.$emit('enter')
    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({ name: 'LIGHTING' })
  })

  test('confirms a free name', async () => {
    const wrapper = mountModal({ forEntity: 'Asset' })
    await open(wrapper)

    await typeName(wrapper, 'Sculpt')

    expect(nameField(wrapper).props('errored')).toBe(false)
    expect(footer(wrapper).props('isDisabled')).toBe(false)
    nameField(wrapper).vm.$emit('enter')
    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      name: 'Sculpt',
      for_entity: 'Asset',
      priority: 1
    })
  })
})
