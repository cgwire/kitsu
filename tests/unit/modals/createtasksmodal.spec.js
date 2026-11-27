vi.mock('@/composables/modal', () => ({ useModal: () => {} }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/productions/p1/shots', params: {} })
}))

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const shotTaskTypes = [
  { id: 'tt-anim', name: 'Animation' },
  { id: 'tt-comp', name: 'Compositing' }
]

const buildStore = (shownColumns, taskTypes = shotTaskTypes) =>
  createStore({
    state: { taskTypes },
    mutations: {
      setShotTaskTypes: (state, taskTypes) => {
        state.taskTypes = taskTypes
      }
    },
    getters: {
      currentProduction: () => ({ id: 'p1' }),
      productionAssetTaskTypes: () => [],
      productionEditTaskTypes: () => [],
      productionEpisodeTaskTypes: () => [],
      productionSequenceTaskTypes: () => [],
      productionShotTaskTypes: state => state.taskTypes,
      assetValidationColumns: () => [],
      editValidationColumns: () => [],
      episodeValidationColumns: () => [],
      sequenceValidationColumns: () => [],
      shotValidationColumns: () => shownColumns
    }
  })

const mountModal = ({ props = {}, shownColumns = [], store } = {}) =>
  mount(CreateTasksModal, {
    props: { active: true, ...props },
    global: {
      plugins: [store || buildStore(shownColumns), i18n],
      stubs: {
        Combobox: true,
        ComboboxTaskType: true,
        PageTitle: true,
        RouterLink: true
      }
    }
  })

const findButton = (wrapper, label) =>
  wrapper.findAll('a.button').find(button => button.text() === label)

const confirmButtons = [
  { name: 'Create the tasks', label: 'tasks.create_tasks_confirm' },
  { name: 'Create and stay', label: 'main.create_and_stay' }
]

describe('modals/CreateTasksModal', () => {
  it('creates the tasks from the keyboard', async () => {
    const wrapper = mountModal()

    await findButton(wrapper, 'tasks.create_tasks_confirm').trigger('keydown', {
      key: 'Enter'
    })
    await findButton(wrapper, 'main.create_and_stay').trigger(
      'keydown',
      { key: 'Enter' }
    )
    await findButton(wrapper, 'tasks.create_tasks_all_missing').trigger(
      'keydown',
      { key: 'Enter' }
    )

    const payload = { form: { task_type_id: 'tt-anim' }, selectionOnly: true }
    expect(wrapper.emitted('confirm')).toEqual([[payload]])
    expect(wrapper.emitted('confirm-and-stay')).toEqual([[payload]])
    expect(wrapper.emitted('confirm-all-missing')).toEqual([
      [{ missingTaskTypeIds: ['tt-anim', 'tt-comp'], selectionOnly: true }]
    ])
  })

  it.each([
    { name: 'Create the tasks', label: 'tasks.create_tasks_confirm', loading: 'isLoading' },
    {
      name: 'Create and stay',
      label: 'main.create_and_stay',
      loading: 'isLoadingStay'
    },
    {
      name: 'Add all missing',
      label: 'tasks.create_tasks_all_missing',
      loading: 'isLoadingAll'
    }
  ])('ignores $name while it runs', async ({ label, loading }) => {
    const wrapper = mountModal({ props: { [loading]: true } })
    const button = findButton(wrapper, label)

    await button.trigger('keydown', { key: 'Enter' })
    await button.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('confirm-and-stay')).toBeUndefined()
    expect(wrapper.emitted('confirm-all-missing')).toBeUndefined()
  })

  it('takes Add all missing out of the tab order when none is missing', async () => {
    const wrapper = mountModal({ shownColumns: ['tt-anim', 'tt-comp'] })
    const button = findButton(wrapper, 'tasks.create_tasks_all_missing_empty')

    await button.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('confirm-all-missing')).toBeUndefined()
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('tabindex')).toBe('-1')
  })

  it('names the choice between the list and the production', () => {
    const wrapper = mountModal()

    expect(wrapper.findComponent(Combobox).props('ariaLabel')).toBe(
      'main.entities'
    )
  })

  it('names the task type choice', () => {
    const wrapper = mountModal()

    expect(wrapper.findComponent(ComboboxTaskType).props('ariaLabel')).toBe(
      'news.task_type'
    )
  })

  it.each(confirmButtons)(
    'disables $name when the production has no task type for the page',
    async ({ label }) => {
      const wrapper = mountModal({ store: buildStore([], []) })
      const button = findButton(wrapper, label)

      await button.trigger('click')
      await button.trigger('keydown', { key: 'Enter' })
      await button.trigger('keydown', { key: ' ' })

      expect(wrapper.emitted('confirm')).toBeUndefined()
      expect(wrapper.emitted('confirm-and-stay')).toBeUndefined()
      expect(button.classes()).toContain('is-disabled')
      expect(button.attributes('aria-disabled')).toBe('true')
      expect(button.attributes('tabindex')).toBe('-1')
    }
  )

  it.each(confirmButtons)(
    'enables $name once the production has a task type',
    async ({ label }) => {
      const store = buildStore([], [])
      const wrapper = mountModal({ store })

      store.commit('setShotTaskTypes', shotTaskTypes)
      await nextTick()
      const button = findButton(wrapper, label)

      expect(button.classes()).not.toContain('is-disabled')
      expect(button.attributes('aria-disabled')).toBe('false')
      expect(button.attributes('tabindex')).toBe('0')
    }
  )

  it('selects a task type of the production loaded after the mount', async () => {
    const store = buildStore([], [])
    const wrapper = mountModal({ store })

    store.commit('setShotTaskTypes', shotTaskTypes)
    await nextTick()
    await findButton(wrapper, 'tasks.create_tasks_confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toEqual([
      [{ form: { task_type_id: 'tt-anim' }, selectionOnly: true }]
    ])
  })

  it('drops the task type of the previous production', async () => {
    const store = buildStore([])
    const wrapper = mountModal({ store })

    store.commit('setShotTaskTypes', [])
    await nextTick()
    await findButton(wrapper, 'tasks.create_tasks_confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('replaces a task type the new production does not have', async () => {
    const store = buildStore([])
    const wrapper = mountModal({ store })

    store.commit('setShotTaskTypes', [{ id: 'tt-layout', name: 'Layout' }])
    await nextTick()
    await findButton(wrapper, 'tasks.create_tasks_confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toEqual([
      [{ form: { task_type_id: 'tt-layout' }, selectionOnly: true }]
    ])
  })

  it('keeps the chosen task type while the production still has it', async () => {
    const store = buildStore([])
    const wrapper = mountModal({ store })

    await wrapper
      .findComponent({ name: 'ComboboxTaskType' })
      .vm.$emit('update:model-value', 'tt-comp')
    store.commit('setShotTaskTypes', [...shotTaskTypes])
    await nextTick()
    await findButton(wrapper, 'tasks.create_tasks_confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toEqual([
      [{ form: { task_type_id: 'tt-comp' }, selectionOnly: true }]
    ])
  })
})
