<template>
<div class="columns fixed-page">
  <div class="column main-column">
    <div class="notifications page">
    <div
      class="empty-list has-text-centered"
      v-if="!loading.notifications && (!notifications || notifications.length === 0)"
    >
      {{ $t('notifications.no_notifications') }}
    </div>
    <div
      class="has-text-centered"
      v-if="loading.notifications"
    >
      <spinner />
    </div>
    <div
      :class="{
        notification: true,
        unread: !notification.read,
        selected: notification.id === currentNotificationId
      }"
      :key="notification.id"
      @click="onNotificationSelected(notification)"
      v-for="notification in notifications"
      v-show="!loading.notifications"
    >

      <div class="flexrow notification-line">
      <div class="flexrow-item">
        <div class="flexrow">
          <at-sign-icon
            class="icon flexrow-item"
            v-if="isMention(notification)"
          />
          <message-square-icon
            class="icon flexrow-item"
            v-if="isComment(notification)"
          />
          <user-icon
            class="icon flexrow-item"
            v-if="isAssignation(notification)"
          />

          <task-type-name
            class="task-type-name"
            :task-type="buildTaskTypeFromNotification(notification)"
            :production-id="notification.project_id"
          />
        </div>

        <div class="mt1">
          <validation-tag
            class="validation-tag flexrow-item mt1"
            :task="buildTaskFromNotification(notification)"
            v-if="notification.change"
          />
        </div>
      </div>

      <div class="flexrow-item comment-content">
      <div>
        <div class="notification-info flexrow">
        <people-avatar
          class="flexrow-item"
          :person="personMap[notification.author_id]"
          :size="30"
          v-if="personMap[notification.author_id]"
        />

          <router-link
            class="person-name flexrow-item"
            :to="{
              name: 'person',
              params: {person_id: notification.author_id}
            }"
          >
            {{ personName(notification) }}
          </router-link>

          <span
            class="explaination flexrow-item"
            v-if="isComment(notification)"
          >
            {{ $t('notifications.commented_on') }}
          </span>

          <span
            class="explaination flexrow-item"
            v-if="isAssignation(notification)"
          >
            {{ $t('notifications.assigned_you') }}
          </span>

          <span
            class="explaination flexrow-item"
            v-if="isMention(notification)"
          >
            {{ $t('notifications.mention_you_on') }}
          </span>

          <router-link
            class=" flexrow-item"
            :to="entityPath(notification)"
          >
            {{ notification.project_name }} / {{ notification.full_entity_name }}
          </router-link>
        </div>
      </div>
      <div
        class="comment-text"
        v-html="renderComment(notification.comment_text, notification.mentions,
                             personMap)"
        v-if="(isComment(notification) || isMention(notification)) && notification.comment_text"
      >
      </div>
      <div class="flexrow"
          v-if="notification.preview_file_id"
      >
          <paperclip-icon class="icon flexrow-item" />
        <div
          class="thumbnail-picture-wrapper flexrow-item"
          v-if="notification.preview_file_id"
        >
          <entity-thumbnail
            :entity="{preview_file_id: notification.preview_file_id}"
            :height="40"
          />
        </div>
      </div>
      <div
        class="comment-text"
        v-if="(isComment(notification) || isMention(notification)) && !notification.comment_text"
      >
        {{ $t('comments.empty_text') }}
      </div>
      <div class="date flexrow">
        <span class="flexrow-item">
          {{ formatDate(notification.created_at) }}
        </span>
      </div>
      </div>
    </div>
    </div>
  </div>
  </div>

  <div
    class="column side-column is-hidden-mobile hide-small-screen"
    v-if="currentTask"
  >
    <task-info
      :task="currentTask"
      :is-loading="loading.currentTask"
    />
  </div>
</div>

</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  AtSignIcon,
  MessageSquareIcon,
  PaperclipIcon,
  UserIcon
} from 'vue-feather-icons'
import marked from 'marked'
import moment from 'moment-timezone'
import { renderComment } from '../../lib/render'

import EntityThumbnail from '../widgets/EntityThumbnail'
import PeopleAvatar from '../widgets/PeopleAvatar'
import Spinner from '../widgets/Spinner'
import TaskInfo from '../sides/TaskInfo'
import TaskTypeName from '../widgets/TaskTypeName'
import ValidationTag from '../widgets/ValidationTag'

