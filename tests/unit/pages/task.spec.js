import { flushPromises, shallowMount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
import AddComment from '@/components/widgets/AddComment.vue'
import Comment from '@/components/widgets/Comment.vue'
import PreviewPlayer from '@/components/players/players/PreviewPlayer.vue'
import { DEFAULT_FPS } from '@/lib/video'
import shotsStore from '@/store/modules/shots'

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
  previews = []
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
      }
    ]
  })
  await router.push({ name: 'task', params: TASK_ROUTE_PARAMS })
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
      taskMap: () => new Map(task ? [[task.id, task]] : []),
      taskMetadataDescriptors: () => [],
      taskStatusForCurrentUser: () => null,
      taskTypeMap: () => new Map([[taskType.id, taskType]]),
      user: () => ({ id: 'user-1', departments: [] }),
      ...getterOverrides
    }
  })
  // Record every dispatch while letting the unregistered ones resolve.
  store.dispatch = vi.fn(type => {
    dispatched.push(type)
    if (type === 'loadTask') return Promise.resolve(task)
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
          template: '<a :data-task="to?.params?.task_id"><slot /></a>'
        },
        // Provided by the animxyz plugin, which the specs do not install.
        XyzTransitionGroup: { template: '<div><slot /></div>' }
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

  it('shows the latest preview when none is selected', async () => {
    const { wrapper } = await mountPage({ previews })
    expect(playerPreviews(wrapper)).toEqual(['from-3'])
  })

  it('shows the preview named by the route', async () => {
    const { wrapper, router } = await mountPage({ previews })
    await selectPreview(router, 'preview-2')
    expect(playerPreviews(wrapper)).toEqual(['from-2'])
  })

  it('falls back to the latest preview when the selected id is unknown', async () => {
    const { wrapper, router } = await mountPage({ previews })
    await selectPreview(router, 'preview-gone')
    // A stale id in the url must not blank the player out.
    expect(wrapper.findComponent(PreviewPlayer).exists()).toBe(true)
    expect(playerPreviews(wrapper)).toEqual(['from-3'])
  })
})

describe('Task.vue timecode navigation', () => {
  const previews = [
    { id: 'preview-2', revision: 2, extension: 'mp4' },
    { id: 'preview-1', revision: 1, extension: 'mp4' }
  ]
  const comments = [{ id: 'comment-1', text: 'v1 00:04.00 (100)' }]

  const clickTimeCode = (wrapper, versionRevision) => {
    // The handler seeks the player on a timer, and the shallow player stub has
    // no seek method. Dropping the fake clock discards that pending callback.
    vi.useFakeTimers()
    wrapper
      .findComponent(Comment)
      .vm.$emit('time-code-clicked', { versionRevision, frame: 100 })
    vi.useRealTimers()
    return flushPromises()
  }

  it('opens the preview the timecode names', async () => {
    const { wrapper, router } = await mountPage({ comments, previews })
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

  const mountWith = ({ entities, production = {} } = {}) => {
    // entityList reads the module cache, not the store.
    shotsStore.cache.shots.push(...entities)
    return mountPage({
      task,
      getterOverrides: {
        currentProduction: () => ({
          id: 'production-1',
          team: [],
          task_types: taskTypes.map(taskType => taskType.id),
          fps: 25,
          ...production
        }),
        taskMap: () => new Map(tasks.map(item => [item.id, item])),
        taskTypeMap: () =>
          new Map(taskTypes.map(taskType => [taskType.id, taskType]))
      }
    })
  }

  afterEach(() => {
    shotsStore.cache.shots.length = 0
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
})

describe('Task.vue fps', () => {
  const previews = [{ id: 'preview-1', revision: 1, extension: 'mp4' }]

  const playerFps = wrapper => wrapper.findComponent(PreviewPlayer).props('fps')

  it('uses the production fps by default', async () => {
    const { wrapper } = await mountPage({ previews })
    expect(playerFps(wrapper)).toBe(30)
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
