<template>
  <panel-layout
    class="notifications-page"
    :class="{ collapsed: !showFilters }"
    side
  >
    <template #filters>
      <div class="filters flexrow">
        <combobox-task-type
          class="flexrow-item task-type-filter"
          :label="$t('news.task_type')"
          :task-type-list="taskTypeList"
          v-model="parameters.taskTypeId"
        />
        <combobox-status
          class="flexrow-item collapsible"
          :label="$t('news.task_status')"
          :task-status-list="taskStatusList"
          v-model="parameters.taskStatusId"
        />
        <div class="actions flexrow">
          <button-simple
            class="flexrow-item"
            :text="$t('notifications.show_comments')"
            :active="parameters.showComments"
            @click="parameters.showComments = !parameters.showComments"
          />
          <button-simple
            class="flexrow-item"
            :is-loading="loading.markAll"
            :text="$t('notifications.mark_all_as_read')"
            @click="markAllNotificationsRead"
            v-if="canMarkAllAsRead"
          />
        </div>
        <filters-toggle
          class="flexrow-item"
          :count="foldedFilterCount"
          :resettable="hasFilters"
          v-model="showFilters"
          @reset="resetFilters"
        />
      </div>
      <div class="filters flexrow collapsible">
        <combobox-styled
          class="flexrow-item"
          :label="$t('main.type')"
          :options="typeOptions"
          v-model="parameters.typeMode"
        />
        <combobox-styled
          class="flexrow-item"
          :label="$t('main.status')"
          :options="statusOptions"
          v-model="parameters.statusMode"
        />
        <combobox-styled
          class="flexrow-item"
          :label="$t('notifications.watching')"
          :options="watchingOptions"
          v-model="parameters.watchingMode"
        />
      </div>
    </template>

    <template #list>
      <search-query-list
        class="query-list"
        :groups="notificationsSearchFilterGroups"
        is-group-enabled
        :queries="notificationsSearchQueries"
        type="notifications"
        with-route-query
      />
      <div
        :class="{
          'desktop-banner': true,
          blocked: isDesktopNotificationsBlocked
        }"
        v-if="shouldShowDesktopBanner"
      >
        <div class="desktop-banner-message">
          <bell-off-icon
            class="desktop-banner-icon"
            :size="22"
            :stroke-width="1.75"
            aria-hidden="true"
            v-if="isDesktopNotificationsBlocked"
          />
          <bell-ring-icon
            class="desktop-banner-icon"
            :size="22"
            :stroke-width="1.75"
            aria-hidden="true"
            v-else
          />
          <span class="desktop-banner-text">
            {{
              isDesktopNotificationsBlocked
                ? $t('notifications.desktop.banner_blocked_text')
                : $t('notifications.desktop.banner_text')
            }}
          </span>
        </div>
        <div class="desktop-banner-actions">
          <button-simple
            class="desktop-banner-action"
            :text="$t('notifications.desktop.banner_enable')"
            @click="enableDesktopNotifications"
            v-if="!isDesktopNotificationsBlocked"
          />
          <button-simple
            class="desktop-banner-action ghost"
            :text="$t('notifications.desktop.banner_dismiss')"
            @click="dismissDesktopBanner"
          />
        </div>
      </div>
      <div ref="body" class="notifications" @scroll.passive="onBodyScroll">
        <div
          class="empty-state"
          v-if="
            !loading.notifications &&
            (!notifications || notifications.length === 0)
          "
        >
          <inbox-icon class="empty-state-icon" :size="48" :stroke-width="1.5" />
          <p class="empty-state-text">
            {{ $t('notifications.no_notifications') }}
          </p>
        </div>
        <div class="loading-skeleton" v-if="loading.notifications">
          <div
            class="skeleton-card"
            :style="{ '--row-index': i - 1 }"
            :key="`skeleton-${i}`"
            v-for="i in SKELETON_ROWS"
          ></div>
        </div>
        <div
          :class="{
            notification: true,
            'mention-notification': isMention(notification),
            'playlist-ready-notification': isPlaylistReady(notification),
            unread: !notification.read,
            selected: isSelected(notification)
          }"
          :key="notification.id"
          role="button"
          tabindex="0"
          @click="onNotificationSelected($event, notification)"
          @keydown.enter.prevent="onNotificationSelected($event, notification)"
          v-for="notification in notifications"
          v-show="!loading.notifications"
        >
          <div class="flexcolumn notification-line">
            <template v-if="isPlaylistReady(notification)">
              <div class="flexrow notification-header">
                <monitor-play-icon
                  class="icon flexrow-item"
                  :title="$t('notifications.playlist_is_ready')"
                />
                <people-avatar
                  class="flexrow-item"
                  :person="notificationAuthor(notification)"
                  :size="30"
                  :is-link="false"
                />
                <production-name
                  class="flexrow-item"
                  :production="productionMap.get(notification.project_id)"
                  :size="30"
                  :with-avatar="true"
                  :only-avatar="true"
                />
                <span class="flexrow-item ml1 mr05">
                  {{ $t('notifications.playlist_ready_text') }}
                </span>
                <span class="flexrow-item">
                  <router-link :to="playlistPath(notification)">
                    {{ notification.playlist_name }}
                  </router-link>
                </span>
                <div class="filler"></div>
                <span class="date flexrow-item">
                  {{ formatDate(notification.created_at) }}
                </span>
                <div class="has-text-right flexrow-item mr0">
                  <boolean-field
                    class="selector"
                    :label="$t('notifications.read')"
                    is-small
                    @click="
                      value => toggleNotificationRead(notification, value)
                    "
                    :model-value="notification.read ? 'true' : 'false'"
                  />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flexrow notification-context-row">
                <at-sign-icon
                  class="icon flexrow-item"
                  :title="$t('notifications.mention')"
                  v-if="isMention(notification) || isReplyMention(notification)"
                />
                <corner-up-left-icon
                  class="icon flexrow-item"
                  :title="$t('notifications.reply')"
                  v-else-if="isReply(notification)"
                />
                <user-icon
                  class="icon flexrow-item"
                  :title="$t('notifications.assignation')"
                  v-else-if="isAssignation(notification)"
                />
                <image-icon
                  class="icon flexrow-item"
                  :title="$t('notifications.publish')"
                  v-else-if="isPublish(notification)"
                />
                <message-square-icon
                  class="icon flexrow-item"
                  :title="$t('notifications.comment')"
                  v-else-if="isComment(notification)"
                />
                <production-name
                  class="flexrow-item"
                  :production="productionMap.get(notification.project_id)"
                  :size="22"
                  :with-avatar="true"
                  :only-avatar="true"
                  :title="notification.project_name"
                />
                <task-type-name
                  class="task-type-name flexrow-item"
                  :task-type="buildTaskTypeFromNotification(notification)"
                  :production-id="notification.project_id"
                />
                <entity-thumbnail
                  class="flexrow-item"
                  :entity="{
                    preview_file_id: notification.entity_preview_file_id
                  }"
                  :height="30"
                />
                <router-link
                  class="flexrow-item entity-link"
                  :to="entityPath(notification)"
                  v-if="entityPath(notification)"
                >
                  {{ notification.full_entity_name }}
                </router-link>
                <span class="flexrow-item entity-link" v-else>
                  {{ notification.full_entity_name }}
                </span>
                <div class="filler"></div>
                <span class="date flexrow-item">
                  {{ formatDate(notification.created_at) }}
                </span>
                <div class="has-text-right flexrow-item mr0">
                  <boolean-field
                    class="selector"
                    :label="$t('notifications.read')"
                    is-small
                    @click="
                      value => toggleNotificationRead(notification, value)
                    "
                    :model-value="notification.read ? 'true' : 'false'"
                  />
                </div>
              </div>

              <div
                class="flexrow notification-actor-row"
                v-if="parameters.showComments || isSelected(notification)"
              >
                <people-avatar
                  class="flexrow-item actor-avatar"
                  :person="notificationAuthor(notification)"
                  :size="30"
                  :is-link="false"
                />
                <div class="actor-line flexrow-item">
                  <span class="actor-name">{{ personName(notification) }}</span>
                  <span class="verb">
                    <template v-if="isPublish(notification)">
                      {{ $t('notifications.published') }}
                    </template>
                    <template v-if="isComment(notification)">
                      {{ $t('notifications.commented_on') }}
                    </template>
                    <template
                      v-if="
                        (isComment(notification) || isPublish(notification)) &&
                        notification.change
                      "
                    >
                      {{ $t('notifications.and_change_status') }}
                    </template>
                    <template v-if="isReply(notification)">
                      {{ $t('notifications.replied_on') }}
                    </template>
                    <template v-if="isAssignation(notification)">
                      {{ $t('notifications.assigned_you') }}
                    </template>
                    <template
                      v-if="
                        isMention(notification) || isReplyMention(notification)
                      "
                    >
                      {{ $t('notifications.mention_you_on') }}
                      <template v-if="isReplyMention(notification)">
                        ({{ $t('main.reply') }})
                      </template>
                    </template>
                  </span>
                  <template v-if="notification.change">
                    <span class="to">{{ $t('notifications.to_status') }}</span>
                    <validation-tag
                      class="validation-tag"
                      :task="buildTaskFromNotification(notification)"
                    />
                  </template>
                </div>
              </div>

              <div
                class="flexrow-item comment-content"
                v-if="parameters.showComments || isSelected(notification)"
              >
                <div
                  class="comment-text content reply-text"
                  v-html="
                    renderComment(
                      notification.reply_text,
                      notification.reply_mentions || [],
                      notification.reply_department_mentions || [],
                      personMap,
                      departmentMap
                    )
                  "
                  v-if="
                    (isReply(notification) || isReplyMention(notification)) &&
                    (parameters.showComments || isSelected(notification))
                  "
                ></div>

                <div
                  class="reply-title mt1"
                  v-if="
                    (isReply(notification) || isReplyMention(notification)) &&
                    notification.comment_text &&
                    (parameters.showComments || isSelected(notification))
                  "
                >
                  <em>{{ $t('notifications.initial_comment') }}</em>
                </div>
                <div
                  class="comment-text content"
                  :style="{
                    opacity:
                      isReply(notification) || isReplyMention(notification)
                        ? '0.8'
                        : '1'
                  }"
                  v-html="
                    renderComment(
                      notification.comment_text,
                      notification.mentions,
                      notification.department_mentions || [],
                      personMap,
                      departmentMap
                    )
                  "
                  v-if="
                    (((isComment(notification) || isMention(notification)) &&
                      notification.comment_text) ||
                      isReply(notification) ||
                      isReplyMention(notification)) &&
                    (parameters.showComments || isSelected(notification))
                  "
                ></div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <template #side>
      <task-info :task="currentTask" />
    </template>
  </panel-layout>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import {
  AtSignIcon,
  BellOffIcon,
  BellRingIcon,
  CornerUpLeftIcon,
  ImageIcon,
  InboxIcon,
  MessageSquareIcon,
  MonitorPlayIcon,
  UserIcon
} from 'lucide-vue-next'
import moment from 'moment-timezone'
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useDesktopNotifications } from '@/composables/desktopNotifications'
import {
  buildEntityRoute,
  buildPlaylistRoute,
  buildTestNotificationPayload,
  isAssignation,
  isComment,
  isMention,
  isPlaylistReady,
  isPublish,
  isReply,
  isReplyMention
} from '@/lib/notifications'
import preferences from '@/lib/preferences'
import { renderComment } from '@/lib/render'

