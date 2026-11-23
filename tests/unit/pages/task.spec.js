import { useHead } from '@unhead/vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// jsdom has no layout engine, and the page scrolls its column on mount.
window.scrollTo = vi.fn()

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid a circular-import race from child components.
import '@/lib/auth'

import Task from '@/components/pages/Task.vue'
import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import AddComment from '@/components/widgets/AddComment.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import Comment from '@/components/widgets/Comment.vue'
import PreviewPlayer from '@/components/players/players/PreviewPlayer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import SubscribeButton from '@/components/widgets/SubscribeButton.vue'
import drafts from '@/lib/drafts'
import { markRequestFailure } from '@/lib/errors'
import { DEFAULT_FPS } from '@/lib/video'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'
import tasksStore from '@/store/modules/tasks'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'
import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

// The ten events the page used to declare through the `socket` component
// option, which `<script setup>` cannot express.
const SOCKET_EVENTS = [
  'preview-file:add-file',
  'preview-file:update',
  'preview-file:annotation-update',
  'comment:acknowledge',
  'comment:unacknowledge',
  'comment:new',
  'comment:update',
  'comment:reply',
  'comment:delete',
  'comment:delete-reply'
]

const TASK_ID = 'task-1'
const TASK_ROUTE_PARAMS = {
  production_id: 'production-1',
  type: 'shots',
  task_id: TASK_ID
}
const taskType = {
  id: 'task-type-1',
  name: 'Animation',
  for_entity: 'Shot',
  department_id: null
}

const buildTask = (overrides = {}) => ({
  id: TASK_ID,
  entity_id: 'entity-1',
  entity_type_name: 'Shot',
  entity_name: 'SH01',
  task_type_id: taskType.id,
  project_id: 'production-1',
  assignees: [],
  entity: { id: 'entity-1' },
  data: {},
  ...overrides
})

