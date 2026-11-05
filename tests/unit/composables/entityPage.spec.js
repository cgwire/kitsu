import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useEntityPage } from '@/composables/entityPage'

enableAutoUnmount(afterEach)

const departments = [
  { id: 'anim', name: 'Animation' },
  { id: 'layout', name: 'Layout' }
]

const taskTypes = [
  { id: 'animation', name: 'Animation', for_entity: 'Shot', department_id: 'anim' },
  { id: 'blocking', name: 'Blocking', for_entity: 'Shot', department_id: 'anim' },
  { id: 'layout', name: 'Layout', for_entity: 'Shot', department_id: 'layout' },
  { id: 'modeling', name: 'Modeling', for_entity: 'Asset', department_id: 'anim' },
  { id: 'lighting', name: 'Lighting', for_entity: 'Shot', department_id: 'gone' }
]

const production = {
  id: 'production-1',
  name: 'Big Buck Bunny',
  descriptors: [],
  task_types: [...taskTypes.map(({ id }) => id), 'deleted']
}

// A search field remembers the value it is given, as the real one does.
const buildSearchField = () => {
  let value = ''
  return {
    focus: vi.fn(),
    getValue: () => value,
    setValue: vi.fn(newValue => {
      value = newValue
    })
  }
}

const mountPage = async ({ getters = {}, query, options = {} } = {}) => {
  const store = {
    getters: {
      clientAccess: { isTaskPanelVisible: true },
      currentEpisode: null,
      currentProduction: production,
      departmentMap: new Map(departments.map(dep => [dep.id, dep])),
      isCurrentUserClient: false,
      isCurrentUserProductionManager: true,
      isTVShow: false,
      nbSelectedTasks: 0,
      nbSelectedValidations: 0,
      productionShotTaskTypes: [taskTypes[0]],
      selectedShots: new Map(),
      shotListScrollPosition: 0,
      shotSearchText: '',
      shotsLoadingKey: 'production-1/',
      taskTypeMap: new Map(taskTypes.map(taskType => [taskType.id, taskType])),
      user: { departments: [] },
      ...getters
    },
    commit: vi.fn(),
    dispatch: vi.fn(() => Promise.resolve())
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  await router.push({ path: '/', query })
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: {} },
    missingWarn: false,
    fallbackWarn: false
  })
  const searchField = buildSearchField()
  const importModal = { reset: vi.fn() }
  const reset = vi.fn()
  let page
  const Host = defineComponent({
    setup() {
      page = useEntityPage({
        type: 'shot',
        pageName: 'Shots',
        listRef: ref({ setScrollPosition: vi.fn() }),
        searchFieldRef: ref(searchField),
        importModalRef: ref(importModal),
        reset,
        ...options
      })
      return () => null
    }
  })
  mount(Host, { global: { plugins: [router, i18n], provide: { store } } })
  await flushPromises()
  return { importModal, page, reset, router, searchField, store }
}

const dispatched = (store, action) =>
  store.dispatch.mock.calls.filter(([name]) => name === action)