import PanelLayout from '@/components/layouts/PanelLayout.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import FiltersToggle from '@/components/widgets/FiltersToggle.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

const PARAMETER_NAMESPACE = 'notifications'
const FILTER_DEFAULTS = {
  taskTypeId: '',
  taskStatusId: '',
  typeMode: '',
  statusMode: null,
  watchingMode: null
}
const FILTER_KEYS = Object.keys(FILTER_DEFAULTS)
const FOLDED_FILTER_KEYS = ['typeMode', 'statusMode', 'watchingMode']
const SKELETON_ROWS = 6

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const instance = getCurrentInstance()
const socket = instance.appContext.config.globalProperties.$socket
const {
  permission: desktopNotificationsPermission,
  shouldShowBanner: shouldShowDesktopBanner,
  dismissBanner: dismissDesktopBanner,
  setPreferenceEnabled
} = useDesktopNotifications()

const isDesktopNotificationsBlocked = computed(
  () => desktopNotificationsPermission.value === 'denied'
)

const enableDesktopNotifications = async () => {
  try {
    const payload = testNotificationPayload.value
    await setPreferenceEnabled(true, {
      ...payload,
      onClick: () =>
        router.push(testNotificationPayload.value.route).catch(() => {})
    })
  } catch (err) {
    console.error(err)
  }
}

