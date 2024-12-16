<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="notifications page" @scroll.passive="onBodyScroll" ref="body">
        <div class="flexrow">
          <combobox-task-type
            class="flexrow-item selector"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            v-model="parameters.taskTypeId"
          />
          <combobox-status
            class="flexrow-item selector"
            :label="$t('news.task_status')"
            :task-status-list="taskStatusList"
            v-model="parameters.taskStatusId"
          />
          <combobox-styled
            class="flexrow-item selector field"
            :label="$t('main.type')"
            :options="typeOptions"
            v-model="parameters.typeMode"
          />
          <combobox-styled
            class="flexrow-item selector field"
            :label="$t('main.status')"
            :options="statusOptions"
            v-model="parameters.statusMode"
          />
          <combobox-styled
            class="flexrow-item selector field"
            :label="$t('notifications.watching')"
            :options="watchingOptions"
            v-model="parameters.watchingMode"
          />
        </div>
        <div class="flexrow mb1">
          <button-simple
            class="flexrow-item"
            :text="$t('notifications.show_comments')"
            :active="parameters.showComments"
            @click="parameters.showComments = !parameters.showComments"
          />
          <span class="filler"></span>
          <button-simple
            class="flexrow-item"
            @click="markAllNotificationsRead"
            :loading="loading.markAll"
            :text="$t('notifications.mark_all_as_read')"
          />
        </div>
        <div
          class="empty-list has-text-centered"
          v-if="
            !loading.notifications &&
            (!notifications || notifications.length === 0)
          "
        >
          {{ $t('notifications.no_notifications') }}
        </div>
        <div class="has-text-centered" v-if="loading.notifications">
          <spinner />
        </div>
        <div
          :class="{
            notification: true,
            'mention-notification': isMention(notification),
            unread: !notification.read,
            selected: isSelected(notification)
          }"
          :key="notification.id"
          @click="onNotificationSelected($event, notification)"
          v-for="notification in notifications"
          v-show="!loading.notifications"
        >
          <div class="flexcolumn notification-line">
            <div class="flexrow notification-header">
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
              <people-avatar
                class="flexrow-item"
                :person="personMap.get(notification.author_id)"
                :size="30"
                :is-link="false"
                v-if="personMap.get(notification.author_id)"
              />
              <entity-thumbnail
                class="flexrow-item"
                :entity="{
                  preview_file_id: notification.entity_preview_file_id
                }"
                :height="40"
              />
              <task-type-name
                class="task-type-name flexrow-item ml1"
                :task-type="buildTaskTypeFromNotification(notification)"
                :production-id="notification.project_id"
              />
              <router-link class="flexrow-item" :to="entityPath(notification)">
                {{ notification.project_name }} /
                {{ notification.full_entity_name }}
              </router-link>
              <validation-tag
                class="validation-tag flexrow-item"
                :task="buildTaskFromNotification(notification)"
                v-if="notification.change"
              />
              <span class="date flexrow-item">
                {{ formatDate(notification.created_at) }}
              </span>
              <div class="filler"></div>
              <div class="has-text-right flexrow-item mr0">
                <boolean-field
                  class="selector"
                  :label="$t('notifications.read')"
                  is-small
                  @input="value => toggleNotificationRead(notification, value)"
                  :value="notification.read ? 'true' : 'false'"
                />
              </div>
            </div>

            <div class="flexrow-item comment-content">
              <div
                class="notification-info flexrow"
                v-if="parameters.showComments || isSelected(notification)"
              >
                <span class="person-name flexrow-item ml0">
                  {{ personName(notification) }}
                </span>

                <div class="flexrow-item">
                  <template v-if="isPublish(notification)">
                    {{ $t('notifications.published') }}
                  </template>

                  <template
                    v-if="isComment(notification) && !isPublish(notification)"
                  >
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
                      ({{ $t('main.reply').toLowerCase() }})
                    </template>
                  </template>
                </div>
              </div>
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
          </div>
        </div>
      </div>
    </div>

    <div class="column side-column is-hidden-mobile hide-small-screen">
      <task-info :task="currentTask" :is-loading="loading.currentTask" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  AtSignIcon,
  CornerUpLeftIcon,
  ImageIcon,
  MessageSquareIcon,
  UserIcon
} from 'lucide-vue-next'
import moment from 'moment-timezone'

import { parametersMixin } from '@/components/mixins/parameters'

import { pluralizeEntityType } from '@/lib/path'
import { renderComment } from '@/lib/render'

import BooleanField from '@/components/widgets/BooleanField.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