describe('useEntityPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('search', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('applies the query of the filter builder', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const { page, router, searchField, store } = await mountPage()
      page.modals.isBuildFilterDisplayed = true

      page.confirmBuildFilter('mood=happy')
      await flushPromises()

      expect(page.modals.isBuildFilterDisplayed).toBe(false)
      expect(searchField.setValue).toHaveBeenCalledWith('mood=happy')
      expect(router.currentRoute.value.query.search).toBe('mood=happy')
      // The URL watcher applies the search.
      expect(dispatched(store, 'setShotSearch')).toEqual([
        ['setShotSearch', 'mood=happy']
      ])
      // The selection of the previous search goes a moment later.
      const nbClears = dispatched(store, 'clearSelectedShots').length
      vi.advanceTimersByTime(10)
      expect(dispatched(store, 'clearSelectedShots')).toHaveLength(nbClears + 1)
    })

    it('focuses the search field', async () => {
      const { page, searchField } = await mountPage()
      page.focusSearchField({ preventScroll: true })
      expect(searchField.focus).toHaveBeenCalledWith({ preventScroll: true })
    })

    it('saves a search once at a time', async () => {
      let endSave
      const { page, store } = await mountPage()
      store.dispatch.mockImplementation(
        () => new Promise(resolve => (endSave = resolve))
      )

      const saving = page.saveSearchQuery('mood=happy')
      expect(page.loading.savingSearch).toBe(true)
      page.saveSearchQuery('mood=sad')
      endSave()
      await saving

      expect(dispatched(store, 'saveShotSearch')).toEqual([
        ['saveShotSearch', 'mood=happy']
      ])
      expect(page.loading.savingSearch).toBe(false)
    })

    // The search list removes its searches itself.
    it('logs a search Zou refuses to save', async () => {
      const error = new Error('refused')
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { page, store } = await mountPage()
      store.dispatch.mockImplementation(() => Promise.reject(error))

      await page.saveSearchQuery('mood=happy')
      await flushPromises()

      expect(consoleError.mock.calls).toEqual([[error]])
      expect(page.loading.savingSearch).toBe(false)
      consoleError.mockRestore()
    })
  })

  describe('departments', () => {
    it('lists once each department of the task types of a type', async () => {
      const { page } = await mountPage()
      expect(page.selectableDepartments('Shot')).toEqual(departments)
      expect(page.selectableDepartments('Asset')).toEqual([departments[0]])
    })

    it('restores the department filter chosen last time', async () => {
      localStorage.setItem('Shots:department', 'layout')
      const { page } = await mountPage({
        getters: {
          isCurrentUserProductionManager: false,
          user: { departments: ['layout'] }
        }
      })
      expect(page.selectedDepartment.value).toBe('layout')
      expect(page.departmentFilter.value).toEqual(['layout'])
    })

    // The department of the stored choice has no task type of the page, and
    // the user works in another one.
    it('filters an artist list on their departments otherwise', async () => {
      localStorage.setItem('Shots:department', 'gone')
      const { page } = await mountPage({
        getters: {
          isCurrentUserProductionManager: false,
          user: { departments: ['anim'] }
        }
      })
      expect(page.selectedDepartment.value).toBe('MY_DEPARTMENTS')
      expect(page.departmentFilter.value).toEqual(['anim'])
    })
  })

  describe('list', () => {
    it('keeps the task panel open on request of the list', async () => {
      const { page } = await mountPage()
      expect(page.isTaskSidePanelOpen.value).toBe(false)
      page.onKeepTaskPanelOpenChanged(true)
      expect(page.isTaskSidePanelOpen.value).toBe(true)
    })

    it('sorts the list as asked', async () => {
      const { page, store } = await mountPage()
      const sortInfo = { type: 'field', column: 'name', ascending: false }
      page.onChangeSortClicked(sortInfo)
      expect(store.dispatch).toHaveBeenCalledWith('changeShotSort', sortInfo)
    })

    it('saves a metadata value, then the search only when it changed', async () => {
      const { page, searchField, store } = await mountPage({
        query: { search: 'mood=happy' }
      })
      const descriptor = { field_name: 'mood' }

      await page.onMetadataChanged({
        entry: { id: 'shot-1' },
        descriptor,
        value: 'sad'
      })
      expect(dispatched(store, 'editShot')).toEqual([
        ['editShot', { id: 'shot-1', data: { mood: 'sad' } }]
      ])
      expect(dispatched(store, 'setShotSearch')).toEqual([
        ['setShotSearch', 'mood=happy']
      ])

      expect(searchField.getValue()).toBe('mood=happy')
      await page.onMetadataChanged({
        entry: { id: 'shot-1' },
        descriptor,
        value: 'happy'
      })
      expect(dispatched(store, 'setShotSearch')).toHaveLength(1)
    })

    it.each([
      [false, null, { name: 'shots', params: { production_id: 'production-1' } }],
      [
        true,
        { id: 'episode-1' },
        {
          name: 'episode-shots',
          params: { production_id: 'production-1', episode_id: 'episode-1' }
        }
      ]
    ])(
      'links to a section of the production, TV show %s',
      async (isTVShow, currentEpisode, path) => {
        const { page } = await mountPage({
          getters: { currentEpisode, isTVShow }
        })
        expect(page.getPath('shots')).toEqual(path)
      }
    )
  })

  describe('entities', () => {
    it('deletes the entity of the delete modal', async () => {
      const { page, store } = await mountPage()
      const shot = { id: 'shot-1', name: 'SH01' }

      page.onDeleteClicked(shot)
      await page.confirmDelete()

      expect(dispatched(store, 'deleteShot')).toEqual([['deleteShot', shot]])
      expect(page.modals.isDeleteDisplayed).toBe(false)
      expect(page.loading.del).toBe(false)
    })

    it('keeps the delete modal open on a delete Zou refuses', async () => {
      const error = new Error('refused')
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { page, store } = await mountPage()
      store.dispatch.mockImplementation(() => Promise.reject(error))

      page.onDeleteClicked({ id: 'shot-1', name: 'SH01' })
      await page.confirmDelete()

      expect(page.modals.isDeleteDisplayed).toBe(true)
      expect(page.errors.del).toBe(true)
      expect(consoleError).toHaveBeenCalledWith(error)
      consoleError.mockRestore()
    })

    it('restores the entity of the restore modal', async () => {
      const { page, store } = await mountPage()
      const shot = { id: 'shot-1', name: 'SH01', canceled: true }

      page.onRestoreClicked(shot)
      expect(page.modals.isRestoreDisplayed).toBe(true)
      await page.confirmRestore()

      expect(dispatched(store, 'restoreShot')).toEqual([['restoreShot', shot]])
      expect(page.modals.isRestoreDisplayed).toBe(false)
    })
  })

  describe('task creation', () => {
    it('creates the tasks of a type and keeps the modal open', async () => {
      const { page, reset, store } = await mountPage()
      page.showCreateTasksModal()

      await page.confirmCreateTasksAndStay({
        form: { task_type_id: 'animation' },
        selectionOnly: true
      })

      expect(dispatched(store, 'createTasks')).toEqual([
        [
          'createTasks',
          {
            type: 'shots',
            task_type_id: 'animation',
            project_id: 'production-1',
            selectionOnly: true
          }
        ]
      ])
      expect(reset).toHaveBeenCalledTimes(1)
      expect(page.modals.isCreateTasksDisplayed).toBe(true)
      expect(page.loading.creatingTasksStay).toBe(false)
    })

    it('creates the missing tasks one type after the other', async () => {
      const { page, reset, store } = await mountPage()
      const pending = []
      store.dispatch.mockImplementation(
        () => new Promise(resolve => pending.push(resolve))
      )
      page.showCreateTasksModal()

      const creation = page.confirmCreateAllMissingTasks({
        missingTaskTypeIds: ['animation', 'layout'],
        selectionOnly: false
      })
      await flushPromises()
      expect(dispatched(store, 'createTasks')).toHaveLength(1)
      pending[0]()
      await flushPromises()
      expect(dispatched(store, 'createTasks')).toHaveLength(2)
      pending[1]()
      await creation

      expect(
        dispatched(store, 'createTasks').map(([, data]) => data.task_type_id)
      ).toEqual(['animation', 'layout'])
      expect(reset).toHaveBeenCalledTimes(1)
      expect(page.modals.isCreateTasksDisplayed).toBe(false)
      expect(page.loading.creatingAllTasks).toBe(false)
    })
  })

  describe('CSV import', () => {
    it('lists the columns of the task types after the name by default', async () => {
      const { page } = await mountPage()
      expect(page.renderColumns.value).toEqual([
        'Name',
        'Animation',
        'Animation comment'
      ])
    })

    it('reloads the entities with a no-op by default after an import', async () => {
      const { page, store } = await mountPage()
      page.showImportRenderModal()

      await page.uploadImportFile([['Name'], ['SH01']], false)

      expect(store.dispatch).toHaveBeenCalledWith('uploadShotFile', false)
      expect(page.modals.isImportRenderDisplayed).toBe(false)
      expect(page.errors.importing).toBe(false)
    })

    it('goes back from the preview to an empty import modal', async () => {
      const { importModal, page, store } = await mountPage()
      page.errors.importing = true
      page.showImportRenderModal()

      page.resetImport()

      expect(page.errors.importing).toBe(false)
      expect(page.modals.isImportRenderDisplayed).toBe(false)
      expect(store.commit).toHaveBeenCalledWith('SHOT_CSV_FILE_SELECTED', null)
      expect(importModal.reset).toHaveBeenCalledTimes(1)
      expect(page.modals.isImportDisplayed).toBe(true)
    })
  })
})