const mountPage = async ({
  task = buildTask(),
  getterOverrides = {},
  comments = [],
  previews = [],
  // Leave the task load hanging: the page then mounts with no task at all.
  pendingTaskLoad = false,
  // The revision the URL names when the page opens.
  previewId = null,
  // The episode the URL names when the page opens, on a TV show.
  episodeId = null,
  // Answers of store actions, by name, in place of the defaults below.
  actions = {},
  stubs = {}
} = {}) => {
  const dispatched = []
  const socket = { on: vi.fn(), off: vi.fn() }

  const router = createRouter({
    history: createMemoryHistory(),
    // Same param shape as the real routes: the page builds its own targets
    // through getTaskPath, and params the route does not declare get dropped.
    routes: [
      { path: '/', name: 'open-productions', component: { template: '<div />' } },
      {
        path: '/productions/:production_id/:type/tasks/:task_id',
        name: 'task',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/:type/tasks/:task_id/previews/:preview_id',
        name: 'task-preview',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/episodes/:episode_id/:type/tasks/:task_id',
        name: 'episode-task',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/episodes/:episode_id/:type/tasks/:task_id/previews/:preview_id',
        name: 'episode-task-preview',
        component: { template: '<div />' }
      }
    ]
  })
  const params = episodeId
    ? { ...TASK_ROUTE_PARAMS, episode_id: episodeId }
    : TASK_ROUTE_PARAMS
  const name = episodeId ? 'episode-task' : 'task'
  await router.push(
    previewId
      ? { name: `${name}-preview`, params: { ...params, preview_id: previewId } }
      : { name, params }
  )
  await router.isReady()

  const store = createStore({
    getters: {
      assetMap: () => new Map(),
      currentEpisode: () => null,
      currentProduction: () => ({
        id: 'production-1',
        team: [],
        task_types: [taskType.id],
        fps: 25
      }),
      dateFormat: () => 'dd/MM/yyyy',
      editMap: () => new Map(),
      episodeMap: () => new Map(),
      getTaskComment: () => () => null,
      getTaskComments: () => () => comments,
      getTaskPreviews: () => () => previews,
      isCurrentUserArtist: () => false,
      isCurrentUserClient: () => false,
      isCurrentUserProductionManager: () => false,
      isCurrentUserProductionSupervisor: () => false,
      isTVShow: () => false,
      organisation: () => ({ format_duration_in_hours: false }),
      personMap: () => new Map(),
      productionMap: () => new Map([['production-1', { fps: 30 }]]),
      sequenceMap: () => new Map(),
      shotMap: () => new Map(),
      taskEntityPreviews: () => [],
      taskMap: () =>
        new Map(task && !pendingTaskLoad ? [[task.id, task]] : []),
      taskMetadataDescriptors: () => [],
      taskStatusForCurrentUser: () => null,
      taskTypeMap: () => new Map([[taskType.id, taskType]]),
      teamRolesForProduction: () => () => ({}),
      user: () => ({ id: 'user-1', departments: [] }),
      ...getterOverrides
    }
  })
  // Record every dispatch while letting the unregistered ones resolve.
  store.dispatch = vi.fn((type, payload) => {
    dispatched.push(type)
    if (actions[type]) return actions[type](payload)
    if (type === 'loadTask') {
      return pendingTaskLoad ? new Promise(() => {}) : Promise.resolve(task)
    }
    return Promise.resolve()
  })
  store.commit = vi.fn()

  const wrapper = shallowMount(Task, {
    global: {
      stubs: {
        // reset() runs on every page reset; the default stub has no such
        // method and the resulting throw would cut the reset short.
        AddPreviewModal: { template: '<div />', methods: { reset: () => {} } },
        // The default stub swallows its slot, which holds the page title.
        RouterLink: {
          props: ['to'],
          template:
            '<a :data-task="to?.params?.task_id" :data-episode="to?.params?.episode_id"><slot /></a>'
        },
        // The shallow stub drops the modals the player opens: they stay in
        // the page, or go into the player in full screen.
        teleport: false,
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
  return { wrapper, socket, dispatched, store, router }
}

// The revision list of the page, above the player.
const previewCombo = wrapper =>
  wrapper
    .findAllComponents(ComboboxStyled)
    .find(combo => combo.classes().includes('preview-combo'))

const pickInPageList = async (wrapper, previewId) => {
  previewCombo(wrapper).vm.$emit('update:modelValue', previewId)
  await flushPromises()
}

// The handler seeks the player on a timer, and the shallow player stub has
// no seek method. Dropping the fake clock discards that pending callback.
const clickTimeCode = async (wrapper, versionRevision) => {
  vi.useFakeTimers()
  try {
    wrapper
      .findComponent(Comment)
      .vm.$emit('time-code-clicked', { versionRevision, frame: 100 })
  } finally {
    vi.useRealTimers()
  }
  await flushPromises()
}

// The handler waits a second for the store to load the comment.
const emitCommentNew = async (socket, taskId) => {
  const [, onCommentNew] = socket.on.mock.calls.find(
    ([event]) => event === 'comment:new'
  )
  vi.useFakeTimers()
  try {
    onCommentNew({ comment_id: 'comment-1', task_id: taskId })
    vi.advanceTimersByTime(1000)
  } finally {
    vi.useRealTimers()
  }
  await flushPromises()
}

describe('Task.vue', () => {
  describe('socket subscriptions', () => {
    it('subscribes to every task event on mount', async () => {
      const { socket } = await mountPage()
      const subscribed = socket.on.mock.calls.map(([event]) => event)
      expect(subscribed).toEqual(expect.arrayContaining(SOCKET_EVENTS))
      expect(subscribed).toHaveLength(SOCKET_EVENTS.length)
    })

    it('unsubscribes the very same handlers on unmount', async () => {
      const { wrapper, socket } = await mountPage()
      expect(socket.off).not.toHaveBeenCalled()

      wrapper.unmount()

      // Passing a different function reference would leave the listener
      // attached, so compare the pairs rather than just the event names.
      expect(socket.off.mock.calls).toEqual(socket.on.mock.calls)
    })
  })

  describe('entity type driven loading', () => {
    it('loads shots for a shot task', async () => {
      const { dispatched } = await mountPage()
      expect(dispatched).toContain('loadShots')
      expect(dispatched).not.toContain('loadAssets')
    })

    it('loads assets for a task on any other entity type', async () => {
      const { dispatched } = await mountPage({
        task: buildTask({ entity_type_name: 'Concept' })
      })
      expect(dispatched).toContain('loadAssets')
      expect(dispatched).not.toContain('loadShots')
    })

    it('loads episodes for an episode task', async () => {
      const { dispatched } = await mountPage({
        task: buildTask({ entity_type_name: 'Episode' })
      })
      expect(dispatched).toContain('loadEpisodes')
    })

    it('clears the task selection on mount', async () => {
      const { dispatched } = await mountPage()
      expect(dispatched).toContain('clearSelectedTasks')
    })
  })

  describe('title', () => {
    it('shows the entity name', async () => {
      const { wrapper } = await mountPage()
      expect(wrapper.find('h1.title').text()).toContain('SH01')
    })

    it('strips the episode segment of a shot name on a TV show', async () => {
      const { wrapper } = await mountPage({
        task: buildTask({ full_entity_name: 'E01/SQ01/SH01' }),
        getterOverrides: { isTVShow: () => true }
      })
      expect(wrapper.find('h1.title').text()).toContain('SQ01/SH01')
      expect(wrapper.find('h1.title').text()).not.toContain('E01')
    })
  })

  describe('commenting permissions', () => {
    it('hides the comment form for an unrelated artist', async () => {
      const { wrapper } = await mountPage()
      expect(wrapper.findComponent(AddComment).exists()).toBe(false)
    })

    it('shows the comment form to someone mentioned in a reply', async () => {
      const { wrapper } = await mountPage({
        comments: [
          {
            id: 'comment-1',
            mentions: [],
            replies: [{ id: 'reply-1', mentions: ['user-1'] }]
          }
        ]
      })
      expect(wrapper.findComponent(AddComment).exists()).toBe(true)
    })

    it('locks the status when the user is only mentioned, not assigned', async () => {
      const { wrapper } = await mountPage({
        comments: [{ id: 'comment-1', mentions: ['user-1'], replies: [] }]
      })
      expect(wrapper.findComponent(AddComment).props('isStatusLocked')).toBe(
        true
      )
    })

    it('leaves the status unlocked for an assignee', async () => {
      const { wrapper } = await mountPage({
        task: buildTask({ assignees: ['user-1'] })
      })
      expect(wrapper.findComponent(AddComment).props('isStatusLocked')).toBe(
        false
      )
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
        person: { id: 'user-1', role: 'user' }
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
      const { wrapper } = await mountPage({
        task: buildTask({ assignees: ['user-1'] }),
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
      const { wrapper, store } = await mountPage({
        task: buildTask({ assignees: ['user-1'] }),
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
        mountPage({
          comments: [
            { id: 'internal', person: { id: 'author-1', role: 'supervisor' } },
            {
              id: 'for-client',
              for_client: true,
              mentions,
              person: { id: 'author-1', role: 'supervisor' }
            },
            { id: 'own', person: { id: 'user-1', role: 'client' } }
          ],
          getterOverrides: { isCurrentUserClient: () => true }
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
        const { wrapper } = await mountAsClient(['user-1'])
        expect(replyable(wrapper)).toEqual({
          internal: false,
          'for-client': true,
          own: true
        })
      })

      it('answers the clients of its studio', async () => {
        const { wrapper } = await mountPage({
          comments: [
            {
              id: 'same-studio',
              person: { id: 'client-2', role: 'client', studio_id: 'studio-1' }
            }
          ],
          getterOverrides: {
            isCurrentUserClient: () => true,
            user: () => ({ id: 'user-1', departments: [], studio_id: 'studio-1' })
          }
        })
        expect(replyable(wrapper)).toEqual({ 'same-studio': true })
      })
    })

    it('lets a manager answer every thread', async () => {
      const { wrapper } = await mountPage({
        comments,
        getterOverrides: { isCurrentUserProductionManager: () => true }
      })
      expect(Object.values(replyable(wrapper))).toEqual([
        true,
        true,
        true,
        true
      ])
    })
  })

  describe('task metadata', () => {
    const descriptor = {
      id: 'descriptor-1',
      name: 'Difficulty',
      field_name: 'difficulty',
      data_type: 'boolean',
      task_type_id: taskType.id
    }

    it('renders a boolean descriptor through its translation key', async () => {
      const { wrapper } = await mountPage({
        task: buildTask({ data: { difficulty: 'true' } }),
        getterOverrides: { taskMetadataDescriptors: () => [descriptor] }
      })
      expect(wrapper.text()).toContain('main.yes')
    })

    it('keeps a descriptor of another task type out of the table', async () => {
      const { wrapper } = await mountPage({
        task: buildTask({ data: { difficulty: 'true' } }),
        getterOverrides: {
          taskMetadataDescriptors: () => [
            { ...descriptor, task_type_id: 'task-type-2' }
          ]
        }
      })
      expect(wrapper.text()).not.toContain('Difficulty')
    })

    describe('url', () => {
      const mountWithUrl = reference =>
        mountPage({
          task: buildTask({ data: { reference } }),
          getterOverrides: {
            taskMetadataDescriptors: () => [
              {
                ...descriptor,
                name: 'Reference',
                field_name: 'reference',
                data_type: 'url'
              }
            ]
          }
        })

      it('links the url in a new tab', async () => {
        const { wrapper } = await mountWithUrl('https://example.com/ref')
        const link = wrapper.find('.info-block a[target="_blank"]')
        expect(link.attributes('href')).toBe('https://example.com/ref')
      })

      it('shows an unsafe scheme as text', async () => {
        const { wrapper } = await mountWithUrl('javascript:alert(1)')
        const block = wrapper.find('.info-block')
        expect(block.find('a[target="_blank"]').exists()).toBe(false)
        expect(block.text()).toContain('javascript:alert(1)')
      })
    })
  })
})

describe('Task.vue task that fails to load', () => {
  const OTHER_TASK_ID = 'task-2'
  const otherTask = () => buildTask({ id: OTHER_TASK_ID, entity_name: 'SH02' })

  const headerTitle = wrapper => wrapper.find('.page-header h1.title').text()
  const tabTitle = () => useHead.mock.lastCall[0].title.value
  const reloadButton = wrapper =>
    wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('text') === 'main.reload')
  const homeLink = wrapper =>
    wrapper.findAll('a').find(link => link.text() === 'main.home')

  // A failure as the API client hands it over, reported already.
  const requestFailure = status => {
    const failure = Object.assign(new Error(`HTTP ${status}`), { status })
    markRequestFailure(failure)
    return failure
  }

  // A promise the test settles, to order the answers of several reads.
  const deferred = () => {
    const handlers = {}
    const promise = new Promise((resolve, reject) => {
      Object.assign(handlers, { resolve, reject })
    })
    return { promise, ...handlers }
  }

  // The tasks the store holds: the page reads the others.
  let taskMap = null
  let consoleError = null

  // The store holds a task once read.
  const readTask = task => {
    taskMap.set(task.id, task)
    return Promise.resolve(task)
  }

  // A revision as the store holds it: each of its files names its task.
  const revisionFile = taskId => ({
    id: 'preview-1',
    task_id: taskId,
    revision: 1,
    extension: 'png'
  })
  const revision = file => ({ ...file, previews: [file] })

  // Strokes a player has not saved yet: it sends them as it unmounts.
  const unsavedStrokes = () => ({
    preview: revisionFile(TASK_ID),
    additions: [{ id: 'stroke-1' }],
    deletions: [],
    updates: []
  })
  const playerWithStrokes = (changes, methods = {}) => ({
    emits: ['annotation-changed'],
    methods,
    beforeUnmount() {
      this.$emit('annotation-changed', changes)
    },
    template: '<div />'
  })
  const mountWithStrokes = (changes, actions, methods) =>
    mountWithActions(
      { loadTask: () => Promise.reject(requestFailure(404)), ...actions },
      {
        previews: [revision(changes.preview)],
        stubs: { PreviewPlayer: playerWithStrokes(changes, methods) }
      }
    )
  const fakeTimeouts = () =>
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

  const mountWithActions = (actions, { stubs = {}, ...options } = {}) =>
    mountPage({
      actions,
      getterOverrides: { taskMap: () => taskMap },
      stubs: { EntityLoadError: false, ...stubs },
      ...options
    })

  const goTo = async (router, taskId) => {
    await router.push({
      name: 'task',
      params: { ...TASK_ROUTE_PARAMS, task_id: taskId }
    })
    await flushPromises()
  }

  beforeEach(() => {
    taskMap = new Map()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('keeps the loading title while the task loads', async () => {
    const { wrapper } = await mountWithActions({
      loadTask: () => new Promise(() => {})
    })

    expect(tabTitle()).toBe('main.loading - Kitsu')
    expect(wrapper.find('.page-header h1.title').exists()).toBe(false)
    expect(reloadButton(wrapper)).toBeUndefined()
  })

  // A deleted task, one out of the user's reach, and a malformed id from a
  // broken link.
  it.each([400, 403, 404])('tells the task is missing on a %i', async status => {
    const failure = requestFailure(status)
    const { wrapper, dispatched } = await mountWithActions({
      loadTask: () => Promise.reject(failure)
    })

    expect(headerTitle(wrapper)).toBe('not_found.title')
    expect(tabTitle()).toBe('not_found.title - Kitsu')
    expect(wrapper.text()).toContain('not_found.text')
    expect(homeLink(wrapper)).toBeDefined()
    expect(reloadButton(wrapper)).toBeUndefined()
    expect(wrapper.find('.task-columns').exists()).toBe(false)
    expect(dispatched).not.toContain('loadAssets')
    expect(consoleError.mock.calls).toEqual([[failure]])
  })

  it('offers a reload after a server error', async () => {
    const failure = requestFailure(500)
    const loadTask = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockImplementationOnce(() => readTask(buildTask()))
    const { wrapper } = await mountWithActions({ loadTask })

    expect(headerTitle(wrapper)).toBe('main.loading_error')
    expect(tabTitle()).toBe('main.loading_error - Kitsu')
    expect(wrapper.text()).not.toContain('not_found.text')
    expect(homeLink(wrapper)).toBeUndefined()

    await reloadButton(wrapper).vm.$emit('click')
    await flushPromises()

    expect(loadTask).toHaveBeenCalledTimes(2)
    expect(headerTitle(wrapper)).toContain('SH01')
    expect(tabTitle()).toBe('SH01 / Animation - Kitsu')
    expect(reloadButton(wrapper)).toBeUndefined()
    expect(consoleError.mock.calls).toEqual([[failure]])
  })

  // The page shows the previews of a task through its comments.
  it('reads the comments again after they fail to load', async () => {
    taskMap.set(TASK_ID, buildTask())
    const failure = requestFailure(500)
    const loadTaskComments = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce()
    const { wrapper } = await mountWithActions({ loadTaskComments })

    expect(headerTitle(wrapper)).toBe('main.loading_error')
    expect(wrapper.find('.task-columns').exists()).toBe(false)

    await reloadButton(wrapper).vm.$emit('click')
    await flushPromises()

    expect(loadTaskComments).toHaveBeenCalledTimes(2)
    expect(headerTitle(wrapper)).toContain('SH01')
    expect(wrapper.find('.task-columns').exists()).toBe(true)
    expect(consoleError.mock.calls).toEqual([[failure]])
  })

  // A bug is no request failure: it reaches Sentry unhandled.
  it('leaves a bug in the load to Sentry', async () => {
    const bug = new TypeError('Cannot read properties of undefined')
    const vueWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    let wrapper = null
    const rejections = await recordUnhandledRejections(async () => {
      ;({ wrapper } = await mountWithActions({
        loadTask: () => Promise.reject(bug)
      }))
    })

    expect(rejections).toEqual([bug])
    expect(headerTitle(wrapper)).toBe('main.loading_error')
    expect(consoleError).not.toHaveBeenCalled()
    // The app handler of main.js, which takes it in production, is not set.
    expect(vueWarn).toHaveBeenCalledTimes(1)
    expect(vueWarn.mock.calls[0][0]).toContain(
      'Unhandled error during execution of mounted hook'
    )
  })

  // The episodes and shots of a shot task load in a step of their own.
  it('leaves a bug in the episode load of a shot task read to Sentry', async () => {
    const bug = new TypeError('Cannot read properties of undefined')
    const vueWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    let wrapper = null
    const rejections = await recordUnhandledRejections(async () => {
      ;({ wrapper } = await mountWithActions({
        loadTask: () => readTask(buildTask()),
        loadEpisodes: () => Promise.reject(bug)
      }))
    })

    expect(rejections).toEqual([bug])
    expect(headerTitle(wrapper)).toBe('main.loading_error')
    expect(consoleError).not.toHaveBeenCalled()
    expect(vueWarn).toHaveBeenCalledTimes(1)
  })

  it('shows the shot task whose episode load fails', async () => {
    const failure = requestFailure(502)
    const { wrapper } = await mountWithActions({
      loadTask: () => readTask(buildTask()),
      loadEpisodes: vi.fn().mockRejectedValueOnce(failure).mockResolvedValue()
    })

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(consoleError.mock.calls).toEqual([[failure]])
  })

  // The arrows walk the shots of that episode.
  it('reads a shot task of a TV show with the shots of its episode', async () => {
    const setCurrentEpisode = vi.fn(() => Promise.resolve())
    const { dispatched } = await mountWithActions(
      {
        loadTask: () => readTask(buildTask({ episode: { id: 'episode-1' } })),
        setCurrentEpisode
      },
      { getterOverrides: { isTVShow: () => true, taskMap: () => taskMap } }
    )

    expect(setCurrentEpisode).toHaveBeenCalledWith('episode-1')
    // Then the shots, before the comments.
    expect(dispatched).toContain('loadTaskComments')
    const read = dispatched.slice(
      dispatched.indexOf('setCurrentEpisode'),
      dispatched.indexOf('loadTaskComments')
    )
    expect(read).toContain('loadShots')
  })

  // Zou names no episode for a shot whose sequence has none, in a production
  // made a TV show after its sequences for instance.
  it('shows a shot task of a TV show whose sequence has no episode', async () => {
    const setCurrentEpisode = vi.fn(() => Promise.resolve())
    let wrapper = null
    let dispatched = null
    const rejections = await recordUnhandledRejections(async () => {
      ;({ wrapper, dispatched } = await mountWithActions(
        { loadTask: () => readTask(buildTask()), setCurrentEpisode },
        { getterOverrides: { isTVShow: () => true, taskMap: () => taskMap } }
      ))
    })

    expect(rejections).toEqual([])
    expect(wrapper.find('.task-columns').exists()).toBe(true)
    expect(wrapper.find('.load-error').exists()).toBe(false)
    expect(wrapper.findComponent(Spinner).exists()).toBe(false)
    expect(setCurrentEpisode).not.toHaveBeenCalled()
    // The read loads the shots before the comments.
    expect(dispatched).toContain('loadTaskComments')
    const commentsLoad = dispatched.indexOf('loadTaskComments')
    expect(dispatched.slice(0, commentsLoad)).toContain('loadShots')
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('loads the task of a new URL after a failed load', async () => {
    const failure = requestFailure(404)
    const loadTask = vi.fn(({ taskId }) =>
      taskId === OTHER_TASK_ID ? readTask(otherTask()) : Promise.reject(failure)
    )
    const { wrapper, router } = await mountWithActions({ loadTask })
    expect(headerTitle(wrapper)).toBe('not_found.title')

    await goTo(router, OTHER_TASK_ID)

    expect(headerTitle(wrapper)).toContain('SH02')
    expect(wrapper.text()).not.toContain('not_found.text')
  })

  it('tells the new task is missing, not the one shown before', async () => {
    taskMap.set(TASK_ID, buildTask())
    const { wrapper, router } = await mountWithActions({
      loadTask: () => Promise.reject(requestFailure(404))
    })
    expect(headerTitle(wrapper)).toContain('SH01')

    await goTo(router, OTHER_TASK_ID)

    expect(headerTitle(wrapper)).toBe('not_found.title')
    expect(tabTitle()).toBe('not_found.title - Kitsu')
  })

  it('shows the task again once the user goes back to it', async () => {
    taskMap.set(TASK_ID, buildTask())
    const { wrapper, router } = await mountWithActions({
      loadTask: () => Promise.reject(requestFailure(404))
    })
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toBe('not_found.title')

    await goTo(router, TASK_ID)

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(wrapper.text()).not.toContain('not_found.text')
  })

  // The page shows that task while the other read runs.
  it('keeps the task the user goes back to when the read of the one left fails', async () => {
    taskMap.set(TASK_ID, buildTask())
    const otherRead = deferred()
    const loadTaskComments = vi.fn(() => Promise.resolve())
    const { wrapper, router } = await mountWithActions({
      loadTask: () => otherRead.promise,
      loadTaskComments
    })
    await goTo(router, OTHER_TASK_ID)
    await goTo(router, TASK_ID)

    otherRead.reject(requestFailure(404))
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(wrapper.text()).not.toContain('not_found.text')
    expect(loadTaskComments).toHaveBeenCalledTimes(2)
  })

  // The page still shows that task while the other read runs.
  it('keeps the task the user goes back to before the next one shows when reading it again fails', async () => {
    taskMap.set(TASK_ID, buildTask())
    const { wrapper, router } = await mountWithActions({
      loadTask: () => new Promise(() => {}),
      loadTaskComments: vi
        .fn()
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(requestFailure(502))
    })
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toContain('SH01')

    await goTo(router, TASK_ID)

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(reloadButton(wrapper)).toBeUndefined()
  })

  // From the browser history, for instance.
  it('reads the task once when the URL names one of its revisions during the read', async () => {
    const loadTask = vi.fn(() => new Promise(() => {}))
    const { router } = await mountWithActions({ loadTask })

    await router.push({
      name: 'task-preview',
      params: { ...TASK_ROUTE_PARAMS, preview_id: 'preview-1' }
    })
    await flushPromises()

    expect(loadTask).toHaveBeenCalledTimes(1)
  })

  it('tells the error when the task shown before fails to load on the way back', async () => {
    taskMap.set(TASK_ID, buildTask())
    const { wrapper, router } = await mountWithActions({
      loadTask: () => Promise.reject(requestFailure(404)),
      loadTaskComments: vi
        .fn()
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(requestFailure(500))
    })
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toBe('not_found.title')

    await goTo(router, TASK_ID)

    expect(headerTitle(wrapper)).toBe('main.loading_error')
    expect(reloadButton(wrapper)).toBeDefined()
  })

  // The header shows the next task while its comments load. The store lets
  // the task left go when it is deleted, or on a production change, when the
  // next task belongs to another production.
  it.each([
    ['deleted', true, map => map.delete(TASK_ID), 404, 'not_found.title'],
    [
      'dropped with the task map, as on a production change',
      false,
      map => map.clear(),
      502,
      'main.loading_error'
    ]
  ])(
    'tells the error when a task left fails to load on the way back while the next one loads (%s)',
    async (_, isNextHeld, letGo, status, title) => {
      taskMap.set(TASK_ID, buildTask())
      if (isNextHeld) taskMap.set(OTHER_TASK_ID, otherTask())
      const { wrapper, router } = await mountWithActions({
        loadTask: ({ taskId }) =>
          taskId === OTHER_TASK_ID
            ? readTask(otherTask())
            : Promise.reject(requestFailure(status)),
        loadTaskComments: vi
          .fn()
          .mockResolvedValueOnce()
          .mockReturnValueOnce(new Promise(() => {}))
      })
      await goTo(router, OTHER_TASK_ID)
      expect(headerTitle(wrapper)).toContain('SH02')
      letGo(taskMap)

      await goTo(router, TASK_ID)

      expect(headerTitle(wrapper)).toBe(title)
    }
  )

  // The page shows that task again: the comments of the next one never
  // loaded.
  it('keeps the task the user goes back to while the next one loads when reading it again fails', async () => {
    taskMap.set(TASK_ID, buildTask())
    taskMap.set(OTHER_TASK_ID, otherTask())
    const { wrapper, router } = await mountWithActions({
      loadTaskComments: vi
        .fn()
        .mockResolvedValueOnce()
        .mockReturnValueOnce(new Promise(() => {}))
        .mockRejectedValueOnce(requestFailure(502))
    })
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toContain('SH02')

    await goTo(router, TASK_ID)

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(reloadButton(wrapper)).toBeUndefined()
  })

  // The player sends the strokes it has not saved yet as it unmounts.
  it('saves the strokes left on the task shown before a failed one', async () => {
    taskMap.set(TASK_ID, buildTask())
    const changes = unsavedStrokes()
    const { wrapper, router, store } = await mountWithStrokes(changes)
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)

    await goTo(router, OTHER_TASK_ID)

    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)
    expect(store.dispatch).toHaveBeenCalledWith('updatePreviewAnnotation', {
      taskId: TASK_ID,
      ...changes
    })
  })

  // Its player is gone: the page sends them again while the server is down
  // or out of reach.
  it.each([502, undefined])(
    'saves the strokes left on the task shown before a failed one once the server answers (status %s)',
    async status => {
      taskMap.set(TASK_ID, buildTask())
      const changes = unsavedStrokes()
      const updatePreviewAnnotation = vi
        .fn()
        .mockRejectedValueOnce(requestFailure(status))
        .mockRejectedValueOnce(requestFailure(status))
        .mockResolvedValue()
      const { router } = await mountWithStrokes(changes, {
        updatePreviewAnnotation
      })
      fakeTimeouts()
      await goTo(router, OTHER_TASK_ID)
      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(1)

      await vi.advanceTimersByTimeAsync(4999)
      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(1)
      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(2)
      await vi.advanceTimersByTimeAsync(5000)
      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(3)
      await vi.advanceTimersByTimeAsync(5000)

      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(3)
      expect(updatePreviewAnnotation).toHaveBeenLastCalledWith({
        taskId: TASK_ID,
        ...changes
      })
    }
  )

  // Sentry hears of the bug from the store.
  it.each([
    ['the server refuses them', () => requestFailure(403)],
    ['their save hits a bug', () => new TypeError('Cannot read properties')]
  ])(
    'drops the strokes left on the task shown before a failed one when %s',
    async (_, failure) => {
      taskMap.set(TASK_ID, buildTask())
      const changes = unsavedStrokes()
      const updatePreviewAnnotation = vi.fn(() => Promise.reject(failure()))
      const { router } = await mountWithStrokes(changes, {
        updatePreviewAnnotation
      })
      fakeTimeouts()
      await goTo(router, OTHER_TASK_ID)

      await vi.advanceTimersByTimeAsync(5000)

      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(1)
    }
  )

  it('drops the strokes left on the task shown before a failed one when the server refuses them again', async () => {
    taskMap.set(TASK_ID, buildTask())
    const changes = unsavedStrokes()
    const updatePreviewAnnotation = vi
      .fn()
      .mockRejectedValueOnce(requestFailure(502))
      .mockRejectedValueOnce(requestFailure(403))
      .mockResolvedValue()
    const { router } = await mountWithStrokes(changes, {
      updatePreviewAnnotation
    })
    fakeTimeouts()
    await goTo(router, OTHER_TASK_ID)

    await vi.advanceTimersByTimeAsync(10000)

    expect(updatePreviewAnnotation).toHaveBeenCalledTimes(2)
  })

  // As on any page closed with strokes not saved.
  it('stops sending the strokes of a failed move again once the page closes', async () => {
    taskMap.set(TASK_ID, buildTask())
    const changes = unsavedStrokes()
    const updatePreviewAnnotation = vi.fn(() =>
      Promise.reject(requestFailure(502))
    )
    const { wrapper, router } = await mountWithStrokes(changes, {
      updatePreviewAnnotation
    })
    fakeTimeouts()
    await goTo(router, OTHER_TASK_ID)

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(5000)

    expect(updatePreviewAnnotation).toHaveBeenCalledTimes(1)
  })

  it('does not send again the strokes whose save fails once the page closed', async () => {
    taskMap.set(TASK_ID, buildTask())
    const changes = unsavedStrokes()
    const save = deferred()
    const updatePreviewAnnotation = vi.fn(() => save.promise)
    const { wrapper } = await mountWithStrokes(changes, {
      updatePreviewAnnotation
    })
    fakeTimeouts()
    wrapper.unmount()

    save.reject(requestFailure(502))
    await vi.advanceTimersByTimeAsync(5000)

    expect(updatePreviewAnnotation).toHaveBeenCalledTimes(1)
  })

  it('saves again the strokes whose player leaves with a failed move during their save', async () => {
    taskMap.set(TASK_ID, buildTask())
    const changes = unsavedStrokes()
    const save = deferred()
    const updatePreviewAnnotation = vi
      .fn()
      .mockReturnValueOnce(save.promise)
      .mockResolvedValue()
    const methods = {
      confirmAnnotationsSaved: vi.fn(),
      restoreFailedAnnotations: vi.fn()
    }
    const { wrapper, router } = await mountWithActions(
      {
        loadTask: () => Promise.reject(requestFailure(404)),
        updatePreviewAnnotation
      },
      {
        previews: [revision(changes.preview)],
        stubs: {
          PreviewPlayer: {
            emits: ['annotation-changed'],
            methods,
            template: '<div />'
          }
        }
      }
    )
    fakeTimeouts()
    wrapper.findComponent(PreviewPlayer).vm.$emit('annotation-changed', changes)
    await goTo(router, OTHER_TASK_ID)
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)

    save.reject(requestFailure(502))
    await vi.advanceTimersByTimeAsync(5000)

    expect(methods.restoreFailedAnnotations).not.toHaveBeenCalled()
    expect(updatePreviewAnnotation).toHaveBeenCalledTimes(2)
    expect(updatePreviewAnnotation).toHaveBeenLastCalledWith({
      taskId: TASK_ID,
      ...changes
    })
  })

  // That player has strokes of its own to save.
  it.each(['fails', 'succeeds'])(
    'leaves the player shown since alone when the save of the one gone %s',
    async outcome => {
      taskMap.set(TASK_ID, buildTask())
      const changes = unsavedStrokes()
      const save = deferred()
      const updatePreviewAnnotation = vi
        .fn()
        .mockReturnValueOnce(save.promise)
        .mockResolvedValue()
      const methods = {
        confirmAnnotationsSaved: vi.fn(),
        restoreFailedAnnotations: vi.fn()
      }
      const { wrapper, router } = await mountWithStrokes(
        changes,
        { updatePreviewAnnotation },
        methods
      )
      fakeTimeouts()
      await goTo(router, OTHER_TASK_ID)
      await goTo(router, TASK_ID)
      expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)

      if (outcome === 'fails') save.reject(requestFailure(502))
      else save.resolve()
      await vi.advanceTimersByTimeAsync(5000)

      expect(methods.confirmAnnotationsSaved).not.toHaveBeenCalled()
      expect(methods.restoreFailedAnnotations).not.toHaveBeenCalled()
      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(
        outcome === 'fails' ? 2 : 1
      )
    }
  )

  it.each([
    ['fails', 'restoreFailedAnnotations'],
    ['succeeds', 'confirmAnnotationsSaved']
  ])(
    'tells the player when the save of its strokes %s',
    async (outcome, method) => {
      taskMap.set(TASK_ID, buildTask())
      const changes = unsavedStrokes()
      const methods = {
        confirmAnnotationsSaved: vi.fn(),
        restoreFailedAnnotations: vi.fn()
      }
      const updatePreviewAnnotation = vi.fn(() =>
        outcome === 'fails'
          ? Promise.reject(requestFailure(502))
          : Promise.resolve()
      )
      const { wrapper } = await mountWithStrokes(
        changes,
        { updatePreviewAnnotation },
        methods
      )

      wrapper.findComponent(PreviewPlayer).vm.$emit('annotation-changed', changes)
      await flushPromises()

      expect(methods[method]).toHaveBeenCalledTimes(1)
      expect(updatePreviewAnnotation).toHaveBeenCalledTimes(1)
    }
  )

  // Its comment form would post on that task.
  it('shows nothing of the task shown before while a reload runs', async () => {
    taskMap.set(TASK_ID, buildTask())
    const secondRead = deferred()
    const loadTask = vi
      .fn()
      .mockRejectedValueOnce(requestFailure(500))
      .mockReturnValueOnce(secondRead.promise)
    const { wrapper, router } = await mountWithActions(
      { loadTask },
      {
        getterOverrides: {
          isCurrentUserProductionManager: () => true,
          taskMap: () => taskMap
        },
        previews: [revision(revisionFile(TASK_ID))]
      }
    )
    expect(wrapper.findComponent(AddComment).exists()).toBe(true)
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)
    await goTo(router, OTHER_TASK_ID)

    await reloadButton(wrapper).vm.$emit('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain('SH01')
    expect(wrapper.findComponent(AddComment).exists()).toBe(false)
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
    expect(tabTitle()).toBe('main.loading - Kitsu')

    taskMap.set(OTHER_TASK_ID, otherTask())
    secondRead.resolve(otherTask())
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH02')
    expect(wrapper.findComponent(AddComment).exists()).toBe(true)
  })

  // The store holds the next task: it shows while its comments load.
  it('shows nothing of the task shown before while a reload reads the comments', async () => {
    taskMap.set(TASK_ID, buildTask())
    taskMap.set(OTHER_TASK_ID, otherTask())
    const secondRead = deferred()
    const loadTaskComments = vi
      .fn()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(requestFailure(500))
      .mockReturnValueOnce(secondRead.promise)
    const { wrapper, router } = await mountWithActions(
      { loadTaskComments },
      {
        comments: [{ id: 'comment-1', text: 'v1' }],
        previews: [revision(revisionFile(TASK_ID))]
      }
    )
    expect(wrapper.findComponent(Comment).exists()).toBe(true)
    await goTo(router, OTHER_TASK_ID)

    await reloadButton(wrapper).vm.$emit('click')
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH02')
    expect(wrapper.findComponent(Comment).exists()).toBe(false)
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)
  })

  // A failed save reads the task again, during an outage for instance: the
  // player stays, with the strokes it could not save yet. The store may have
  // let the task go meanwhile.
  it.each([
    ['held by the store', { isHeldFirst: true, isHeldLater: true }],
    ['let go by the store since', { isHeldFirst: true, isHeldLater: false }],
    ['read when the page opened', { isHeldFirst: false, isHeldLater: true }]
  ])(
    'keeps the task shown when reading it again fails (task %s)',
    async (_, { isHeldFirst, isHeldLater }) => {
      if (isHeldFirst) taskMap.set(TASK_ID, buildTask())
      const comment = { id: 'comment-1', text: 'v1' }
      const saveFailure = requestFailure(502)
      const readFailure = requestFailure(502)
      const loadTask = vi.fn(() => Promise.reject(readFailure))
      if (!isHeldFirst) {
        loadTask.mockImplementationOnce(() => readTask(buildTask()))
      }
      const { wrapper } = await mountWithActions(
        {
          editTaskComment: () => Promise.reject(saveFailure),
          loadTask,
          loadTaskComments: vi
            .fn()
            .mockResolvedValueOnce()
            .mockRejectedValueOnce(readFailure)
        },
        { comments: [comment], previews: [revision(revisionFile(TASK_ID))] }
      )
      if (!isHeldLater) taskMap.delete(TASK_ID)

      await wrapper.findComponent(Comment).vm.$emit('checklist-updated', comment)
      await flushPromises()

      expect(headerTitle(wrapper)).toContain('SH01')
      expect(reloadButton(wrapper)).toBeUndefined()
      expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)
      expect(wrapper.findComponent(Spinner).exists()).toBe(false)
      expect(consoleError.mock.calls).toEqual([[saveFailure], [readFailure]])
    }
  )

  it('keeps the task shown when reading it again fails twice', async () => {
    taskMap.set(TASK_ID, buildTask())
    const comment = { id: 'comment-1', text: 'v1' }
    const { wrapper } = await mountWithActions(
      {
        editTaskComment: () => Promise.reject(requestFailure(502)),
        loadTaskComments: vi
          .fn()
          .mockResolvedValueOnce()
          .mockRejectedValue(requestFailure(502))
      },
      { comments: [comment] }
    )
    const failSave = async () => {
      await wrapper.findComponent(Comment).vm.$emit('checklist-updated', comment)
      await flushPromises()
    }

    await failSave()
    await failSave()

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(reloadButton(wrapper)).toBeUndefined()
  })

  // The page shows the next task with the comments of the one left until its
  // own comments load.
  it('tells the error when a task whose comments still load fails to be read again', async () => {
    taskMap.set(TASK_ID, buildTask())
    taskMap.set(OTHER_TASK_ID, otherTask())
    const comment = { id: 'comment-1', text: 'v1' }
    const { wrapper, router } = await mountWithActions(
      {
        editTaskComment: () => Promise.reject(requestFailure(502)),
        loadTaskComments: vi
          .fn()
          .mockResolvedValueOnce()
          .mockReturnValueOnce(new Promise(() => {}))
          .mockRejectedValueOnce(requestFailure(502))
      },
      { comments: [comment] }
    )
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toContain('SH02')

    await wrapper.findComponent(Comment).vm.$emit('checklist-updated', comment)
    await flushPromises()

    expect(headerTitle(wrapper)).toBe('main.loading_error')
    expect(reloadButton(wrapper)).toBeDefined()
  })

  // The deletion resets the page from the store, which holds the next task.
  it('keeps the error title when a deletion answers after a failed move', async () => {
    taskMap.set(TASK_ID, buildTask())
    taskMap.set(OTHER_TASK_ID, otherTask())
    const comment = { id: 'comment-1', text: 'v1' }
    const deletion = deferred()
    const { wrapper, router } = await mountWithActions(
      {
        deleteTaskComment: () => deletion.promise,
        loadTaskComments: vi
          .fn()
          .mockResolvedValueOnce()
          .mockRejectedValueOnce(requestFailure(500))
      },
      { comments: [comment] }
    )
    await wrapper.findComponent(Comment).vm.$emit('delete-comment', comment)
    wrapper
      .findAllComponents(DeleteModal)
      .find(modal => modal.props('active'))
      .vm.$emit('confirm')
    await goTo(router, OTHER_TASK_ID)
    expect(tabTitle()).toBe('main.loading_error - Kitsu')

    deletion.resolve()
    await flushPromises()

    expect(headerTitle(wrapper)).toBe('main.loading_error')
    expect(tabTitle()).toBe('main.loading_error - Kitsu')
  })

  // Back with the edit window open, for instance.
  it('saves a comment edit on its task when a failed move lands while its files upload', async () => {
    taskMap.set(TASK_ID, buildTask())
    const comment = { id: 'comment-1', text: 'v1' }
    const upload = deferred()
    const moveFailure = requestFailure(404)
    const { wrapper, router, store } = await mountWithActions(
      {
        addAttachmentToComment: () => upload.promise,
        loadTask: () => Promise.reject(moveFailure)
      },
      { comments: [comment] }
    )
    const edit = { ...comment, text: 'v2' }
    await wrapper.findComponent(Comment).vm.$emit('edit-comment', comment)
    wrapper.findComponent(EditCommentModal).vm.$emit('confirm', edit)
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toBe('not_found.title')

    const rejections = await recordUnhandledRejections(async () => {
      upload.resolve()
      await flushPromises()
    })

    expect(rejections).toEqual([])
    expect(store.dispatch).toHaveBeenCalledWith('editTaskComment', {
      taskId: TASK_ID,
      comment: edit
    })
    expect(consoleError.mock.calls).toEqual([[moveFailure]])
  })

  // The arrows to the next and previous edits walk it.
  it('loads the list of the page once a reload shows the task', async () => {
    const loadTask = vi
      .fn()
      .mockRejectedValueOnce(requestFailure(500))
      .mockImplementationOnce(() =>
        readTask(buildTask({ entity_type_name: 'Edit' }))
      )
    const { wrapper, dispatched } = await mountWithActions({ loadTask })

    await reloadButton(wrapper).vm.$emit('click')
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(dispatched).toContain('loadEdits')
  })

  it('loads the list of the page once, for the first task shown', async () => {
    const names = { [OTHER_TASK_ID]: 'EDIT02', 'task-3': 'EDIT03' }
    const loadTask = vi.fn(({ taskId }) =>
      taskId === TASK_ID
        ? Promise.reject(requestFailure(404))
        : readTask(
            buildTask({
              id: taskId,
              entity_type_name: 'Edit',
              entity_name: names[taskId]
            })
          )
    )
    const { wrapper, router, dispatched } = await mountWithActions({ loadTask })
    const listLoads = () => dispatched.filter(type => type === 'loadEdits')

    await goTo(router, OTHER_TASK_ID)
    expect(listLoads()).toHaveLength(1)

    await goTo(router, 'task-3')
    expect(headerTitle(wrapper)).toContain('EDIT03')
    expect(listLoads()).toHaveLength(1)
  })

  it('scrolls to the top once the first task shows', async () => {
    taskMap.set(TASK_ID, buildTask())
    window.scrollTo.mockClear()

    const { wrapper } = await mountWithActions({})

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    expect(wrapper.find('.task-columns').element.scrollTop).toBe(100)
  })

  // The list load puts its own copy of each task in the store, where a
  // subscription change lands.
  it('loads the list of the page once when the user moves during its load', async () => {
    taskMap.set(TASK_ID, buildTask())
    taskMap.set(OTHER_TASK_ID, otherTask())
    const listLoad = deferred()
    const loadShots = vi.fn(async () => {
      await listLoad.promise
      taskMap.set(OTHER_TASK_ID, { ...otherTask(), is_subscribed: true })
    })
    const { wrapper, router } = await mountWithActions({ loadShots })
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toContain('SH02')
    window.scrollTo.mockClear()

    listLoad.resolve()
    await flushPromises()

    expect(loadShots).toHaveBeenCalledTimes(1)
    expect(wrapper.findComponent(SubscribeButton).props('subscribed')).toBe(
      true
    )
    // Nor scrolls the task shown since.
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  // The list only brings its own copy of the task: what the user started
  // stays.
  it('keeps the files picked for a comment when the list of the page loads', async () => {
    taskMap.set(TASK_ID, buildTask())
    const listLoad = deferred()
    const windowReset = vi.fn()
    const { wrapper } = await mountWithActions(
      { loadShots: () => listLoad.promise },
      {
        getterOverrides: {
          isCurrentUserProductionManager: () => true,
          taskMap: () => taskMap
        },
        stubs: {
          AddPreviewModal: {
            template: '<div />',
            methods: { reset: windowReset }
          }
        }
      }
    )
    const form = new FormData()
    form.append('file', new File(['frame'], 'sh010.png'))
    wrapper.findComponent(AddComment).vm.$emit('file-drop', [form])
    windowReset.mockClear()

    listLoad.resolve()
    await flushPromises()

    expect(wrapper.findComponent(AddComment).props('previewForms')).toEqual([
      form
    ])
    // Nor the files picked in the window that publishes a revision.
    expect(windowReset).not.toHaveBeenCalled()
  })

  // Reading the task of an asset or a shot loads the list of its page.
  it('loads the list of the page once when reading the task loads it', async () => {
    const loadShots = vi.fn(() => Promise.resolve())
    await mountWithActions(
      { loadTask: () => readTask(buildTask()), loadShots },
      {
        getterOverrides: {
          isShotsLoading: () => false,
          shotsLoadingKey: () => 'production-1/',
          taskMap: () => taskMap
        }
      }
    )

    expect(loadShots).toHaveBeenCalledTimes(1)
  })

  // Zou names the asset type of an asset task, not 'Asset'.
  it('loads the asset list once when reading the task loads it', async () => {
    const loadAssets = vi.fn(() => Promise.resolve())
    await mountWithActions(
      {
        loadTask: () => readTask(buildTask({ entity_type_name: 'Character' })),
        loadAssets
      },
      {
        getterOverrides: {
          isAssetsLoading: () => false,
          assetsLoadingKey: () => 'production-1/',
          taskMap: () => taskMap
        }
      }
    )

    expect(loadAssets).toHaveBeenCalledTimes(1)
  })

  // The read loaded the list long before the Reload, which finds the task in
  // the store.
  it('loads the list of the page again on a reload after a failed read', async () => {
    const loadShots = vi.fn(() => Promise.resolve())
    const { wrapper } = await mountWithActions(
      {
        loadTask: () => readTask(buildTask()),
        loadShots,
        loadTaskComments: vi
          .fn()
          .mockRejectedValueOnce(requestFailure(502))
          .mockResolvedValue()
      },
      {
        getterOverrides: {
          isShotsLoading: () => false,
          shotsLoadingKey: () => 'production-1/',
          taskMap: () => taskMap
        }
      }
    )
    expect(headerTitle(wrapper)).toBe('main.loading_error')

    await reloadButton(wrapper).vm.$emit('click')
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(loadShots).toHaveBeenCalledTimes(2)
  })

  // A failed list load leaves the store with no list for the page.
  it('loads the list of the page again when the one read with the task failed', async () => {
    const loadShots = vi.fn(() => Promise.resolve())
    await mountWithActions(
      { loadTask: () => readTask(buildTask()), loadShots },
      {
        getterOverrides: {
          isShotsLoading: () => false,
          shotsLoadingKey: () => null,
          taskMap: () => taskMap
        }
      }
    )

    expect(loadShots).toHaveBeenCalledTimes(2)
  })

  // A failed load leaves no list for the arrows to walk. The shots, the
  // assets, and the edits answer it with their error flag, which their next
  // load clears.
  const shotsFailingOnCall = failingCall => {
    const isFailed = ref(false)
    const loadShots = vi.fn(() => {
      isFailed.value = loadShots.mock.calls.length === failingCall
      return Promise.resolve()
    })
    const getterOverrides = {
      isShotsLoadingError: () => isFailed.value,
      taskMap: () => taskMap
    }
    return { loadShots, getterOverrides }
  }

  it('loads the shots again on a move after their load failed', async () => {
    taskMap.set(TASK_ID, buildTask())
    taskMap.set(OTHER_TASK_ID, otherTask())
    taskMap.set('task-3', buildTask({ id: 'task-3', entity_name: 'SH03' }))
    const { loadShots, getterOverrides } = shotsFailingOnCall(1)
    const { wrapper, router } = await mountWithActions(
      { loadShots },
      { getterOverrides }
    )

    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toContain('SH02')
    expect(loadShots).toHaveBeenCalledTimes(2)

    await goTo(router, 'task-3')
    expect(headerTitle(wrapper)).toContain('SH03')
    expect(loadShots).toHaveBeenCalledTimes(2)
  })

  // The read of a task out of the store loads the shots with it.
  it('loads the shots again once the read of a task out of the store failed to load them', async () => {
    taskMap.set(TASK_ID, buildTask())
    const { loadShots, getterOverrides } = shotsFailingOnCall(2)
    const { wrapper, router } = await mountWithActions(
      { loadShots, loadTask: () => readTask(otherTask()) },
      { getterOverrides }
    )

    await goTo(router, OTHER_TASK_ID)

    expect(headerTitle(wrapper)).toContain('SH02')
    expect(loadShots).toHaveBeenCalledTimes(3)
  })

  // The sequences and the episodes pass the failure on.
  it('loads the sequences again on a move after their load failed', async () => {
    taskMap.set(TASK_ID, buildTask({ entity_type_name: 'Sequence' }))
    taskMap.set(OTHER_TASK_ID, {
      ...otherTask(),
      entity_type_name: 'Sequence'
    })
    const failure = requestFailure(502)
    const loadSequences = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValue()
    const { wrapper, router } = await mountWithActions({ loadSequences })
    expect(consoleError.mock.calls).toEqual([[failure]])

    await goTo(router, OTHER_TASK_ID)

    expect(headerTitle(wrapper)).toContain('SH02')
    expect(loadSequences).toHaveBeenCalledTimes(2)
  })

  // Reading an edit task loads the assets, not the edits.
  it('loads the edits of an edit task its read did not load', async () => {
    const loadEdits = vi.fn(() => Promise.resolve())
    await mountWithActions(
      {
        loadTask: () => readTask(buildTask({ entity_type_name: 'Edit' })),
        loadEdits
      },
      {
        getterOverrides: {
          isEditsLoading: () => false,
          editsLoadingKey: () => 'production-1/',
          taskMap: () => taskMap
        }
      }
    )

    expect(loadEdits).toHaveBeenCalledTimes(1)
  })

  // Opened from the list of its page, for instance: a reload brings the tasks
  // created since, which no event announces.
  it.each(['Asset', 'Edit', 'Shot'])(
    'loads again the %s list of a task the store holds',
    async type => {
      taskMap.set(
        TASK_ID,
        buildTask({ entity_type_name: type === 'Asset' ? 'Character' : type })
      )
      const loadList = vi.fn(() => Promise.resolve())
      await mountWithActions(
        { [`load${type}s`]: loadList },
        {
          getterOverrides: {
            [`is${type}sLoading`]: () => false,
            [`${type.toLowerCase()}sLoadingKey`]: () => 'production-1/',
            taskMap: () => taskMap
          }
        }
      )

      expect(loadList).toHaveBeenCalledTimes(1)
    }
  )

  // The other lists reload with the tasks the arrows walk.
  it('loads the sequences of a sequence task the store holds already', async () => {
    taskMap.set(TASK_ID, buildTask({ entity_type_name: 'Sequence' }))
    const loadSequences = vi.fn(() => Promise.resolve())
    await mountWithActions(
      { loadSequences },
      {
        getterOverrides: {
          isSequencesLoading: () => false,
          sequencesLoadingKey: () => 'production-1/',
          taskMap: () => taskMap
        }
      }
    )

    expect(loadSequences).toHaveBeenCalledTimes(1)
  })

  it('leaves the page alone when its list load ends while a newer read runs', async () => {
    taskMap.set(TASK_ID, buildTask())
    const listLoad = deferred()
    const { wrapper, router } = await mountWithActions({
      loadShots: () => listLoad.promise,
      loadTask: () => new Promise(() => {})
    })
    await goTo(router, OTHER_TASK_ID)
    const page = wrapper.html()

    listLoad.resolve()
    await flushPromises()

    expect(wrapper.html()).toBe(page)
  })

  // They act on the task shown before.
  it.each([
    ['edit-comment', wrapper => wrapper.findComponent(EditCommentModal)],
    [
      'delete-comment',
      wrapper =>
        wrapper
          .findAllComponents(DeleteModal)
          .find(modal => modal.props('text') === 'tasks.delete_comment')
    ]
  ])('closes the window of a %s when a move fails', async (event, modal) => {
    taskMap.set(TASK_ID, buildTask())
    const comment = { id: 'comment-1', text: 'v1' }
    const { wrapper, router } = await mountWithActions(
      { loadTask: () => Promise.reject(requestFailure(404)) },
      { comments: [comment] }
    )
    await wrapper.findComponent(Comment).vm.$emit(event, comment)
    expect(modal(wrapper).props('active')).toBe(true)

    await goTo(router, OTHER_TASK_ID)

    expect(headerTitle(wrapper)).toBe('not_found.title')
    expect(modal(wrapper).props('active')).toBe(false)
  })

  it('loads the list of the page once a production change shows the task', async () => {
    const production = ref({
      id: 'production-1',
      team: [],
      task_types: [taskType.id],
      fps: 25
    })
    const loadTask = vi
      .fn()
      .mockRejectedValueOnce(requestFailure(500))
      .mockImplementationOnce(() =>
        readTask(buildTask({ entity_type_name: 'Edit' }))
      )
    const { wrapper, dispatched } = await mountWithActions(
      { loadTask },
      {
        getterOverrides: {
          currentProduction: () => production.value,
          taskMap: () => taskMap
        }
      }
    )
    expect(headerTitle(wrapper)).toBe('main.loading_error')

    production.value = { ...production.value }
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH01')
    expect(dispatched).toContain('loadEdits')
  })

  it('shows the task of the URL when an earlier read fails after it', async () => {
    const firstRead = deferred()
    const failure = requestFailure(404)
    const loadTask = vi.fn(({ taskId }) =>
      taskId === TASK_ID ? firstRead.promise : readTask(otherTask())
    )
    const { wrapper, router } = await mountWithActions({ loadTask })

    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toContain('SH02')

    firstRead.reject(failure)
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH02')
    expect(wrapper.text()).not.toContain('not_found.text')
    expect(consoleError.mock.calls).toEqual([[failure]])
  })

  it('keeps the error of the URL when an earlier read succeeds after it', async () => {
    const firstRead = deferred()
    const loadTask = vi.fn(({ taskId }) =>
      taskId === TASK_ID
        ? firstRead.promise
        : Promise.reject(requestFailure(404))
    )
    const { wrapper, router, dispatched } = await mountWithActions({ loadTask })

    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toBe('not_found.title')

    firstRead.resolve(buildTask())
    await flushPromises()

    expect(headerTitle(wrapper)).toBe('not_found.title')
    // Nor the list of a task left.
    expect(dispatched).not.toContain('loadEpisodes')
  })

  it('shows the task of the URL when an earlier read lands during its list load', async () => {
    taskMap.set(TASK_ID, buildTask())
    const LEFT_TASK_ID = 'task-3'
    const listLoad = deferred()
    // The comments of the task left would answer last.
    const loadTaskComments = vi.fn(({ taskId }) =>
      taskId === LEFT_TASK_ID ? new Promise(() => {}) : Promise.resolve()
    )
    const { wrapper, router, dispatched } = await mountWithActions({
      loadTask: ({ taskId }) =>
        readTask(
          taskId === LEFT_TASK_ID
            ? buildTask({ id: LEFT_TASK_ID, entity_name: 'SH03' })
            : otherTask()
        ),
      loadEpisodes: vi
        .fn()
        .mockReturnValueOnce(listLoad.promise)
        .mockResolvedValue(),
      loadTaskComments
    })
    const shotLoads = () => dispatched.filter(type => type === 'loadShots')

    await goTo(router, LEFT_TASK_ID)
    await goTo(router, OTHER_TASK_ID)
    expect(headerTitle(wrapper)).toContain('SH02')
    const shotLoadCount = shotLoads().length

    listLoad.resolve()
    await flushPromises()

    expect(headerTitle(wrapper)).toContain('SH02')
    expect(loadTaskComments).not.toHaveBeenCalledWith(
      expect.objectContaining({ taskId: LEFT_TASK_ID })
    )
    // Nor the shots of its episode.
    expect(shotLoads()).toHaveLength(shotLoadCount)
  })

  // Read again on another page: left in the store, or out of it.
  it.each([true, false])(
    'keeps the spinner of a newer load when an earlier one ends (task held: %s)',
    async isTaskHeld => {
      if (isTaskHeld) taskMap.set(TASK_ID, buildTask())
      const commentsLoad = deferred()
      const { wrapper, router } = await mountWithActions({
        loadTask: ({ taskId }) =>
          taskId === TASK_ID ? readTask(buildTask()) : new Promise(() => {}),
        loadTaskComments: vi
          .fn()
          .mockReturnValueOnce(commentsLoad.promise)
          .mockResolvedValue()
      })

      await goTo(router, OTHER_TASK_ID)
      expect(wrapper.findComponent(Spinner).exists()).toBe(true)

      commentsLoad.resolve()
      await flushPromises()

      expect(wrapper.findComponent(Spinner).exists()).toBe(true)
    }
  )

  it('reads nothing again when only the revision of the URL changes', async () => {
    taskMap.set(TASK_ID, buildTask())
    const loadTaskComments = vi.fn(() => Promise.resolve())
    const { router } = await mountWithActions({ loadTaskComments })

    await router.push({
      name: 'task-preview',
      params: { ...TASK_ROUTE_PARAMS, preview_id: 'preview-2' }
    })
    await flushPromises()

    expect(loadTaskComments).toHaveBeenCalledTimes(1)
  })
})

describe('Task.vue preview selection', () => {
  // Distinct nested previews make the selected revision observable through
  // the player props.
  const previews = [
    { id: 'preview-3', revision: 3, extension: 'mp4', previews: ['from-3'] },
    { id: 'preview-2', revision: 2, extension: 'mp4', previews: ['from-2'] }
  ]

  const playerPreviews = wrapper =>
    wrapper.findComponent(PreviewPlayer).props('previews')

  const selectPreview = async (router, previewId) => {
    await router.push({
      name: 'task-preview',
      params: { ...TASK_ROUTE_PARAMS, preview_id: previewId }
    })
    await flushPromises()
  }

  // Same as the chevrons: the episode of the task may not be the one of the
  // page, the list the page walks.
  it('keeps the episode of the URL when it switches revision', async () => {
    const { wrapper, router } = await mountPage({
      previews: previews.map(preview => ({ ...preview, task_id: TASK_ID })),
      task: buildTask({ episode_id: 'episode-2' }),
      getterOverrides: {
        currentEpisode: () => ({ id: 'episode-1' }),
        isTVShow: () => true
      }
    })
    await router.push({
      name: 'episode-task',
      params: { ...TASK_ROUTE_PARAMS, episode_id: 'episode-1' }
    })
    await flushPromises()

    await pickInPageList(wrapper, 'preview-2')

    expect(router.currentRoute.value.name).toBe('episode-task-preview')
    expect(router.currentRoute.value.params).toMatchObject({
      episode_id: 'episode-1',
      preview_id: 'preview-2'
    })
  })

  it('keeps the episode of the URL when the player switches revision', async () => {
    const { wrapper, router } = await mountPage({
      previews: previews.map(preview => ({ ...preview, task_id: TASK_ID })),
      task: buildTask({ episode_id: 'episode-2' }),
      getterOverrides: {
        currentEpisode: () => ({ id: 'episode-1' }),
        isTVShow: () => true
      }
    })
    await router.push({
      name: 'episode-task',
      params: { ...TASK_ROUTE_PARAMS, episode_id: 'episode-1' }
    })
    await flushPromises()

    wrapper
      .findComponent(PreviewPlayer)
      .vm.$emit('change-current-preview', { ...previews[1], task_id: TASK_ID })
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('episode-task-preview')
    expect(router.currentRoute.value.params).toMatchObject({
      episode_id: 'episode-1',
      preview_id: 'preview-2'
    })
  })

  // Opened at an address without its episode, the page writes the revision
  // picked at the episode address of its task at once, not in a second step.
  it('writes the revision the player picks at the episode address of its task in one step', async () => {
    const { wrapper, router } = await mountPage({
      previews: previews.map(preview => ({ ...preview, task_id: TASK_ID })),
      getterOverrides: {
        currentEpisode: () => ({ id: 'episode-1' }),
        isTVShow: () => true
      }
    })
    const push = vi.spyOn(router, 'push')

    wrapper
      .findComponent(PreviewPlayer)
      .vm.$emit('change-current-preview', { ...previews[1], task_id: TASK_ID })
    await flushPromises()

    expect(push.mock.calls[0][0]).toMatchObject({
      name: 'episode-task-preview',
      params: { episode_id: 'episode-1', preview_id: 'preview-2' }
    })
  })

  // A link or a Back to a revision of a task the store does not hold: the
  // page still shows the task before while it reads that one.
  it('stays on the revision of the URL while its task loads', async () => {
    const { router } = await mountPage({
      previews,
      actions: { loadTask: () => new Promise(() => {}) }
    })

    await router.push({
      name: 'task-preview',
      params: { ...TASK_ROUTE_PARAMS, task_id: 'task-2', preview_id: 'preview-9' }
    })
    await flushPromises()

    expect(router.currentRoute.value.params).toMatchObject({
      task_id: 'task-2',
      preview_id: 'preview-9'
    })
  })

  // The list keeps the revisions of the task before until the comments of
  // the next one load: one that names no task only changes the player.
  it('changes only the player for a revision of no known task picked while the next task loads', async () => {
    const { wrapper, router } = await mountPage({
      previews,
      actions: {
        loadTaskComments: vi
          .fn()
          .mockResolvedValueOnce()
          .mockReturnValueOnce(new Promise(() => {}))
      },
      getterOverrides: {
        taskMap: () =>
          new Map([
            [TASK_ID, buildTask()],
            ['task-2', buildTask({ id: 'task-2' })]
          ])
      }
    })
    await router.push({
      name: 'task',
      params: { ...TASK_ROUTE_PARAMS, task_id: 'task-2' }
    })
    await flushPromises()

    await pickInPageList(wrapper, 'preview-2')

    expect(router.currentRoute.value.name).toBe('task')
    expect(router.currentRoute.value.params.task_id).toBe('task-2')
    expect(playerPreviews(wrapper)).toEqual(['from-2'])
  })

  // Zou names the task of every revision: one that names none still reaches
  // the URL of the task shown in full.
  it('writes a revision of no known task in the URL of the task shown', async () => {
    const { wrapper, router } = await mountPage({ previews })

    await pickInPageList(wrapper, 'preview-2')

    expect(router.currentRoute.value.name).toBe('task-preview')
    expect(router.currentRoute.value.params.preview_id).toBe('preview-2')
  })

  // Back from a task whose comments still load, to a task the store let go
  // with its production for instance.
  it('stays on the revision of the URL on the way back to a task the store let go', async () => {
    const tasks = new Map([[TASK_ID, buildTask()]])
    const { router } = await mountPage({
      previews,
      previewId: 'preview-2',
      actions: {
        loadTask: ({ taskId }) => {
          if (taskId !== 'task-2') return new Promise(() => {})
          const nextTask = buildTask({ id: 'task-2' })
          tasks.set(nextTask.id, nextTask)
          return Promise.resolve(nextTask)
        },
        loadTaskComments: vi
          .fn()
          .mockResolvedValueOnce()
          .mockReturnValueOnce(new Promise(() => {}))
      },
      getterOverrides: { taskMap: () => tasks }
    })
    await router.push({
      name: 'task',
      params: { ...TASK_ROUTE_PARAMS, task_id: 'task-2' }
    })
    await flushPromises()
    tasks.delete(TASK_ID)

    router.back()
    await flushPromises()

    expect(router.currentRoute.value.params).toMatchObject({
      task_id: TASK_ID,
      preview_id: 'preview-2'
    })
  })

  it('puts the revision picked in the URL once the next task shows', async () => {
    const { wrapper, router } = await mountPage({
      getterOverrides: {
        getTaskPreviews: () => taskId =>
          previews.map(preview => ({ ...preview, task_id: taskId })),
        taskMap: () =>
          new Map([
            [TASK_ID, buildTask()],
            ['task-2', buildTask({ id: 'task-2' })]
          ])
      }
    })
    await router.push({
      name: 'task',
      params: { ...TASK_ROUTE_PARAMS, task_id: 'task-2' }
    })
    await flushPromises()

    await pickInPageList(wrapper, 'preview-2')

    expect(router.currentRoute.value.params).toMatchObject({
      task_id: 'task-2',
      preview_id: 'preview-2'
    })
  })

  it('shows the latest preview when none is selected', async () => {
    const { wrapper } = await mountPage({ previews })
    expect(playerPreviews(wrapper)).toEqual(['from-3'])
  })

  it('shows the preview named by the route', async () => {
    const { wrapper, router } = await mountPage({ previews })
    await selectPreview(router, 'preview-2')
    expect(playerPreviews(wrapper)).toEqual(['from-2'])
  })

  // The task panel opens the page on the revision it shows: no detour
  // through the latest one.
  it('shows the preview its URL names from the first render', async () => {
    const { wrapper } = await mountPage({ previews, previewId: 'preview-2' })
    expect(playerPreviews(wrapper)).toEqual(['from-2'])
  })

  it('falls back to the latest preview when the selected id is unknown', async () => {
    const { wrapper, router } = await mountPage({ previews })
    await selectPreview(router, 'preview-gone')
    // A stale id in the url must not blank the player out.
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)
    expect(playerPreviews(wrapper)).toEqual(['from-3'])
  })

  // The real mutations hold the revisions here: the order of the events of a
  // deletion decides what is left.
  describe('once a comment is deleted', () => {
    const { mutations } = tasksStore

    // Zou names the task of every file of a comment.
    const buildComment = (revision, taskId = TASK_ID) => ({
      id: `comment-${revision}`,
      person: { id: 'user-1', first_name: 'Ann', last_name: 'Lee' },
      person_id: 'user-1',
      previews: [
        { id: `preview-${revision}`, revision, extension: 'png', task_id: taskId }
      ],
      task_status: {}
    })

    const mountOnRevisions = async (revisions, options = {}) => {
      const state = {
        taskComments: {},
        taskEntityPreviews: {},
        taskMap: new Map(),
        taskPreviews: {}
      }
      mutations.LOAD_TASK_COMMENTS_END(state, {
        taskId: TASK_ID,
        comments: revisions.map(revision => buildComment(revision))
      })
      const page = await mountPage({
        ...options,
        getterOverrides: {
          ...options.getterOverrides,
          getTaskComment: () => (taskId, commentId) =>
            state.taskComments[taskId]?.find(({ id }) => id === commentId),
          getTaskComments: () => id => state.taskComments[id] ?? [],
          getTaskPreviews: () => id => state.taskPreviews[id] ?? []
        }
      })
      page.store.commit.mockImplementation((type, payload) => {
        if (['ADD_PREVIEW_END', 'REMOVE_TASK_COMMENT'].includes(type)) {
          mutations[type](state, payload)
        }
      })
      return { ...page, state }
    }

    const options = wrapper =>
      previewCombo(wrapper)
        .props('options')
        .map(({ value }) => value)

    const shownFiles = wrapper => playerPreviews(wrapper).map(({ id }) => id)

    // A comment and its first file, as the events bring them.
    const publish = ({ state, socket }, revision, previewId) => {
      mutations.NEW_TASK_COMMENT_END(state, {
        comment: { ...buildComment(revision), previews: [] },
        taskId: TASK_ID
      })
      const [, onPreviewAdded] = socket.on.mock.calls.find(
        ([event]) => event === 'preview-file:add-file'
      )
      onPreviewAdded({
        task_id: TASK_ID,
        comment_id: `comment-${revision}`,
        preview_file_id: previewId ?? `preview-${revision}`,
        revision,
        extension: 'png',
        status: 'ready'
      })
      return flushPromises()
    }

    const emitDeletion = ({ socket }, revision) => {
      const [, onCommentDelete] = socket.on.mock.calls.find(
        ([event]) => event === 'comment:delete'
      )
      onCommentDelete({ comment_id: `comment-${revision}`, task_id: TASK_ID })
      return flushPromises()
    }

    it('leaves a revision deleted elsewhere', async () => {
      const page = await mountOnRevisions([2, 1])

      await emitDeletion(page, 2)

      expect(options(page.wrapper)).toEqual(['preview-1'])
      expect(shownFiles(page.wrapper)).toEqual(['preview-1'])
    })

    it('keeps the revision of its URL when another one goes', async () => {
      const page = await mountOnRevisions([3, 2, 1], { previewId: 'preview-2' })

      await emitDeletion(page, 3)

      expect(options(page.wrapper)).toEqual(['preview-2', 'preview-1'])
      expect(shownFiles(page.wrapper)).toEqual(['preview-2'])
    })

    it('shows no player once the only revision goes', async () => {
      const page = await mountOnRevisions([1])

      await emitDeletion(page, 1)

      expect(page.wrapper.findComponent(PreviewPlayer).exists()).toBe(false)
    })

    // The comparison of the player lists the revisions of the other tasks of
    // the entity too.
    it('refreshes the revisions compared once a comment goes on another task', async () => {
      const page = await mountOnRevisions([2, 1])
      const [, onCommentDelete] = page.socket.on.mock.calls.find(
        ([event]) => event === 'comment:delete'
      )

      onCommentDelete({ comment_id: 'comment-elsewhere', task_id: 'task-2' })
      await flushPromises()

      expect(page.store.dispatch).toHaveBeenCalledWith(
        'refreshTaskEntityPreviewFiles',
        { entityId: buildTask().entity_id, taskId: 'task-2' }
      )
    })

    it('refreshes nothing for a comment of its own task', async () => {
      const page = await mountOnRevisions([2, 1])
      const [, onCommentDelete] = page.socket.on.mock.calls.find(
        ([event]) => event === 'comment:delete'
      )

      await emitDeletion(page, 2)
      onCommentDelete({ comment_id: 'comment-unknown', task_id: TASK_ID })
      await flushPromises()

      expect(page.dispatched).not.toContain('refreshTaskEntityPreviewFiles')
    })

    // The options go by number, the list by date of publication.
    it('names the revision it shows when a lower number came last', async () => {
      const { wrapper } = await mountOnRevisions([3, 5])

      expect(shownFiles(wrapper)).toEqual(['preview-3'])
      expect(previewCombo(wrapper).props('modelValue')).toBe('preview-3')
    })

    it('names the revision it shows from a URL naming one gone', async () => {
      const page = await mountOnRevisions([3, 5, 1], {
        previewId: 'preview-1'
      })

      await emitDeletion(page, 1)

      expect(shownFiles(page.wrapper)).toEqual(['preview-3'])
      expect(previewCombo(page.wrapper).props('modelValue')).toBe('preview-3')
    })

    it('opens the revision picked in its list', async () => {
      const page = await mountOnRevisions([2, 1])

      await pickInPageList(page.wrapper, 'preview-1')

      expect(shownFiles(page.wrapper)).toEqual(['preview-1'])
      expect(page.router.currentRoute.value.params.preview_id).toBe('preview-1')
    })

    // The list may change behind a modal of the player.
    describe('with a modal of the player open', () => {
      const previewForm = () => {
        const form = new FormData()
        form.append('file', new File(['frame'], 'sh010-alt.png'))
        return form
      }

      const confirmExtraFile = async wrapper => {
        wrapper
          .findComponent({ ref: 'add-extra-preview-modal' })
          .vm.$emit('confirm', [previewForm()])
        await flushPromises()
      }

      // The page shows the last file of the revision once the upload ends.
      const stubs = {
        PreviewPlayer: {
          props: ['previews'],
          template: '<div />',
          methods: { displayLast: () => {}, focus: () => {} }
        }
      }

      // The trash shows the first file of the revision before it removes one.
      const trashStubs = {
        PreviewPlayer: {
          ...stubs.PreviewPlayer,
          methods: { ...stubs.PreviewPlayer.methods, displayFirst: () => {} }
        }
      }

      it('adds a file to the revision it opened on, once a new one is published', async () => {
        const page = await mountOnRevisions([2, 1], { stubs })
        page.wrapper.findComponent(PreviewPlayer).vm.$emit('add-extra-preview')

        await publish(page, 3)
        await confirmExtraFile(page.wrapper)

        expect(page.store.dispatch).toHaveBeenCalledWith(
          'addCommentExtraPreview',
          expect.objectContaining({
            commentId: 'comment-2',
            previewId: 'preview-2'
          })
        )
      })

      it('removes a file from the revision it opened on, once a new one is published', async () => {
        const page = await mountOnRevisions([2, 1], { stubs: trashStubs })
        page.wrapper
          .findComponent(PreviewPlayer)
          .vm.$emit('remove-extra-preview', { id: 'preview-2' })
        await flushPromises()

        await publish(page, 3)
        expect(shownFiles(page.wrapper)).toEqual(['preview-3'])
        page.wrapper
          .findAllComponents(DeleteModal)
          .find(modal => modal.props('active'))
          .vm.$emit('confirm')
        await flushPromises()

        expect(page.store.dispatch).toHaveBeenCalledWith('deleteTaskPreview', {
          taskId: TASK_ID,
          commentId: 'comment-2',
          previewId: 'preview-2'
        })
      })

      it('adds a file to no other revision once its own goes', async () => {
        const page = await mountOnRevisions([2, 1], { stubs })
        page.wrapper.findComponent(PreviewPlayer).vm.$emit('add-extra-preview')

        await emitDeletion(page, 2)
        await confirmExtraFile(page.wrapper)

        expect(page.store.dispatch).toHaveBeenCalledWith(
          'addCommentExtraPreview',
          expect.objectContaining({
            commentId: undefined,
            previewId: 'preview-2'
          })
        )
      })

      // The way back in the browser leaves the modal open.
      it('adds a file to the revision it opened on once the task changes', async () => {
        const otherTask = buildTask({ id: 'task-2' })
        const page = await mountOnRevisions([2, 1], {
          stubs,
          getterOverrides: {
            taskMap: () =>
              new Map([
                [TASK_ID, buildTask()],
                [otherTask.id, otherTask]
              ])
          }
        })
        mutations.LOAD_TASK_COMMENTS_END(page.state, {
          taskId: otherTask.id,
          comments: [buildComment(5, otherTask.id)]
        })
        page.wrapper.findComponent(PreviewPlayer).vm.$emit('add-extra-preview')

        await page.router.push({
          name: 'task',
          params: { ...TASK_ROUTE_PARAMS, task_id: otherTask.id }
        })
        await flushPromises()
        await confirmExtraFile(page.wrapper)

        expect(page.store.dispatch).toHaveBeenCalledWith(
          'addCommentExtraPreview',
          expect.objectContaining({
            taskId: TASK_ID,
            commentId: 'comment-2',
            previewId: 'preview-2'
          })
        )
        // A file of the previous task leaves the page as it is.
        expect(shownFiles(page.wrapper)).toEqual(['preview-5'])
      })

      // The trash can take the only file during the upload of another one.
      it('shows a file that starts over a revision the trash emptied', async () => {
        const page = await mountOnRevisions([1], { stubs })
        page.wrapper.findComponent(PreviewPlayer).vm.$emit('add-extra-preview')
        page.store.dispatch.mockImplementation(async type => {
          if (type !== 'addCommentExtraPreview') return
          mutations.DELETE_PREVIEW_END(page.state, {
            taskId: TASK_ID,
            previewId: 'preview-1'
          })
          mutations.ADD_PREVIEW_END(page.state, {
            preview: { id: 'preview-1b', revision: 1, extension: 'png' },
            taskId: TASK_ID,
            commentId: 'comment-1',
            comment: page.state.taskComments[TASK_ID][0]
          })
        })

        await confirmExtraFile(page.wrapper)

        expect(shownFiles(page.wrapper)).toEqual(['preview-1b'])
      })

      it('tells a trash Zou refuses once the only revision went', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const page = await mountOnRevisions([1])
        page.wrapper
          .findComponent(PreviewPlayer)
          .vm.$emit('remove-extra-preview', { id: 'preview-1' })
        await flushPromises()
        const refusal = new Error('Not Found')
        page.store.dispatch.mockImplementation(type =>
          type === 'deleteTaskPreview'
            ? Promise.reject(refusal)
            : Promise.resolve()
        )
        await emitDeletion(page, 1)

        const modal = page.wrapper
          .findAllComponents(DeleteModal)
          .find(deleteModal => deleteModal.props('active'))
        modal.vm.$emit('confirm')
        await flushPromises()

        expect(consoleError).toHaveBeenCalledWith(refusal)
        expect(modal.props('isLoading')).toBe(false)
        expect(modal.props('isError')).toBe(true)
        consoleError.mockRestore()
      })

      // The page shows the revisions of the previous task until the comments
      // of the next one load: the "+" and the trash sent the next task there,
      // with no comment, and Zou refused them.
      describe('on a revision of the previous task', () => {
        const nextTask = buildTask({ id: 'task-2' })

        // The page moves on to the next task, whose comments load until
        // `endCommentsLoad` runs. `beforeMove` acts on the previous task. A
        // next task out of the store reads first, then the list of its page,
        // which never comes here.
        const mountAndMoveOn = async (
          pageStubs,
          beforeMove = () => {},
          { isNextTaskInStore = true, previewId } = {}
        ) => {
          const tasks = new Map([[TASK_ID, buildTask()]])
          if (isNextTaskInStore) tasks.set(nextTask.id, nextTask)
          const page = await mountOnRevisions([2, 1], {
            previewId,
            stubs: pageStubs,
            getterOverrides: { taskMap: () => tasks }
          })
          beforeMove(page, tasks)
          let endLoad
          page.store.dispatch.mockImplementation(type => {
            if (type === 'loadTaskComments') {
              return new Promise(resolve => {
                endLoad = resolve
              })
            }
            if (!isNextTaskInStore && type === 'loadTask') {
              return Promise.resolve(nextTask)
            }
            if (!isNextTaskInStore && type === 'loadEpisodes') {
              return new Promise(() => {})
            }
            return Promise.resolve()
          })
          await page.router.push({
            name: 'task',
            params: { ...TASK_ROUTE_PARAMS, task_id: nextTask.id }
          })
          await flushPromises()
          const endCommentsLoad = async () => {
            mutations.LOAD_TASK_COMMENTS_END(page.state, {
              taskId: nextTask.id,
              comments: [buildComment(5, nextTask.id)]
            })
            endLoad()
            await flushPromises()
          }
          return { ...page, endCommentsLoad }
        }

        const openExtraFileModal = ({ wrapper }) =>
          wrapper.findComponent(PreviewPlayer).vm.$emit('add-extra-preview')

        it.each([
          ['opened before the move', true, false],
          ['opened before the move, confirmed once the next task loads', true, true],
          ['opened on it', false, false],
          ['opened on it, confirmed once the next task loads', false, true]
        ])(
          'adds a file to it from a modal %s',
          async (_, isOpenedBeforeMove, isConfirmedOnceLoaded) => {
            const page = await mountAndMoveOn(stubs, page => {
              if (isOpenedBeforeMove) openExtraFileModal(page)
            })
            expect(shownFiles(page.wrapper)).toEqual(['preview-2'])
            if (!isOpenedBeforeMove) openExtraFileModal(page)
            if (isConfirmedOnceLoaded) {
              await page.endCommentsLoad()
              expect(shownFiles(page.wrapper)).toEqual(['preview-5'])
            }
            await confirmExtraFile(page.wrapper)

            expect(page.store.dispatch).toHaveBeenCalledWith(
              'addCommentExtraPreview',
              expect.objectContaining({
                taskId: TASK_ID,
                commentId: 'comment-2',
                previewId: 'preview-2'
              })
            )
            // A file of the previous task leaves the page as it is.
            expect(shownFiles(page.wrapper)).toEqual(
              isConfirmedOnceLoaded ? ['preview-5'] : ['preview-2']
            )
          }
        )

        // The page shows the latest revision of the previous task meanwhile.
        it('adds a file to the older revision it opened on', async () => {
          const page = await mountAndMoveOn(stubs, openExtraFileModal, {
            previewId: 'preview-1'
          })
          expect(shownFiles(page.wrapper)).toEqual(['preview-2'])

          await confirmExtraFile(page.wrapper)

          expect(page.store.dispatch).toHaveBeenCalledWith(
            'addCommentExtraPreview',
            expect.objectContaining({
              taskId: TASK_ID,
              commentId: 'comment-1',
              previewId: 'preview-1'
            })
          )
        })

        // The way back to another production, for one: the page keeps the
        // previous task until the next one reads, while its URL names the
        // next one already.
        describe('with the next task out of the store', () => {
          const moveOutOfStore = pageStubs =>
            mountAndMoveOn(pageStubs, undefined, { isNextTaskInStore: false })

          it('adds a file to it and leaves the page as it is', async () => {
            const displayLast = vi.fn()
            const page = await moveOutOfStore({
              PreviewPlayer: {
                ...stubs.PreviewPlayer,
                methods: { ...stubs.PreviewPlayer.methods, displayLast }
              }
            })
            expect(shownFiles(page.wrapper)).toEqual(['preview-2'])
            openExtraFileModal(page)

            // The player shows the last file once a timer runs.
            vi.useFakeTimers({ toFake: ['setTimeout'] })
            try {
              await confirmExtraFile(page.wrapper)
              vi.runAllTimers()
            } finally {
              vi.useRealTimers()
            }

            expect(page.store.dispatch).toHaveBeenCalledWith(
              'addCommentExtraPreview',
              expect.objectContaining({
                taskId: TASK_ID,
                commentId: 'comment-2',
                previewId: 'preview-2'
              })
            )
            expect(page.wrapper.findComponent(PreviewPlayer).exists()).toBe(true)
            expect(shownFiles(page.wrapper)).toEqual(['preview-2'])
            expect(displayLast).not.toHaveBeenCalled()
          })

          it('removes a file of it and leaves the page and its URL as they are', async () => {
            const page = await moveOutOfStore(trashStubs)
            page.wrapper
              .findComponent(PreviewPlayer)
              .vm.$emit('remove-extra-preview', { id: 'preview-2' })
            await flushPromises()

            page.wrapper
              .findAllComponents(DeleteModal)
              .find(modal => modal.props('active'))
              .vm.$emit('confirm')
            await flushPromises()

            expect(page.store.dispatch).toHaveBeenCalledWith('deleteTaskPreview', {
              taskId: TASK_ID,
              commentId: 'comment-2',
              previewId: 'preview-2'
            })
            expect(page.router.currentRoute.value.params).toEqual({
              ...TASK_ROUTE_PARAMS,
              task_id: nextTask.id
            })
            expect(shownFiles(page.wrapper)).toEqual(['preview-2'])
          })

          // The list of the next task drops the previous one from the store:
          // the way back to it during the comments of the next one reads it
          // again, while `task` still holds the next one.
          const goBackDuringLoad = async pageStubs => {
            const tasks = new Map([[TASK_ID, buildTask()]])
            const page = await mountOnRevisions([2, 1], {
              stubs: pageStubs,
              getterOverrides: { taskMap: () => tasks }
            })
            page.store.dispatch.mockImplementation((type, payload) => {
              if (type === 'loadTask') {
                return payload.taskId === nextTask.id
                  ? Promise.resolve(nextTask)
                  : new Promise(() => {})
              }
              if (type === 'loadShots') {
                tasks.delete(TASK_ID)
                tasks.set(nextTask.id, nextTask)
              }
              if (type === 'loadTaskComments') return new Promise(() => {})
              return Promise.resolve()
            })
            await page.router.push({
              name: 'task',
              params: { ...TASK_ROUTE_PARAMS, task_id: nextTask.id }
            })
            await flushPromises()
            await page.router.push({ name: 'task', params: TASK_ROUTE_PARAMS })
            await flushPromises()
            return page
          }

          it('removes a file of it back on it, and keeps the URL on it', async () => {
            const page = await goBackDuringLoad(trashStubs)
            expect(shownFiles(page.wrapper)).toEqual(['preview-2'])
            page.wrapper
              .findComponent(PreviewPlayer)
              .vm.$emit('remove-extra-preview', { id: 'preview-2' })
            await flushPromises()

            page.wrapper
              .findAllComponents(DeleteModal)
              .find(modal => modal.props('active'))
              .vm.$emit('confirm')
            await flushPromises()

            expect(page.store.dispatch).toHaveBeenCalledWith('deleteTaskPreview', {
              taskId: TASK_ID,
              commentId: 'comment-2',
              previewId: 'preview-2'
            })
            expect(page.router.currentRoute.value.params).toEqual(
              TASK_ROUTE_PARAMS
            )
          })

          it('adds a file to it back on it, and leaves the page as it is', async () => {
            const displayLast = vi.fn()
            const page = await goBackDuringLoad({
              PreviewPlayer: {
                ...stubs.PreviewPlayer,
                methods: { ...stubs.PreviewPlayer.methods, displayLast }
              }
            })
            openExtraFileModal(page)

            vi.useFakeTimers({ toFake: ['setTimeout'] })
            try {
              await confirmExtraFile(page.wrapper)
              vi.runAllTimers()
            } finally {
              vi.useRealTimers()
            }

            expect(page.store.dispatch).toHaveBeenCalledWith(
              'addCommentExtraPreview',
              expect.objectContaining({
                taskId: TASK_ID,
                commentId: 'comment-2',
                previewId: 'preview-2'
              })
            )
            expect(displayLast).not.toHaveBeenCalled()
          })
        })

        // A change of production, for one, drops it from the store.
        it('adds a file to it once the store dropped its task', async () => {
          const page = await mountAndMoveOn(stubs, (page, tasks) => {
            openExtraFileModal(page)
            tasks.delete(TASK_ID)
          })
          expect(shownFiles(page.wrapper)).toEqual(['preview-2'])

          await confirmExtraFile(page.wrapper)

          expect(page.store.dispatch).toHaveBeenCalledWith(
            'addCommentExtraPreview',
            expect.objectContaining({
              taskId: TASK_ID,
              commentId: 'comment-2',
              previewId: 'preview-2'
            })
          )
        })

        // The URL keeps naming the task shown, never a revision of another.
        it.each([
          ['while it shows', false],
          ['once the next task loads', true]
        ])(
          'removes a file of it confirmed %s',
          async (_, isConfirmedOnceLoaded) => {
            const page = await mountAndMoveOn(trashStubs)
            expect(shownFiles(page.wrapper)).toEqual(['preview-2'])
            page.wrapper
              .findComponent(PreviewPlayer)
              .vm.$emit('remove-extra-preview', { id: 'preview-2' })
            await flushPromises()
            if (isConfirmedOnceLoaded) await page.endCommentsLoad()

            page.wrapper
              .findAllComponents(DeleteModal)
              .find(modal => modal.props('active'))
              .vm.$emit('confirm')
            await flushPromises()

            expect(page.store.dispatch).toHaveBeenCalledWith(
              'deleteTaskPreview',
              { taskId: TASK_ID, commentId: 'comment-2', previewId: 'preview-2' }
            )
            expect(page.router.currentRoute.value.params).toEqual({
              ...TASK_ROUTE_PARAMS,
              task_id: nextTask.id
            })
            expect(shownFiles(page.wrapper)).toEqual(
              isConfirmedOnceLoaded ? ['preview-5'] : ['preview-2']
            )
          }
        )

        // A file added since stays out of the list of its comment: the trash
        // finds the comment by the revision it shows.
        it('removes a file added since from the comment of its revision', async () => {
          const page = await mountAndMoveOn(trashStubs)
          page.wrapper
            .findComponent(PreviewPlayer)
            .vm.$emit('remove-extra-preview', { id: 'preview-2b' })
          await flushPromises()

          page.wrapper
            .findAllComponents(DeleteModal)
            .find(modal => modal.props('active'))
            .vm.$emit('confirm')
          await flushPromises()

          expect(page.store.dispatch).toHaveBeenCalledWith('deleteTaskPreview', {
            taskId: TASK_ID,
            commentId: 'comment-2',
            previewId: 'preview-2b'
          })
        })
      })
    })

    // Zou sends the event before it answers the request: the local stack gave
    // that order on every run, nothing says a production server does.
    describe.each([
      ['the event comes first', true],
      ['the answer comes first', false]
    ])('deleted from the page, %s', (_, isEventFirst) => {
      const deleteFromPage = async (page, revision) => {
        const { state, store, wrapper } = page
        store.dispatch.mockImplementation(async (type, payload) => {
          if (type !== 'deleteTaskComment') return
          if (isEventFirst) await emitDeletion(page, revision)
          mutations.DELETE_COMMENT_END(state, {
            taskId: TASK_ID,
            commentId: payload.commentId,
            taskStatusMap: new Map(),
            todoStatus: {}
          })
        })
        wrapper
          .findAllComponents(Comment)
          .find(comment => comment.props('comment').id === `comment-${revision}`)
          .vm.$emit('delete-comment', { id: `comment-${revision}` })
        await flushPromises()
        wrapper
          .findAllComponents(DeleteModal)
          .find(modal => modal.props('active'))
          .vm.$emit('confirm')
        await flushPromises()
      }

      it('moves to the latest revision from its URL', async () => {
        const page = await mountOnRevisions([2, 1], { previewId: 'preview-2' })

        await deleteFromPage(page, 2)

        expect(options(page.wrapper)).toEqual(['preview-1'])
        expect(shownFiles(page.wrapper)).toEqual(['preview-1'])
      })

      it('stays on the older revision its URL names', async () => {
        const page = await mountOnRevisions([3, 2, 1], {
          previewId: 'preview-1'
        })

        await deleteFromPage(page, 3)

        expect(options(page.wrapper)).toEqual(['preview-2', 'preview-1'])
        expect(shownFiles(page.wrapper)).toEqual(['preview-1'])
        expect(page.router.currentRoute.value.params.preview_id).toBe(
          'preview-1'
        )
      })

      // Nobody picked the revision left: the next publication shows.
      it.each([
        ['without a revision', undefined],
        ['naming the revision that goes', 'preview-2']
      ])('shows the next publication from a URL %s', async (_, previewId) => {
        const page = await mountOnRevisions([2, 1], { previewId })

        await deleteFromPage(page, 2)
        await publish(page, 2, 'preview-2-again')

        expect(options(page.wrapper)).toEqual(['preview-2-again', 'preview-1'])
        expect(shownFiles(page.wrapper)).toEqual(['preview-2-again'])
        expect(previewCombo(page.wrapper).props('modelValue')).toBe(
          'preview-2-again'
        )
      })
    })
  })
})

describe('Task.vue timecode navigation', () => {
  const previews = [
    { id: 'preview-2', revision: 2, extension: 'mp4' },
    { id: 'preview-1', revision: 1, extension: 'mp4' }
  ]
  const comments = [{ id: 'comment-1', text: 'v1 00:04.00 (100)' }]

  it('opens the preview the timecode names', async () => {
    const { wrapper, router } = await mountPage({
      comments,
      previews: previews.map(preview => ({ ...preview, task_id: TASK_ID }))
    })
    await clickTimeCode(wrapper, '1')
    expect(router.currentRoute.value.params.preview_id).toBe('preview-1')
  })

  it('ignores a timecode whose revision is gone', async () => {
    const { wrapper, router } = await mountPage({ comments, previews })
    // The revision is parsed out of the raw comment text, so it can name a
    // revision that was deleted or never existed.
    await clickTimeCode(wrapper, '9')
    expect(router.currentRoute.value.name).toBe('task')
  })
})

// The page keeps the comments and revisions of the task shown until the
// comments of the next task load: its time codes, its revision list, and the
// list of the player in full screen still pick among them.
describe('Task.vue revision picked while the next task loads', () => {
  const NEXT_TASK_ID = 'task-2'
  // Zou names the task of each revision.
  const previews = [
    { id: 'preview-2', revision: 2, extension: 'mp4', task_id: TASK_ID },
    { id: 'preview-1', revision: 1, extension: 'mp4', task_id: TASK_ID }
  ]
  const comments = [{ id: 'comment-1', text: 'v1 00:04.00 (100)' }]
  // The revisions the store keeps for the next task from an earlier visit: a
  // production change empties its task map only, and a new comment brings no
  // revision.
  const nextTaskPreviews = [
    {
      id: 'preview-9',
      revision: 2,
      extension: 'mp4',
      previews: ['from-9'],
      task_id: NEXT_TASK_ID
    },
    {
      id: 'preview-8',
      revision: 1,
      extension: 'mp4',
      previews: ['from-8'],
      task_id: NEXT_TASK_ID
    }
  ]

  // The comments of the task shown load, then those of the next task hang.
  const commentsOfNextTaskHang = () =>
    vi
      .fn()
      .mockResolvedValue()
      .mockResolvedValueOnce()
      .mockReturnValueOnce(new Promise(() => {}))

  const bothTasks = () =>
    new Map([
      [TASK_ID, buildTask()],
      [NEXT_TASK_ID, buildTask({ id: NEXT_TASK_ID })]
    ])

  const goTo = async (router, params) => {
    await router.push({
      name: 'task',
      params: { ...TASK_ROUTE_PARAMS, ...params }
    })
    await flushPromises()
  }

  // The list of revisions of the player in full screen.
  const pickInPlayer = async (wrapper, preview) => {
    wrapper
      .findComponent(PreviewPlayer)
      .vm.$emit('change-current-preview', preview)
    await flushPromises()
  }

  it('opens a time code of the task before on that task', async () => {
    const { wrapper, router } = await mountPage({
      comments,
      previews,
      actions: { loadTaskComments: commentsOfNextTaskHang() },
      getterOverrides: { taskMap: bothTasks }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })

    await clickTimeCode(wrapper, '1')

    expect(router.currentRoute.value.name).toBe('task-preview')
    expect(router.currentRoute.value.params).toMatchObject({
      task_id: TASK_ID,
      preview_id: 'preview-1'
    })
  })

  // A link to a task of another episode, which the store does not hold: the
  // header keeps the task before while the page reads that one.
  it('opens a time code of the task before under its own episode', async () => {
    const { wrapper, router } = await mountPage({
      comments,
      previews,
      episodeId: 'episode-1',
      actions: { loadTask: () => new Promise(() => {}) },
      getterOverrides: {
        currentEpisode: () => ({ id: 'episode-1' }),
        isTVShow: () => true
      }
    })
    await router.push({
      name: 'episode-task',
      params: {
        ...TASK_ROUTE_PARAMS,
        episode_id: 'episode-2',
        task_id: NEXT_TASK_ID
      }
    })
    await flushPromises()

    await clickTimeCode(wrapper, '1')

    expect(router.currentRoute.value.name).toBe('episode-task-preview')
    expect(router.currentRoute.value.params).toMatchObject({
      episode_id: 'episode-1',
      task_id: TASK_ID,
      preview_id: 'preview-1'
    })
  })

  // A link to a task of another production: the store lets go of the task
  // shown, read like the next one.
  it('opens a revision of the task before in its own production', async () => {
    const tasks = new Map()
    const { wrapper, router } = await mountPage({
      previews,
      actions: {
        loadTask: ({ taskId }) => {
          const task =
            taskId === TASK_ID
              ? buildTask()
              : buildTask({ id: taskId, project_id: 'production-2' })
          tasks.set(task.id, task)
          return Promise.resolve(task)
        },
        loadTaskComments: commentsOfNextTaskHang()
      },
      getterOverrides: { taskMap: () => tasks }
    })
    tasks.clear()
    await goTo(router, {
      production_id: 'production-2',
      task_id: NEXT_TASK_ID
    })

    await pickInPlayer(wrapper, previews[1])

    expect(router.currentRoute.value.params).toMatchObject({
      production_id: 'production-1',
      task_id: TASK_ID,
      preview_id: 'preview-1'
    })
  })

  // Back from a task whose comments still load, to a task the store let go:
  // the header shows the task left while the page reads that one.
  it('stays on the task of the URL on the way back to a task the store let go', async () => {
    const tasks = new Map([[TASK_ID, buildTask()]])
    const { wrapper, router } = await mountPage({
      previews,
      previewId: 'preview-2',
      actions: {
        loadTask: ({ taskId }) => {
          if (taskId !== NEXT_TASK_ID) return new Promise(() => {})
          const nextTask = buildTask({ id: NEXT_TASK_ID })
          tasks.set(nextTask.id, nextTask)
          return Promise.resolve(nextTask)
        },
        loadTaskComments: commentsOfNextTaskHang()
      },
      getterOverrides: { taskMap: () => tasks }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })
    tasks.delete(TASK_ID)
    router.back()
    await flushPromises()

    await pickInPlayer(wrapper, previews[1])

    expect(router.currentRoute.value.params).toMatchObject({
      task_id: TASK_ID,
      preview_id: 'preview-1'
    })
  })

  // Back to a task the store holds, from the next one shown in full: the
  // header shows the task of the Back at once, the lists keep those of the
  // task left until its comments load.
  it('opens a revision of the task left on that task while a Back loads the task before', async () => {
    const { wrapper, router } = await mountPage({
      actions: {
        loadTaskComments: vi
          .fn()
          .mockResolvedValue()
          .mockResolvedValueOnce()
          .mockResolvedValueOnce()
          .mockReturnValueOnce(new Promise(() => {}))
      },
      getterOverrides: {
        getTaskPreviews: () => taskId =>
          taskId === NEXT_TASK_ID ? nextTaskPreviews : previews,
        taskMap: bothTasks
      }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })
    router.back()
    await flushPromises()

    await pickInPlayer(wrapper, nextTaskPreviews[1])

    expect(router.currentRoute.value.params).toMatchObject({
      task_id: NEXT_TASK_ID,
      preview_id: 'preview-8'
    })
  })

  // A new comment on the next task lists the revisions the store kept for
  // it, before its comments load.
  it('opens a revision of the next task on that task', async () => {
    const { wrapper, router, socket } = await mountPage({
      actions: { loadTaskComments: commentsOfNextTaskHang() },
      getterOverrides: {
        getTaskComments: () => taskId =>
          taskId === NEXT_TASK_ID ? comments : [],
        getTaskPreviews: () => taskId =>
          taskId === NEXT_TASK_ID ? nextTaskPreviews : previews,
        taskMap: bothTasks
      }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })
    await emitCommentNew(socket, NEXT_TASK_ID)

    await pickInPlayer(wrapper, nextTaskPreviews[1])

    expect(router.currentRoute.value.params).toMatchObject({
      task_id: NEXT_TASK_ID,
      preview_id: 'preview-8'
    })
  })

  it('opens a revision of the task before picked in the list of the page on that task', async () => {
    const { wrapper, router } = await mountPage({
      previews,
      actions: { loadTaskComments: commentsOfNextTaskHang() },
      getterOverrides: { taskMap: bothTasks }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })

    await pickInPageList(wrapper, 'preview-1')

    expect(router.currentRoute.value.name).toBe('task-preview')
    expect(router.currentRoute.value.params).toMatchObject({
      task_id: TASK_ID,
      preview_id: 'preview-1'
    })
  })

  // A task the store does not hold reads while the header keeps the task
  // before. Reordering the files of a revision meanwhile reads again the
  // revisions the store kept for the task of the URL.
  it('opens a revision of the next task listed under the task before on that task', async () => {
    const { wrapper, router } = await mountPage({
      previews,
      actions: { loadTask: () => new Promise(() => {}) },
      getterOverrides: {
        getTaskPreviews: () => taskId =>
          taskId === NEXT_TASK_ID ? nextTaskPreviews : previews
      }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })
    wrapper.findComponent(PreviewPlayer).vm.$emit('previews-order-changed')
    await flushPromises()

    await pickInPlayer(wrapper, nextTaskPreviews[1])

    expect(router.currentRoute.value.name).toBe('task-preview')
    expect(router.currentRoute.value.params).toMatchObject({
      task_id: NEXT_TASK_ID,
      preview_id: 'preview-8'
    })
    expect(wrapper.findComponent(PreviewPlayer).props('previews')).toEqual([
      'from-8'
    ])
  })

  // Back to the task shown while the comments of the next one still load,
  // once a new comment listed the revisions the store kept for the next one.
  // That one never showed in full: the page has no address for it.
  it('keeps out of the URL a revision a new comment listed for the task left, on the way back', async () => {
    const { wrapper, router, socket } = await mountPage({
      actions: {
        loadTaskComments: vi
          .fn()
          .mockResolvedValue()
          .mockResolvedValueOnce()
          .mockReturnValueOnce(new Promise(() => {}))
          .mockReturnValueOnce(new Promise(() => {}))
      },
      getterOverrides: {
        getTaskComments: () => taskId =>
          taskId === NEXT_TASK_ID ? comments : [],
        getTaskPreviews: () => taskId =>
          taskId === NEXT_TASK_ID ? nextTaskPreviews : previews,
        taskMap: bothTasks
      }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })
    await emitCommentNew(socket, NEXT_TASK_ID)
    router.back()
    await flushPromises()

    await pickInPlayer(wrapper, nextTaskPreviews[1])

    expect(router.currentRoute.value.name).toBe('task')
    expect(router.currentRoute.value.params.task_id).toBe(TASK_ID)
    expect(wrapper.findComponent(PreviewPlayer).props('previews')).toEqual([
      'from-8'
    ])
  })

  // The URL of a task may change its episode after the load, with no new
  // load. Back to it from a task of another production, its current URL wins
  // over the one it loaded under.
  it('opens a revision of the task of the URL under the episode of its URL', async () => {
    const tasks = new Map([[TASK_ID, buildTask()]])
    const { wrapper, router } = await mountPage({
      previews,
      episodeId: 'episode-1',
      actions: {
        loadTask: ({ taskId }) => {
          if (taskId !== NEXT_TASK_ID) return new Promise(() => {})
          const nextTask = buildTask({ id: taskId, project_id: 'production-2' })
          tasks.set(nextTask.id, nextTask)
          return Promise.resolve(nextTask)
        },
        loadTaskComments: commentsOfNextTaskHang()
      },
      getterOverrides: {
        currentEpisode: () => ({ id: 'episode-1' }),
        isTVShow: () => true,
        taskMap: () => tasks
      }
    })
    const episodeTask = params =>
      router.push({ name: 'episode-task', params: { ...TASK_ROUTE_PARAMS, ...params } })
    await episodeTask({ episode_id: 'episode-2' })
    await flushPromises()
    tasks.delete(TASK_ID)
    await episodeTask({
      episode_id: 'episode-3',
      production_id: 'production-2',
      task_id: NEXT_TASK_ID
    })
    await flushPromises()
    router.back()
    await flushPromises()

    await pickInPlayer(wrapper, previews[1])

    expect(router.currentRoute.value.name).toBe('episode-task-preview')
    expect(router.currentRoute.value.params).toMatchObject({
      episode_id: 'episode-2',
      task_id: TASK_ID,
      preview_id: 'preview-1'
    })
  })

  // A click on the revision shown closes the list.
  it('stays on the next task when the revision shown is picked again in the list of the page', async () => {
    const { wrapper, router } = await mountPage({
      previews,
      actions: { loadTaskComments: commentsOfNextTaskHang() },
      getterOverrides: { taskMap: bothTasks }
    })
    await goTo(router, { task_id: NEXT_TASK_ID })

    await pickInPageList(wrapper, 'preview-2')

    expect(router.currentRoute.value.name).toBe('task')
    expect(router.currentRoute.value.params.task_id).toBe(NEXT_TASK_ID)
  })
})

describe('Task.vue comment events', () => {
  const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]
  const comment = { id: 'comment-1', text: 'v1', previews: [] }

  it('mounts the player once a comment brings the first preview', async () => {
    // The store replaces its lists when the comment lands, and the page
    // notices the new length.
    let storeComments = []
    let storePreviews = []
    const { wrapper, socket } = await mountPage({
      getterOverrides: {
        getTaskComments: () => () => storeComments,
        getTaskPreviews: () => () => storePreviews
      }
    })
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)

    storeComments = [comment]
    storePreviews = previews
    await emitCommentNew(socket, TASK_ID)

    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)
  })

  it('keeps the player unmounted while the task is still loading', async () => {
    // The store keeps the lists of a task viewed earlier (a side panel, a
    // previous visit): the player must not mount on them against a null
    // task, its render throws on the task's production.
    const { wrapper, socket } = await mountPage({
      comments: [comment],
      previews,
      pendingTaskLoad: true
    })
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)

    await emitCommentNew(socket, TASK_ID)

    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)
  })

  // App.vue reloads the comment of a task the event names. Older Zou
  // versions leave the task out of the preview events.
  describe('comment:update', () => {
    const emitCommentUpdate = (socket, eventData) => {
      const [, onCommentUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'comment:update'
      )
      onCommentUpdate(eventData)
    }
    const reloads = store =>
      store.dispatch.mock.calls.filter(([type]) => type === 'loadComment')

    it('reloads a comment it shows when the event names no task', async () => {
      const { socket, store } = await mountPage({ comments: [comment] })
      emitCommentUpdate(socket, { comment_id: comment.id })
      expect(reloads(store)).toEqual([
        ['loadComment', { commentId: comment.id }]
      ])
    })

    it('leaves to App.vue a comment whose task the event names', async () => {
      const { socket, store } = await mountPage({ comments: [comment] })
      emitCommentUpdate(socket, { comment_id: comment.id, task_id: TASK_ID })
      expect(reloads(store)).toEqual([])
    })

    it('leaves alone the comments it does not show', async () => {
      const { socket, store } = await mountPage({ comments: [comment] })
      emitCommentUpdate(socket, { comment_id: 'comment-of-another-task' })
      expect(reloads(store)).toEqual([])
    })

    it('leaves a bug in the reload to Sentry', async () => {
      const bug = new TypeError('Cannot read properties of undefined')
      const { socket, store } = await mountPage({ comments: [comment] })
      store.dispatch.mockImplementation(type =>
        type === 'loadComment' ? Promise.reject(bug) : Promise.resolve()
      )

      const rejections = await recordUnhandledRejections(() =>
        emitCommentUpdate(socket, { comment_id: comment.id })
      )

      expect(rejections).toEqual([bug])
    })
  })

  // The panel the player holds for its full screen comments gets the same
  // events as the page.
  describe('comment:acknowledge', () => {
    const TEAMMATE_ID = 'person-2'

    it.each([
      ['comment:acknowledge', [], [TEAMMATE_ID]],
      ['comment:unacknowledge', [TEAMMATE_ID], []]
    ])(
      'applies a %s of a teammate once, however many panels get it',
      async (event, acknowledgements, expected) => {
        const acknowledged = { ...comment, acknowledgements }
        const { socket, store } = await mountPage({
          comments: [acknowledged],
          getterOverrides: {
            personMap: () => new Map([[TEAMMATE_ID, { id: TEAMMATE_ID }]])
          }
        })
        // The toggle of the ACK_COMMENT mutation.
        store.commit.mockImplementation((type, payload) => {
          if (type === 'ACK_COMMENT') {
            const { user } = payload
            acknowledged.acknowledgements =
              acknowledged.acknowledgements.includes(user.id)
                ? acknowledged.acknowledgements.filter(id => id !== user.id)
                : [...acknowledged.acknowledgements, user.id]
          }
        })
        const [, handler] = socket.on.mock.calls.find(
          ([name]) => name === event
        )

        handler({ comment_id: acknowledged.id, person_id: TEAMMATE_ID })
        handler({ comment_id: acknowledged.id, person_id: TEAMMATE_ID })

        expect(acknowledged.acknowledgements).toEqual(expected)
      }
    )
  })
})

