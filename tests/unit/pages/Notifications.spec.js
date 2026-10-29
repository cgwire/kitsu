import { nextTick, ref } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('@/composables/desktopNotifications', () => ({
  useDesktopNotifications: vi.fn()
}))
vi.mock('@/lib/preferences', () => ({
  default: {
    getObjectPreference: vi.fn(() => null),
    setObjectPreference: vi.fn()
  }
}))
vi.mock('@/lib/render', () => ({ renderComment: () => '' }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import { useDesktopNotifications } from '@/composables/desktopNotifications'
import NotificationsPage from '@/components/pages/Notifications.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const ButtonSimpleStub = {
  template: '<button v-bind="$attrs"><slot /></button>',
  inheritAttrs: true
}

const makeStore = (getterOverrides = {}) => {
  const actions = {
    clearNotifications: vi.fn(),
    loadNotifications: vi.fn(() => Promise.resolve()),
    loadNotification: vi.fn(() => Promise.resolve()),
    loadMoreNotifications: vi.fn(() => Promise.resolve()),
    loadTask: vi.fn(() => Promise.resolve({})),
    toggleNotificationReadStatus: vi.fn(),
    markAllNotificationsAsRead: vi.fn(() => Promise.resolve())
  }
  const store = createStore({
    state: () => ({}),
    getters: {
      notifications: () => [],
      departmentMap: () => new Map(),
      organisation: () => ({ name: 'My Studio' }),
      personMap: () => new Map(),
      productionMap: () => new Map(),
      taskStatus: () => [],
      taskTypes: () => [],
      taskTypeMap: () => new Map(),
      user: () => ({ id: 'user-1' }),
      ...getterOverrides
    },
    actions
  })
  return { store, actions }
}

describe('Notifications.vue', () => {
  let wrapper, socketMock, store
  let dismissBannerMock, setPreferenceEnabledMock, showNotificationMock
  let shouldShowBanner, permission, isActive, preferenceEnabled

  const getSocketHandler = event =>
    socketMock.on.mock.calls.find(([e]) => e === event)?.[1]

  const mountPage = store => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }]
    })
    return shallowMount(NotificationsPage, {
      global: {
        plugins: [
          store,
          router,
          {
            install: app => {
              app.config.globalProperties.$socket = socketMock
            }
          }
        ],
        stubs: { ButtonSimple: ButtonSimpleStub }
      }
    })
  }

  beforeEach(async () => {
    socketMock = { on: vi.fn(), off: vi.fn() }
    dismissBannerMock = vi.fn()
    setPreferenceEnabledMock = vi.fn(() => Promise.resolve(false))
    showNotificationMock = vi.fn()
    shouldShowBanner = ref(true)
    permission = ref('default')
    isActive = ref(false)
    preferenceEnabled = ref(false)

    useDesktopNotifications.mockReturnValue({
      isSupported: true,
      isActive,
      permission,
      preferenceEnabled,
      shouldShowBanner,
      dismissBanner: dismissBannerMock,
      setPreferenceEnabled: setPreferenceEnabledMock,
      showNotification: showNotificationMock
    })

    ;({ store } = makeStore())
    wrapper = mountPage(store)
    await nextTick()
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('task type tag', () => {
    const notification = {
      id: 'notification-1',
      author_id: 'person-1',
      created_at: '2026-09-21T10:00:00',
      episode_id: 'episode-1',
      full_entity_name: 'SH010',
      notification_type: 'comment',
      project_id: 'production-1',
      read: false,
      task_id: 'task-1',
      task_type_id: 'task-type-1'
    }

    const remountWith = async getters => {
      wrapper.unmount()
      ;({ store } = makeStore(getters))
      wrapper = mountPage(store)
      await flushPromises()
    }

    it('passes the task type scoped to the episode when it is known', async () => {
      const taskType = { id: 'task-type-1', name: 'Animation', for_entity: 'Shot' }
      await remountWith({
        notifications: () => [notification],
        taskTypeMap: () => new Map([[taskType.id, taskType]])
      })

      expect(wrapper.findComponent(TaskTypeName).props('taskType')).toEqual({
        ...taskType,
        episode_id: 'episode-1'
      })
    })

    // A task type created after the tab loaded, or whose socket event was
    // missed, is absent from the map: the tag must not receive a partial
    // object the widget would turn into a broken link.
    it('passes null when the task type is unknown', async () => {
      await remountWith({ notifications: () => [notification] })

      expect(wrapper.findComponent(TaskTypeName).props('taskType')).toBeNull()
    })
  })

  describe('read toggle', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('logs a read status that fails to save', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = new Error('Request has been terminated')
      const notification = {
        id: 'notification-1',
        author_id: 'person-1',
        created_at: '2026-09-21T10:00:00',
        notification_type: 'comment',
        project_id: 'production-1',
        read: false,
        task_id: 'task-1',
        task_type_id: 'task-type-1'
      }
      wrapper.unmount()
      let actions
      ;({ store, actions } = makeStore({
        notifications: () => [notification]
      }))
      actions.toggleNotificationReadStatus.mockRejectedValueOnce(error)
      wrapper = mountPage(store)
      await flushPromises()

      wrapper.findComponent(BooleanField).vm.$emit('click', true)
      await flushPromises()

      expect(actions.toggleNotificationReadStatus).toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalledWith(error)
    })
  })

  describe('task selection', () => {
    const notificationOf = (id, taskId) => ({
      id,
      author_id: 'person-1',
      created_at: '2026-09-21T10:00:00',
      notification_type: 'comment',
      project_id: 'production-1',
      read: false,
      task_id: taskId,
      task_type_id: 'task-type-1'
    })
    const notifications = [
      notificationOf('notification-1', 'task-1'),
      notificationOf('notification-2', 'task-2')
    ]

    // Each task load ends on demand: the user may select another
    // notification, or change a filter, before it lands.
    const mountWithDeferredLoads = async () => {
      const settlers = new Map()
      wrapper.unmount()
      let actions
      ;({ store, actions } = makeStore({ notifications: () => notifications }))
      actions.loadTask.mockImplementation(
        (_, { taskId }) =>
          new Promise((resolve, reject) => {
            settlers.set(taskId, { resolve, reject })
          })
      )
      wrapper = mountPage(store)
      await flushPromises()
      const finish = async taskId => {
        settlers.get(taskId).resolve({ id: taskId })
        await flushPromises()
      }
      const fail = async taskId => {
        settlers.get(taskId).reject(new Error('Bad Gateway'))
        await flushPromises()
      }
      return { actions, fail, finish }
    }

    const rows = () => wrapper.findAll('.notification')
    const panelTask = () => wrapper.findComponent(TaskInfo).props('task')
    const isSelected = row => row.classes().includes('selected')

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('shows the task of the notification selected last when an earlier load ends after it', async () => {
      const { finish } = await mountWithDeferredLoads()

      await rows()[0].trigger('click')
      await rows()[1].trigger('click')
      await finish('task-2')
      await finish('task-1')

      expect(panelTask()?.id).toBe('task-2')
      expect(isSelected(rows()[0])).toBe(false)
      expect(isSelected(rows()[1])).toBe(true)
    })

    it('drops a task that loads once the notifications are loaded again', async () => {
      const { finish } = await mountWithDeferredLoads()

      await rows()[0].trigger('click')
      wrapper
        .findComponent(ComboboxTaskType)
        .vm.$emit('update:modelValue', 'task-type-1')
      await flushPromises()
      await finish('task-1')

      expect(panelTask()).toBe(null)
      expect(rows().some(isSelected)).toBe(false)
    })

    it('opens a notification clicked twice while its task loads', async () => {
      const { finish } = await mountWithDeferredLoads()

      await rows()[0].trigger('click')
      await rows()[0].trigger('click')
      await finish('task-1')

      expect(panelTask()?.id).toBe('task-1')
      expect(isSelected(rows()[0])).toBe(true)
    })

    it('loads a task again on a click after its load failed', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { actions, fail, finish } = await mountWithDeferredLoads()

      await rows()[0].trigger('click')
      await fail('task-1')
      await rows()[0].trigger('click')
      await finish('task-1')

      expect(actions.loadTask).toHaveBeenCalledTimes(2)
      expect(consoleError).toHaveBeenCalledTimes(1)
      expect(panelTask()?.id).toBe('task-1')
    })
  })

  describe('desktop banner', () => {
    it('clicking the enable button calls setPreferenceEnabled with the test payload', async () => {
      await wrapper.find('button.desktop-banner-action:not(.ghost)').trigger('click')
      expect(setPreferenceEnabledMock).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          title: 'notifications.desktop.test_notification_title',
          body: 'notifications.desktop.test_notification_body',
          onClick: expect.any(Function)
        })
      )
    })

    it('clicking the dismiss button calls dismissBanner', async () => {
      await wrapper.find('button.desktop-banner-action.ghost').trigger('click')
      expect(dismissBannerMock).toHaveBeenCalled()
    })

    it('enable button is hidden when permission is denied', async () => {
      permission.value = 'denied'
      await nextTick()
      expect(wrapper.find('button.desktop-banner-action:not(.ghost)').exists()).toBe(false)
    })
  })

  describe('onNewNotification socket handler', () => {
    it('dispatches loadNotification when person_id matches current user', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch').mockResolvedValue(undefined)
      getSocketHandler('notification:new')({
        person_id: 'user-1',
        notification_id: 'notification-1'
      })
      await nextTick()
      expect(dispatchSpy).toHaveBeenCalledWith('loadNotification', 'notification-1')
    })

    it('ignores events for other users', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch').mockResolvedValue(undefined)
      getSocketHandler('notification:new')({
        person_id: 'other-user',
        notification_id: 'notification-1'
      })
      await nextTick()
      expect(dispatchSpy).not.toHaveBeenCalledWith('loadNotification', expect.anything())
    })
  })
})
