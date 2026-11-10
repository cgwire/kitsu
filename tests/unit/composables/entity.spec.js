import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, nextTick, onMounted, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Pre-load the real store to avoid a circular-import race from the modules.
import '@/lib/auth'

import { useEntity } from '@/composables/entity'
import { parseSimpleDate } from '@/lib/time'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

enableAutoUnmount(afterEach)

const entities = [{ id: 'entity-0' }, { id: 'entity-1' }, { id: 'entity-2' }]

const mountEntity = async ({
  type = 'shot',
  path = '/productions/production-1/episodes/episode-1/shots/entity-1',
  list = { key: 'production-1/episode-1', isLoading: false },
  entity = entities[1],
  tasks = [],
  getters = {},
  actions = {},
  init = () => {},
  loadList
} = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/productions/:production_id/episodes/:episode_id/:section/:id',
        component: { template: '<div />' }
      },
      // The entity pages name the id of their entity after its type.
      { path: '/shots/:shot_id', component: { template: '<div />' } },
      { path: '/:path(.*)*', component: { template: '<div />' } }
    ]
  })
  await router.push(path)
  // The shots store records the scope of its last list load, and raises its
  // loading flag meanwhile.
  const store = createStore({
    state: { list, nbSelectedTasks: 0, tasks },
    mutations: {
      LOAD_START: (state, key) => {
        state.list = { key, isLoading: true }
      },
      LOAD_END: state => {
        state.list = { ...state.list, isLoading: false }
      },
      MARK_PARTIAL: state => {
        state.list = { ...state.list, key: `${state.list.key}#partial` }
      },
      SET_NB_SELECTED_TASKS: (state, nbSelectedTasks) => {
        state.nbSelectedTasks = nbSelectedTasks
      },
      UPDATE_TASK: (state, changes) => {
        state.tasks = state.tasks.map(task =>
          task.id === changes.id ? { ...task, ...changes } : task
        )
      }
    },
    getters: {
      currentEpisode: () => ({ id: 'episode-1' }),
      currentProduction: () => ({ id: 'production-1' }),
      getTaskTypePriority: () => () => 1,
      isCurrentUserProductionManager: () => false,
      isCurrentUserProductionSupervisor: () => false,
      isShotsLoading: state => state.list.isLoading,
      isTVShow: () => true,
      nbSelectedTasks: state => state.nbSelectedTasks,
      organisation: () => ({}),
      shotsLoadingKey: state => state.list.key,
      taskMap: state => new Map(state.tasks.map(task => [task.id, task])),
      taskTypeMap: () => new Map(),
      user: () => ({ departments: [] }),
      ...getters
    },
    actions
  })
  let api
  const Host = defineComponent({
    setup() {
      // As the pages: the entity shows once their init has found it.
      const currentEntity = ref(null)
      api = useEntity({
        type,
        currentEntity,
        entityList: computed(() => entities),
        init,
        loadList: loadList && (() => loadList(store))
      })
      onMounted(() => {
        currentEntity.value = entity
      })
      return () => null
    }
  })
  mount(Host, { global: { plugins: [router, store] } })
  await flushPromises()
  const neighbor = path => path.value?.params[`${type}_id`] ?? null
  return {
    api,
    router,
    store,
    neighbors: () => [
      neighbor(api.previousEntityPath),
      neighbor(api.nextEntityPath)
    ],
    nextEntityPath: () => api.nextEntityPath.value
  }
}

const taskTypes = [
  {
    id: 'animation',
    name: 'Animation',
    color: '#ff0000',
    department_id: 'anim',
    priority: 2
  },
  {
    id: 'layout',
    name: 'Layout',
    color: '#00ff00',
    department_id: 'layout',
    priority: 1
  }
]

const taskGetters = (overrides = {}) => ({
  currentProduction: () => ({
    id: 'production-1',
    start_date: '2026-01-05T00:00:00',
    end_date: '2026-06-30T00:00:00'
  }),
  getTaskTypePriority: () => taskTypeId =>
    taskTypes.find(({ id }) => id === taskTypeId)?.priority,
  // An estimation of 480 minutes makes one day.
  organisation: () => ({ hours_by_day: 8 }),
  taskTypeMap: () =>
    new Map(taskTypes.map(taskType => [taskType.id, taskType])),
  ...overrides
})

