<template>
  <div class="page">
    <page-title :text="$t('notifications.title')"></page-title>

    <div
      :class="{
        flexrow: true,
        notification: true,
        unread: !notification.read
      }"
      :key="notification.id"
      v-for="notification in notifications"
    >

      <div class="flexrow-item">
        <people-avatar
          class="flexrow-item"
          :person="personMap[notification.author_id]"
          v-if="personMap[notification.author_id]"
        >
        </people-avatar>
      </div>

      <div class="flexrow-item comment-content">
        <div class="notification-info">
          <span class="date">
            {{ formatDate(notification.created_at) }}
          </span>
          <router-link
            :to="{
              name: 'person',
              params: {person_id: notification.author_id}
            }"
          >
            {{ personName(notification) }}
          </router-link>
          <span>
            {{ $t('notifications.commented_on') }}
          </span>
          <router-link
            class=""
            :to="{name: 'task', params: {task_id: notification.task_id}}"
          >
            {{ notification.project_name }} / {{ notification.full_entity_name }}
            &nbsp;
          </router-link>
          <router-link
            class=""
            :to="{name: 'task', params: {task_id: notification.task_id}}"
          >
            <task-type-name
              :task-type="taskTypeMap[notification.task_type_id]"
            >
            </task-type-name>
          </router-link>
          <span
            v-if="notification.change"
          >
            {{ $t('notifications.and_change_status') }}
          </span>
          <validation-tag
            class="validation-tag"
            :task="{
              id: notification.task_id,
              task_status_short_name: taskStatusMap[notification.task_status_id].short_name,
              task_status_color: taskStatusMap[notification.task_status_id].color

            }"
            v-if="notification.change"
          >
          </validation-tag>
          <span
            v-if="notification.preview_file_id"
          >
            {{ $t('notifications.with_preview') }}
          </span>
          <span
            class="thumbnail-picture-wrapper"
            v-if="notification.preview_file_id"
          >
            <entity-thumbnail
              :entity="{preview_file_id: notification.preview_file_id}"
              :height="40"
            >
            </entity-thumbnail>
          </span>
        </div>
        <div
          class="comment-text"
          v-html="compileMarkdown(notification.comment_text)"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import marked from 'marked'
import moment from 'moment-timezone'

import EntityThumbnail from './widgets/EntityThumbnail'
import PageTitle from './widgets/PageTitle'
import PeopleAvatar from './widgets/PeopleAvatar'
import TaskTypeName from './widgets/TaskTypeName'
import ValidationTag from './widgets/ValidationTag'

export default {
  name: 'notification-page',
  components: {
    EntityThumbnail,
    PageTitle,
    PeopleAvatar,
    TaskTypeName,
    ValidationTag
  },

  data () {
    return {
      loading: {
        notifications: false
      },
      errors: {
        notifications: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'notifications',
      'taskTypeMap',
      'taskStatusMap',
      'personMap'
    ])
  },

  methods: {
    ...mapActions([
      'loadNotifications',
      'markAllNotificationsAsRead'
    ]),

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
    }
  },

  mounted () {
    this.loading.notifications = true
    this.errors.notifications = false
    this.loadNotifications()
      .then(() => {
        this.loading.notifications = false
      })
      .catch((err) => {
        console.error(err)
        this.errors.notifications = true
      })
  },

  socket: {
    events: {
      'preview:add' (eventData) {
        const commentId = eventData.comment_id
        const previewId = eventData.preview.id
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

<style scoped>
a {
  font-weight: bold;
  color: #666;
}

.flexrow-item:first-child {
  margin-right: 1em;
}

.page {
  padding-top: 90px
}

.notification {
  margin-bottom: 1em;
  border-radius: 0.3em;
  align-items: flex-start;
}

.unread {
  background-color: #ecfaec;
}

img.thumbnail-picture {
}

.comment-text {
  font-style: italic;
  margin-top: 1em;
}

.validation-tag {
  margin: 0 0.5em;
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
  margin-right: 0.1em;
}

.thumbnail-picture-wrapper {
  margin-left: 0.5em;
}
</style>
