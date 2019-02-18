<template>
  <div class="page">
    <page-title :text="$t('notifications.title')" />
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
        />
      </div>

      <div class="flexrow-item comment-content">
        <div class="notification-info">
          <span class="date">
            {{ formatDate(notification.created_at) }}
          </span>
          <router-link
            class="person-name"
            :to="{
              name: 'person',
              params: {person_id: notification.author_id}
            }"
          >
            {{ personName(notification) }}
          </router-link>
          <span class="comment-explaination">
            {{ $t('notifications.commented_on') }}
          </span>
          <router-link
            class=""
            :to="entityPath(notification)"
          >
            {{ notification.project_name }} / {{ notification.full_entity_name }}
            &nbsp;
          </router-link>
          <task-type-name
            class="task-type-name"
            :task-type="buildTaskTypeFromNotification(notification)"
            :production-id="notification.project_id"
          />
          <span
            v-if="notification.change"
          >
            {{ $t('notifications.and_change_status') }}
          </span>
          <validation-tag
            class="validation-tag"
            :task="buildTaskFromNotification(notification)"
            v-if="notification.change"
          />
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
            />
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

import EntityThumbnail from '../widgets/EntityThumbnail'
import PageTitle from '../widgets/PageTitle'
import PeopleAvatar from '../widgets/PeopleAvatar'
import Spinner from '../widgets/Spinner'
import TaskTypeName from '../widgets/TaskTypeName'
import ValidationTag from '../widgets/ValidationTag'

export default {
  name: 'notification-page',
  components: {
    EntityThumbnail,
    PageTitle,
    PeopleAvatar,
    Spinner,
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
.dark .notification {
  background: $dark-grey-light;
  color: $white-grey;
}

.dark a {
  color: #DDDDDD;
}

a {
  font-weight: bold;
  color: $grey-strong;
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

.person-name {
  margin-left: 0.5em;
}

.comment-explaination {
  margin-left: 0.5em;
  margin-right: 0.5em;
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

.task-type-name {
  margin-right: 0.5em;
}
</style>