// State

const body = ref(null)
const currentTask = ref(null)
const currentNotificationId = ref(null)
// The notification selected last: its task may still be loading.
let selectedNotificationId = null

const errors = reactive({ notifications: false })
const loading = reactive({
  markAll: false,
  more: false,
  notifications: false
})

const parameters = reactive({ ...FILTER_DEFAULTS, showComments: false })
const showFilters = ref(false)
// The route watcher sees the query of the next page too, before this one
// unmounts.
const pagePath = route.path

// Computed

const departmentMap = computed(() => store.getters.departmentMap)
const notifications = computed(() => store.getters.notifications)
const notificationsSearchFilterGroups = computed(
  () => store.getters.notificationsSearchFilterGroups
)
const notificationsSearchQueries = computed(
  () => store.getters.notificationsSearchQueries
)
const organisationLogoPath = computed(() => store.getters.organisationLogoPath)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const taskStatus = computed(() => store.getters.taskStatus)
const taskTypes = computed(() => store.getters.taskTypes)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)

const testNotificationPayload = computed(() =>
  buildTestNotificationPayload(t, organisationLogoPath.value)
)

const taskStatusList = computed(() => [
  { id: '', color: '#999', short_name: t('news.all') },
  ...taskStatus.value
])

const taskTypeList = computed(() => [
  { id: '', color: '#999', name: t('news.all') },
  ...taskTypes.value
])

