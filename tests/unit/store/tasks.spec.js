import { vi } from 'vitest'

// Importing the tasks module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/store/api/tasks', () => ({
  default: {
    unassignPersonFromTasks: vi.fn(() => Promise.resolve()),
    createEntityTasks: vi.fn(() =>
      Promise.resolve([{ id: 'task-1' }, { id: 'task-2' }])
    ),
    setTasksPriority: vi.fn(() =>
      Promise.resolve([{ id: 'task-1', priority: 2, task_type_id: 'type-1' }])
    ),
    subscribeToTasks: vi.fn(() => Promise.resolve()),
    unsubscribeFromTasks: vi.fn(() => Promise.resolve()),
    setTasksMainPreview: vi.fn(() =>
      Promise.resolve([{ id: 'entity-1', preview_file_id: 'preview-1' }])
    )
  }
}))

import tasksApi from '@/store/api/tasks'
import tasksStore from '@/store/modules/tasks'
import peopleStore from '@/store/modules/people'

describe('Tasks store', () => {
  describe('Comment author resolution', () => {
    const studioPerson = {
      id: 'person-studio',
      first_name: 'Studio',
      last_name: 'Member',
      full_name: 'Studio Member (live)',
      role: 'manager',
      has_avatar: false
    }

    beforeEach(() => {
      peopleStore.cache.personMap = new Map([['person-studio', studioPerson]])
    })

    afterEach(() => {
      peopleStore.cache.personMap = new Map()
    })

    test('LOAD_TASK_COMMENTS_END prefers personMap over embedded author', () => {
      const state = { taskComments: {}, taskPreviews: {} }
      const comments = [
        {
          id: 'comment-studio',
          person_id: 'person-studio',
          created_at: '2026-05-20T10:00:00',
          pinned: false,
          // Embedded author is stale; the live personMap must win.
          person: { id: 'person-studio', full_name: 'Studio Member (stale)' }
        }
      ]
      tasksStore.mutations.LOAD_TASK_COMMENTS_END(state, {
        taskId: 'task-1',
        comments
      })
      const [comment] = state.taskComments['task-1']
      expect(comment.person.full_name).toEqual('Studio Member (live)')
    })

    test('LOAD_TASK_COMMENTS_END falls back to the embedded guest author', () => {
      const state = { taskComments: {}, taskPreviews: {} }
      const comments = [
        {
          id: 'comment-guest',
          person_id: 'person-guest',
          created_at: '2026-05-20T11:00:00',
          pinned: false,
          // Guests are absent from personMap; the API embeds the author.
          person: {
            id: 'person-guest',
            first_name: 'Guest',
            last_name: 'Author',
            full_name: 'Guest Author',
            role: 'client',
            has_avatar: false
          }
        }
      ]
      tasksStore.mutations.LOAD_TASK_COMMENTS_END(state, {
        taskId: 'task-1',
        comments
      })
      const [comment] = state.taskComments['task-1']
      expect(comment.person.full_name).toEqual('Guest Author')
      // addAdditionalInformation enriches the embedded author for the avatar.
      expect(comment.person.initials).toEqual('GA')
      expect(comment.person.name).toEqual('Guest Author')
    })

    test('LOAD_TASK_COMMENTS_END resolves embedded reply authors too', () => {
      const state = { taskComments: {}, taskPreviews: {} }
      const comments = [
        {
          id: 'comment-studio',
          person_id: 'person-studio',
          created_at: '2026-05-20T10:00:00',
          pinned: false,
          person: studioPerson,
          replies: [
            {
              id: 'reply-guest',
              person_id: 'person-guest',
              person: {
                id: 'person-guest',
                first_name: 'Guest',
                last_name: 'Author',
                full_name: 'Guest Author',
                role: 'client'
              }
            }
          ]
        }
      ]
      tasksStore.mutations.LOAD_TASK_COMMENTS_END(state, {
        taskId: 'task-1',
        comments
      })
      const [comment] = state.taskComments['task-1']
      expect(comment.replies[0].person.full_name).toEqual('Guest Author')
      expect(comment.replies[0].person.initials).toEqual('GA')
    })

    test('ADD_REPLY_TO_COMMENT resolves the embedded guest reply author', () => {
      const comment = { id: 'comment-studio', replies: [] }
      const reply = {
        id: 'reply-guest',
        person_id: 'person-guest',
        person: {
          id: 'person-guest',
          first_name: 'Guest',
          last_name: 'Author',
          full_name: 'Guest Author',
          role: 'client'
        }
      }
      tasksStore.mutations.ADD_REPLY_TO_COMMENT({}, { comment, reply })
      expect(comment.replies[0].person.full_name).toEqual('Guest Author')
      expect(comment.replies[0].person.initials).toEqual('GA')
    })

    test('UPDATE_COMMENT_REPLIES resolves the realtime reply author', () => {
      const state = {
        taskComments: {
          'task-1': [{ id: 'comment-studio', replies: [] }]
        }
      }
      // The comment:reply payload carries person_id and no embedded author.
      tasksStore.mutations.UPDATE_COMMENT_REPLIES(state, {
        id: 'comment-studio',
        object_id: 'task-1',
        person_id: 'person-studio',
        replies: [{ id: 'reply-studio', person_id: 'person-studio' }]
      })
      const [reply] = state.taskComments['task-1'][0].replies
      expect(reply.person.full_name).toEqual('Studio Member (live)')
      expect(reply.person.initials).toEqual('SM')
    })

    test('UPDATE_COMMENT_REPLIES ignores a comment absent from the store', () => {
      const state = { taskComments: { 'task-1': [] } }
      expect(() =>
        tasksStore.mutations.UPDATE_COMMENT_REPLIES(state, {
          id: 'comment-unknown',
          object_id: 'task-1',
          replies: []
        })
      ).not.toThrow()
    })

    test('UPDATE_COMMENT_CHECKLIST ignores a comment absent from the store', () => {
      const state = { taskComments: { 'task-1': [] } }
      expect(() =>
        tasksStore.mutations.UPDATE_COMMENT_CHECKLIST(state, {
          comment: { id: 'comment-unknown', object_id: 'task-1' },
          checklist: []
        })
      ).not.toThrow()
    })

    test('ADD_ATTACHMENT_TO_COMMENT ignores an untracked task', () => {
      const state = { taskComments: {} }
      expect(() =>
        tasksStore.mutations.ADD_ATTACHMENT_TO_COMMENT(state, {
          comment: { id: 'comment-1', object_id: 'task-unknown' },
          attachmentFiles: [{ id: 'file-1' }]
        })
      ).not.toThrow()
    })
  })

  describe('batch actions', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    test('unassignPersonFromTasks sends one request and commits per task', async () => {
      const commit = vi.fn()
      const person = { id: 'person-1' }
      const tasks = [{ id: 'task-1' }, { id: 'task-2' }]
      await tasksStore.actions.unassignPersonFromTasks(
        { commit },
        { tasks, person }
      )
      expect(tasksApi.unassignPersonFromTasks).toHaveBeenCalledTimes(1)
      expect(tasksApi.unassignPersonFromTasks).toHaveBeenCalledWith(
        ['task-1', 'task-2'],
        'person-1'
      )
      expect(commit).toHaveBeenCalledTimes(2)
      expect(commit).toHaveBeenNthCalledWith(1, 'UNASSIGN_TASK', {
        task: tasks[0],
        person
      })
    })

    test('unassignPersonFromTasks skips the request on an empty selection', async () => {
      const commit = vi.fn()
      await tasksStore.actions.unassignPersonFromTasks(
        { commit },
        { tasks: [], person: { id: 'person-1' } }
      )
      expect(tasksApi.unassignPersonFromTasks).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })

    test('changeSelectedPriorities updates the selection in one request', async () => {
      const commit = vi.fn()
      const state = {
        selectedTasks: new Map([
          ['task-1', true],
          ['task-2', true]
        ]),
        taskMap: new Map([
          ['task-1', { id: 'task-1', priority: 0 }],
          // Already at the target priority: must be excluded from the call.
          ['task-2', { id: 'task-2', priority: 2 }]
        ])
      }
      const rootGetters = { taskTypeMap: new Map() }
      await tasksStore.actions.changeSelectedPriorities(
        { commit, state, rootGetters },
        { priority: 2 }
      )
      expect(tasksApi.setTasksPriority).toHaveBeenCalledTimes(1)
      expect(tasksApi.setTasksPriority).toHaveBeenCalledWith(['task-1'], 2)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit.mock.calls[0][0]).toEqual('EDIT_TASK_END')
      expect(commit.mock.calls[0][1].task.priority).toEqual(2)
    })

    test('subscribeToTasks sends one request and commits per task', async () => {
      const commit = vi.fn()
      await tasksStore.actions.subscribeToTasks({ commit }, ['task-1', 'task-2'])
      expect(tasksApi.subscribeToTasks).toHaveBeenCalledTimes(1)
      expect(tasksApi.subscribeToTasks).toHaveBeenCalledWith(['task-1', 'task-2'])
      expect(commit).toHaveBeenCalledTimes(2)
      expect(commit).toHaveBeenNthCalledWith(1, 'LOAD_TASK_SUBSCRIBE_END', {
        taskId: 'task-1',
        subscribed: true
      })
    })

    test('unsubscribeFromTasks commits subscribed=false per task', async () => {
      const commit = vi.fn()
      await tasksStore.actions.unsubscribeFromTasks(
        { commit },
        ['task-1', 'task-2']
      )
      expect(tasksApi.unsubscribeFromTasks).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(2)
      expect(commit.mock.calls[0][1].subscribed).toBe(false)
    })

    test('setTasksMainPreview maps returned entities back to their task', async () => {
      const commit = vi.fn()
      const state = {
        taskMap: new Map([
          ['task-1', { id: 'task-1', entity: { id: 'entity-1' } }],
          // No preview for this task's entity: skipped server-side.
          ['task-2', { id: 'task-2', entity: { id: 'entity-2' } }]
        ])
      }
      await tasksStore.actions.setTasksMainPreview(
        { commit, state },
        ['task-1', 'task-2']
      )
      expect(tasksApi.setTasksMainPreview).toHaveBeenCalledWith([
        'task-1',
        'task-2'
      ])
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith('SET_PREVIEW', {
        taskId: 'task-1',
        entityId: 'entity-1',
        previewId: 'preview-1',
        taskMap: state.taskMap
      })
    })

    test('createEntityTasks commits NEW_TASK_END for each created task', async () => {
      const commit = vi.fn()
      const rootGetters = { currentProduction: { id: 'prod-1' } }
      const tasks = await tasksStore.actions.createEntityTasks(
        { commit, rootGetters },
        { entityId: 'entity-1', taskTypeIds: ['type-1', 'type-2'] }
      )
      expect(tasksApi.createEntityTasks).toHaveBeenCalledTimes(1)
      expect(tasksApi.createEntityTasks).toHaveBeenCalledWith('entity-1', [
        'type-1',
        'type-2'
      ])
      expect(tasks.map(task => task.id)).toEqual(['task-1', 'task-2'])
      expect(commit).toHaveBeenCalledTimes(2)
      expect(commit.mock.calls[0][0]).toEqual('NEW_TASK_END')
      expect(commit.mock.calls[0][1].task).toEqual(tasks[0])
    })
  })

  describe('updatePreviewAnnotations action', () => {
    const annotations = [{ time: 0, drawing: { objects: [] } }]
    const preview = { id: 'preview-1', task_id: 'task-1' }

    test('commits one UPDATE_PREVIEW_ANNOTATION for the main preview', () => {
      const commit = vi.fn()
      tasksStore.actions.updatePreviewAnnotations(
        { commit },
        { preview, annotations }
      )
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith('UPDATE_PREVIEW_ANNOTATION', {
        taskId: 'task-1',
        preview,
        annotations
      })
    })

    test('commits once per extra preview with the same annotations', () => {
      const commit = vi.fn()
      const revisionCopy = { id: 'preview-1', revision: 2 }
      const subPreviewParent = { id: 'preview-parent', revision: 1 }
      tasksStore.actions.updatePreviewAnnotations(
        { commit },
        {
          preview,
          annotations,
          extraPreviews: [
            { taskId: 'task-1', preview: revisionCopy },
            { taskId: 'task-1', preview: subPreviewParent }
          ]
        }
      )
      expect(commit).toHaveBeenCalledTimes(3)
      expect(commit).toHaveBeenNthCalledWith(1, 'UPDATE_PREVIEW_ANNOTATION', {
        taskId: 'task-1',
        preview,
        annotations
      })
      expect(commit).toHaveBeenNthCalledWith(2, 'UPDATE_PREVIEW_ANNOTATION', {
        taskId: 'task-1',
        preview: revisionCopy,
        annotations
      })
      expect(commit).toHaveBeenNthCalledWith(3, 'UPDATE_PREVIEW_ANNOTATION', {
        taskId: 'task-1',
        preview: subPreviewParent,
        annotations
      })
    })
  })

  describe('SET_PREVIEW', () => {
    // The socket event carries no task id, and the my-checks page renders the
    // very objects registered here, so the whole map has to be swept.
    test('refreshes every registered task of the entity', () => {
      const acting = {
        id: 'task-1',
        entity_id: 'entity-1',
        entity_preview_file_id: 'old',
        entity: { id: 'entity-1', preview_file_id: 'old' }
      }
      const sibling = {
        id: 'task-2',
        entity_id: 'entity-1',
        entity_preview_file_id: 'old'
      }
      const other = {
        id: 'task-3',
        entity_id: 'entity-2',
        entity_preview_file_id: 'old'
      }
      const state = {
        taskMap: new Map([
          ['task-1', acting],
          ['task-2', sibling],
          ['task-3', other]
        ])
      }

      tasksStore.mutations.SET_PREVIEW(state, {
        entityId: 'entity-1',
        previewId: 'preview-1'
      })

      expect(acting.entity_preview_file_id).toEqual('preview-1')
      expect(acting.entity.preview_file_id).toEqual('preview-1')
      expect(sibling.entity_preview_file_id).toEqual('preview-1')
      expect(other.entity_preview_file_id).toEqual('old')
    })

    // The people module only refreshes the done tasks: the todo ones of the
    // person page rely on being registered here, so pin that registration.
    test('reaches the person todo tasks registered by LOAD_PERSON_TASKS_END', () => {
      const task = {
        id: 'task-1',
        entity_id: 'entity-1',
        entity_type_name: 'Shot',
        entity_name: 'SH01',
        project_id: 'project-1',
        entity_preview_file_id: 'old'
      }
      const state = { taskMap: new Map() }

      tasksStore.mutations.LOAD_PERSON_TASKS_END(state, { tasks: [task] })
      expect(state.taskMap.get('task-1')).toBe(task)

      tasksStore.mutations.SET_PREVIEW(state, {
        entityId: 'entity-1',
        previewId: 'preview-1'
      })
      expect(task.entity_preview_file_id).toEqual('preview-1')
    })
  })
})
