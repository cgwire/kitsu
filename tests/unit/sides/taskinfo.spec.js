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
import PreviewPlayer from '@/components/players/players/PreviewPlayer.vue'
import AddComment from '@/components/widgets/AddComment.vue'
import Comment from '@/components/widgets/Comment.vue'
import { DEFAULT_FPS } from '@/lib/video'
import shotStore from '@/store/modules/shots'

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
  previews = []
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
})