const canMarkAllAsRead = computed(
  () =>
    parameters.taskTypeId === '' &&
    parameters.taskStatusId === '' &&
    parameters.typeMode === '' &&
    [null, 'unread'].includes(parameters.statusMode) &&
    parameters.watchingMode === null
)

// The toggle shows how many filters its folded row holds.
const foldedFilterCount = computed(
  () => FOLDED_FILTER_KEYS.filter(key => parameters[key]).length
)

const hasFilters = computed(() => FILTER_KEYS.some(key => parameters[key]))

const statusOptions = computed(() => [
  { label: t('notifications.all_statuses'), value: null },
  { label: t('notifications.only_read'), value: 'read' },
  { label: t('notifications.only_unread'), value: 'unread' }
])
const typeOptions = computed(() => [
  { label: t('notifications.all_types'), value: '' },
  { label: t('notifications.only_comments'), value: 'comment' },
  { label: t('notifications.only_mentions'), value: 'mention' },
  { label: t('notifications.only_assignations'), value: 'assignation' },
  { label: t('notifications.only_replies'), value: 'reply' },
  { label: t('notifications.only_playlists_ready'), value: 'playlist-ready' }
])
const watchingOptions = computed(() => [
  { label: t('notifications.all_notifications'), value: null },
  { label: t('notifications.only_watching'), value: 'watching' },
  { label: t('notifications.only_non_watching'), value: 'non-watching' }
])

// Functions

const buildLoadParams = () => {
  const params = {
    task_status_id: parameters.taskStatusId,
    task_type_id: parameters.taskTypeId,
    type: parameters.typeMode
  }
  if (parameters.statusMode) {
    params.read = parameters.statusMode === 'read'
  }
  if (parameters.watchingMode !== null) {
    params.watching = parameters.watchingMode === 'watching'
  }
  return params
}

const resetFilters = () => {
  Object.assign(parameters, FILTER_DEFAULTS)
}

const closeTask = () => {
  selectedNotificationId = null
  currentTask.value = null
  currentNotificationId.value = null
}

const reloadData = () => {
  loading.notifications = true
  errors.notifications = false
  closeTask()
  store
    .dispatch('loadNotifications', buildLoadParams())
    .then(() => {
      loading.notifications = false
    })
    .catch(err => {
      console.error(err)
      errors.notifications = true
    })
}

const loadFollowingNotifications = async () => {
  if (loading.more || loading.notifications) return
  loading.more = true
  await store
    .dispatch('loadMoreNotifications', buildLoadParams())
    .catch(console.error)
  loading.more = false
}

const onBodyScroll = event => {
  if (!body.value) return
  const maxHeight = body.value.scrollHeight - body.value.offsetHeight
  if (maxHeight < event.target.scrollTop + 100) {
    loadFollowingNotifications()
  }
}

const entityPath = notification =>
  buildEntityRoute(notification, taskTypeMap.value)

const formatDate = date => {
  const utcDate = moment.tz(date, 'UTC')
  const formatted = moment(utcDate.format()).fromNow()
  return formatted[0].toUpperCase() + formatted.slice(1)
}

const personName = notification =>
  personMap.value.get(notification.author_id)?.full_name || ''

