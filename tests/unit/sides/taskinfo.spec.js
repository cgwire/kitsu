import { flushPromises, shallowMount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid a circular-import race from child components.
import '@/lib/auth'

import TaskInfo from '@/components/sides/TaskInfo.vue'
import ActionPanel from '@/components/tops/ActionPanel.vue'
import PreviewPlayer from '@/components/players/players/PreviewPlayer.vue'
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import AddComment from '@/components/widgets/AddComment.vue'
import Comment from '@/components/widgets/Comment.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import drafts from '@/lib/drafts'
import { DEFAULT_FPS } from '@/lib/video'
import shotStore from '@/store/modules/shots'

import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

// The eleven events the panel declares through its socketEvents table.
const SOCKET_EVENTS = [
  'preview-file:add-file',
  'preview-file:update',
  'preview-file:annotation-update',
  'task:update',
  'comment:new',
  'comment:update',
  'comment:acknowledge',
  'comment:unacknowledge',
  'comment:reply',
  'comment:delete',
  'comment:delete-reply'
]

const TASK_ID = 'task-1'
const USER_ID = 'user-1'
const ENTITY_ID = 'entity-1'

const taskType = {
  id: 'task-type-1',
  name: 'Animation',
  for_entity: 'Shot',
  department_id: 'department-1'
}

const buildTask = (overrides = {}) => ({
  id: TASK_ID,
  entity_id: ENTITY_ID,
  entity_type_name: 'Shot',
  entity_name: 'SH01',
  task_type_id: taskType.id,
  project_id: 'production-1',
  assignees: [],
  entity: { id: ENTITY_ID },
  data: {},
  ...overrides
})

const mountPanel = async ({
  task = buildTask(),
  props = {},
  getterOverrides = {},
  stubs = {},
  comments = [],
  previews = [],
  slots = {}
} = {}) => {
  const socket = { on: vi.fn(), off: vi.fn() }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }]
  })
  await router.push('/')
  await router.isReady()

  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({
        id: 'production-1',
        team: [],
        task_types: [taskType.id],
        fps: 25
      }),
      currentUserRoleForProduction: () => () => 'user',
      getTaskComment: () => () => null,
      getTaskComments: () => () => comments,
      getTaskPreviews: () => () => previews,
      getTaskStatusForCurrentUser: () => () => [],
      isCurrentUserAdmin: () => false,
      isCurrentUserArtist: () => true,
      isCurrentUserClient: () => false,
      isSavingCommentPreview: () => false,
      isTVShow: () => false,
      nbSelectedTasks: () => 0,
      nbSelectedValidations: () => 0,
      personMap: () => new Map(),
      productionMap: () => new Map([['production-1', { fps: 30 }]]),
      selectedAssets: () => new Map(),
      selectedConcepts: () => new Map(),
      selectedEdits: () => new Map(),
      selectedShots: () => new Map(),
      selectedTasks: () => new Map(),
      shotMap: () => new Map(),
      taskEntityPreviews: () => [],
      taskMap: () => new Map([[TASK_ID, task]]),
      taskTypeMap: () => new Map([[taskType.id, taskType]]),
      teamRolesForProduction: () => () => ({}),
      user: () => ({ id: USER_ID, departments: [] }),
      ...getterOverrides
    }
  })
  // Record every dispatch while letting the unregistered ones resolve.
  store.dispatch = vi.fn(() => Promise.resolve())
  // The panel clears the upload progress through a real mutation, which
  // this getter-only store does not carry.
  store.commit = vi.fn()

  const wrapper = shallowMount(TaskInfo, {
    props: { task, ...props },
    slots,
    global: {
      stubs: {
        // reset() runs after every load; the default stub has no such method
        // and the resulting throw would cut the reset short.
        AddPreviewModal: { template: '<div />', methods: { reset: () => {} } },
        // reset() focuses the player and the timecode handler seeks it;
        // the default stub carries neither method.
        PreviewPlayer: {
          props: ['fps', 'previews', 'readOnly'],
          template: '<div />',
          methods: { focus: () => {}, setCurrentFrame: () => {} }
        },
        // The default stub swallows its slot, which holds the panel title.
        RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        // Provided by the animxyz plugin, which the specs do not install.
        XyzTransitionGroup: { template: '<div><slot /></div>' },
        ...stubs
      },
      directives: { xyz: {} },
      plugins: [
        router,
        store,
        {
          install: app => {
            app.config.globalProperties.$socket = socket
          }
        }
      ]
    }
  })
  await flushPromises()
  return { wrapper, socket, store }
}

const dispatchedTypes = store => store.dispatch.mock.calls.map(([type]) => type)

