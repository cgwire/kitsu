vi.mock('@/composables/modal', () => ({ useModal: () => {} }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/productions/p1/shots', params: {} })
}))

import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'

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

const buildStore = shownColumns =>
  createStore({
    getters: {
      currentProduction: () => ({ id: 'p1' }),
      productionAssetTaskTypes: () => [],
      productionEditTaskTypes: () => [],
      productionEpisodeTaskTypes: () => [],
      productionSequenceTaskTypes: () => [],
      productionShotTaskTypes: () => shotTaskTypes,
      assetValidationColumns: () => [],
      editValidationColumns: () => [],
      episodeValidationColumns: () => [],
      sequenceValidationColumns: () => [],
      shotValidationColumns: () => shownColumns
    }
  })

const mountModal = ({ props = {}, shownColumns = [] } = {}) =>
  mount(CreateTasksModal, {
    props: { active: true, ...props },
    global: {
      plugins: [buildStore(shownColumns), i18n],
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

describe('modals/CreateTasksModal', () => {
  it('creates the tasks from the keyboard', async () => {
    const wrapper = mountModal()

    await findButton(wrapper, 'main.confirmation').trigger('keydown', {
      key: 'Enter'
    })
    await findButton(wrapper, 'main.confirmation_and_stay').trigger(
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
    { name: 'Confirm', label: 'main.confirmation', loading: 'isLoading' },
    {
      name: 'Confirm and stay',
      label: 'main.confirmation_and_stay',
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
})