export default {
  name: 'notification-page',
  components: {
    AtSignIcon,
    EntityThumbnail,
    PaperclipIcon,
    PeopleAvatar,
    MessageSquareIcon,
    Spinner,
    TaskInfo,
    TaskTypeName,
    UserIcon,
    ValidationTag
  },

  data () {
    return {
      loading: {
        notifications: false,
        currentTask: true
      },
      errors: {
        notifications: false
      },
      currentTask: null,
      currentNotificationId: null
    }
  },

  mounted () {
    this.loading.notifications = true
    this.errors.notifications = false
    this.currentTask = null
    this.loadNotifications()
      .then(() => {
        this.loading.notifications = false
      })
      .catch((err) => {
        console.error(err)
        this.errors.notifications = true
      })
  },

  computed: {
    ...mapGetters([
      'notifications',
      'personMap',
      'taskTypeMap',
      'taskStatusMap',
      'personMap'
    ])
  },

  methods: {
    ...mapActions([
      'loadNotifications',
      'loadTask',
      'markAllNotificationsAsRead'
    ]),

    entityPath (notification) {
      const type =
        this.getTaskType(notification).for_shots ? 'shot' : 'asset'

      const route = {
        name: 'task',
        params: {
          production_id: notification.project_id,
          task_id: notification.task_id,
          type: type
        }
      }

      if (notification.episode_id) {
        route.name = 'episode-task'
        route.params.episode_id = notification.episode_id
      }
      return route
    },

    getTaskType (notification) {
      return this.taskTypeMap[notification.task_type_id]
    },

    formatDate (date) {
      const utcDate = moment.tz(date, 'UTC')
      date = moment(utcDate.format()).fromNow()
      return date[0].toUpperCase() + date.slice(1)
    },

    compileMarkdown (input) {
      return marked(input || '')
    },

    personName (notification) {
      const person = this.personMap[notification.author_id]
      return person ? person.full_name : ''
    },

    buildTaskFromNotification (notification) {
      return {
        id: notification.task_id,
        task_status_id: notification.task_status_id,
        task_type_id: notification.task_type_id,
        episode_id: notification.episode_id
      }
    },

    buildTaskTypeFromNotification (notification) {
      return {
        ...this.taskTypeMap[notification.task_type_id],
        episode_id: notification.episode_id
      }
    },

    onNotificationSelected (notification) {
      this.loading.currentTask = true
      this.loadTask({
        taskId: notification.task_id,
        callback: (err, task) => {
          if (err) console.error(err)
          this.loading.currentTask = false
          this.currentTask = task
          this.currentNotificationId = notification.id
        }
      })
    },

    renderComment,
    isComment: notification => {
      return !notification.notification_type ||
             notification.notification_type === 'comment'
    },
    isMention: notification => notification.notification_type === 'mention',
    isAssignation: notification => {
      return notification.notification_type === 'assignation'
    }
  },

  socket: {
    events: {
      'preview-file:add-file' (eventData) {
        const commentId = eventData.comment_id
        const previewId = eventData.preview_file_id
        this.$store.commit('NOTIFICATION_ADD_PREVIEW', {
          previewId,
          commentId
        })
      }
    }
  },

  beforeDestroy () {
    this.markAllNotificationsAsRead()
  },

  metaInfo () {
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
    box-shadow: 0px 1px 1px 1px $dark-grey;

    &.selected {
      border-left: 6px solid $dark-purple;
    }
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

.notification {
  margin-bottom: 0.5em;
  align-items: flex-start;
  background: white;
  box-shadow: 0 0 4px $light-grey;
  cursor: pointer;
  border-left: 6px solid transparent;
  padding-left: 0.7em;
}

.unread {
  border-left: 6px solid $orange;
}

.person-name {
  margin-left: 0.5em;
  margin-right: 0.5em;
}

.comment-text {
  color: $grey-strong;
  margin-top: 1em;
}

.validation-tag {
  padding-top: 1em;
}

.notification-info {
  vertical-align: middle;
}

.notification-info span,
.notification-info a {
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  line-height: 2.1em;
}

.date {
  font-size: 0.8em;
  margin-top: 0.5em;
  color: $grey;

  span {
    margin-left: 0;
  }
}

.thumbnail-picture-wrapper {
  margin-left: 0.5em;
}

.icon {
  width: 20px;
  margin-right: 0em;
  font-size: 0.8em;
  color: $grey;
}

.notification-line {
  align-items: start;
}

.validation-tag {
  margin-left: 30px;
}

.comment-content {
  .flexrow-item {
    margin-right: 0.5em;
    margin-left: 0;
  }

  .person-name {
    margin-left: 0.5em;
  }
}

.selected {
  border-left: 6px solid $purple;
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
  border-right: 3px solid $light-grey;
  flex: 1 1 auto;
  padding-top: 60px;
  background: $white-grey-light;
  overflow-y: hidden;
  height: 100%;
}

.notifications {
  background: $white-grey-light;
  width: 100%;
  padding: 2em;
  overflow-y: auto;
  height: 100%;
}

.side-column {
  width: 450px;
  min-width: 450px;
  max-width: 450px;
}
</style>