// Returns the notification's author when known, or a placeholder so the
// avatar slot always renders something instead of disappearing when the
// person hasn't loaded into personMap (deactivated / deleted user, or a
// notification that arrived before the people cache was hydrated).
const notificationAuthor = notification => {
  const known = personMap.value.get(notification.author_id)
  if (known) return known
  return {
    id: notification.author_id || 'unknown',
    full_name: t('main.unknown'),
    initials: '?',
    color: '#999',
    has_avatar: false,
    is_bot: false
  }
}

const playlistPath = notification =>
  buildPlaylistRoute(notification, productionMap.value)

const buildTaskFromNotification = notification => ({
  id: notification.task_id,
  task_status_id: notification.task_status_id,
  task_type_id: notification.task_type_id,
  episode_id: notification.episode_id
})

const buildTaskTypeFromNotification = notification => {
  const taskType = taskTypeMap.value.get(notification.task_type_id)
  return taskType ? { ...taskType, episode_id: notification.episode_id } : null
}

const isSelected = notification =>
  notification.id === currentNotificationId.value

const onNotificationSelected = (event, notification) => {
  if (isPlaylistReady(notification)) return
  if (
    event.target.classList.contains('bool-field') ||
    event.target.parentElement?.classList.contains('bool-field') ||
    event.target.parentElement?.parentElement?.classList.contains('bool-field')
  ) {
    return
  }
  if (notification.id !== selectedNotificationId) {
    selectedNotificationId = notification.id
    store
      .dispatch('loadTask', { taskId: notification.task_id })
      .then(task => {
        // Answers come in any order: a slower load of a notification
        // selected before would replace the task of this one.
        if (notification.id !== selectedNotificationId) return
        currentTask.value = task
        currentNotificationId.value = notification.id
      })
      .catch(err => {
        console.error(err)
        // A click on the notification loads it again.
        if (notification.id === selectedNotificationId) {
          selectedNotificationId = currentNotificationId.value
        }
      })
  } else if (notification.id === currentNotificationId.value) {
    // Only the task shown closes: a notification still loading gets the
    // second click of a double click.
    closeTask()
  }
}

const toggleNotificationRead = (notification, value) => {
  if (value !== notification.read) {
    store
      .dispatch('toggleNotificationReadStatus', notification)
      .catch(console.error)
  }
}

const markAllNotificationsRead = async () => {
  loading.markAll = true
  await store.dispatch('markAllNotificationsAsRead').catch(console.error)
  loading.markAll = false
}

// Parameters persistence (URL query string + local preferences).

const applyParametersToUrl = () => {
  const query = Object.keys(parameters).reduce((acc, key) => {
    if (parameters[key]) {
      let value = parameters[key]
      if (value === 'true') value = true
      else if (value === 'false') value = false
      acc[key] = value
    }
    return acc
  }, {})
  router.replace({ query })
}

const saveParametersToPreferences = () => {
  preferences.setObjectPreference(`parameters:${PARAMETER_NAMESPACE}`, {
    ...parameters
  })
}

const restoreParameters = () => {
  const stored =
    preferences.getObjectPreference(`parameters:${PARAMETER_NAMESPACE}`) || {}
  Object.assign(parameters, stored, route.query)
  parameters.showComments =
    parameters.showComments === 'true' || parameters.showComments === true
}

// Socket handlers

// Fetch unconditionally so non-leader tabs keep their list in sync.
// The mutation dedups on id so the redundant leader-tab fetch is harmless.
const onNewNotification = eventData => {
  if (user.value?.id !== eventData.person_id) return
  if (!eventData.notification_id) return
  store
    .dispatch('loadNotification', eventData.notification_id)
    .catch(console.error)
}

const onPreviewFileAdd = eventData => {
  store.commit('NOTIFICATION_ADD_PREVIEW', {
    previewId: eventData.preview_file_id,
    commentId: eventData.comment_id
  })
}

// Zou deletes the notifications of a comment with it, and no event names them.
const onCommentDelete = eventData => {
  store.commit('REMOVE_COMMENT_NOTIFICATIONS', eventData.comment_id)
}

// Watchers

watch(parameters, () => {
  applyParametersToUrl()
  saveParametersToPreferences()
})

watch(() => FILTER_KEYS.map(key => parameters[key]), reloadData)

// A saved search, or the back button, sets a query the page did not write:
// what it does not hold goes back to its default. The query the page wrote
// changes nothing here.
watch(
  () => route.query,
  query => {
    if (route.path !== pagePath) return
    Object.assign(parameters, FILTER_DEFAULTS, query, {
      showComments: `${query.showComments}` === 'true'
    })
  }
)

