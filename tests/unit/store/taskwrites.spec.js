// @vitest-environment node

import { vi } from 'vitest'

// Importing the tasks module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@sentry/vue', () => ({ captureException: vi.fn() }))
vi.mock('@/store/api/tasks', () => ({
  default: {
    assignTasks: vi.fn(),
    commentTask: vi.fn(),
    commentTasks: vi.fn(),
    getTasks: vi.fn(() => Promise.resolve([])),
    unassignTasks: vi.fn()
  }
}))

import { createStore } from 'vuex'

import tasksApi from '@/store/api/tasks'
import peopleStore from '@/store/modules/people'
import tasksStore from '@/store/modules/tasks'
import taskStatusStore from '@/store/modules/taskstatus'
import userStore from '@/store/modules/user'

// A request Zou answers when the test says so.
const defer = () => {
  const request = {}
  request.promise = new Promise((resolve, reject) => {
    Object.assign(request, { resolve, reject })
  })
  return request
}

const statuses = ['todo', 'wip', 'retake'].map(name => ({
  id: `status-${name}`,
  name,
  short_name: name,
  color: '#000000'
}))

// Lets the requests sent aside of an action settle.
const settle = () => new Promise(resolve => setTimeout(resolve))

const reloadedIds = () =>
  tasksApi.getTasks.mock.calls.flatMap(([filters]) => JSON.parse(filters.id))

const buildComment = (taskId, statusName, id = `comment-${taskId}`) => ({
  id,
  object_id: taskId,
  person_id: 'person-1',
  task_status_id: `status-${statusName}`,
  text: '',
  created_at: '2099-01-01T10:00:00',
  previews: []
})