describe('Task.vue comment actions', () => {
  const comments = [
    { id: 'comment-1', text: 'v1' },
    { id: 'comment-2', text: 'v2' }
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
    const { wrapper, store } = await mountPage({ comments })
    store.dispatch.mockImplementation(type =>
      type === action ? Promise.reject(error) : Promise.resolve()
    )

    emitOn(wrapper, comments[0], event)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith(action, comments[0])
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('flags the comment whose action failed', async () => {
    const { wrapper, store } = await mountPage({ comments })
    await failAck(wrapper, store, comments[1])
    expect(actionErrors(wrapper)).toEqual([false, true])
  })

  it('clears the flag on the next action', async () => {
    const { wrapper, store } = await mountPage({ comments })
    await failAck(wrapper, store, comments[1])

    emitOn(wrapper, comments[0], 'pin-comment')
    await flushPromises()

    expect(actionErrors(wrapper)).toEqual([false, false])
  })

  it('clears the flag when the page shows another task', async () => {
    const task = buildTask()
    const otherTask = buildTask({ id: 'task-2' })
    const { wrapper, store, router } = await mountPage({
      task,
      comments,
      // The stubbed getter hands the same comments to the other task.
      getterOverrides: {
        taskMap: () =>
          new Map([
            [task.id, task],
            [otherTask.id, otherTask]
          ])
      }
    })
    await failAck(wrapper, store, comments[1])

    await router.push({
      name: 'task',
      params: { ...TASK_ROUTE_PARAMS, task_id: otherTask.id }
    })
    await flushPromises()

    expect(actionErrors(wrapper)).toEqual([false, false])
  })
})

describe('Task.vue comment edits', () => {
  // The window of another comment can open while the first one saves.
  it('saves the attachments of an edit on the comment it opened on', async () => {
    const first = { id: 'comment-1', text: 'v1' }
    const second = { id: 'comment-2', text: 'v2' }
    let releaseDeletion = null
    const { wrapper, store } = await mountPage({
      comments: [first, second],
      actions: {
        deleteAttachment: vi
          .fn()
          .mockImplementationOnce(
            () =>
              new Promise(resolve => {
                releaseDeletion = resolve
              })
          )
          .mockResolvedValue()
      }
    })
    const editOn = comment =>
      wrapper
        .findAllComponents(Comment)
        .find(component => component.props('comment').id === comment.id)
        .vm.$emit('edit-comment', comment)
    const attachments = [{ id: 'attachment-1' }, { id: 'attachment-2' }]
    const file = new File(['frame'], 'ref.png')
    editOn(first)
    await flushPromises()
    wrapper.findComponent(EditCommentModal).vm.$emit('confirm', {
      ...first,
      text: 'v1 bis',
      attachmentFilesToDelete: attachments,
      newAttachmentFiles: [file]
    })
    await flushPromises()
    wrapper.findComponent(EditCommentModal).vm.$emit('cancel')
    editOn(second)
    await flushPromises()

    releaseDeletion()
    await flushPromises()

    attachments.forEach(attachment => {
      expect(store.dispatch).toHaveBeenCalledWith('deleteAttachment', {
        attachment,
        comment: first
      })
    })
    expect(store.dispatch).toHaveBeenCalledWith('addAttachmentToComment', {
      comment: first,
      files: [file]
    })
  })
})

// A save that fails once its window is closed sets the error of that window:
// the next opening starts without it.
describe('Task.vue window errors', () => {
  const file = {
    id: 'preview-1',
    task_id: TASK_ID,
    revision: 1,
    extension: 'png'
  }
  const comment = { id: 'comment-1', text: 'v1', previews: [file] }
  const deletion = text => wrapper =>
    wrapper
      .findAllComponents(DeleteModal)
      .find(modal => modal.props('text') === text)
  const extraFile = () => {
    const form = new FormData()
    form.append('file', new File(['frame'], 'sh010-alt.png'))
    return form
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    {
      name: 'comment edit',
      action: 'editTaskComment',
      open: wrapper =>
        wrapper.findComponent(Comment).vm.$emit('edit-comment', comment),
      modal: wrapper => wrapper.findComponent(EditCommentModal),
      confirm: modal => modal.vm.$emit('confirm', { ...comment, text: 'v2' })
    },
    {
      name: 'comment deletion',
      action: 'deleteTaskComment',
      open: wrapper =>
        wrapper.findComponent(Comment).vm.$emit('delete-comment', comment),
      modal: deletion('tasks.delete_comment'),
      confirm: modal => modal.vm.$emit('confirm')
    },
    {
      name: 'revision file upload',
      action: 'addCommentExtraPreview',
      open: wrapper =>
        wrapper.findComponent(PreviewPlayer).vm.$emit('add-extra-preview'),
      modal: wrapper => wrapper.findComponent({ ref: 'add-extra-preview-modal' }),
      confirm: modal => modal.vm.$emit('confirm', [extraFile()])
    },
    {
      name: 'revision file removal',
      action: 'deleteTaskPreview',
      open: wrapper =>
        wrapper
          .findComponent(PreviewPlayer)
          .vm.$emit('remove-extra-preview', { id: 'preview-1' }),
      modal: deletion('tasks.delete_preview'),
      confirm: modal => modal.vm.$emit('confirm')
    }
  ])(
    'opens the $name window without the error of a save that failed after it closed',
    async ({ action, open, modal, confirm }) => {
      const failure = new Error('Bad Gateway')
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      let fail = null
      const { wrapper } = await mountPage({
        comments: [comment],
        previews: [{ ...file, previews: [file] }],
        actions: {
          [action]: () =>
            new Promise((resolve, reject) => {
              fail = reject
            })
        },
        stubs: {
          AddPreviewModal: {
            props: ['active', 'isError', 'isLoading'],
            template: '<div />',
            methods: { reset: () => {} }
          },
          PreviewPlayer: {
            props: ['previews'],
            template: '<div />',
            methods: {
              displayFirst: () => {},
              displayLast: () => {},
              focus: () => {}
            }
          }
        }
      })
      open(wrapper)
      await flushPromises()
      confirm(modal(wrapper))
      await flushPromises()
      modal(wrapper).vm.$emit('cancel')
      await flushPromises()

      fail(failure)
      await flushPromises()
      open(wrapper)
      await flushPromises()

      expect(consoleError).toHaveBeenCalledWith(failure)
      expect(modal(wrapper).props('active')).toBe(true)
      expect(modal(wrapper).props('isError')).toBe(false)
    }
  )
})