// Lifecycle

onMounted(() => {
  store.dispatch('clearNotifications')
  restoreParameters()
  reloadData()
  socket.on('notification:new', onNewNotification)
  socket.on('preview-file:add-file', onPreviewFileAdd)
  socket.on('comment:delete', onCommentDelete)
})

onBeforeUnmount(() => {
  socket.off('notification:new', onNewNotification)
  socket.off('preview-file:add-file', onPreviewFileAdd)
  socket.off('comment:delete', onCommentDelete)
})

// Head

useHead({ title: computed(() => `${t('notifications.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.dark {
  .notification {
    background: $dark-grey-lighter;
    color: $white-grey;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  }

  .icon,
  .comment-text {
    color: $light-grey-light;
  }

  a {
    color: $light-grey-light;
  }
}

a {
  font-weight: bold;
  color: $grey-strong;
}

.flexrow-item:first-child {
  margin-right: 1em;
}

// One label height and one control height for the whole row, as on the other
// pages.
.filters {
  align-items: flex-start;
  flex-wrap: wrap;
  row-gap: 1em;

  // the comboboxes are fields, set 2em apart from what follows them
  > .flexrow-item,
  .actions > .flexrow-item,
  :deep(.field) {
    margin-bottom: 0;
  }

  :deep(.label) {
    margin-bottom: 5px;
    padding-top: 0;
  }

  > :last-child {
    margin-right: 0;
  }

  // the status combobox carries a 1px margin-top the others lack
  :deep(.status-combo) {
    margin-top: 0;
  }

  // 39px tall against 42px for the others
  :deep(.combo) {
    display: inline-flex;
    flex-direction: column;
    height: 42px;
    justify-content: center;
    margin: 0;
    vertical-align: top;
  }
}

// the buttons keep to the right, on a line of their own once the row wraps
.actions {
  align-self: flex-end;
  margin-left: auto;
  // its last button gives its own margin up
  margin-right: 1rem;

  > .button {
    // Bulma's near-black button text outweighs the grey of the filter labels
    color: var(--text);
    height: 42px;
    padding: 0 14px;
  }
}

.collapsed .filters.collapsible {
  display: none;
}

.desktop-banner {
  align-items: center;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.75em;
  box-shadow: 0 0 0 2px rgba($green, 0.3);
  display: flex;
  gap: 2em;
  margin: 0 auto;
  max-width: 800px;
  padding: 0.75em 1em;
  width: fit-content;

  &.blocked {
    box-shadow: 0 0 0 2px rgba($orange, 0.3);

    .desktop-banner-icon {
      color: $orange;
    }
  }
}

.dark .desktop-banner {
  background: var(--background-alt);
}

.desktop-banner-message {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 0.75em;
  min-width: 0;
}

.desktop-banner-icon {
  color: $green;
  flex-shrink: 0;
}

.desktop-banner-text {
  color: var(--text);
}

.desktop-banner-actions {
  display: flex;
  gap: 0.5em;
}

.desktop-banner-action.ghost {
  opacity: 0.7;
}

@media screen and (max-width: 768px) {
  .desktop-banner {
    align-items: stretch;
    flex-direction: column;
    width: auto;
  }

  .desktop-banner-action {
    flex: 1;
  }
}

.empty-state {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  padding: 4em 1em;
}

.empty-state-icon {
  color: $grey;
  opacity: 0.6;
}

.empty-state-text {
  color: var(--text-alt);
  margin: 0;
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.skeleton-card {
  // The pulse animates the same opacity as the entry animation, so it
  // only starts once the 0.4s fade-in is over (its 0% frame matches the
  // fade-in end value): no visible jump between the two.
  animation:
    skeleton-card-in 0.4s ease-out forwards,
    skeleton-pulse 1.6s ease-in-out infinite;
  animation-delay:
    calc(var(--row-index) * 150ms), calc(var(--row-index) * 150ms + 0.4s);
  background: rgba(var(--skeleton-rgb), 0.45);
  border-radius: 1em;
  height: 72px;
  opacity: 0;
}

.dark .skeleton-card {
  background: rgba(var(--skeleton-rgb), 0.15);
}

@keyframes skeleton-card-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card {
    animation: none;
    opacity: 1;
  }
}

.notification {
  align-items: flex-start;
  background: white;
  border: 3px solid transparent;
  border-radius: 1em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  margin-bottom: 0.5em;
  overflow-x: auto;
  padding: 1rem;
  transition: border-color 0.15s ease-in-out;

  &.unread {
    border-color: var(--unread-border);
  }

  &:hover {
    background-color: var(--background-hover);
    border-color: var(--selectable-accent);

    &.playlist-ready-notification {
      border-color: var(--unread-border);
    }

    .icon {
      opacity: 1;
    }
  }

  &.playlist-ready-notification {
    border-left: 3px solid $green;
  }

  .icon {
    opacity: 0.7;
    transition: opacity 0.15s ease-in-out;
  }

  .actor-avatar :deep(.avatar) {
    border: 1px solid var(--border);
  }

  :deep(.validation-tag) {
    font-size: 0.85em;
    padding: 0.15em 0.5em;
  }
}

.notifications {
  --unread-border: #f0c5d1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.dark .notifications {
  --unread-border: #906571;
}

.notification-actor-row,
.notification-context-row,
.notification-header {
  align-items: center;
  gap: 0.6em;
  width: 100%;

  // The flexrow-item global rule adds margin-right: 1rem; reset it inside
  // the header so the single `gap` controls horizontal spacing and every
  // element stays aligned to the same rhythm.
  .flexrow-item {
    margin-right: 0;
  }
}

.notification-actor-row {
  margin-top: 0.5em;
}

.actor-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35em;
  min-width: 0;
}

.actor-name {
  font-weight: 600;
}

.verb {
  color: var(--text-alt);
}

.person-name {
  font-weight: bold;
  margin-left: 0.5em;
  margin-right: 0.5em;
}

.comment-text {
  color: $grey-strong;
  margin-top: 1em;
}

.notification-info {
  margin-top: 0.5em;
  vertical-align: middle;

  span,
  a {
    vertical-align: middle;
    display: inline-flex;
    align-items: center;
    line-height: 2.1em;
  }
}

.icon {
  color: $grey;
  height: 20px;
  margin-right: 0;
  width: 20px;
}

.thumbnail-picture-wrapper {
  margin-left: 0.5em;
}

.date {
  align-items: center;
  color: $grey;
  display: inline-flex;
  font-size: 0.9em;
  line-height: 1;

  span {
    margin-left: 0;
  }
}

.notification-context-row .has-text-right {
  align-items: center;
  display: inline-flex;
}

.notification-line {
  border-radius: 1em;
  align-items: start;
}

.notification-header {
  width: 100%;
}

.notification-metadata {
  height: 100%;
  padding-right: 1em;
}

.comment-content {
  flex: 1;
  margin-top: 1em;

  .flexrow-item {
    margin-right: 0.5em;
    margin-left: 0;
  }

  .person-name {
    margin-left: 0.5em;
  }
}

.selected,
.selected:hover {
  border: 4px solid var(--background-selected);
}

.flexrow-item.mr0 {
  margin-right: 0;
}

.comment-text {
  background: var(--background-tag);
  border: 1px solid var(--border);
  border-radius: 0.5em;
  padding: 1em 1em 0 1em;
  margin-top: 0.3em;
  margin-bottom: 0;
}

.notification.mention-notification,
.notification.mention-notification.unread {
  .icon {
    color: $orange;
  }
}

.person-name.ml0 {
  margin-left: 0;
}

@media screen and (max-width: 768px) {
  .collapsed .collapsible {
    display: none;
  }

  // The task type and the funnel lead the row: the status, then the buttons,
  // follow them, on the lines they need.
  .actions {
    margin: 0;
    order: 3;
  }

  .task-type-filter {
    flex: 1 1 150px;
    min-width: 0;

    // the combobox pins itself to 200px
    :deep(.task-type-combo) {
      min-width: 0;
      width: 100%;
    }
  }

  .filters > .filters-buttons {
    margin-right: 1rem;
    order: 1;
  }

  .filters > .collapsible {
    order: 2;
  }

  // Strip non-essential elements on narrow screens (date, entity
  // thumbnail, read toggle) and breathe the remaining content with
  // more padding.
  .notification {
    padding: 1.25rem 1.5rem;

    .date,
    .thumbnail-wrapper,
    .has-text-right,
    .actor-name,
    .verb {
      display: none;
    }
  }

  .notification-header {
    flex-wrap: wrap;
    row-gap: 0.4em;
  }
}
</style>