export default {
  name: 'notifications',

  mixins: [parametersMixin],

  components: {
    AtSignIcon,
    BooleanField,
    ButtonSimple,
    ComboboxStatus,
    ComboboxStyled,
    ComboboxTaskType,
    CornerUpLeftIcon,
    EntityThumbnail,
    ImageIcon,
    MessageSquareIcon,
    PeopleAvatar,
    Spinner,
    TaskInfo,
    TaskTypeName,
    UserIcon,
    ValidationTag
  },

  data() {
    return {
      currentTask: null,
      currentNotificationId: null,
      errors: {
        notifications: false
      },
      loading: {
        currentTask: true,
        markAll: false,
        more: false,
        notifications: false
      },
      parameterNamespace: 'notifications',
      parameters: {
        taskTypeId: '',
        taskStatusId: '',
        typeMode: '',
        showComments: false,
        statusMode: null,
        watchingMode: null
      },
      statusOptions: [
        {
          label: this.$t('notifications.all_statuses'),
          value: null
        },
        {
          label: this.$t('notifications.only_read'),
          value: 'read'
        },
        {
          label: this.$t('notifications.only_unread'),
          value: 'unread'
        }
      ],
      typeOptions: [
        {
          label: this.$t('notifications.all_types'),
          value: ''
        },
        {
          label: this.$t('notifications.only_comments'),
          value: 'comment'
        },
        {
          label: this.$t('notifications.only_mentions'),
          value: 'mention'
        },
        {
          label: this.$t('notifications.only_assignations'),
          value: 'assignation'
        },
        {
          label: this.$t('notifications.only_replies'),
          value: 'reply'
        }
      ],
      watchingOptions: [
        {
          label: this.$t('notifications.all_notifications'),
          value: null
        },
        {
          label: this.$t('notifications.only_watching'),
          value: 'watching'
        },
        {
          label: this.$t('notifications.only_non_watching'),
          value: 'non-watching'
        }
      ]
    }
  },

  created() {
    this.clearNotifications()
  },

  mounted() {
    const params = this.getParametersFromPreferences(this.parameters) || {}
    this.applyQueryParameters(params)
    if (params.showComments === 'true' || params.showComments === true) {
      params.showComments = true
    } else {
      params.showComments = false
    }
    this.parameters = params
    this.reloadData()
  },

  computed: {
    ...mapGetters([
      'departmentMap',
      'notifications',
      'personMap',
      'taskStatus',
      'taskTypes',
      'taskTypeMap',
      'user'
    ]),

    taskStatusList() {
      return [
        {
          id: '',
          color: '#999',
          short_name: this.$t('news.all')
        }
      ].concat([...this.taskStatus])
    },

    taskTypeList() {
      return [
        {
          id: '',
          color: '#999',
          name: this.$t('news.all')
        }
      ].concat([...this.taskTypes])
    }
  },

  methods: {
    ...mapActions([
      'clearNotifications',
      'loadMoreNotifications',
      'loadNotification',
      'loadNotifications',
      'loadTask',
      'markAllNotificationsAsRead',
      'toggleNotificationReadStatus'
    ]),

    reloadData() {
      this.loading.notifications = true
      this.errors.notifications = false
      this.currentTask = null
      const params = {
        task_status_id: this.parameters.taskStatusId,
        task_type_id: this.parameters.taskTypeId,
        type: this.parameters.typeMode
      }
      if (this.parameters.statusMode) {
        params.read = this.parameters.statusMode === 'read'
      }
      if (this.parameters.watchingMode !== null) {
        params.watching = this.parameters.watchingMode === 'watching'
      }
      this.loadNotifications(params)
        .then(() => {
          this.loading.notifications = false
        })
        .catch(err => {
          console.error(err)
          this.errors.notifications = true
        })
    },

    onBodyScroll(event) {
      const position = event.target
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.loadFollowingNotifications()
      }
    },

    async loadFollowingNotifications() {
      if (!this.loading.more && !this.loading.notifications) {
        this.loading.more = true
        const params = {
          task_status_id: this.parameters.taskStatusId,
          task_type_id: this.parameters.taskTypeId,
          type: this.parameters.typeMode
        }
        if (this.parameters.statusMode) {
          params.read = this.parameters.statusMode === 'read'
        }
        if (this.parameters.watchingMode) {
          params.watching = this.parameters.watchingMode === 'watching'
        }
        await this.loadMoreNotifications(params)
        this.loading.more = false
      }
    },

    entityPath(notification) {
      const taskType = this.taskTypeMap.get(notification.task_type_id)

      const route = {
        name: 'task',
        params: {
          production_id: notification.project_id,
          task_id: notification.task_id,
          type: pluralizeEntityType(taskType.for_entity)
        }
      }

      if (notification.episode_id) {
        route.name = 'episode-task'
        route.params.episode_id = notification.episode_id
      }
      return route
    },

    formatDate(date) {
      const utcDate = moment.tz(date, 'UTC')
      date = moment(utcDate.format()).fromNow()
      return date[0].toUpperCase() + date.slice(1)
    },

    personName(notification) {
      const person = this.personMap.get(notification.author_id)
      return person ? person.full_name : ''
    },

    buildTaskFromNotification(notification) {
      return {
        id: notification.task_id,
        task_status_id: notification.task_status_id,
        task_type_id: notification.task_type_id,
        episode_id: notification.episode_id
      }
    },

    buildTaskTypeFromNotification(notification) {
      return {
        ...this.taskTypeMap.get(notification.task_type_id),
        episode_id: notification.episode_id
      }
    },

    onNotificationSelected(event, notification) {
      if (
        event.target.classList.contains('bool-field') ||
        event.target.parentElement?.classList.contains('bool-field') ||
        event.target.parentElement?.parentElement?.classList.contains(
          'bool-field'
        )
      ) {
        return
      }
      if (this.currentNotificationId !== notification.id) {
        this.loading.currentTask = true
        this.loadTask({
          taskId: notification.task_id
        })
          .then(task => {
            this.loading.currentTask = false
            this.currentTask = task
            this.currentNotificationId = notification.id
          })
          .catch(console.error)
      } else {
        this.currentTask = null
        this.currentNotificationId = null
      }
    },

    renderComment,

    isAssignation: notification => {
      return notification.notification_type === 'assignation'
    },

    isComment: notification => {
      return (
        !notification.notification_type ||
        (notification.notification_type === 'comment' &&
          !notification.preview_file_id)
      )
    },

    isMention: notification => notification.notification_type === 'mention',

    isReplyMention: notification =>
      notification.notification_type === 'reply-mention',

    isReply: notification => notification.notification_type === 'reply',

    isPublish(notification) {
      return (
        notification &&
        notification.preview_file_id &&
        !this.isMention(notification) &&
        !this.isReply(notification) &&
        !this.isReplyMention(notification)
      )
    },

    isSelected(notification) {
      return notification.id === this.currentNotificationId
    },

    toggleNotificationRead(notification, value) {
      if (value !== notification.read) {
        this.toggleNotificationReadStatus(notification)
      }
    },

    async markAllNotificationsRead() {
      this.loading.markAll = true
      await this.markAllNotificationsAsRead()
      this.loading.markAll = true
    }
  },

  socket: {
    events: {
      'notification:new'(eventData) {
        if (this.user.id === eventData.person_id) {
          const notificationId = eventData.notification_id
          this.loadNotification(notificationId).catch(console.error)
        }
      },

      'preview-file:add-file'(eventData) {
        const commentId = eventData.comment_id
        const previewId = eventData.preview_file_id
        this.$store.commit('NOTIFICATION_ADD_PREVIEW', {
          previewId,
          commentId
        })
      }
    }
  },

  watch: {
    'parameters.taskTypeId'() {
      this.reloadData()
    },
    'parameters.taskStatusId'() {
      this.reloadData()
    },
    'parameters.typeMode'() {
      this.reloadData()
    },
    'parameters.statusMode'() {
      this.reloadData()
    },
    'parameters.watchingMode'() {
      this.reloadData()
    }
  },

  head() {
    return {
      title: `${this.$t('notifications.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .page {
    background: $dark-grey-light;
  }

  .notification {
    background: $dark-grey-lighter;
    color: $white-grey;
    box-shadow: 0 1px 1px 1px $dark-grey;
  }

  .icon,
  .comment-text {
    color: $light-grey-light;
  }

  a {
    color: $light-grey-light;
  }

  .notification.unread {
    border: 4px solid #906571;

    &:hover {
      border: 4px solid #6065a1; //;var(--background-selectable);
    }
  }
}

a {
  font-weight: bold;
  color: $grey-strong;
}

.flexrow-item:first-child {
  margin-right: 1em;
}

.notification {
  align-items: flex-start;
  background: white;
  border: 4px solid transparent;
  border-radius: 1em;
  box-shadow: 0 0 4px $light-grey;
  cursor: pointer;
  margin-bottom: 0.5em;
  padding: 1rem;
  transition: all 0.2s ease-in-out;

  &.unread {
    border: 4px solid #f0c5d1;
  }

  &:hover {
    border: 4px solid var(--background-selectable);

    .dark & {
      border: 4px solid #6065a1; //;var(--background-selectable);
    }
  }
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
  width: 20px;
  margin-right: 0;
  font-size: 0.8em;
  color: $grey;
}

.thumbnail-picture-wrapper {
  margin-left: 0.5em;
}

.date {
  font-size: 0.9em;
  color: $grey;

  span {
    margin-left: 0;
  }
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
  // transform: scale(1.01);
}

.columns {
  display: flex;
  flex-direction: row;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  flex: 1 1 auto;
  padding-top: 60px;
  background: $white-grey-light;
  overflow-y: hidden;
  height: 100%;
}

.notifications {
  background: $white-grey-light;
  width: 100%;
  padding: 1em 1.5em;
  overflow-y: auto;
  height: 100%;
}

.side-column {
  width: 450px;
  min-width: 450px;
  max-width: 450px;
}

.flexrow-item.mr0 {
  margin-right: 0;
}

.comment-text {
  background: $white-grey;
  border: 1px solid var(--border);
  border-radius: 0.5em;
  padding: 1em 1em 0 1em;
  margin-top: 0.3em;
  margin-bottom: 0;

  .dark & {
    background: var(--background);
  }
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
</style>
