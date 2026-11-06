// @vitest-environment node

import { vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('@/store', () => ({ default: {} }))

vi.mock('@/store/api/client', () => ({
  default: {
    pdel: vi.fn(),
    pget: vi.fn(),
    ppost: vi.fn(),
    pput: vi.fn()
  }
}))

import client from '@/store/api/client'
import breakdownStore from '@/store/modules/breakdown'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import peopleStore from '@/store/modules/people'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'
import tasksStore from '@/store/modules/tasks'
import userStore from '@/store/modules/user'
import {
  LOAD_ASSETS_END,
  LOAD_EDITS_END,
  LOAD_PEOPLE_END,
  LOAD_PERSON_TASKS_END,
  LOAD_SEQUENCES_END,
  LOAD_SHOTS_END,
  SET_EPISODES_WITH_TASKS,
  USER_LOAD_TODOS_END
} from '@/store/mutation-types'

const production = { id: 'p1' }
const names = list => list.map(({ name }) => name)

const loadShots = store =>
  store.commit(LOAD_SHOTS_END, {
    production,
    shots: [],
    userFilters: store.getters.userFilters,
    userFilterGroups: store.getters.userFilterGroups,
    taskMap: new Map(),
    taskTypeMap: new Map(),
    personMap: new Map(),
    episodeMap: new Map(),
    sequenceMap: new Map()
  })

const loadBreakdown = store =>
  store.commit(LOAD_ASSETS_END, {
    production,
    userFilters: store.getters.userFilters,
    userFilterGroups: store.getters.userFilterGroups
  })

// Each list takes its searches from the user store when it loads, and holds
// an array of its own while its production has none there.
const lists = [
  {
    name: 'Shots',
    modules: { shots: shotsStore },
    listType: 'shot',
    queries: 'shotSearchQueries',
    save: (store, name) => store.dispatch('saveShotSearch', name),
    remove: (store, query) => store.dispatch('removeShotSearch', query),
    load: loadShots
  },
  {
    name: 'Edits',
    modules: { edits: editsStore },
    listType: 'edit',
    queries: 'editSearchQueries',
    save: (store, name) => store.dispatch('saveEditSearch', name),
    remove: (store, query) => store.dispatch('removeEditSearch', query),
    load: store =>
      store.commit(LOAD_EDITS_END, {
        production,
        edits: [],
        userFilters: store.getters.userFilters,
        taskMap: new Map(),
        taskTypeMap: new Map(),
        personMap: new Map()
      })
  },
  {
    name: 'Sequences',
    modules: { sequences: sequencesStore },
    listType: 'sequence',
    queries: 'sequenceSearchQueries',
    save: (store, name) => store.dispatch('saveSequenceSearch', name),
    remove: (store, query) => store.dispatch('removeSequenceSearch', query),
    load: store =>
      store.commit(LOAD_SEQUENCES_END, {
        sequences: [],
        episodeMap: new Map(),
        production,
        userFilters: store.getters.userFilters
      })
  },
  {
    name: 'Episodes',
    modules: { episodes: episodesStore },
    listType: 'episode',
    queries: 'episodeSearchQueries',
    save: (store, name) => store.dispatch('saveEpisodeSearch', name),
    remove: (store, query) => store.dispatch('removeEpisodeSearch', query),
    load: store =>
      store.commit(SET_EPISODES_WITH_TASKS, {
        production,
        episodes: [],
        routeEpisodeId: null,
        personMap: new Map(),
        userFilters: store.getters.userFilters,
        taskMap: new Map(),
        taskTypeMap: new Map(),
        taskStatusMap: new Map()
      })
  },
  {
    name: 'Breakdown',
    modules: { breakdown: breakdownStore },
    listType: 'breakdown',
    queries: 'breakdownSearchQueries',
    save: (store, name) => store.dispatch('saveBreakdownSearch', name),
    remove: (store, query) => store.dispatch('removeBreakdownSearch', query),
    load: loadBreakdown
  },
  {
    name: 'Task type',
    modules: { tasks: tasksStore },
    listType: 'task',
    queries: 'taskSearchQueries',
    save: (store, name) =>
      store.dispatch('saveTaskSearch', { searchQuery: name, entityType: 'Shot' }),
    remove: (store, query) => store.dispatch('removeTaskSearch', query),
    load: loadShots
  },
  {
    name: 'People',
    modules: { people: peopleStore },
    listType: 'people',
    key: 'all',
    queries: 'peopleSearchQueries',
    save: (store, name) => store.dispatch('savePeopleSearch', name),
    remove: (store, query) => store.dispatch('removePeopleSearch', query),
    load: store =>
      store.commit(LOAD_PEOPLE_END, {
        people: [],
        userFilters: store.getters.userFilters
      })
  },
  {
    name: 'Person tasks',
    modules: { people: peopleStore },
    listType: 'persontasks',
    key: 'all',
    queries: 'personTaskSearchQueries',
    save: (store, name) => store.dispatch('savePersonTasksSearch', name),
    remove: (store, query) =>
      store.dispatch('removePersonTasksSearch', query),
    load: store =>
      store.commit(LOAD_PERSON_TASKS_END, {
        personId: 'person-1',
        tasks: [],
        userFilters: store.getters.userFilters,
        taskTypeMap: new Map()
      })
  },
  {
    name: 'My tasks',
    modules: {},
    listType: 'todos',
    key: 'all',
    queries: 'todoSearchQueries',
    save: (store, name) => store.dispatch('saveTodoSearch', name),
    remove: (store, query) => store.dispatch('removeTodoSearch', query),
    load: store =>
      store.commit(USER_LOAD_TODOS_END, {
        tasks: [],
        userFilters: store.getters.userFilters,
        taskTypeMap: new Map()
      })
  }
]

const buildStore = modules =>
  createStore({
    modules: { ...modules, user: userStore },
    getters: { currentProduction: () => production }
  })

beforeEach(() => {
  Object.values(client).forEach(fn => fn.mockReset())
  userStore.state.userFilters = {}
  userStore.state.userFilterGroups = {}
})

describe.each(lists)(
  '$name list, saved searches',
  ({ key = production.id, listType, load, modules, queries, remove, save }) => {
    const savedSearch = (id, name) => ({
      id,
      name,
      list_type: listType,
      project_id: key === 'all' ? null : key
    })

    test('keeps the first search of a production across a load', async () => {
      const store = buildStore(modules)
      load(store)
      client.ppost.mockResolvedValueOnce(savedSearch('f1', 'wip'))

      await save(store, 'wip')
      expect(names(store.getters[queries])).toEqual(['wip'])
      load(store)

      expect(names(store.getters[queries])).toEqual(['wip'])
    })

    test('keeps a removed search out of the next load', async () => {
      const store = buildStore(modules)
      load(store)
      client.ppost.mockResolvedValueOnce(savedSearch('f1', 'wip'))
      client.pdel.mockResolvedValueOnce()

      await save(store, 'wip')
      await remove(store, store.getters[queries][0])
      expect(store.getters[queries]).toEqual([])
      load(store)

      expect(store.getters[queries]).toEqual([])
    })

    // The list then shares the array of the user store.
    test('lists a search once in a production that has some', async () => {
      userStore.state.userFilters = {
        [listType]: { [key]: [savedSearch('f1', 'done')] }
      }
      const store = buildStore(modules)
      load(store)
      client.ppost.mockResolvedValueOnce(savedSearch('f2', 'wip'))

      await save(store, 'wip')
      load(store)

      expect(names(store.getters[queries])).toEqual(['done', 'wip'])
    })

    // Two searches can share a name, in different filter groups.
    test('removes only the search asked for', async () => {
      userStore.state.userFilters = {
        [listType]: {
          [key]: [
            { ...savedSearch('f1', 'wip'), search_filter_group_id: 'g1' },
            savedSearch('f2', 'wip')
          ]
        }
      }
      const store = buildStore(modules)
      load(store)
      client.pdel.mockResolvedValueOnce()

      await remove(store, store.getters[queries][1])

      expect(store.getters[queries].map(({ id }) => id)).toEqual(['f1'])
    })
  }
)

const groupLists = [
  {
    name: 'Shots',
    modules: { shots: shotsStore },
    groups: 'shotSearchFilterGroups',
    save: (store, group) => store.dispatch('saveShotSearchFilterGroup', group),
    remove: (store, group) =>
      store.dispatch('removeShotSearchFilterGroup', group),
    load: loadShots
  },
  {
    name: 'Breakdown',
    modules: { breakdown: breakdownStore },
    groups: 'breakdownSearchFilterGroups',
    save: (store, group) =>
      store.dispatch('saveBreakdownSearchFilterGroup', group),
    remove: (store, group) =>
      store.dispatch('removeBreakdownSearchFilterGroup', group),
    load: loadBreakdown
  }
]

describe.each(groupLists)(
  '$name list, filter groups',
  ({ groups, load, modules, remove, save }) => {
    const group = {
      name: 'Mine',
      color: '#ff0000',
      is_shared: false,
      department_id: null
    }

    test('keeps the first group of a production across a load', async () => {
      const store = buildStore(modules)
      load(store)
      client.ppost.mockResolvedValueOnce({ id: 'g1', ...group })

      await save(store, group)
      expect(names(store.getters[groups])).toEqual(['Mine'])
      load(store)

      expect(names(store.getters[groups])).toEqual(['Mine'])
    })

    test('keeps a removed group out of the next load', async () => {
      const store = buildStore(modules)
      load(store)
      client.ppost.mockResolvedValueOnce({ id: 'g1', ...group })
      client.pdel.mockResolvedValueOnce()

      await save(store, group)
      await remove(store, store.getters[groups][0])
      expect(store.getters[groups]).toEqual([])
      load(store)

      expect(store.getters[groups]).toEqual([])
    })

    test('removes only the group asked for', async () => {
      const store = buildStore(modules)
      load(store)
      client.ppost.mockResolvedValueOnce({ id: 'g1', ...group })
      client.ppost.mockResolvedValueOnce({ id: 'g2', ...group })
      client.pdel.mockResolvedValueOnce()

      await save(store, group)
      await save(store, { ...group, name: 'Other' })
      store.getters[groups][1].name = 'Mine'
      await remove(store, store.getters[groups][1])

      expect(store.getters[groups].map(({ id }) => id)).toEqual(['g1'])
    })
  }
)