const task = (id, fields = {}) => ({ id, task_type_id: 'animation', ...fields })

const withTasks = tasks => ({
  entity: { id: 'entity-1', tasks: tasks.map(({ id }) => id) },
  tasks
})

const day = date => date.format('YYYY-MM-DD')

const span = item => [day(item.startDate), day(item.endDate)]

describe('useEntity', () => {
  describe('previous and next entities', () => {
    it('walks the list loaded for the episode of the page', async () => {
      const { neighbors, nextEntityPath } = await mountEntity()
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
      expect(nextEntityPath().params.episode_id).toBe('episode-1')
    })

    // The page loads its entity by id into the list held by the store, which
    // then records its scope as extended.
    it('offers no link over the list of another episode', async () => {
      const { neighbors } = await mountEntity({
        list: { key: 'production-1/episode-3#partial', isLoading: false }
      })
      expect(neighbors()).toEqual([null, null])
    })

    it('offers no link over the list of all episodes on a page of one', async () => {
      const { neighbors } = await mountEntity({
        list: { key: 'production-1/all', isLoading: false }
      })
      expect(neighbors()).toEqual([null, null])
    })

    it('offers no link while the list loads', async () => {
      const { neighbors } = await mountEntity({
        list: { key: 'production-1/episode-1', isLoading: true }
      })
      expect(neighbors()).toEqual([null, null])
    })

    it('walks the list of a production without episodes', async () => {
      const { neighbors } = await mountEntity({
        path: '/productions/production-1/shots/entity-1',
        list: { key: 'production-1/', isLoading: false },
        getters: { currentEpisode: () => null, isTVShow: () => false }
      })
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
    })

    it('walks the episodes, listed for the whole production', async () => {
      const { neighbors } = await mountEntity({ type: 'episode' })
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
    })
  })

  describe('list of the page', () => {
    const otherList = { key: 'production-1/episode-3#partial', isLoading: false }

    it('loads the list of the page when the store holds another one', async () => {
      const loadList = vi.fn(() => Promise.resolve())
      await mountEntity({ list: otherList, loadList })
      expect(loadList).toHaveBeenCalledTimes(1)
    })

    it('offers the arrows once that list is loaded', async () => {
      const { neighbors } = await mountEntity({
        list: otherList,
        loadList: store => {
          store.commit('LOAD_START', 'production-1/episode-1')
          store.commit('LOAD_END')
          return Promise.resolve()
        }
      })
      expect(neighbors()).toEqual(['entity-0', 'entity-2'])
    })

    // A URL whose episode is not the one of its entity: the list loaded lacks
    // the entity, which the page loads into it again.
    it('loads the list once for an entity', async () => {
      const loadList = vi.fn(store => {
        store.commit('LOAD_START', 'production-1/episode-1')
        store.commit('LOAD_END')
        store.commit('MARK_PARTIAL')
        return Promise.resolve()
      })
      const { neighbors } = await mountEntity({ list: otherList, loadList })
      expect(loadList).toHaveBeenCalledTimes(1)
      expect(neighbors()).toEqual([null, null])
    })

    it('loads nothing when the store holds the list of the page', async () => {
      const loadList = vi.fn(() => Promise.resolve())
      await mountEntity({ loadList })
      expect(loadList).not.toHaveBeenCalled()
    })

    it('loads nothing for a TV show page without an episode in its URL', async () => {
      const loadList = vi.fn(() => Promise.resolve())
      await mountEntity({
        path: '/productions/production-1/shots/entity-1',
        list: otherList,
        loadList
      })
      expect(loadList).not.toHaveBeenCalled()
    })
  })

  describe('tasks', () => {
    it('lists the known tasks of the entity in task type order', async () => {
      const { api } = await mountEntity({
        entity: {
          id: 'entity-1',
          tasks: ['animation-task', 'deleted-task', 'layout-task']
        },
        tasks: [
          task('animation-task'),
          task('layout-task', { task_type_id: 'layout' })
        ],
        getters: taskGetters()
      })
      expect(api.currentTasks.value.map(({ id }) => id)).toEqual([
        'layout-task',
        'animation-task'
      ])
    })

    it('selects a task, and unselects it on a second click', async () => {
      const clearSelectedTasks = vi.fn()
      const addSelectedTask = vi.fn()
      const { api } = await mountEntity({
        actions: { addSelectedTask, clearSelectedTasks }
      })
      const animationTask = task('animation-task')

      api.onTaskSelected(animationTask)
      expect(clearSelectedTasks).toHaveBeenCalledTimes(1)
      expect(addSelectedTask).toHaveBeenCalledWith(
        expect.anything(),
        animationTask
      )
      expect(api.currentTask.value).toEqual(animationTask)

      api.onTaskSelected(animationTask)
      expect(clearSelectedTasks).toHaveBeenCalledTimes(2)
      expect(addSelectedTask).toHaveBeenCalledTimes(1)
      expect(api.currentTask.value).toBeNull()
    })

    it('forgets the task once the action panel clears the selection', async () => {
      const { api, store } = await mountEntity({
        actions: { addSelectedTask: () => {}, clearSelectedTasks: () => {} }
      })
      api.onTaskSelected(task('animation-task'))
      store.commit('SET_NB_SELECTED_TASKS', 1)
      await nextTick()
      expect(api.currentTask.value).not.toBeNull()

      store.commit('SET_NB_SELECTED_TASKS', 0)
      await nextTick()
      expect(api.currentTask.value).toBeNull()
    })
  })

  describe('schedule', () => {
    it('draws a bar for each dated task of a known task type', async () => {
      const { api } = await mountEntity({
        ...withTasks([
          task('planned', {
            start_date: '2026-03-02',
            due_date: '2026-03-06',
            estimation: 960
          }),
          task('started', {
            real_start_date: '2026-03-09',
            end_date: '2026-03-10'
          }),
          // Three days of estimation from a Monday: to the Wednesday.
          task('estimated', { start_date: '2026-03-16', estimation: 1440 }),
          // A due date before the start: the bar lasts a day.
          task('reversed', { start_date: '2026-03-20', due_date: '2026-03-19' }),
          task('undated', { estimation: 480 }),
          task('orphan', { start_date: '2026-03-02', task_type_id: 'deleted' })
        ]),
        getters: taskGetters()
      })

      const [root] = api.scheduleItems.value
      expect(root.children.map(child => [child.id, ...span(child)])).toEqual([
        ['planned', '2026-03-02', '2026-03-06'],
        ['started', '2026-03-09', '2026-03-10'],
        ['estimated', '2026-03-16', '2026-03-18'],
        ['reversed', '2026-03-20', '2026-03-21']
      ])
      expect(root.children[0]).toMatchObject({
        name: 'Animation',
        color: '#ff0000',
        man_days: 960,
        parentElement: root
      })
      expect(span(root)).toEqual(['2026-03-02', '2026-03-21'])
      expect(root.man_days).toBe(2400)
      // Two months of margin around the bars.
      expect(day(api.tasksStartDate.value)).toBe('2026-01-01')
      expect(day(api.tasksEndDate.value)).toBe('2026-05-20')
    })

    it('spans the production while no task is dated', async () => {
      const { api } = await mountEntity({
        ...withTasks([task('undated')]),
        getters: taskGetters()
      })
      expect(api.scheduleItems.value[0].children).toEqual([])
      expect(day(api.tasksStartDate.value)).toBe('2026-01-05')
      expect(day(api.tasksEndDate.value)).toBe('2026-06-30')
    })

    it.each([
      ['a manager', { isCurrentUserProductionManager: () => true }, true],
      [
        'a supervisor of every department',
        { isCurrentUserProductionSupervisor: () => true },
        true
      ],
      [
        'a supervisor of the department of the task',
        {
          isCurrentUserProductionSupervisor: () => true,
          user: () => ({ departments: ['anim'] })
        },
        true
      ],
      [
        'a supervisor of another department',
        {
          isCurrentUserProductionSupervisor: () => true,
          user: () => ({ departments: ['layout'] })
        },
        false
      ],
      ['an artist', {}, false]
    ])('lets %s move the bars: %s', async (_, roleGetters, editable) => {
      const { api } = await mountEntity({
        ...withTasks([task('planned', { start_date: '2026-03-02' })]),
        getters: taskGetters(roleGetters)
      })
      expect(api.scheduleItems.value[0].children[0].editable).toBe(editable)
    })

    // Every task change in the store rebuilds the bars: a change the bars do
    // not show keeps them, and the widget is not drawn again.
    it('keeps the bars while no date or estimation changes', async () => {
      const { api, store } = await mountEntity({
        ...withTasks([
          task('planned', { start_date: '2026-03-02', due_date: '2026-03-06' })
        ]),
        getters: taskGetters()
      })
      const bars = api.scheduleItems.value

      store.commit('UPDATE_TASK', { id: 'planned', task_status_id: 'wip' })
      await nextTick()
      expect(api.scheduleItems.value).toBe(bars)

      store.commit('UPDATE_TASK', { id: 'planned', due_date: '2026-03-13' })
      await nextTick()
      expect(api.scheduleItems.value).not.toBe(bars)
      expect(span(api.scheduleItems.value[0].children[0])).toEqual([
        '2026-03-02',
        '2026-03-13'
      ])
    })

    describe('a bar change', () => {
      const bar = fields => ({
        id: 'planned',
        startDate: parseSimpleDate('2026-03-02'),
        endDate: parseSimpleDate('2026-03-04'),
        parentElement: { daysOff: [] },
        ...fields
      })

      const mountSchedule = async updateTask =>
        (await mountEntity({ actions: { updateTask }, getters: taskGetters() }))
          .api

      it('saves the dates of the bar', async () => {
        const updateTask = vi.fn()
        const api = await mountSchedule(updateTask)
        const item = bar()

        api.saveTaskScheduleItem(item)

        expect(item.man_days).toBe(0)
        expect(updateTask).toHaveBeenCalledWith(expect.anything(), {
          taskId: 'planned',
          data: {
            estimation: undefined,
            start_date: '2026-03-02',
            due_date: '2026-03-04'
          }
        })
      })

      // Three days of estimation from a Monday, the Tuesday off: to the
      // Thursday.
      it('stretches an estimated bar over its business days', async () => {
        const updateTask = vi.fn()
        const api = await mountSchedule(updateTask)
        const item = bar({
          estimation: 1440,
          parentElement: { daysOff: [{ date: '2026-03-03' }] }
        })

        api.saveTaskScheduleItem(item)

        expect(day(item.endDate)).toBe('2026-03-05')
        expect(item.man_days).toBe(1440)
        expect(updateTask).toHaveBeenCalledWith(expect.anything(), {
          taskId: 'planned',
          data: {
            estimation: 1440,
            start_date: '2026-03-02',
            due_date: '2026-03-05'
          }
        })
      })

      it('saves nothing for a bar without dates', async () => {
        const updateTask = vi.fn()
        const api = await mountSchedule(updateTask)

        api.saveTaskScheduleItem(bar({ startDate: null, endDate: null }))

        expect(updateTask).not.toHaveBeenCalled()
      })

      it('logs a save Zou refuses', async () => {
        const error = new Error('refused')
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const api = await mountSchedule(() => Promise.reject(error))

        api.saveTaskScheduleItem(bar())
        await flushPromises()

        expect(consoleError).toHaveBeenCalledWith(error)
        consoleError.mockRestore()
      })
    })
  })

  describe('route', () => {
    it('reloads the page for another entity of the URL only', async () => {
      const init = vi.fn()
      const { api, router } = await mountEntity({
        path: '/shots/entity-1',
        init
      })

      await router.push('/shots/entity-1?section=schedule')
      await nextTick()
      expect(init).not.toHaveBeenCalled()
      expect(api.currentSection.value).toBe('schedule')

      await router.push('/shots/entity-2')
      await nextTick()
      expect(init).toHaveBeenCalledTimes(1)
      expect(api.currentSection.value).toBe('infos')
    })
  })
})
