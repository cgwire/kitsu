// @vitest-environment node

import { vi } from 'vitest'

// Importing the tasks module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@sentry/vue', () => ({ captureException: vi.fn() }))
vi.mock('@/store/api/tasks', () => ({
  default: {
    addExtraPreview: vi.fn(),
    addPreview: vi.fn(),
    commentTask: vi.fn(),
    getTaskComment: vi.fn(),
    getTaskComments: vi.fn(),
    uploadPreview: vi.fn(),
    setLastTaskPreviewAsEntityThumbnail: vi.fn(),
    setPreview: vi.fn(),
    pinComment: vi.fn(),
    updatePreviewAnnotation: vi.fn(),
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

import * as Sentry from '@sentry/vue'

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
        { commit, dispatch: vi.fn(), state },
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

  describe('updatePreviewAnnotation action', () => {
    const preview = { id: 'preview-1', task_id: 'task-1' }
    const payload = {
      taskId: 'task-1',
      preview,
      additions: [],
      deletions: [],
      updates: []
    }
    const httpError = status =>
      Object.assign(new Error(`HTTP ${status}`), {
        response: { status },
        status
      })

    beforeEach(() => {
      Sentry.captureException.mockClear()
    })

    // A retry could never succeed: the preview was deleted meanwhile.
    test('drops the save of a deleted preview without reporting it', async () => {
      const commit = vi.fn()
      tasksApi.updatePreviewAnnotation.mockRejectedValueOnce(httpError(404))

      await tasksStore.actions.updatePreviewAnnotation({ commit }, payload)

      expect(commit).not.toHaveBeenCalled()
      expect(Sentry.captureException).not.toHaveBeenCalled()
    })

    test('reports any other failure and rethrows it', async () => {
      const commit = vi.fn()
      const error = httpError(500)
      tasksApi.updatePreviewAnnotation.mockRejectedValueOnce(error)

      await expect(
        tasksStore.actions.updatePreviewAnnotation({ commit }, payload)
      ).rejects.toBe(error)
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.anything()
      )
    })
  })

  describe('pinComment action', () => {
    const pinAndSave = async comment => {
      const state = { taskComments: { 'task-1': [comment] } }
      const commit = (type, payload) =>
        tasksStore.mutations[type](state, payload)
      await tasksStore.actions.pinComment({ commit }, comment)
    }

    test('keeps the pin once saved', async () => {
      const comment = { id: 'comment-1', object_id: 'task-1', pinned: false }
      tasksApi.pinComment.mockResolvedValueOnce({})

      await pinAndSave(comment)

      expect(comment.pinned).toBe(true)
    })

    test('restores the pin and rethrows when the save fails', async () => {
      const comment = { id: 'comment-1', object_id: 'task-1', pinned: false }
      const error = new Error('Request has been terminated')
      tasksApi.pinComment.mockRejectedValueOnce(error)

      await expect(pinAndSave(comment)).rejects.toBe(error)

      expect(comment.pinned).toBe(false)
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

// Zou builds the files of an uploaded preview in a job: the store of the
// preview statuses learns each preview the task panels upload or list.
describe('Tasks store, preview file statuses', () => {
  const form = name => new Map([['file', { name }]])
  const upload = preview => ({
    request: { on: vi.fn() },
    promise: Promise.resolve(preview)
  })
  const registerCalls = dispatch =>
    dispatch.mock.calls
      .map((call, index) => [...call, dispatch.mock.invocationCallOrder[index]])
      .filter(([action]) => action === 'registerPreviewFileStatuses')
  const commitOrders = (commit, type) =>
    commit.mock.calls
      .map((call, index) => [call[0], commit.mock.invocationCallOrder[index]])
      .filter(([name]) => name === type)
      .map(([, order]) => order)

  test('commentTaskWithPreview registers the status of each uploaded preview', async () => {
    tasksApi.commentTask.mockResolvedValue({ id: 'comment-1' })
    tasksApi.addPreview.mockResolvedValue({ id: 'preview-1' })
    tasksApi.addExtraPreview.mockResolvedValue({ id: 'preview-2' })
    const uploaded = [
      { id: 'preview-1', revision: 1, status: 'processing' },
      { id: 'preview-2', revision: 1, status: 'processing' }
    ]
    tasksApi.uploadPreview
      .mockReturnValueOnce(upload(uploaded[0]))
      .mockReturnValueOnce(upload(uploaded[1]))
    const commit = vi.fn()
    const dispatch = vi.fn()

    await tasksStore.actions.commentTaskWithPreview(
      { commit, dispatch },
      {
        taskId: 'task-1',
        taskStatusId: 'status-1',
        comment: '',
        forms: [form('a.png'), form('b.png')]
      }
    )

    const registers = registerCalls(dispatch)
    expect(registers.map(([, previews]) => previews)).toEqual([
      [uploaded[0]],
      [uploaded[1]]
    ])
    // A ready status known before must reach the copy ADD_PREVIEW_END makes.
    const additions = commitOrders(commit, 'ADD_PREVIEW_END')
    expect(registers[0][2]).toBeGreaterThan(additions[0])
    expect(registers[1][2]).toBeGreaterThan(additions[1])
  })

  test('addCommentExtraPreview registers the status of each uploaded preview', async () => {
    tasksApi.addExtraPreview.mockResolvedValue({ id: 'preview-3' })
    const uploaded = { id: 'preview-3', revision: 2, status: 'processing' }
    tasksApi.uploadPreview.mockReturnValueOnce(upload(uploaded))
    const commit = vi.fn()
    const dispatch = vi.fn()

    await tasksStore.actions.addCommentExtraPreview(
      {
        commit,
        dispatch,
        getters: { getTaskComment: () => ({ id: 'comment-1' }) }
      },
      {
        taskId: 'task-1',
        commentId: 'comment-1',
        previewId: 'preview-1',
        forms: [form('c.png')]
      }
    )

    const registers = registerCalls(dispatch)
    expect(registers.map(([, previews]) => previews)).toEqual([[uploaded]])
    expect(registers[0][2]).toBeGreaterThan(
      commitOrders(commit, 'ADD_PREVIEW_END')[0]
    )
  })

  test('loadTaskComments registers the statuses of the comment previews', async () => {
    const previews = [
      { id: 'preview-1', status: 'processing' },
      { id: 'preview-2', status: 'ready' }
    ]
    tasksApi.getTaskComments.mockResolvedValue([
      { id: 'comment-1', previews },
      { id: 'comment-2', previews: [] },
      { id: 'comment-3' }
    ])
    const commit = vi.fn()
    const dispatch = vi.fn(() => Promise.resolve())

    await tasksStore.actions.loadTaskComments(
      { commit, dispatch },
      { taskId: 'task-1', entityId: 'entity-1' }
    )

    const registers = registerCalls(dispatch)
    expect(registers.map(([, registered]) => registered)).toEqual([previews])
    expect(registers[0][2]).toBeGreaterThan(
      commitOrders(commit, 'LOAD_TASK_COMMENTS_END')[0]
    )
  })
})

// The caller hands over the files to upload: no other panel can change them
// while a long upload runs.
describe('Tasks store, preview uploads', () => {
  const form = name => new Map([['file', { name }]])
  const uploadedFiles = () =>
    tasksApi.uploadPreview.mock.calls.map(([previewId, form]) => [
      previewId,
      form?.get('file').name
    ])

  beforeEach(() => {
    vi.clearAllMocks()
    tasksApi.commentTask.mockResolvedValue({ id: 'comment-1' })
    tasksApi.addPreview.mockResolvedValue({ id: 'preview-1' })
    tasksApi.uploadPreview.mockImplementation(previewId => ({
      request: { on: vi.fn() },
      promise: Promise.resolve({ id: previewId, revision: 1 })
    }))
  })

  test('commentTaskWithPreview uploads the first form as the main preview, the others as extras', async () => {
    tasksApi.addExtraPreview
      .mockResolvedValueOnce({ id: 'preview-2' })
      .mockResolvedValueOnce({ id: 'preview-3' })

    await tasksStore.actions.commentTaskWithPreview(
      { commit: vi.fn(), dispatch: vi.fn() },
      {
        taskId: 'task-1',
        taskStatusId: 'status-1',
        comment: '',
        forms: [form('a.png'), form('b.png'), form('c.png')]
      }
    )

    expect(uploadedFiles()).toEqual([
      ['preview-1', 'a.png'],
      ['preview-2', 'b.png'],
      ['preview-3', 'c.png']
    ])
    expect(tasksApi.addExtraPreview.mock.calls).toEqual([
      ['preview-1', 'task-1', 'comment-1'],
      ['preview-1', 'task-1', 'comment-1']
    ])
  })

  test('commentTaskWithPreview adds no extra preview to a single form', async () => {
    await tasksStore.actions.commentTaskWithPreview(
      { commit: vi.fn(), dispatch: vi.fn() },
      {
        taskId: 'task-1',
        taskStatusId: 'status-1',
        comment: '',
        forms: [form('thumbnail.png')]
      }
    )

    expect(uploadedFiles()).toEqual([['preview-1', 'thumbnail.png']])
    expect(tasksApi.addExtraPreview).not.toHaveBeenCalled()
  })

  test('commentTaskWithPreview reports the progress under the uploaded file name', async () => {
    const commit = vi.fn()

    await tasksStore.actions.commentTaskWithPreview(
      { commit, dispatch: vi.fn() },
      {
        taskId: 'task-1',
        taskStatusId: 'status-1',
        comment: '',
        forms: [form('a.png')]
      }
    )
    const { request } = tasksApi.uploadPreview.mock.results[0].value
    const [event, onProgress] = request.on.mock.calls[0]
    onProgress({ direction: 'download', percent: 100 })

    expect(event).toBe('progress')
    expect(commit).toHaveBeenCalledWith('SET_UPLOAD_PROGRESS', {
      previewId: 'preview-1',
      percent: 100,
      name: 'a.png'
    })
  })

  // The comment box and the extra preview modal upload at the same time:
  // each clears the progress of its own files only.
  test('CLEAR_UPLOAD_PROGRESS of given files keeps the progress of the others', () => {
    const state = { uploadProgress: { 'a.png': 40, 'b.png': 100 } }

    tasksStore.mutations.CLEAR_UPLOAD_PROGRESS(state, ['b.png'])

    expect(state.uploadProgress).toEqual({ 'a.png': 40 })
  })

  test('commentTaskWithPreview clears the progress of its files once done', async () => {
    const commit = vi.fn()

    await tasksStore.actions.commentTaskWithPreview(
      { commit, dispatch: vi.fn() },
      {
        taskId: 'task-1',
        taskStatusId: 'status-1',
        comment: '',
        forms: [form('a.png')]
      }
    )

    expect(commit).toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS', ['a.png'])
    expect(commit).not.toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS')
  })

  // A retry starts the bars of its files from zero.
  test('addCommentExtraPreview clears the progress of its files first and last', async () => {
    const commit = vi.fn()
    tasksApi.addExtraPreview.mockResolvedValueOnce({ id: 'preview-2' })

    await tasksStore.actions.addCommentExtraPreview(
      {
        commit,
        dispatch: vi.fn(),
        getters: { getTaskComment: () => ({ id: 'comment-1' }) }
      },
      {
        taskId: 'task-1',
        commentId: 'comment-1',
        previewId: 'preview-1',
        forms: [form('b.png')]
      }
    )

    const clears = commit.mock.calls.filter(
      ([type]) => type === 'CLEAR_UPLOAD_PROGRESS'
    )
    expect(commit.mock.calls[0]).toEqual(['CLEAR_UPLOAD_PROGRESS', ['b.png']])
    expect(clears).toEqual([
      ['CLEAR_UPLOAD_PROGRESS', ['b.png']],
      ['CLEAR_UPLOAD_PROGRESS', ['b.png']]
    ])
  })

  test('addCommentExtraPreview uploads the forms it is handed', async () => {
    tasksApi.addExtraPreview
      .mockResolvedValueOnce({ id: 'preview-2' })
      .mockResolvedValueOnce({ id: 'preview-3' })

    await tasksStore.actions.addCommentExtraPreview(
      {
        commit: vi.fn(),
        dispatch: vi.fn(),
        getters: { getTaskComment: () => ({ id: 'comment-1' }) }
      },
      {
        taskId: 'task-1',
        commentId: 'comment-1',
        previewId: 'preview-1',
        forms: [form('b.png'), form('c.png')]
      }
    )

    expect(uploadedFiles()).toEqual([
      ['preview-2', 'b.png'],
      ['preview-3', 'c.png']
    ])
  })
})

// The players draw copies of the comment previews: they follow the status
// Zou announces for each preview file.
describe('Tasks store, preview copies', () => {
  const buildPreviews = status => {
    const head = {
      id: 'preview-1',
      status,
      previews: [
        { id: 'preview-1', status },
        { id: 'preview-2', status: 'processing' }
      ]
    }
    return { head, state: { taskPreviews: { 'task-1': [head] } } }
  }

  test('SET_PREVIEW_FILE_STATUS settles every copy of the preview', () => {
    const { head, state } = buildPreviews('processing')

    tasksStore.mutations.SET_PREVIEW_FILE_STATUS(state, {
      previewFileId: 'preview-1',
      status: 'ready'
    })

    expect([
      head.status,
      head.previews[0].status,
      head.previews[1].status
    ]).toEqual(['ready', 'ready', 'processing'])
  })

  // DELETE_TASK_END leaves the entry of the task, set to undefined.
  test('SET_PREVIEW_FILE_STATUS skips a task deleted meanwhile', () => {
    const { head, state } = buildPreviews('processing')
    state.taskPreviews['task-0'] = undefined

    tasksStore.mutations.SET_PREVIEW_FILE_STATUS(state, {
      previewFileId: 'preview-1',
      status: 'ready'
    })

    expect(head.status).toBe('ready')
  })

  test('SET_PREVIEW_FILE_STATUS keeps a ready copy against a late processing status', () => {
    const { head, state } = buildPreviews('ready')

    tasksStore.mutations.SET_PREVIEW_FILE_STATUS(state, {
      previewFileId: 'preview-1',
      status: 'processing'
    })

    expect([head.status, head.previews[0].status]).toEqual(['ready', 'ready'])
  })

  test('UPDATE_PREVIEW_ANNOTATION keeps a ready copy when an older answer says processing', () => {
    const { head, state } = buildPreviews('ready')

    tasksStore.mutations.UPDATE_PREVIEW_ANNOTATION(state, {
      taskId: 'task-1',
      preview: { id: 'preview-1', status: 'processing' }
    })

    expect([head.status, head.previews[0].status]).toEqual(['ready', 'ready'])
  })
})

// Zou lists the previews of a single comment by their IDs: a reload must keep
// what the store holds of them, the revision number the comment shows first.
describe('Tasks store, comment reloads', () => {
  const reloadComment = async (state, previewIds) => {
    tasksApi.getTaskComment.mockResolvedValue({
      id: 'comment-1',
      object_id: 'task-1',
      previews: previewIds
    })
    const commit = vi.fn()

    await tasksStore.actions.loadComment(
      { commit, state },
      { commentId: 'comment-1' }
    )

    const [, { comment }] = commit.mock.calls.find(
      ([type]) => type === 'NEW_TASK_COMMENT_END'
    )
    return comment
  }

  // A comment of a todo task, loaded without the task previews.
  test('loadComment keeps the previews the comment holds', async () => {
    const preview = {
      id: 'preview-1',
      revision: 1,
      validation_status: 'validated'
    }
    const state = {
      taskComments: { 'task-1': [{ id: 'comment-1', previews: [preview] }] },
      taskPreviews: {}
    }

    const comment = await reloadComment(state, ['preview-1', 'preview-2'])

    expect(comment.previews[0]).toBe(preview)
    expect(comment.previews[1]).toEqual({ id: 'preview-2' })
  })

  // A preview another user adds to a revision stays a bare ID in the
  // comment, ADD_PREVIEW_END only puts it in the task previews.
  test('loadComment takes a preview the comment lists bare from the task previews', async () => {
    const copy = { id: 'preview-2', revision: 1, extension: 'png' }
    const head = {
      id: 'preview-1',
      revision: 1,
      previews: [{ id: 'preview-1', revision: 1 }, copy]
    }
    const state = {
      taskComments: {
        'task-1': [{ id: 'comment-1', previews: [head, { id: 'preview-2' }] }]
      },
      taskPreviews: { 'task-1': [head] }
    }

    const comment = await reloadComment(state, ['preview-1', 'preview-2'])

    expect(comment.previews[0]).toBe(head)
    expect(comment.previews[1]).toBe(copy)
  })
})

// Zou answers a new main preview with its status, which can still be
// processing: the thumbnails must know it before they show the preview.
describe('Tasks store, new main previews', () => {
  const entity = {
    id: 'entity-1',
    preview_file_id: 'preview-1',
    preview_file_status: 'processing'
  }
  const taskMap = new Map([
    [
      'task-1',
      {
        id: 'task-1',
        entity: { id: 'entity-1' },
        entity_preview_file_id: 'preview-1'
      }
    ]
  ])
  const expectRegisteredFirst = (commit, dispatch) => {
    expect(dispatch).toHaveBeenCalledWith('registerPreviewFileStatuses', [
      { id: 'preview-1', status: 'processing' }
    ])
    expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(
      commit.mock.invocationCallOrder[0]
    )
  }

  test('setPreview registers the status Zou answers before showing it', async () => {
    tasksApi.setPreview.mockResolvedValue(entity)
    const commit = vi.fn()
    const dispatch = vi.fn()

    await tasksStore.actions.setPreview(
      { commit, dispatch, state: { taskMap } },
      { taskId: 'task-1', entityId: 'entity-1', previewId: 'preview-1' }
    )

    expectRegisteredFirst(commit, dispatch)
  })

  test('setLastTaskPreview registers the status Zou answers before showing it', async () => {
    tasksApi.setLastTaskPreviewAsEntityThumbnail.mockResolvedValue(entity)
    const commit = vi.fn()
    const dispatch = vi.fn()

    await tasksStore.actions.setLastTaskPreview(
      { commit, dispatch, state: { taskMap } },
      'task-1'
    )

    expectRegisteredFirst(commit, dispatch)
  })

  test('setTasksMainPreview registers the status of each new main preview', async () => {
    tasksApi.setTasksMainPreview.mockResolvedValueOnce([entity])
    const commit = vi.fn()
    const dispatch = vi.fn()

    await tasksStore.actions.setTasksMainPreview(
      { commit, dispatch, state: { taskMap } },
      ['task-1']
    )

    expectRegisteredFirst(commit, dispatch)
  })
})

describe('Tasks store, DELETE_TASK_END', () => {
  const task = { id: 't1', entity_id: 'e1', task_type_id: 'tt1' }
  const buildState = () => ({
    taskComments: {},
    taskPreviews: {},
    taskMap: new Map([['t1', task]]),
    selectedTasks: new Map(),
    selectedValidations: new Map(),
    nbSelectedTasks: 0,
    nbSelectedValidations: 0
  })

  // A colleague's deletion reaches every open list: an empty cell selected
  // behind the user's back would recreate the task on the next creation.
  test('selects nothing when the deleted task was not selected', () => {
    const state = buildState()
    tasksStore.mutations.DELETE_TASK_END(state, task)
    expect(state.selectedValidations.size).toBe(0)
  })

  test('keeps the empty cell of a selected task selected, and counted', () => {
    const state = buildState()
    state.selectedTasks.set('t1', task)
    state.nbSelectedTasks = 1
    tasksStore.mutations.DELETE_TASK_END(state, task)
    expect(state.nbSelectedTasks).toBe(0)
    expect(state.selectedValidations.has('e1-tt1')).toBe(true)
    expect(state.nbSelectedValidations).toBe(1)
  })
})