describe('Task.vue publishing', () => {
  const previewForm = name => {
    const form = new FormData()
    form.append('file', new File(['frame'], name))
    return form
  }

  const mountCommentingPage = async (options = {}) => {
    const reset = vi.fn()
    const mounted = await mountPage({
      ...options,
      getterOverrides: {
        isCurrentUserProductionManager: () => true,
        ...options.getterOverrides
      },
      stubs: {
        AddComment: {
          props: ['previewForms'],
          template: '<div />',
          methods: { focus: () => {}, reset }
        },
        ...options.stubs
      }
    })
    return { ...mounted, reset }
  }

  const commentBox = wrapper => wrapper.findComponent(AddComment)

  it('publishes the files of its comment box with the comment', async () => {
    const { wrapper, store } = await mountCommentingPage()
    const form = previewForm('sh010.mp4')

    commentBox(wrapper).vm.$emit('file-drop', [form])
    commentBox(wrapper).vm.$emit('add-comment', 'Done', [], [], 'status-1')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith(
      'commentTaskWithPreview',
      expect.objectContaining({ taskId: TASK_ID, forms: [form] })
    )
  })

  // The extra preview modal may upload at the same time.
  it('clears the progress of the published files only', async () => {
    const { wrapper, store } = await mountCommentingPage()

    commentBox(wrapper).vm.$emit('file-drop', [previewForm('sh010.mp4')])
    commentBox(wrapper).vm.$emit('add-comment', 'Done', [], [], 'status-1')
    await flushPromises()

    expect(store.commit).toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS', [
      'sh010.mp4'
    ])
    expect(store.commit).not.toHaveBeenCalledWith('CLEAR_UPLOAD_PROGRESS')
  })

  it('keeps the files of its comment box when a comment is deleted', async () => {
    const comment = { id: 'comment-1', text: 'v1' }
    const { wrapper, store } = await mountCommentingPage({
      comments: [comment]
    })
    const form = previewForm('sh010.mp4')
    commentBox(wrapper).vm.$emit('file-drop', [form])
    wrapper.findComponent(Comment).vm.$emit('delete-comment', comment)
    await flushPromises()

    wrapper
      .findAllComponents(DeleteModal)
      .find(modal => modal.props('active'))
      .vm.$emit('confirm')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('deleteTaskComment', {
      taskId: TASK_ID,
      commentId: comment.id
    })
    expect(commentBox(wrapper).props('previewForms')).toEqual([form])
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
      vi.useRealTimers()
    })

    it('keeps the comment box files when the modal opens', async () => {
      const previews = [
        { id: 'preview-1', revision: 1, extension: 'mp4', previews: [] }
      ]
      const { wrapper, store } = await mountCommentingPage({ previews })
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
      const { wrapper } = await mountCommentingPage({
        getterOverrides: { uploadProgress: () => uploadProgress }
      })

      expect(extraModal(wrapper).vm.$attrs['upload-progress']).toEqual(
        uploadProgress
      )
    })

    it('keeps the comment box files once the extra preview is added', async () => {
      const { wrapper, store } = await mountCommentingPage()
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
      const { wrapper, store } = await mountCommentingPage()
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

    // The upload can end once the page shows a task without previews, and
    // so without a player.
    it('adds an extra preview once the page left its player', async () => {
      const task = buildTask()
      const otherTask = buildTask({ id: 'task-2' })
      const previews = [
        { id: 'preview-1', revision: 1, extension: 'mp4', previews: [] }
      ]
      const { wrapper, store, router } = await mountCommentingPage({
        task,
        getterOverrides: {
          getTaskPreviews: () => taskId =>
            taskId === task.id ? previews : [],
          taskMap: () =>
            new Map([
              [task.id, task],
              [otherTask.id, otherTask]
            ])
        }
      })
      vi.useFakeTimers({ toFake: ['setTimeout'] })
      let endUpload
      store.dispatch.mockImplementation(type =>
        type === 'addCommentExtraPreview'
          ? new Promise(resolve => {
              endUpload = resolve
            })
          : Promise.resolve()
      )

      extraModal(wrapper).vm.$emit('confirm', [previewForm('sh010-alt.png')])
      await router.push({
        name: 'task',
        params: { ...TASK_ROUTE_PARAMS, task_id: otherTask.id }
      })
      await flushPromises()
      expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(false)
      endUpload()
      await flushPromises()

      expect(() => vi.runAllTimers()).not.toThrow()
    })

    // The upload ends on the task it went to: a task the page moved on to
    // meanwhile keeps the revision its player shows.
    describe('once the extra preview is uploaded', () => {
      const previews = [
        { id: 'preview-1', revision: 1, extension: 'mp4', previews: [] }
      ]
      const playerWithLast = displayLast => ({
        props: ['fps', 'previews', 'readOnly'],
        template: '<div />',
        data: () => ({
          currentPreview: { id: 'preview-1', task_id: TASK_ID },
          notSaved: false
        }),
        methods: {
          displayFirst: () => {},
          displayLast,
          focus: () => {},
          isValidPreviewModification: () => true,
          setCurrentFrame: () => {}
        }
      })

      it('shows the last revision of the task', async () => {
        const displayLast = vi.fn()
        const { wrapper } = await mountCommentingPage({
          previews,
          stubs: { PreviewPlayer: playerWithLast(displayLast) }
        })
        vi.useFakeTimers({ toFake: ['setTimeout'] })

        extraModal(wrapper).vm.$emit('confirm', [previewForm('sh010-alt.png')])
        await flushPromises()
        vi.runAllTimers()

        expect(displayLast).toHaveBeenCalledTimes(1)
      })

      it('leaves the player of the task the page moved on to', async () => {
        const task = buildTask()
        const otherTask = buildTask({ id: 'task-2' })
        const displayLast = vi.fn()
        const { wrapper, store, router } = await mountCommentingPage({
          task,
          previews,
          getterOverrides: {
            taskMap: () =>
              new Map([
                [task.id, task],
                [otherTask.id, otherTask]
              ])
          },
          stubs: { PreviewPlayer: playerWithLast(displayLast) }
        })
        vi.useFakeTimers({ toFake: ['setTimeout'] })
        let endUpload
        store.dispatch.mockImplementation(type =>
          type === 'addCommentExtraPreview'
            ? new Promise(resolve => {
                endUpload = resolve
              })
            : Promise.resolve()
        )

        extraModal(wrapper).vm.$emit('confirm', [previewForm('sh010-alt.png')])
        await router.push({
          name: 'task',
          params: { ...TASK_ROUTE_PARAMS, task_id: otherTask.id }
        })
        await flushPromises()
        expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)
        endUpload()
        await flushPromises()
        vi.runAllTimers()

        expect(displayLast).not.toHaveBeenCalled()
      })
    })
  })

  it('uploads the files of the extra preview modal', async () => {
    const { wrapper, store } = await mountCommentingPage()
    // Left pending: the end of the upload only refreshes the player.
    store.dispatch.mockImplementation(() => new Promise(() => {}))
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
    const publish = async wrapper => {
      commentBox(wrapper).vm.$emit('file-drop', [previewForm('sh010.mp4')])
      commentBox(wrapper).vm.$emit('add-comment', 'Done', [], [], 'status-1')
      await flushPromises()
    }

    afterEach(() => localStorage.clear())

    it('empties the comment box of the published task', async () => {
      const { wrapper, reset } = await mountCommentingPage()
      drafts.setTaskDraft(TASK_ID, { text: 'Done' })

      await publish(wrapper)

      expect(commentBox(wrapper).props('previewForms')).toEqual([])
      expect(reset).toHaveBeenCalled()
      expect(drafts.getTaskDraft(TASK_ID)).toBeNull()
    })

    it('leaves alone the comment box of the task shown since', async () => {
      const task = buildTask()
      const otherTask = buildTask({ id: 'task-2' })
      const { wrapper, store, router, reset } = await mountCommentingPage({
        task,
        getterOverrides: {
          taskMap: () =>
            new Map([
              [task.id, task],
              [otherTask.id, otherTask]
            ])
        }
      })
      let endUpload
      store.dispatch.mockImplementation(type =>
        type === 'commentTaskWithPreview'
          ? new Promise(resolve => {
              endUpload = resolve
            })
          : Promise.resolve()
      )
      drafts.setTaskDraft(task.id, { text: 'Done' })
      drafts.setTaskDraft(otherTask.id, { text: 'Lighting fixed' })

      await publish(wrapper)
      await router.push({
        name: 'task',
        params: { ...TASK_ROUTE_PARAMS, task_id: otherTask.id }
      })
      await flushPromises()
      const otherForm = previewForm('sh020.mp4')
      commentBox(wrapper).vm.$emit('file-drop', [otherForm])
      endUpload()
      await flushPromises()

      expect(commentBox(wrapper).props('previewForms')).toEqual([otherForm])
      expect(reset).not.toHaveBeenCalled()
      expect(drafts.getTaskDraft(task.id)).toBeNull()
      expect(drafts.getTaskDraft(otherTask.id)).toEqual({
        text: 'Lighting fixed',
        checklist: []
      })
    })
  })
})