describe('TaskInfo.vue', () => {
  describe('socket subscriptions', () => {
    it('subscribes to every task event on mount', async () => {
      const { socket } = await mountPanel()
      expect(socket.on.mock.calls.map(([event]) => event)).toEqual(
        SOCKET_EVENTS
      )
    })

    it('unsubscribes from the very same handlers on unmount', async () => {
      const { wrapper, socket } = await mountPanel()
      wrapper.unmount()
      // A handler left behind keeps a destroyed panel reacting to events.
      expect(socket.off.mock.calls).toEqual(socket.on.mock.calls)
    })
  })

  describe('task loading', () => {
    it('loads the comments of the task it displays', async () => {
      const { store } = await mountPanel()
      expect(store.dispatch).toHaveBeenCalledWith('loadTaskComments', {
        taskId: TASK_ID,
        entityId: ENTITY_ID
      })
    })

    it('loads nothing while the panel is silent', async () => {
      const { store } = await mountPanel({ props: { silent: true } })
      expect(dispatchedTypes(store)).not.toContain('loadTaskComments')
    })

    it('loads once the panel stops being silent', async () => {
      const { wrapper, store } = await mountPanel({ props: { silent: true } })
      await wrapper.setProps({ silent: false })
      expect(dispatchedTypes(store)).toContain('loadTaskComments')
    })

    it('reloads when it is handed another task', async () => {
      const { wrapper, store } = await mountPanel()
      await wrapper.setProps({ task: buildTask({ id: 'task-2' }) })
      await flushPromises()
      expect(store.dispatch).toHaveBeenCalledWith('loadTaskComments', {
        taskId: 'task-2',
        entityId: ENTITY_ID
      })
    })
  })

  describe('task loading failure', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('stops the spinner and reports the error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { wrapper, store } = await mountPanel({ props: { silent: true } })
      store.dispatch.mockImplementation(type =>
        type === 'loadTaskComments'
          ? Promise.reject(new Error('Request has been terminated'))
          : Promise.resolve()
      )

      await wrapper.setProps({ silent: false })
      await flushPromises()

      expect(wrapper.findComponent(Spinner).exists()).toBe(false)
      expect(wrapper.find('.no-comment').text()).toBe('main.loading_error')
    })
  })

  describe('entity selection', () => {
    const selectedConcepts = () =>
      new Map([
        ['concept-1', { id: 'concept-1', full_name: 'Concept' }],
        ['concept-2', { id: 'concept-2', full_name: 'Concept' }]
      ])

    it('counts the selected entities', async () => {
      const { wrapper } = await mountPanel({
        task: null,
        props: { entityType: 'Concept' },
        getterOverrides: { selectedConcepts }
      })
      expect(wrapper.find('h2').text()).toBe('tasks.selected_entities (2)')
    })

    it('lets the parent describe the selection', async () => {
      const { wrapper } = await mountPanel({
        task: null,
        props: { entityType: 'Concept' },
        getterOverrides: { selectedConcepts },
        slots: { selection: '<div class="custom-selection" />' }
      })
      expect(wrapper.find('.custom-selection').exists()).toBe(true)
      expect(wrapper.find('.entity-line').exists()).toBe(false)
    })
  })

  describe('title', () => {
    it('names the entity the task belongs to', async () => {
      const { wrapper } = await mountPanel()
      expect(wrapper.find('.header-title .title').text()).toBe('SH01')
    })

    it('prefers the full entity name when the entity carries one', async () => {
      const { wrapper } = await mountPanel({
        task: buildTask({ full_entity_name: 'SQ01 / SH01' })
      })
      expect(wrapper.find('.header-title .title').text()).toBe('SQ01 / SH01')
    })

    it('drops the entity link for a client', async () => {
      const { wrapper } = await mountPanel({
        getterOverrides: { isCurrentUserClient: () => true }
      })
      // Clients have no access to the entity page behind that link.
      expect(wrapper.find('.header-title .title').text()).toBe('SH01')
      expect(wrapper.find('.header-title .title a').exists()).toBe(false)
    })

    it('drops the entity link when the task carries no entity', async () => {
      const { wrapper } = await mountPanel({
        task: buildTask({ entity: undefined, entity_id: undefined })
      })
      // A link without an entity id has no route to resolve.
      expect(wrapper.find('.header-title .title').text()).toBe('SH01')
      expect(wrapper.find('.header-title .title a').exists()).toBe(false)
    })
  })

  describe('commenting permissions', () => {
    const canComment = wrapper => wrapper.findComponent(AddComment).exists()

    it('denies a plain artist', async () => {
      const { wrapper } = await mountPanel()
      expect(canComment(wrapper)).toBe(false)
    })

    it('allows an assignee', async () => {
      const { wrapper } = await mountPanel({
        task: buildTask({ assignees: [USER_ID] })
      })
      expect(canComment(wrapper)).toBe(true)
    })

    it('allows someone a reply mentions', async () => {
      const { wrapper } = await mountPanel({
        // Once a conversation is going, people get named in the replies.
        comments: [
          { id: 'comment-1', mentions: [], replies: [{ mentions: [USER_ID] }] }
        ]
      })
      expect(canComment(wrapper)).toBe(true)
    })

    it('allows someone whose department a comment mentions', async () => {
      const { wrapper } = await mountPanel({
        comments: [{ id: 'comment-1', department_mentions: ['department-1'] }],
        getterOverrides: {
          user: () => ({ id: USER_ID, departments: ['department-1'] })
        }
      })
      expect(canComment(wrapper)).toBe(true)
    })

    it('allows a client', async () => {
      const { wrapper } = await mountPanel({
        getterOverrides: { isCurrentUserClient: () => true }
      })
      expect(canComment(wrapper)).toBe(true)
    })

    it('allows a manager', async () => {
      const { wrapper } = await mountPanel({
        getterOverrides: { currentUserRoleForProduction: () => () => 'manager' }
      })
      expect(canComment(wrapper)).toBe(true)
    })

    it('reads the role from the production of the displayed task', async () => {
      // The panel also serves cross-production views, where the globally
      // selected production is not the one the task belongs to.
      const roles = { 'production-1': 'manager', 'production-2': 'user' }
      const { wrapper } = await mountPanel({
        getterOverrides: {
          currentProduction: () => ({
            id: 'production-2',
            team: [],
            task_types: []
          }),
          currentUserRoleForProduction: () => id => roles[id]
        }
      })
      expect(canComment(wrapper)).toBe(true)
    })
  })

  // The client sees the name and avatar of whoever answers a comment it is
  // shown: there, the production managers answer for the studio, and the
  // client once it is mentioned.
  describe('reply permissions', () => {
    const comments = [
      { id: 'internal', person: { id: 'author-1', role: 'supervisor' } },
      {
        id: 'for-client',
        for_client: true,
        person: { id: 'author-1', role: 'supervisor' }
      },
      { id: 'from-client', person: { id: 'client-1', role: 'client' } },
      {
        id: 'own-for-client',
        for_client: true,
        person: { id: USER_ID, role: 'user' }
      }
    ]

    const replyable = wrapper =>
      Object.fromEntries(
        wrapper
          .findAllComponents(Comment)
          .map(component => [
            component.props('comment').id,
            component.props('isReplyable')
          ])
      )

    it('keeps an assignee out of the client threads, its own included', async () => {
      const { wrapper } = await mountPanel({
        task: buildTask({ assignees: [USER_ID] }),
        comments
      })
      expect(replyable(wrapper)).toEqual({
        internal: true,
        'for-client': false,
        'from-client': false,
        'own-for-client': false
      })
    })

    // Zou reads the role the author holds on the production of the task,
    // which the team of that production carries.
    it('reads the role of the author from the production of the task', async () => {
      const teamRoles = {
        'production-1': { 'author-1': 'client', 'author-2': 'user' }
      }
      const { wrapper, store } = await mountPanel({
        task: buildTask({ assignees: [USER_ID] }),
        comments: [
          { id: 'from-client', person: { id: 'author-1', role: 'user' } },
          { id: 'from-artist', person: { id: 'author-2', role: 'client' } }
        ],
        getterOverrides: {
          teamRolesForProduction: () => id => teamRoles[id] || {}
        }
      })
      expect(store.dispatch).toHaveBeenCalledWith(
        'loadTeamRolesOnce',
        'production-1'
      )
      expect(replyable(wrapper)).toEqual({
        'from-client': false,
        'from-artist': true
      })
    })

    describe('as a client', () => {
      const mountAsClient = mentions =>
        mountPanel({
          comments: [
            { id: 'internal', person: { id: 'author-1', role: 'supervisor' } },
            {
              id: 'for-client',
              for_client: true,
              mentions,
              person: { id: 'author-1', role: 'supervisor' }
            },
            { id: 'own', person: { id: USER_ID, role: 'client' } }
          ],
          getterOverrides: {
            currentUserRoleForProduction: () => () => 'client',
            isCurrentUserArtist: () => false,
            isCurrentUserClient: () => true
          }
        })

      it('answers its own comments only', async () => {
        const { wrapper } = await mountAsClient([])
        expect(replyable(wrapper)).toEqual({
          internal: false,
          'for-client': false,
          own: true
        })
      })

      // An internal comment reaches the client emptied of its text: an
      // answer there would land in a thread the client never sees.
      it('answers the threads it sees once mentioned', async () => {
        const { wrapper } = await mountAsClient([USER_ID])
        expect(replyable(wrapper)).toEqual({
          internal: false,
          'for-client': true,
          own: true
        })
      })
    })

    it('lets a manager answer every thread', async () => {
      const { wrapper } = await mountPanel({
        comments,
        getterOverrides: { currentUserRoleForProduction: () => () => 'manager' }
      })
      expect(Object.values(replyable(wrapper))).toEqual([
        true,
        true,
        true,
        true
      ])
    })
  })

  describe('status lock', () => {
    const isStatusLocked = wrapper =>
      wrapper.findComponent(AddComment).props('isStatusLocked')

    it('locks the status for someone only mentioned', async () => {
      const { wrapper } = await mountPanel({
        comments: [{ id: 'comment-1', mentions: [USER_ID] }]
      })
      // They may answer, but the status stays where the assignees left it.
      expect(isStatusLocked(wrapper)).toBe(true)
    })

    it('leaves the status open to a mentioned assignee', async () => {
      const { wrapper } = await mountPanel({
        task: buildTask({ assignees: [USER_ID] }),
        comments: [{ id: 'comment-1', mentions: [USER_ID] }]
      })
      expect(isStatusLocked(wrapper)).toBe(false)
    })

    it('leaves the status open to a mentioned manager', async () => {
      const { wrapper } = await mountPanel({
        comments: [{ id: 'comment-1', mentions: [USER_ID] }],
        getterOverrides: { currentUserRoleForProduction: () => () => 'manager' }
      })
      expect(isStatusLocked(wrapper)).toBe(false)
    })
  })

  describe('fps', () => {
    const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]
    const playerFps = wrapper =>
      wrapper.findComponent(PreviewPlayer).props('fps')

    afterEach(() => {
      shotStore.cache.shotMap.delete(ENTITY_ID)
    })

    it('uses the production fps by default', async () => {
      const { wrapper } = await mountPanel({ previews })
      expect(playerFps(wrapper)).toBe(30)
    })

    it('lets the entity override the production fps', async () => {
      // The video was rendered at the entity rate; using the production one
      // would duplicate or drop frames in the player.
      shotStore.cache.shotMap.set(ENTITY_ID, {
        id: ENTITY_ID,
        data: { fps: '48' }
      })
      const { wrapper } = await mountPanel({ previews })
      expect(playerFps(wrapper)).toBe(48)
    })

    it('falls back to the default fps when the production declares none', async () => {
      const { wrapper } = await mountPanel({
        previews,
        getterOverrides: {
          productionMap: () => new Map([['production-1', {}]])
        }
      })
      expect(playerFps(wrapper)).toBe(DEFAULT_FPS)
    })
  })

  describe('preview player permissions', () => {
    const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]
    const isReadOnly = wrapper =>
      wrapper.findComponent(PreviewPlayer).props('readOnly')

    it('is read only for a plain artist', async () => {
      const { wrapper } = await mountPanel({ previews })
      expect(isReadOnly(wrapper)).toBe(true)
    })

    it('is writable for a manager', async () => {
      const { wrapper } = await mountPanel({
        previews,
        getterOverrides: { currentUserRoleForProduction: () => () => 'manager' }
      })
      expect(isReadOnly(wrapper)).toBe(false)
    })

    it('is writable for a client', async () => {
      const { wrapper } = await mountPanel({
        previews,
        getterOverrides: { isCurrentUserClient: () => true }
      })
      expect(isReadOnly(wrapper)).toBe(false)
    })

    it('is writable for the supervisor of the task department', async () => {
      const { wrapper } = await mountPanel({
        previews,
        getterOverrides: {
          currentUserRoleForProduction: () => () => 'supervisor',
          user: () => ({ id: USER_ID, departments: ['department-1'] })
        }
      })
      expect(isReadOnly(wrapper)).toBe(false)
    })

    it('is read only for the supervisor of another department', async () => {
      const { wrapper } = await mountPanel({
        previews,
        getterOverrides: {
          currentUserRoleForProduction: () => () => 'supervisor',
          user: () => ({ id: USER_ID, departments: ['department-2'] })
        }
      })
      expect(isReadOnly(wrapper)).toBe(true)
    })
  })

  describe('preview selection', () => {
    // Distinct nested previews make the selected revision observable through
    // the player props.
    const previews = [
      { id: 'preview-2', revision: 2, extension: 'mp4', previews: ['from-2'] },
      { id: 'preview-1', revision: 1, extension: 'mp4', previews: ['from-1'] }
    ]
    const player = wrapper => wrapper.findComponent(PreviewPlayer)

    it('shows the latest preview on load', async () => {
      const { wrapper } = await mountPanel({ previews })
      expect(player(wrapper).props('previews')).toEqual(['from-2'])
    })

    it('follows the preview the player switches to', async () => {
      const { wrapper } = await mountPanel({ previews })
      player(wrapper).vm.$emit('change-current-preview', previews[1])
      await flushPromises()
      expect(player(wrapper).props('previews')).toEqual(['from-1'])
    })

    it('shows no player at all while the task has no preview', async () => {
      const { wrapper } = await mountPanel()
      expect(player(wrapper).exists()).toBe(false)
      expect(wrapper.find('.no-preview').exists()).toBe(true)
    })
  })

  describe('timecode navigation', () => {
    const previews = [
      { id: 'preview-2', revision: 2, extension: 'mp4', previews: ['from-2'] },
      { id: 'preview-1', revision: 1, extension: 'mp4', previews: ['from-1'] }
    ]
    const comments = [{ id: 'comment-1', text: 'v1 00:04.00 (100)' }]

    const clickTimeCode = (wrapper, versionRevision) => {
      // The handler seeks the player on a timer, and the shallow player stub
      // has no seek method. Dropping the fake clock discards that callback.
      vi.useFakeTimers()
      wrapper
        .findComponent(Comment)
        .vm.$emit('time-code-clicked', { versionRevision, frame: 100 })
      vi.useRealTimers()
      return flushPromises()
    }

    it('opens the preview the timecode names', async () => {
      const { wrapper } = await mountPanel({ comments, previews })
      await clickTimeCode(wrapper, '1')
      expect(wrapper.findComponent(PreviewPlayer).props('previews')).toEqual([
        'from-1'
      ])
    })

    it('ignores a timecode whose revision is gone', async () => {
      const { wrapper } = await mountPanel({ comments, previews })
      // The revision is parsed out of the raw comment text, so it can name a
      // revision that was deleted or never existed.
      await clickTimeCode(wrapper, '9')
      expect(wrapper.findComponent(PreviewPlayer).props('previews')).toEqual([
        'from-2'
      ])
    })

    it('hands the timecode over to the parent outside preview mode', async () => {
      const { wrapper } = await mountPanel({
        comments,
        previews,
        props: { isPreview: false }
      })
      await clickTimeCode(wrapper, '1')
      // The playlist player owns the seek in that mode.
      expect(wrapper.emitted('time-code-clicked')).toHaveLength(1)
    })
  })

  describe('status changes', () => {
    it('marks the comments that moved the task status', async () => {
      const { wrapper } = await mountPanel({
        // Newest first, as the store returns them.
        comments: [
          { id: 'comment-3', task_status_id: 'wip' },
          { id: 'comment-2', task_status_id: 'wip' },
          { id: 'comment-1', task_status_id: 'todo' }
        ]
      })
      const isChange = wrapper
        .findAllComponents(Comment)
        .map(comment => comment.props('isChange'))
      // The oldest comment always counts as a change, the middle one moved
      // the status, and the newest left it untouched.
      expect(isChange).toEqual([false, true, true])
    })
  })

  describe('comment actions', () => {
    const comments = [
      { id: 'comment-1', task_status_id: 'wip' },
      { id: 'comment-2', task_status_id: 'wip' }
    ]

    const emitOn = (wrapper, comment, event) =>
      wrapper
        .findAllComponents(Comment)
        .find(component => component.props('comment').id === comment.id)
        .vm.$emit(event, comment)

    const failAck = async (wrapper, store, comment) => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      store.dispatch.mockImplementationOnce(() =>
        Promise.reject(new Error('Request has been terminated'))
      )
      emitOn(wrapper, comment, 'ack-comment')
      await flushPromises()
    }

    const actionErrors = wrapper =>
      wrapper
        .findAllComponents(Comment)
        .map(component => component.props('isActionError'))

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it.each([
      ['ack-comment', 'ackComment'],
      ['pin-comment', 'pinComment'],
      ['toggle-for-client', 'toggleCommentForClient']
    ])('logs a failed %s', async (event, action) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = new Error('Request has been terminated')
      const { wrapper, store } = await mountPanel({ comments })
      store.dispatch.mockImplementation(type =>
        type === action ? Promise.reject(error) : Promise.resolve()
      )

      emitOn(wrapper, comments[0], event)
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith(action, comments[0])
      expect(consoleError).toHaveBeenCalledWith(error)
    })

    it('leaves the edited comment it is handed untouched', async () => {
      const { wrapper, store } = await mountPanel({ comments })
      const edited = {
        id: 'comment-1',
        text: 'Retake the pose',
        attachmentFilesToDelete: [],
        newAttachmentFiles: []
      }

      wrapper.findComponent(EditCommentModal).vm.$emit('confirm', edited)
      await flushPromises()

      expect(edited).toHaveProperty('newAttachmentFiles')
      expect(store.dispatch).toHaveBeenCalledWith('editTaskComment', {
        taskId: TASK_ID,
        comment: { id: 'comment-1', text: 'Retake the pose' }
      })
    })

    it('flags the comment whose action failed', async () => {
      const { wrapper, store } = await mountPanel({ comments })
      await failAck(wrapper, store, comments[1])
      expect(actionErrors(wrapper)).toEqual([false, true])
    })

    it('clears the flag on the next action', async () => {
      const { wrapper, store } = await mountPanel({ comments })
      await failAck(wrapper, store, comments[1])

      emitOn(wrapper, comments[0], 'pin-comment')
      await flushPromises()

      expect(actionErrors(wrapper)).toEqual([false, false])
    })

    it('clears the flag when it is handed another task', async () => {
      const { wrapper, store } = await mountPanel({ comments })
      await failAck(wrapper, store, comments[1])

      // The stubbed getter hands the same comments to the new task.
      await wrapper.setProps({ task: buildTask({ id: 'task-2' }) })
      await flushPromises()

      expect(actionErrors(wrapper)).toEqual([false, false])
    })
  })

  describe('public interface', () => {
    it('lets a parent focus the comment box', async () => {
      const focus = vi.fn()
      const { wrapper } = await mountPanel({
        task: buildTask({ assignees: [USER_ID] }),
        stubs: { AddComment: { template: '<div />', methods: { focus } } }
      })
      // A script setup component exposes nothing unless it says so, and the
      // parents drive this one through a template ref.
      wrapper.vm.focusCommentTextarea()
      expect(focus).toHaveBeenCalled()
    })
  })

  describe('publishing', () => {
    const previewForm = name => {
      const form = new FormData()
      form.append('file', new File(['frame'], name))
      return form
    }

    const mountCommentingPanel = async ({
      previews = [],
      getterOverrides = {}
    } = {}) => {
      const reset = vi.fn()
      const mounted = await mountPanel({
        previews,
        // A manager comments on every task the panel shows.
        getterOverrides: {
          currentUserRoleForProduction: () => () => 'manager',
          ...getterOverrides
        },
        stubs: {
          AddComment: {
            props: ['previewForms'],
            template: '<div />',
            methods: { focus: () => {}, reset }
          }
        }
      })
      return { ...mounted, reset }
    }

    const commentBox = wrapper => wrapper.findComponent(AddComment)

    const publish = async wrapper => {
      commentBox(wrapper).vm.$emit('add-comment', 'Done', [], [], 'status-1')
      await flushPromises()
    }

    it('publishes the files of its comment box with the comment', async () => {
      const { wrapper, store } = await mountCommentingPanel()
      const form = previewForm('sh010.mp4')

      commentBox(wrapper).vm.$emit('file-drop', [form])
      await publish(wrapper)

      expect(store.dispatch).toHaveBeenCalledWith(
        'commentTaskWithPreview',
        expect.objectContaining({ taskId: TASK_ID, forms: [form] })
      )
    })

    // The extra preview modal may upload at the same time.
    it('clears the progress of the published files only', async () => {
      const { wrapper, store } = await mountCommentingPanel()

      commentBox(wrapper).vm.$emit('file-drop', [previewForm('sh010.mp4')])
      await publish(wrapper)

      expect(store.commit).toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS', [
        'sh010.mp4'
      ])
      expect(store.commit).not.toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS')
    })

    // The extra preview modal uploads its own files: the comment box keeps
    // what it holds, and a refused file never lands in it.
    describe('beside an extra preview', () => {
      const extraModal = wrapper =>
        wrapper.findComponent({ ref: 'add-extra-preview-modal' })
      const boxFiles = wrapper =>
        commentBox(wrapper)
          .props('previewForms')
          .map(form => form.get('file').name)

      let consoleError = null

      afterEach(() => {
        consoleError?.mockRestore()
        consoleError = null
      })

      it('keeps the comment box files when the modal opens', async () => {
        const previews = [
          { id: 'preview-1', revision: 1, extension: 'mp4', previews: [] }
        ]
        const { wrapper, store } = await mountCommentingPanel({ previews })
        const form = previewForm('sh010.mp4')
        commentBox(wrapper).vm.$emit('file-drop', [form])
        store.commit.mockClear()

        wrapper.findComponent(PreviewPlayer).vm.$emit('add-extra-preview')
        await flushPromises()

        expect(boxFiles(wrapper)).toEqual(['sh010.mp4'])
        // The bars of a publication in progress keep their values.
        expect(store.commit).not.toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS')
      })

      it('shows its upload progress in the modal', async () => {
        const uploadProgress = { 'sh010-alt.png': 30 }
        const { wrapper } = await mountCommentingPanel({
          getterOverrides: { uploadProgress: () => uploadProgress }
        })

        expect(extraModal(wrapper).vm.$attrs['upload-progress']).toEqual(
          uploadProgress
        )
      })

      it('keeps the comment box files once the extra preview is added', async () => {
        const { wrapper, store } = await mountCommentingPanel()
        const form = previewForm('sh010.mp4')
        commentBox(wrapper).vm.$emit('file-drop', [form])
        store.commit.mockClear()

        extraModal(wrapper).vm.$emit('confirm', [previewForm('sh010-alt.png')])
        await flushPromises()

        expect(boxFiles(wrapper)).toEqual(['sh010.mp4'])
        // The upload clears the progress of its own files.
        expect(store.commit).not.toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS')
      })

      it('keeps a refused extra preview out of the comment box', async () => {
        const { wrapper, store } = await mountCommentingPanel()
        const refusal = new Error('Request Entity Too Large')
        store.dispatch.mockImplementation(type =>
          type === 'addCommentExtraPreview'
            ? Promise.reject(refusal)
            : Promise.resolve()
        )
        consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})

        extraModal(wrapper).vm.$emit('confirm', [previewForm('sh010-alt.png')])
        await flushPromises()

        expect(boxFiles(wrapper)).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(refusal)
      })
    })

    it('uploads the files of the extra preview modal', async () => {
      const { wrapper, store } = await mountCommentingPanel()
      const form = previewForm('sh010-alt.png')

      wrapper
        .findComponent({ ref: 'add-extra-preview-modal' })
        .vm.$emit('confirm', [form])
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith(
        'addCommentExtraPreview',
        expect.objectContaining({ taskId: TASK_ID, forms: [form] })
      )
    })

    describe('once the upload ends', () => {
      afterEach(() => localStorage.clear())

      it('empties the comment box of the published task', async () => {
        const { wrapper, reset } = await mountCommentingPanel()
        drafts.setTaskDraft(TASK_ID, { text: 'Done' })

        commentBox(wrapper).vm.$emit('file-drop', [previewForm('sh010.mp4')])
        await publish(wrapper)

        expect(commentBox(wrapper).props('previewForms')).toEqual([])
        expect(reset).toHaveBeenCalled()
        expect(drafts.getTaskDraft(TASK_ID)).toBeNull()
      })

      it('leaves alone the comment box of the task shown since', async () => {
        const { wrapper, store, reset } = await mountCommentingPanel()
        let endUpload
        store.dispatch.mockImplementation(type =>
          type === 'commentTaskWithPreview'
            ? new Promise(resolve => {
                endUpload = resolve
              })
            : Promise.resolve()
        )
        const otherTask = buildTask({ id: 'task-2' })
        drafts.setTaskDraft(TASK_ID, { text: 'Done' })
        drafts.setTaskDraft(otherTask.id, { text: 'Lighting fixed' })

        commentBox(wrapper).vm.$emit('file-drop', [previewForm('sh010.mp4')])
        await publish(wrapper)
        await wrapper.setProps({ task: otherTask })
        await flushPromises()
        const otherForm = previewForm('sh020.mp4')
        commentBox(wrapper).vm.$emit('file-drop', [otherForm])
        endUpload()
        await flushPromises()

        expect(commentBox(wrapper).props('previewForms')).toEqual([otherForm])
        expect(reset).not.toHaveBeenCalled()
        expect(drafts.getTaskDraft(TASK_ID)).toBeNull()
        expect(drafts.getTaskDraft(otherTask.id)).toEqual({
          text: 'Lighting fixed',
          checklist: []
        })
      })
    })
  })

  // Zou may still build the files of a preview another user adds.
  describe('preview-file:add-file', () => {
    const emitPreviewAdded = socket => {
      const [, onPreviewAdded] = socket.on.mock.calls.find(
        ([event]) => event === 'preview-file:add-file'
      )
      onPreviewAdded({
        task_id: TASK_ID,
        comment_id: 'comment-1',
        preview_file_id: 'preview-2',
        revision: 2,
        extension: 'png',
        status: 'processing'
      })
    }

    it('keeps the status of a preview another user adds', async () => {
      const comment = { id: 'comment-1', previews: [] }
      const { socket, store } = await mountPanel({
        getterOverrides: { getTaskComment: () => () => comment }
      })

      emitPreviewAdded(socket)

      expect(store.commit).toHaveBeenCalledWith(
        'ADD_PREVIEW_END',
        expect.objectContaining({
          preview: expect.objectContaining({
            id: 'preview-2',
            status: 'processing'
          })
        })
      )
      expect(store.dispatch).toHaveBeenCalledWith(
        'registerPreviewFileStatuses',
        [{ id: 'preview-2', status: 'processing' }]
      )
      // A ready status the store learnt first must reach the copy
      // ADD_PREVIEW_END makes.
      const callOrder = (mock, name) =>
        mock.mock.invocationCallOrder[
          mock.mock.calls.findIndex(([type]) => type === name)
        ]
      expect(
        callOrder(store.dispatch, 'registerPreviewFileStatuses')
      ).toBeGreaterThan(callOrder(store.commit, 'ADD_PREVIEW_END'))
    })

    // Zou announces the new preview with 'comment:update' before
    // 'preview-file:add-file': the comment reloaded in between lists it
    // by its bare ID.
    it('adds a preview its reloaded comment already lists', async () => {
      const comment = { id: 'comment-1', previews: [{ id: 'preview-2' }] }
      const { socket, store } = await mountPanel({
        getterOverrides: { getTaskComment: () => () => comment }
      })

      emitPreviewAdded(socket)

      expect(store.commit).toHaveBeenCalledWith(
        'ADD_PREVIEW_END',
        expect.objectContaining({
          preview: expect.objectContaining({ id: 'preview-2', revision: 2 })
        })
      )
    })

    // The uploader's session adds its previews itself, the event can come
    // after.
    it('skips a preview the task previews already hold', async () => {
      const head = {
        id: 'preview-1',
        revision: 2,
        previews: [{ id: 'preview-1' }, { id: 'preview-2' }]
      }
      const comment = { id: 'comment-1', previews: [head] }
      const { socket, store } = await mountPanel({
        previews: [head],
        getterOverrides: { getTaskComment: () => () => comment }
      })

      emitPreviewAdded(socket)

      expect(store.commit).not.toHaveBeenCalledWith(
        'ADD_PREVIEW_END',
        expect.anything()
      )
      expect(store.dispatch).not.toHaveBeenCalledWith(
        'registerPreviewFileStatuses',
        expect.anything()
      )
    })
  })

  // Zou sends every comment update to every open tab, whatever the
  // production. App.vue reloads the comment of a task the event names;
  // older Zou versions leave the task out of the preview events.
  describe('comment:update', () => {
    const shownComment = { id: 'comment-1', previews: [] }
    const emitCommentUpdate = (socket, eventData) => {
      const [, onRemoteCommentUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'comment:update'
      )
      onRemoteCommentUpdate(eventData)
    }
    const reloads = store =>
      store.dispatch.mock.calls.filter(([type]) => type === 'loadComment')

    it('reloads a comment it shows when the event names no task', async () => {
      const { socket, store } = await mountPanel({ comments: [shownComment] })
      emitCommentUpdate(socket, { comment_id: shownComment.id })
      expect(reloads(store)).toEqual([
        ['loadComment', { commentId: shownComment.id }]
      ])
    })

    // An artist may not read the comments of the other productions.
    it('leaves alone the comments it does not show', async () => {
      const { socket, store } = await mountPanel({ comments: [shownComment] })
      emitCommentUpdate(socket, { comment_id: 'comment-of-another-task' })
      expect(reloads(store)).toEqual([])
    })

    it('leaves to App.vue a comment whose task the event names', async () => {
      const { socket, store } = await mountPanel({ comments: [shownComment] })
      emitCommentUpdate(socket, {
        comment_id: shownComment.id,
        task_id: TASK_ID
      })
      expect(reloads(store)).toEqual([])
    })

    it('waits for the end of the preview upload of the user', async () => {
      const { socket, store } = await mountPanel({
        comments: [shownComment],
        getterOverrides: { isSavingCommentPreview: () => true }
      })
      emitCommentUpdate(socket, { comment_id: shownComment.id })
      expect(reloads(store)).toEqual([])
    })

    it('leaves a bug in the reload to Sentry', async () => {
      const bug = new TypeError('Cannot read properties of undefined')
      const { socket, store } = await mountPanel({ comments: [shownComment] })
      store.dispatch.mockImplementation(type =>
        type === 'loadComment' ? Promise.reject(bug) : Promise.resolve()
      )

      const rejections = await recordUnhandledRejections(() =>
        emitCommentUpdate(socket, { comment_id: shownComment.id })
      )

      expect(rejections).toEqual([bug])
    })
  })

  describe('preview-file:update', () => {
    const emitPreviewFileUpdate = async (socket, eventData) => {
      const [, onRemotePreviewUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'preview-file:update'
      )
      onRemotePreviewUpdate(eventData)
      await flushPromises()
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('logs a refresh that fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = new Error('Request has been terminated')
      const comment = {
        id: 'comment-1',
        text: 'v1',
        previews: [{ id: 'preview-1', revision: 1, status: 'processing' }]
      }
      const { socket, store } = await mountPanel({ comments: [comment] })
      store.dispatch = vi.fn(type =>
        type === 'refreshPreview' ? Promise.reject(error) : Promise.resolve()
      )

      await emitPreviewFileUpdate(socket, { preview_file_id: 'preview-1' })

      expect(consoleError).toHaveBeenCalledWith(error)
    })

    it('updates a preview that is not first in the comment, a second or third bulk-upload image', async () => {
      // A comment carrying several previews of the same revision (the
      // bulk-upload case): only previews[0] used to be looked up, so a
      // later one flipping from "processing" to "ready" never refreshed.
      const previews = [
        { id: 'preview-1', revision: 1, status: 'ready' },
        { id: 'preview-2', revision: 1, status: 'processing' },
        { id: 'preview-3', revision: 1, status: 'processing' }
      ]
      const comment = { id: 'comment-1', text: 'v1', previews }
      const { socket, store } = await mountPanel({
        comments: [comment],
        previews: [previews[0]]
      })
      store.dispatch = vi.fn(type => {
        if (type === 'refreshPreview') {
          return Promise.resolve({ validation_status: 'wip', status: 'ready' })
        }
        return Promise.resolve()
      })

      await emitPreviewFileUpdate(socket, { preview_file_id: 'preview-3' })

      expect(previews[2].status).toBe('ready')
      expect(previews[2].validation_status).toBe('wip')
      // Untouched: only the preview named by the event is refreshed.
      expect(previews[0].status).toBe('ready')
      expect(previews[1].status).toBe('processing')
    })

    it('does nothing when no comment carries the named preview', async () => {
      const comment = {
        id: 'comment-1',
        text: 'v1',
        previews: [{ id: 'preview-1', revision: 1, status: 'ready' }]
      }
      const { socket, store } = await mountPanel({ comments: [comment] })
      store.dispatch = vi.fn(type => {
        if (type === 'refreshPreview') return Promise.resolve({})
        return Promise.resolve()
      })

      await emitPreviewFileUpdate(socket, {
        preview_file_id: 'unknown-preview'
      })

      expect(store.dispatch).not.toHaveBeenCalledWith(
        'refreshPreview',
        expect.anything()
      )
    })
  })

  describe('player requests', () => {
    const previews = [
      { id: 'preview-1', revision: 1, extension: 'mp4', previews: ['p-1'] }
    ]
    // The shallow stub carries none of the player members the panel reads.
    const PlayerStub = {
      props: ['fps', 'previews', 'readOnly'],
      template: '<div />',
      data: () => ({
        currentPreview: { id: 'preview-1', task_id: TASK_ID },
        notSaved: false
      }),
      methods: {
        focus: () => {},
        setCurrentFrame: () => {},
        isValidPreviewModification: () => true
      }
    }
    const error = new Error('Request has been terminated')

    afterEach(() => {
      vi.restoreAllMocks()
    })

    // The player takes a while over the snapshots, and the panel can close
    // meanwhile: its comment box is gone when they come back.
    it('drops the snapshots that come back once the panel is closed', async () => {
      let returnSnapshots = null
      const { wrapper } = await mountPanel({
        previews,
        // A manager comments on every task the panel shows.
        getterOverrides: {
          currentUserRoleForProduction: () => () => 'manager'
        },
        stubs: {
          AddComment: {
            template: '<div />',
            methods: {
              hideAnnotationLoading: () => {},
              setAnnotationSnapshots: () => {},
              showAnnotationLoading: () => {}
            }
          },
          PreviewPlayer: {
            ...PlayerStub,
            methods: {
              ...PlayerStub.methods,
              extractAnnotationSnapshots: () =>
                new Promise(resolve => {
                  returnSnapshots = resolve
                })
            }
          }
        }
      })
      const errorHandler = vi.fn()
      wrapper.vm.$.appContext.config.errorHandler = errorHandler

      wrapper
        .findComponent(AddComment)
        .vm.$emit('annotation-snapshots-requested')
      wrapper.unmount()
      returnSnapshots([])
      await flushPromises()

      expect(errorHandler).not.toHaveBeenCalled()
    })

    it('logs an annotation refresh that fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { socket, store } = await mountPanel({
        previews,
        stubs: { PreviewPlayer: PlayerStub }
      })
      store.dispatch = vi.fn(type =>
        type === 'refreshPreview' ? Promise.reject(error) : Promise.resolve()
      )
      const [, onRemoteAnnotationUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'preview-file:annotation-update'
      )

      onRemoteAnnotationUpdate({
        preview_file_id: 'preview-1',
        updated_at: '2026-10-01T10:00:00'
      })
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith('refreshPreview', {
        previewId: 'preview-1',
        taskId: TASK_ID
      })
      expect(consoleError).toHaveBeenCalledWith(error)
    })

    it('logs a thumbnail that fails to save', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { wrapper, store } = await mountPanel({
        previews,
        props: { withActions: true },
        getterOverrides: { nbSelectedTasks: () => 1 },
        stubs: { PreviewPlayer: PlayerStub }
      })
      store.dispatch = vi.fn(type =>
        type === 'setPreview' ? Promise.reject(error) : Promise.resolve()
      )
      const actionPanel = wrapper.findComponent(ActionPanel)

      actionPanel.vm.$emit('set-frame-thumbnail', false)
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith(
        'setPreview',
        expect.objectContaining({ previewId: 'preview-1' })
      )
      expect(consoleError).toHaveBeenCalledWith(error)
      expect(actionPanel.props('isSetFrameThumbnailLoading')).toBe(false)
    })
  })
})
