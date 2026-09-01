import { vi } from 'vitest'

// Importing the people module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import store from '@/store/modules/people'
import taskStatusStore from '@/store/modules/taskstatus'
import { buildTaskIndex } from '@/lib/indexing'

describe('People store', () => {
  describe('Mutations', () => {
    let state

    beforeEach(() => {
      store.cache.people = [
        { id: 'person-1', name: 'John Doe', email: 'john.doe@example.com' },
        { id: 'person-2', name: 'Jane Roe', email: 'jane.roe@example.com' }
      ]
      store.cache.peopleIndex = {}
      store.cache.personMap = new Map()
      store.cache.guests = []
      state = {
        displayedPeople: [],
        guests: [],
        peopleSearchText: '',
        personMapVersion: 0
      }
    })

    // A filter-only search (e.g. `department=animation`) reduces to zero
    // keywords, so indexSearch returns null. The mutation must fall back to
    // the full list rather than leave displayedPeople null.
    test('DELETE_PEOPLE_END keeps displayedPeople an array with a filter search', () => {
      state.peopleSearchText = 'department=animation'
      store.mutations.DELETE_PEOPLE_END(state)
      expect(Array.isArray(state.displayedPeople)).toBe(true)
      expect(state.displayedPeople).toEqual(store.cache.people)
    })

    test('EDIT_PEOPLE_END keeps displayedPeople an array with a filter search', () => {
      state.peopleSearchText = 'department=animation'
      store.mutations.EDIT_PEOPLE_END(state, {
        id: 'person-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      })
      expect(Array.isArray(state.displayedPeople)).toBe(true)
      expect(state.displayedPeople).toEqual(store.cache.people)
    })

    // Person.vue's unmount reset commits no personId; state.person must fall
    // back to an object so a later SET_TIME_SPENT can read .id safely.
    test('LOAD_PERSON_TASKS_END keeps person an object when personId is absent', () => {
      state.personTasksSearchText = ''
      store.mutations.LOAD_PERSON_TASKS_END(state, {
        tasks: [],
        userFilters: {},
        taskTypeMap: new Map()
      })
      expect(state.person).toEqual({})
    })

    // A My Tasks timesheet save landing after the person page unmount must
    // skip the person-page cache without throwing.
    test('SET_TIME_SPENT skips the person cache when no person is displayed', () => {
      state.person = undefined
      state.personTimeSpentMap = { 'task-9': { duration: 60 } }
      store.mutations.SET_TIME_SPENT(state, {
        task_id: 'task-1',
        person_id: 'person-1',
        duration: 120
      })
      expect(state.personTimeSpentMap['task-1']).toBeUndefined()
      expect(state.personTimeSpentTotal).toEqual(1)
    })

    test('SET_TIME_SPENT stores the entry for the displayed person', () => {
      state.person = { id: 'person-1' }
      state.personTimeSpentMap = {}
      store.mutations.SET_TIME_SPENT(state, {
        task_id: 'task-1',
        person_id: 'person-1',
        duration: 120
      })
      expect(state.personTimeSpentMap['task-1'].duration).toEqual(120)
      expect(state.personTimeSpentTotal).toEqual(2)
    })

    // The done tasks of the person page never reach the tasks module map,
    // unlike the todo ones registered on LOAD_PERSON_TASKS_END.
    test('SET_PREVIEW refreshes the person done list', () => {
      const done = { id: 'task-1', entity_id: 'entity-1' }
      const other = { id: 'task-2', entity_id: 'entity-2' }
      state.displayedPersonDoneTasks = [done, other]

      store.mutations.SET_PREVIEW(state, {
        entityId: 'entity-1',
        previewId: 'preview-1'
      })

      expect(done.entity_preview_file_id).toEqual('preview-1')
      expect(other.entity_preview_file_id).toBeUndefined()
    })

    // NEW_TASK_COMMENT_END no longer rebuilds personDoneTasksIndex. That
    // rebuild is dead only because the done list comes from its own fetch:
    // the same task sits in both lists as two distinct objects, so commenting
    // the todo one cannot make the done index stale.
    test('NEW_TASK_COMMENT_END leaves the done list and its index alone', () => {
      const statuses = {
        wip: { id: 'status-wip', name: 'Work in progress', short_name: 'wip' },
        done: { id: 'status-done', name: 'Done', short_name: 'done' },
        retake: { id: 'status-retake', name: 'Retake', short_name: 'retake' }
      }
      Object.values(statuses).forEach(status =>
        taskStatusStore.cache.taskStatusMap.set(status.id, status)
      )
      const buildTask = status => ({
        id: 'task-1',
        full_entity_name: 'Asset / Tree',
        project_name: 'Big Buck Bunny',
        task_type_name: 'Modeling',
        task_status_id: status.id,
        task_status_short_name: status.short_name
      })

      const doneTask = buildTask(statuses.done)
      store.cache.personDoneTasks = [doneTask]
      store.cache.personDoneTasksIndex = buildTaskIndex([doneTask])
      state.personTasks = [buildTask(statuses.wip)]
      state.displayedPersonTasks = []
      state.displayedPersonDoneTasks = []

      store.mutations.NEW_TASK_COMMENT_END(state, {
        taskId: 'task-1',
        comment: { id: 'comment-1', task_status_id: statuses.retake.id }
      })

      expect(state.personTasks[0].task_status_short_name).toEqual('retake')
      expect(doneTask.task_status_short_name).toEqual('done')
      store.mutations.SET_PERSON_TASKS_SEARCH(state, 'done')
      expect(state.displayedPersonDoneTasks).toEqual([doneTask])
    })
  })
})