describe('Task.vue navigation', () => {
  const taskTypes = [
    { id: 'tt-layout', name: 'Layout', for_entity: 'Shot', priority: 1 },
    { id: 'tt-anim', name: 'Animation', for_entity: 'Shot', priority: 2 },
    { id: 'tt-light', name: 'Lighting', for_entity: 'Shot', priority: 3 }
  ]
  const task = buildTask({ task_type_id: 'tt-anim' })
  const tasks = [
    task,
    { id: 'task-layout', task_type_id: 'tt-layout', entity_id: 'entity-1' },
    { id: 'task-light', task_type_id: 'tt-light', entity_id: 'entity-1' },
    { id: 'task-0-anim', task_type_id: 'tt-anim', entity_id: 'entity-0' },
    { id: 'task-2-layout', task_type_id: 'tt-layout', entity_id: 'entity-2' },
    { id: 'task-4-layout', task_type_id: 'tt-layout', entity_id: 'entity-4' },
    { id: 'task-3-anim', task_type_id: 'tt-anim', entity_id: 'entity-3' }
  ]

  // The header renders the task type chevrons inside .task-type, and the
  // entity chevrons in the status block next to it. Each pair reads
  // [previous, next].
  const typeLinks = wrapper =>
    wrapper.findAll('.task-type a').map(link => link.attributes('data-task'))
  const entityLinks = wrapper =>
    wrapper
      .findAll('.header-title > div:not(.task-type) a')
      .map(link => link.attributes('data-task'))

  const mountWith = ({
    entities,
    production = {},
    currentTask = task,
    getterOverrides = {}
  } = {}) => {
    // entityList reads the module cache, not the store.
    shotsStore.cache.shots.push(...entities)
    return mountPage({
      task: currentTask,
      getterOverrides: {
        currentProduction: () => ({
          id: 'production-1',
          team: [],
          task_types: taskTypes.map(taskType => taskType.id),
          fps: 25,
          ...production
        }),
        // The list of the page, loaded.
        isShotsLoading: () => false,
        shotsLoadingKey: () => 'production-1/',
        taskMap: () =>
          new Map([...tasks, currentTask].map(item => [item.id, item])),
        taskTypeMap: () =>
          new Map(taskTypes.map(taskType => [taskType.id, taskType])),
        ...getterOverrides
      }
    })
  }

  afterEach(() => {
    shotsStore.cache.shots.length = 0
    sequencesStore.cache.sequences.length = 0
  })

  describe('between the task types of an entity', () => {
    it('walks the task types in priority order, not in storage order', async () => {
      const { wrapper } = await mountWith({
        // Declared in an order the sort has to undo.
        entities: [{ id: 'entity-1', tasks: ['task-light', TASK_ID, 'task-layout'] }]
      })
      expect(typeLinks(wrapper)).toEqual(['task-layout', 'task-light'])
    })

    it('wraps back to the last task type from the first one', async () => {
      const { wrapper } = await mountWith({
        // Animation outranks Lighting, so the current task opens the list.
        entities: [{ id: 'entity-1', tasks: ['task-light', TASK_ID] }]
      })
      expect(typeLinks(wrapper)).toEqual(['task-light', 'task-light'])
    })

    it('wraps on to the first task type from the last one', async () => {
      const { wrapper } = await mountWith({
        // Layout outranks Animation, so the current task closes the list.
        entities: [{ id: 'entity-1', tasks: ['task-layout', TASK_ID] }]
      })
      expect(typeLinks(wrapper)).toEqual(['task-layout', 'task-layout'])
    })

    it('lets the production reorder the task types', async () => {
      const { wrapper } = await mountWith({
        entities: [{ id: 'entity-1', tasks: ['task-light', TASK_ID, 'task-layout'] }],
        // Lighting and Layout swap ranks, which swaps both neighbours.
        production: { task_types_priority: { 'tt-light': 1, 'tt-layout': 3 } }
      })
      expect(typeLinks(wrapper)).toEqual(['task-light', 'task-layout'])
    })

    it('offers no link when the entity is not in the list', async () => {
      const { wrapper } = await mountWith({
        entities: [{ id: 'entity-9', tasks: [] }]
      })
      expect(typeLinks(wrapper)).toEqual([])
    })
  })

  describe('between the entities of a task type', () => {
    it('keeps the task type while moving to another entity', async () => {
      const { wrapper } = await mountWith({
        entities: [
          { id: 'entity-0', tasks: ['task-0-anim'] },
          { id: 'entity-1', tasks: [TASK_ID] },
          { id: 'entity-3', tasks: ['task-3-anim'] }
        ]
      })
      expect(entityLinks(wrapper)).toEqual(['task-0-anim', 'task-3-anim'])
    })

    it('skips an entity that carries no task of that type', async () => {
      const { wrapper } = await mountWith({
        // The current entity is walled in by two entities without an
        // Animation task, so both directions have to step over one.
        entities: [
          { id: 'entity-0', tasks: ['task-0-anim'] },
          { id: 'entity-2', tasks: ['task-2-layout'] },
          { id: 'entity-1', tasks: [TASK_ID] },
          { id: 'entity-4', tasks: ['task-4-layout'] },
          { id: 'entity-3', tasks: ['task-3-anim'] }
        ]
      })
      expect(entityLinks(wrapper)).toEqual(['task-0-anim', 'task-3-anim'])
    })

    it('offers no link when no other entity carries that task type', async () => {
      const { wrapper } = await mountWith({
        entities: [
          { id: 'entity-1', tasks: [TASK_ID] },
          { id: 'entity-2', tasks: ['task-2-layout'] }
        ]
      })
      // The search stops once it comes back to the entity it started from.
      expect(entityLinks(wrapper)).toEqual([])
    })

    it('offers no link when the entity is not in the list', async () => {
      const { wrapper } = await mountWith({
        entities: [{ id: 'entity-9', tasks: ['task-3-anim'] }]
      })
      expect(entityLinks(wrapper)).toEqual([])
    })
  })

  // The page loads the list of its episode once the task shows.
  describe('list of the page', () => {
    const entities = [
      { id: 'entity-0', tasks: ['task-0-anim'] },
      { id: 'entity-1', tasks: [TASK_ID] },
      { id: 'entity-3', tasks: ['task-3-anim'] }
    ]

    it('offers no link while that list loads, then walks it', async () => {
      const isLoading = ref(true)
      const { wrapper } = await mountWith({
        entities,
        getterOverrides: { isShotsLoading: () => isLoading.value }
      })
      expect(entityLinks(wrapper)).toEqual([])

      isLoading.value = false
      await flushPromises()
      expect(entityLinks(wrapper)).toEqual(['task-0-anim', 'task-3-anim'])
    })

    it('offers no link over the list of another episode', async () => {
      const { wrapper } = await mountWith({
        entities,
        getterOverrides: {
          currentEpisode: () => ({ id: 'episode-1' }),
          isTVShow: () => true,
          shotsLoadingKey: () => 'production-1/episode-3#partial'
        }
      })
      expect(entityLinks(wrapper)).toEqual([])
    })

    // A task the store reloads (task:update) carries its own episode, for an
    // asset its source, which may not be the episode of the page for an asset
    // cast in from another one. Opened under it, a neighbor leaves the list.
    it('opens a neighbor under the episode of the URL', async () => {
      const { wrapper, router } = await mountWith({
        entities,
        currentTask: buildTask({ task_type_id: 'tt-anim', episode_id: 'episode-2' }),
        getterOverrides: {
          currentEpisode: () => ({ id: 'episode-1' }),
          isTVShow: () => true,
          shotsLoadingKey: () => 'production-1/episode-1'
        }
      })
      await router.push({
        name: 'episode-task',
        params: { ...TASK_ROUTE_PARAMS, episode_id: 'episode-1' }
      })
      await flushPromises()
      expect(
        wrapper
          .findAll('.header-title > div:not(.task-type) a')
          .map(link => link.attributes('data-episode'))
      ).toEqual(['episode-1', 'episode-1'])
    })

    // The page reloads them without the tasks the chevrons read.
    it('keeps walking the sequences the store holds', async () => {
      sequencesStore.cache.sequences.push(...entities)
      const { wrapper } = await mountWith({
        entities: [],
        currentTask: buildTask({
          task_type_id: 'tt-anim',
          entity_type_name: 'Sequence'
        }),
        getterOverrides: { sequencesLoadingKey: () => 'production-1/#partial' }
      })
      expect(entityLinks(wrapper)).toEqual(['task-0-anim', 'task-3-anim'])
    })
  })
})