describe('Tasks store, writes shown before Zou answers', () => {
  let store

  const task = id => store.getters.taskMap.get(id)
  const statusOf = id => task(id).task_status_id
  const comments = id =>
    (store.getters.getTaskComments(id) || []).map(({ id }) => id)
  const select = (...ids) =>
    store.commit(
      'ADD_SELECTED_TASKS',
      ids.map(id => ({ task: task(id) }))
    )

  beforeEach(() => {
    vi.clearAllMocks()
    statuses.forEach(status =>
      taskStatusStore.cache.taskStatusMap.set(status.id, status)
    )
    store = createStore({
      modules: {
        people: { ...peopleStore, state: { ...peopleStore.state } },
        production: {
          getters: { currentProduction: () => ({ id: 'production-1' }) }
        },
        tasks: {
          ...tasksStore,
          state: {
            ...tasksStore.state,
            selectedTasks: new Map(),
            taskComments: {},
            taskMap: new Map(
              ['task-1', 'task-2'].map(id => [
                id,
                {
                  id,
                  task_status_id: 'status-todo',
                  assignees: ['person-9'],
                  last_comment_date: '2026-01-01T10:00:00'
                }
              ])
            )
          }
        },
        user: {
          ...userStore,
          state: { ...userStore.state, user: { id: 'person-1' } }
        }
      }
    })
  })

  afterEach(() => {
    taskStatusStore.cache.taskStatusMap.clear()
  })

  describe('changeSelectedTaskStatus', () => {
    const changeStatus = statusName =>
      store.dispatch('changeSelectedTaskStatus', {
        taskStatusId: `status-${statusName}`,
        comment: ''
      })

    test('shows the status while Zou works on the batch', async () => {
      const request = defer()
      tasksApi.commentTasks.mockReturnValueOnce(request.promise)
      select('task-1', 'task-2')

      const change = changeStatus('wip')

      expect([statusOf('task-1'), statusOf('task-2')]).toEqual([
        'status-wip',
        'status-wip'
      ])

      request.resolve([
        buildComment('task-1', 'wip'),
        buildComment('task-2', 'wip')
      ])
      await change

      expect([statusOf('task-1'), statusOf('task-2')]).toEqual([
        'status-wip',
        'status-wip'
      ])
      expect(comments('task-1')).toEqual(['comment-task-1'])
    })

    // Zou leaves out of its answer the tasks the user may not comment.
    test('takes back the status of a task Zou left out', async () => {
      tasksApi.commentTasks.mockResolvedValueOnce([
        buildComment('task-1', 'wip')
      ])
      select('task-1', 'task-2')

      await changeStatus('wip')

      expect([statusOf('task-1'), statusOf('task-2')]).toEqual([
        'status-wip',
        'status-todo'
      ])
      expect(comments('task-2')).toEqual([])
    })

    test('takes back every status once Zou refuses the batch', async () => {
      const refusal = new Error('403')
      tasksApi.commentTasks.mockRejectedValueOnce(refusal)
      select('task-1', 'task-2')

      await expect(changeStatus('wip')).rejects.toBe(refusal)

      expect([statusOf('task-1'), statusOf('task-2')]).toEqual([
        'status-todo',
        'status-todo'
      ])
      expect(task('task-1').last_comment_date).toBe('2026-01-01T10:00:00')
      expect(comments('task-1')).toEqual([])
    })

    // Zou saves the comments one by one: a batch that fails midway leaves
    // the first ones saved.
    test('reads the tasks again once Zou fails on the batch', async () => {
      tasksApi.commentTasks.mockRejectedValueOnce(new Error('down'))
      tasksApi.getTasks.mockResolvedValueOnce([
        { id: 'task-1', task_status_id: 'status-wip' },
        { id: 'task-2', task_status_id: 'status-todo' }
      ])
      select('task-1', 'task-2')

      await expect(changeStatus('wip')).rejects.toThrow('down')
      await settle()

      expect(reloadedIds()).toEqual(['task-1', 'task-2'])
      expect([statusOf('task-1'), statusOf('task-2')]).toEqual([
        'status-wip',
        'status-todo'
      ])
    })

    test('keeps the status of a later change when the first one fails', async () => {
      const first = defer()
      const second = defer()
      tasksApi.commentTasks
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise)
      select('task-1')

      const firstChange = changeStatus('wip')
      const secondChange = changeStatus('retake')
      first.reject(new Error('down'))
      await expect(firstChange).rejects.toThrow('down')

      expect(statusOf('task-1')).toBe('status-retake')

      // Refused too, the later change goes back to the status of the start.
      second.reject(new Error('down'))
      await expect(secondChange).rejects.toThrow('down')

      expect(statusOf('task-1')).toBe('status-todo')
    })
  })

  describe('commentTask', () => {
    const post = () =>
      store.dispatch('commentTask', {
        taskId: 'task-1',
        taskStatusId: 'status-wip',
        comment: 'Check the timing'
      })

    test('shows the comment and its status while Zou saves it', async () => {
      const request = defer()
      tasksApi.commentTask.mockReturnValueOnce(request.promise)

      const posted = post()

      const [pending] = store.getters.getTaskComments('task-1')
      expect(pending).toMatchObject({
        object_id: 'task-1',
        person_id: 'person-1',
        task_status_id: 'status-wip',
        text: 'Check the timing'
      })
      expect(statusOf('task-1')).toBe('status-wip')

      request.resolve(buildComment('task-1', 'wip', 'comment-1'))
      await posted

      // The comment of Zou takes the place of the one shown meanwhile.
      expect(comments('task-1')).toEqual(['comment-1'])
      expect(task('task-1').last_comment.id).toBe('comment-1')
      expect(statusOf('task-1')).toBe('status-wip')
    })

    // The task panel and the task page render the list they read once.
    test.each([
      ['saved', request => request.resolve(buildComment('task-1', 'wip')), ['comment-task-1']],
      ['refused', request => request.reject(new Error('403')), []]
    ])('updates the very list the views render once %s', async (_, answer, expected) => {
      const request = defer()
      tasksApi.commentTask.mockReturnValueOnce(request.promise)
      const posted = post()
      const renderedComments = store.getters.getTaskComments('task-1')
      expect(renderedComments).toHaveLength(1)

      answer(request)
      await posted.catch(() => {})

      expect(renderedComments.map(({ id }) => id)).toEqual(expected)
    })

    test('takes the comment and its status back once Zou refuses it', async () => {
      const refusal = new Error('403')
      tasksApi.commentTask.mockRejectedValueOnce(refusal)

      await expect(post()).rejects.toBe(refusal)

      expect(comments('task-1')).toEqual([])
      expect(statusOf('task-1')).toBe('status-todo')
      expect(task('task-1').last_comment).toBeUndefined()
    })
  })

  describe('comment events', () => {
    const isOwn = event => store.getters.isOwnCommentEvent(event)
    const event = (commentId, personId = 'person-1') => ({
      comment_id: commentId,
      task_id: 'task-1',
      person_id: personId
    })

    // During a batch, the events reach the tab before the answer and its
    // comment ids.
    test('takes the comment of the user for its own while its answer is awaited', async () => {
      const request = defer()
      tasksApi.commentTask.mockReturnValueOnce(request.promise)
      const posted = store.dispatch('commentTask', {
        taskId: 'task-1',
        taskStatusId: 'status-wip',
        comment: ''
      })

      expect(isOwn(event('comment-1'))).toBe(true)
      // Another tab of the user awaits no answer, and somebody else may
      // comment the same task meanwhile.
      expect(isOwn(event('comment-2', 'person-2'))).toBe(false)

      request.resolve(buildComment('task-1', 'wip', 'comment-1'))
      await posted

      expect(isOwn(event('comment-1'))).toBe(true)
      expect(isOwn(event('comment-3'))).toBe(false)
    })

    test('takes no comment for its own on a task the tab did not write', () => {
      expect(isOwn(event('comment-1'))).toBe(false)
    })
  })

  describe('assignSelectedTasks', () => {
    const assign = () =>
      store.dispatch('assignSelectedTasks', {
        personId: 'person-2',
        taskIds: ['task-1', 'task-2']
      })
    const assignees = () => [task('task-1').assignees, task('task-2').assignees]

    test('shows the person on the tasks while Zou assigns them', async () => {
      const request = defer()
      tasksApi.assignTasks.mockReturnValueOnce(request.promise)

      const assignment = assign()

      expect(assignees()).toEqual([
        ['person-9', 'person-2'],
        ['person-9', 'person-2']
      ])

      request.resolve([{ id: 'task-1' }, { id: 'task-2' }])
      await assignment

      expect(assignees()).toEqual([
        ['person-9', 'person-2'],
        ['person-9', 'person-2']
      ])
    })

    test('takes the person off the tasks Zou did not assign', async () => {
      tasksApi.assignTasks.mockResolvedValueOnce([{ id: 'task-1' }])

      await expect(assign()).rejects.toMatchObject({
        failedTaskIds: ['task-2'],
        successfulTaskIds: ['task-1']
      })

      expect(assignees()).toEqual([['person-9', 'person-2'], ['person-9']])
    })

    test('takes the person off every task once Zou refuses', async () => {
      const refusal = new Error('403')
      tasksApi.assignTasks.mockRejectedValueOnce(refusal)

      await expect(assign()).rejects.toBe(refusal)

      expect(assignees()).toEqual([['person-9'], ['person-9']])
    })

    test('reads the tasks again once Zou fails on the assignment', async () => {
      tasksApi.assignTasks.mockRejectedValueOnce(new Error('down'))
      tasksApi.getTasks.mockResolvedValueOnce([
        { id: 'task-1', assignees: ['person-9', 'person-2'] }
      ])

      await expect(assign()).rejects.toThrow('down')
      await settle()

      expect(reloadedIds()).toEqual(['task-1', 'task-2'])
      expect(assignees()).toEqual([['person-9', 'person-2'], ['person-9']])
    })
  })

  describe('reloadTasks', () => {
    test('asks for the tasks the store holds, 50 a request', async () => {
      const ids = Array.from({ length: 120 }, (_, index) => `task-${index}`)
      ids.forEach(id => store.commit('NEW_TASK_END', { task: { id } }))

      await store.dispatch('reloadTasks', [...ids, 'task-unknown'])

      expect(
        tasksApi.getTasks.mock.calls.map(
          ([{ id, relations }]) => [JSON.parse(id).length, relations]
        )
      ).toEqual([
        [50, true],
        [50, true],
        [20, true]
      ])
      expect(reloadedIds()).toEqual(ids)
    })

    // A row of the task list names neither its project nor its entity.
    test('gives a task its new values and keeps its names', async () => {
      Object.assign(task('task-1'), { entity_name: 'SQ01 / SH01' })
      tasksApi.getTasks.mockResolvedValueOnce([
        { id: 'task-1', task_status_id: 'status-retake', retake_count: 2 }
      ])

      await store.dispatch('reloadTasks', ['task-1'])

      expect(task('task-1')).toMatchObject({
        entity_name: 'SQ01 / SH01',
        retake_count: 2,
        task_status_id: 'status-retake'
      })
    })

    test('sends nothing for tasks the store does not hold', async () => {
      await store.dispatch('reloadTasks', ['task-unknown'])

      expect(tasksApi.getTasks).not.toHaveBeenCalled()
    })
  })

  describe('unassignSelectedTasks', () => {
    const unassign = () =>
      store.dispatch('unassignSelectedTasks', { taskIds: ['task-1'] })

    test('empties the assignees while Zou clears them', async () => {
      const request = defer()
      tasksApi.unassignTasks.mockReturnValueOnce(request.promise)

      const unassignment = unassign()

      expect(task('task-1').assignees).toEqual([])

      request.resolve()
      await unassignment

      expect(task('task-1').assignees).toEqual([])
    })

    test('puts the assignees back once Zou refuses', async () => {
      const refusal = new Error('403')
      tasksApi.unassignTasks.mockRejectedValueOnce(refusal)

      await expect(unassign()).rejects.toBe(refusal)

      expect(task('task-1').assignees).toEqual(['person-9'])
    })
  })
})