describe('Task.vue fps', () => {
  const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]

  const playerFps = wrapper => wrapper.findComponent(PreviewPlayer).props('fps')

  it('uses the production fps by default', async () => {
    const { wrapper } = await mountPage({ previews })
    expect(playerFps(wrapper)).toBe(30)
  })

  it('keeps a fractional production fps', async () => {
    const { wrapper } = await mountPage({
      previews,
      getterOverrides: {
        productionMap: () => new Map([['production-1', { fps: '23.976' }]])
      }
    })
    expect(playerFps(wrapper)).toBe(23.976)
  })

  it('lets the entity override the production fps', async () => {
    // The video was rendered at the entity rate; using the production one
    // would duplicate or drop frames in the player.
    const { wrapper } = await mountPage({
      previews,
      getterOverrides: {
        shotMap: () => new Map([['entity-1', { id: 'entity-1', data: { fps: '48' } }]])
      }
    })
    expect(playerFps(wrapper)).toBe(48)
  })

  it('falls back to the default fps when the production declares none', async () => {
    const { wrapper } = await mountPage({
      previews,
      getterOverrides: { productionMap: () => new Map([['production-1', {}]]) }
    })
    expect(playerFps(wrapper)).toBe(DEFAULT_FPS)
  })

  it('keeps the decimals of a production fps', async () => {
    const { wrapper } = await mountPage({
      previews,
      getterOverrides: {
        productionMap: () => new Map([['production-1', { fps: '29.97' }]])
      }
    })
    expect(playerFps(wrapper)).toBe(29.97)
  })
})

describe('Task.vue preview player permissions', () => {
  const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]

  const isReadOnly = wrapper =>
    wrapper.findComponent(PreviewPlayer).props('readOnly')

  it('is read only for a plain artist', async () => {
    const { wrapper } = await mountPage({ previews })
    expect(isReadOnly(wrapper)).toBe(true)
  })

  it('is writable for a production manager', async () => {
    const { wrapper } = await mountPage({
      previews,
      getterOverrides: { isCurrentUserProductionManager: () => true }
    })
    expect(isReadOnly(wrapper)).toBe(false)
  })

  it('is writable for a supervisor without any department', async () => {
    const { wrapper } = await mountPage({
      previews,
      getterOverrides: {
        isCurrentUserProductionSupervisor: () => true,
        user: () => ({ id: 'user-1', departments: [] })
      }
    })
    expect(isReadOnly(wrapper)).toBe(false)
  })

  // Annotating and commenting are two rights: the player shows its comments
  // in full screen to whoever can comment here.
  it.each([
    ['a plain artist', false, {}],
    ['an assigned artist', true, { task: buildTask({ assignees: ['user-1'] }) }]
  ])('lets %s comment in the player: %s', async (_, canComment, options) => {
    const { wrapper } = await mountPage({ previews, ...options })
    expect(wrapper.findComponent(PreviewPlayer).props('canComment')).toBe(
      canComment
    )
  })

  it('is read only for a supervisor of another department', async () => {
    const { wrapper } = await mountPage({
      previews,
      getterOverrides: {
        isCurrentUserProductionSupervisor: () => true,
        user: () => ({ id: 'user-1', departments: ['department-2'] }),
        taskTypeMap: () =>
          new Map([[taskType.id, { ...taskType, department_id: 'department-1' }]])
      }
    })
    expect(isReadOnly(wrapper)).toBe(true)
  })

  // The page keeps the previews of the previous task until the comments of
  // the next one load: a drawing went onto them with the rights of the next
  // task, and Zou refused it.
  describe('on the previews of the previous task', () => {
    const ownTaskType = { ...taskType, department_id: 'department-1' }
    const otherTaskType = {
      ...taskType,
      id: 'task-type-2',
      department_id: 'department-2'
    }
    const ownTask = id => buildTask({ id })
    const otherTask = id => buildTask({ id, task_type_id: otherTaskType.id })
    const previewsByTask = {
      [TASK_ID]: [
        { id: 'preview-1', revision: 1, task_id: TASK_ID, previews: ['1'] }
      ],
      'task-2': [
        { id: 'preview-2', revision: 1, task_id: 'task-2', previews: ['2'] }
      ]
    }

    it.each([
      {
        title: 'locks them for a supervisor of another department',
        previousTask: otherTask(TASK_ID),
        nextTask: ownTask('task-2'),
        role: 'supervisor',
        readOnlyWhileLoading: true,
        readOnlyOnceLoaded: false
      },
      {
        title: 'leaves them open to a supervisor of their department',
        previousTask: ownTask(TASK_ID),
        nextTask: otherTask('task-2'),
        role: 'supervisor',
        readOnlyWhileLoading: false,
        readOnlyOnceLoaded: true
      },
      {
        title: 'leaves them open to a manager',
        previousTask: otherTask(TASK_ID),
        nextTask: ownTask('task-2'),
        role: 'manager',
        readOnlyWhileLoading: false,
        readOnlyOnceLoaded: false
      },
      {
        title: 'locks them once the store drops their task',
        previousTask: otherTask(TASK_ID),
        nextTask: ownTask('task-2'),
        role: 'manager',
        isPreviousTaskDropped: true,
        readOnlyWhileLoading: true,
        readOnlyOnceLoaded: false
      }
    ])(
      '$title',
      async ({
        previousTask,
        nextTask,
        role,
        isPreviousTaskDropped = false,
        readOnlyWhileLoading,
        readOnlyOnceLoaded
      }) => {
        const tasks = new Map([
          [previousTask.id, previousTask],
          [nextTask.id, nextTask]
        ])
        const { wrapper, store, router } = await mountPage({
          task: previousTask,
          getterOverrides: {
            getTaskPreviews: () => taskId => previewsByTask[taskId] ?? [],
            isCurrentUserProductionManager: () => role === 'manager',
            isCurrentUserProductionSupervisor: () => role === 'supervisor',
            taskMap: () => tasks,
            taskTypeMap: () =>
              new Map([
                [ownTaskType.id, ownTaskType],
                [otherTaskType.id, otherTaskType]
              ]),
            user: () => ({ id: 'user-1', departments: ['department-1'] })
          }
        })
        const player = () => wrapper.findComponent(PreviewPlayer)
        let endCommentsLoad
        store.dispatch.mockImplementation(type =>
          type === 'loadTaskComments'
            ? new Promise(resolve => {
                endCommentsLoad = resolve
              })
            : Promise.resolve()
        )
        if (isPreviousTaskDropped) tasks.delete(previousTask.id)

        await router.push({
          name: 'task',
          params: { ...TASK_ROUTE_PARAMS, task_id: nextTask.id }
        })
        await flushPromises()

        expect(player().props('previews')).toEqual(['1'])
        expect(isReadOnly(wrapper)).toBe(readOnlyWhileLoading)

        endCommentsLoad()
        await flushPromises()

        expect(player().props('previews')).toEqual(['2'])
        expect(isReadOnly(wrapper)).toBe(readOnlyOnceLoaded)
      }
    )

    // The player sends the strokes of the previous preview as its preview
    // changes, once the page shows the next task.
    it('files a drawing under the task of its preview', async () => {
      const confirmAnnotationsSaved = vi.fn()
      const tasks = new Map([
        [TASK_ID, ownTask(TASK_ID)],
        ['task-2', ownTask('task-2')]
      ])
      const { wrapper, store, router } = await mountPage({
        task: ownTask(TASK_ID),
        stubs: {
          PreviewPlayer: {
            props: ['previews', 'readOnly'],
            template: '<div />',
            methods: {
              confirmAnnotationsSaved,
              focus: () => {},
              restoreFailedAnnotations: () => {}
            }
          }
        },
        getterOverrides: {
          getTaskPreviews: () => taskId => previewsByTask[taskId] ?? [],
          isCurrentUserProductionManager: () => true,
          taskMap: () => tasks
        }
      })
      await router.push({
        name: 'task',
        params: { ...TASK_ROUTE_PARAMS, task_id: 'task-2' }
      })
      await flushPromises()
      const changes = {
        preview: { id: 'preview-1', task_id: TASK_ID },
        additions: [{ id: 'stroke-1' }],
        deletions: [],
        updates: []
      }

      wrapper
        .findComponent(PreviewPlayer)
        .vm.$emit('annotation-changed', changes)
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith('updatePreviewAnnotation', {
        taskId: TASK_ID,
        ...changes
      })
      expect(confirmAnnotationsSaved).toHaveBeenCalled()
    })
  })
})

describe('Task.vue metadata values', () => {
  const descriptorOf = (data_type, extra = {}) => ({
    id: 'descriptor-1',
    name: 'Field',
    field_name: 'field',
    data_type,
    task_type_id: taskType.id,
    ...extra
  })

  const renderWith = (data_type, value, getterOverrides = {}) =>
    mountPage({
      task: buildTask({ data: { field: value } }),
      getterOverrides: {
        taskMetadataDescriptors: () => [descriptorOf(data_type)],
        ...getterOverrides
      }
    })

  it('renders a person descriptor as the person name', async () => {
    const { wrapper } = await renderWith('person', 'person-1', {
      personMap: () => new Map([['person-1', { id: 'person-1', name: 'Ada' }]])
    })
    expect(wrapper.text()).toContain('Ada')
  })

  it('renders an unknown person as an empty value', async () => {
    const { wrapper } = await renderWith('person', 'person-missing')
    expect(wrapper.text()).not.toContain('person-missing')
  })

  it('renders a plain string descriptor as is', async () => {
    const { wrapper } = await renderWith('string', 'hello')
    expect(wrapper.text()).toContain('hello')
  })

  it('renders an empty value as an empty string', async () => {
    const { wrapper } = await renderWith('string', '')
    const row = wrapper
      .findAll('tr.datatable-row')
      .find(candidate => candidate.find('.field-label').text() === 'Field')
    expect(row.findAll('td')[1].text()).toEqual('')
  })
})

// Zou may still build the files of a preview another user adds.
describe('Task.vue preview-file:add-file', () => {
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
    const { socket, store } = await mountPage({
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
    expect(store.dispatch).toHaveBeenCalledWith('registerPreviewFileStatuses', [
      { id: 'preview-2', status: 'processing' }
    ])
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
    const { socket, store } = await mountPage({
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
    const { socket, store } = await mountPage({
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

describe('Task.vue preview-file:update', () => {
  const emitPreviewFileUpdate = async (socket, eventData) => {
    const [, onPreviewFileUpdate] = socket.on.mock.calls.find(
      ([event]) => event === 'preview-file:update'
    )
    onPreviewFileUpdate(eventData)
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
    const { socket, store } = await mountPage({ comments: [comment] })
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
    const { socket, store } = await mountPage({
      comments: [comment],
      previews: [previews[0]]
    })
    store.dispatch = vi.fn(type => {
      if (type === 'refreshPreview') {
        return Promise.resolve({
          validation_status: 'wip',
          status: 'ready'
        })
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
    const { socket, store } = await mountPage({ comments: [comment] })
    store.dispatch = vi.fn(type => {
      if (type === 'refreshPreview') return Promise.resolve({})
      return Promise.resolve()
    })

    await emitPreviewFileUpdate(socket, { preview_file_id: 'unknown-preview' })

    expect(store.dispatch).not.toHaveBeenCalledWith(
      'refreshPreview',
      expect.anything()
    )
  })
})

// The page asks the player again once the refresh is back: a text may be
// typed by then, and reloading the canvas under it ended the typing.
describe('Task.vue preview-file:annotation-update', () => {
  const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]

  const emitAnnotationUpdate = async isValidPreviewModification => {
    const player = {
      isValidPreviewModification,
      loadAnnotation: vi.fn(),
      reloadAnnotations: vi.fn()
    }
    const { socket, store } = await mountPage({
      previews,
      stubs: {
        PreviewPlayer: {
          props: ['fps', 'previews', 'readOnly'],
          template: '<div />',
          data: () => ({
            currentPreview: { id: 'preview-1', task_id: TASK_ID },
            notSaved: false
          }),
          methods: player
        }
      }
    })
    const [, onAnnotationUpdate] = socket.on.mock.calls.find(
      ([event]) => event === 'preview-file:annotation-update'
    )
    onAnnotationUpdate({
      preview_file_id: 'preview-1',
      updated_at: '2026-11-03T10:00:00'
    })
    await flushPromises()
    return { player, store }
  }

  it('reloads the annotations another user saved', async () => {
    const { player, store } = await emitAnnotationUpdate(() => true)

    expect(store.dispatch).toHaveBeenCalledWith('refreshPreview', {
      previewId: 'preview-1',
      taskId: TASK_ID
    })
    expect(player.reloadAnnotations).toHaveBeenCalled()
    expect(player.loadAnnotation).toHaveBeenCalled()
  })

  it('keeps the canvas when the player refuses the refreshed update', async () => {
    const isValid = vi.fn().mockReturnValueOnce(true).mockReturnValue(false)
    const { player, store } = await emitAnnotationUpdate(isValid)

    expect(store.dispatch).toHaveBeenCalledWith(
      'refreshPreview',
      expect.anything()
    )
    expect(isValid).toHaveBeenCalledTimes(2)
    expect(isValid).toHaveBeenLastCalledWith('preview-1', '2026-11-03T10:00:00')
    expect(player.reloadAnnotations).not.toHaveBeenCalled()
    expect(player.loadAnnotation).not.toHaveBeenCalled()
  })
})

describe('Task.vue failed requests', () => {
  const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]
  // The shallow stub carries none of the player members the page reads.
  const PlayerStub = {
    props: ['fps', 'previews', 'readOnly'],
    template: '<div />',
    data: () => ({
      currentPreview: { id: 'preview-1', task_id: TASK_ID },
      notSaved: false
    }),
    methods: { isValidPreviewModification: () => true }
  }
  const error = new Error('Request has been terminated')

  const failOn = (store, action) => {
    store.dispatch.mockImplementation(type =>
      type === action ? Promise.reject(error) : Promise.resolve()
    )
  }

  let consoleError

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs an annotation refresh that fails', async () => {
    const { socket, store } = await mountPage({
      previews,
      stubs: { PreviewPlayer: PlayerStub }
    })
    failOn(store, 'refreshPreview')
    const [, onAnnotationUpdate] = socket.on.mock.calls.find(
      ([event]) => event === 'preview-file:annotation-update'
    )

    onAnnotationUpdate({
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

  it('stops the set preview spinner when the request fails', async () => {
    const { wrapper, store } = await mountPage({
      previews,
      getterOverrides: { isCurrentUserProductionManager: () => true },
      stubs: { PreviewPlayer: PlayerStub }
    })
    failOn(store, 'setPreview')
    const findButton = () =>
      wrapper
        .findAll('.set-main-preview button')
        .find(button => button.text().includes('tasks.set_preview'))

    await findButton().trigger('click')
    await flushPromises()

    expect(findButton().classes()).not.toContain('is-loading')
    expect(wrapper.find('.set-main-preview .error').text()).toBe(
      'tasks.set_preview_error'
    )
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('logs a subscription that fails', async () => {
    const { wrapper, store } = await mountPage()
    failOn(store, 'subscribeToTask')

    wrapper.findComponent(SubscribeButton).vm.$emit('click')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('subscribeToTask', TASK_ID)
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})

// The player takes a while over the snapshots, and the page can be left
// meanwhile: its comment box is gone when they come back.
describe('Task.vue annotation snapshots', () => {
  it('drops the snapshots that come back once the page is left', async () => {
    let returnSnapshots = null
    const { wrapper } = await mountPage({
      previews: [{ id: 'preview-1', revision: 1, extension: 'mp4' }],
      getterOverrides: { isCurrentUserProductionManager: () => true },
      stubs: {
        AddComment: {
          template: '<div />',
          methods: {
            focus: () => {},
            hideAnnotationLoading: () => {},
            reset: () => {},
            setAnnotationSnapshots: () => {},
            showAnnotationLoading: () => {}
          }
        },
        PreviewPlayer: {
          props: ['fps', 'previews', 'readOnly'],
          template: '<div />',
          methods: {
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

  // The snapshot buttons spin while the player takes the snapshots.
  // Closing the attachment dialog aborts its signal: the player stops.
  it('lets the attachment dialog stop the snapshots', async () => {
    const { signal } = new AbortController()
    const extractAnnotationSnapshots = vi.fn(() => Promise.resolve([]))
    const { wrapper } = await mountPage({
      previews: [{ id: 'preview-1', revision: 1, extension: 'png' }],
      getterOverrides: { isCurrentUserProductionManager: () => true },
      stubs: {
        AddComment: {
          template: '<div />',
          methods: {
            focus: () => {},
            hideAnnotationLoading: () => {},
            reset: () => {},
            setAnnotationSnapshots: () => {},
            showAnnotationLoading: () => signal
          }
        },
        PreviewPlayer: {
          props: ['fps', 'previews', 'readOnly'],
          template: '<div />',
          methods: { extractAnnotationSnapshots }
        }
      }
    })

    wrapper
      .findComponent(AddComment)
      .vm.$emit('annotation-snapshots-with-label-requested')
    await flushPromises()

    expect(extractAnnotationSnapshots).toHaveBeenCalledWith({
      withLabel: true,
      signal
    })
  })

  it('stops the snapshot loading when the snapshots fail', async () => {
    const failure = new Error('drawImage failed')
    const hideAnnotationLoading = vi.fn()
    const setAnnotationSnapshots = vi.fn()
    const { wrapper } = await mountPage({
      previews: [{ id: 'preview-1', revision: 1, extension: 'png' }],
      getterOverrides: { isCurrentUserProductionManager: () => true },
      stubs: {
        AddComment: {
          template: '<div />',
          methods: {
            focus: () => {},
            hideAnnotationLoading,
            reset: () => {},
            setAnnotationSnapshots,
            showAnnotationLoading: () => {}
          }
        },
        PreviewPlayer: {
          props: ['fps', 'previews', 'readOnly'],
          template: '<div />',
          methods: {
            extractAnnotationSnapshots: () => Promise.reject(failure)
          }
        }
      }
    })
    const errorHandler = vi.fn()
    wrapper.vm.$.appContext.config.errorHandler = errorHandler

    wrapper
      .findComponent(AddComment)
      .vm.$emit('annotation-snapshots-requested')
    await flushPromises()

    expect(hideAnnotationLoading).toHaveBeenCalledTimes(1)
    expect(setAnnotationSnapshots).not.toHaveBeenCalled()
    // Still reported, as a Vue error
    expect(errorHandler.mock.calls[0][0]).toBe(failure)
  })
})

describe('Task.vue full screen', () => {
  const previews = [
    { id: 'preview-1', revision: 1, extension: 'png', previews: ['p-1'] }
  ]

  const mountWithModals = () =>
    mountPage({
      previews,
      stubs: {
        AddPreviewModal: {
          props: ['active'],
          template: '<div />',
          methods: { reset: () => {} }
        }
      }
    })

  const openModal = async (wrapper, event, Modal) => {
    wrapper.findComponent(PreviewPlayer).vm.$emit(event, { id: 'preview-1' })
    await flushPromises()
    return wrapper
      .findAllComponents(Modal)
      .find(modal => modal.props('active'))
  }

  afterEach(() => {
    resetFullScreen()
  })

  // The browser shows the player alone: the modals of its "+" and trash
  // buttons go into it, and come back to the page once it ends.
  it.each([
    ['add-extra-preview', AddPreviewModal],
    ['remove-extra-preview', DeleteModal]
  ])('opens the %s modal in the player', async (event, Modal) => {
    const { wrapper } = await mountWithModals()
    const player = wrapper.findComponent(PreviewPlayer).element
    setFullScreenElement(player)

    const modal = await openModal(wrapper, event, Modal)
    expect(player.contains(modal.element)).toBe(true)

    setFullScreenElement(null)
    await flushPromises()
    expect(player.contains(modal.element)).toBe(false)
    expect(wrapper.element.contains(modal.element)).toBe(true)
  })

  // The modal plays the video picked for upload, which can go full screen
  // on its own.
  it.each([
    ['in the page', false],
    ['in the player in full screen', true]
  ])(
    'keeps the modal %s when its video goes full screen',
    async (_, isPlayerFullScreen) => {
      const { wrapper } = await mountWithModals()
      const player = wrapper.findComponent(PreviewPlayer).element
      if (isPlayerFullScreen) setFullScreenElement(player)
      const modal = await openModal(wrapper, 'add-extra-preview', AddPreviewModal)
      const parent = modal.element.parentNode

      const video = document.createElement('video')
      setFullScreenElement(modal.element.appendChild(video))
      await flushPromises()
      expect(modal.element.parentNode).toBe(parent)
    }
  )
})
