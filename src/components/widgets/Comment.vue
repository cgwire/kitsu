<template>
<article
  :class="{
    media: true,
    comment: true,
    highlighted: highlighted
  }"
  :style="{
    'border-left': '6px solid ' + comment.task_status.color
  }"
>

  <figure class="media-left">
    <people-avatar class="level-item" :person="comment.person" />
  </figure>

  <div class="media-content">
    <div class="content">
      <div class="comment-person flexrow">
        <div class="flexrow-item">
          <strong class="">
            <people-name class="" :person="comment.person" />
          </strong>
          <span class="comment-date">
            {{ formatDate(comment.created_at) }}
          </span>
          <router-link
            :to="previewRoute"
            class="revision"
            v-if="!light && comment.previews.length > 0"
          >
            revision {{ comment.previews[0].revision }}
          </router-link>

        </div>
        <div class="flexrow-item" v-if="!light">
          <button-link
            icon="upload"
            class=""
            :text="$t('tasks.add_preview')"
            :is-responsive="true"
            :path="addPreviewPath"
            v-if="editable && comment.previews.length === 0 && comment.task_status.is_reviewable"
          />
          <button-link
            icon="edit"
            class=""
            :path="editCommentPath"
            v-if="editable"
          />
          <button-link
            icon="delete"
            class=""
            :path="deleteCommentPath"
            v-if="editable"
          />
        </div>
      </div>

      <p v-if="comment.task_status.name === 'Done'">
        <span :style="{'color': comment.task_status.color}">
        {{ $t('comments.validated') }}
        </span>
      </p>

      <p
        v-html="compileMarkdown(comment.text)"
        class="comment-text"
        v-if="comment.text"
      >
      </p>
      <p class="comment-text empty" v-else>
        {{ $t('comments.empty_text') }}
      </p>
    </div>
  </div>
</article>
</template>

<script>
import marked from 'marked'
import moment from 'moment-timezone'

import PeopleAvatar from './PeopleAvatar.vue'
import PeopleName from './PeopleName.vue'
import ButtonLink from './ButtonLink.vue'

export default {
  name: 'comment',
  components: {
    PeopleAvatar,
    PeopleName,
    ButtonLink
  },

  props: {
    comment: {
      type: Object,
      default: () => {}
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    previewRoute () {
      let route = {
        name: 'task',
        params: {task_id: this.comment.object_id}
      }
      if (this.comment.previews.length > 0) {
        route = {
          name: 'task-preview',
          params: {
            task_id: this.comment.object_id,
            preview_id: this.comment.previews[0].id
          }
        }
      }
      if (this.$route.params.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.$route.params.episode_id
      }
      return route
    },

    deleteCommentPath () {
      return this.getPath('task-delete-comment')
    },

    editCommentPath () {
      return this.getPath('task-edit-comment')
    },

    addPreviewPath () {
      return this.getPath('task-add-preview')
    }
  },

  methods: {
    formatDate (date) {
      const utcDate = moment.tz(date, 'UTC')
      if (moment().diff(utcDate, 'days') > 1) {
        return utcDate.format('YYYY-MM-DD HH:mm')
      } else {
        return moment(utcDate.format()).fromNow()
      }
    },

    compileMarkdown (input) {
      return marked(input || '')
    },

    getPath (name) {
      let route = {
        name: name,
        params: {
          task_id: this.comment.object_id,
          comment_id: this.comment.id
        }
      }
      if (this.$route.params.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.$route.params.episode_id
      }
      return route
    }
  }
}
</script>

<style scoped>
.dark .comment-text {
  color: #EEE;
}

.comment {
  background: white;
  border-left: 6px solid #CCC;
  border-radius: 0 5px 5px 0;
  padding: 0.6em;
}

.comment:first-child {
  padding-top: 1em;
}

.comment.highlighted {
  background: #F1EEFF;
}

.content .comment-person {
  margin-bottom: 0.3em;
}

.comment-date {
  color: #999;
  margin-left: 0.5em;
  flex: 1;
}

a.revision {
  color: #999;
  font-size: 0.8em;
  font-style: italic;
  margin: 0 1em 0 0;
}

a.revision:hover {
  text-decoration: underline;
}

.comment-text {
  margin-top: 1em;
}

.comment-text.empty {
  font-style: italic;
  color: #AAA;
}

@media screen and (max-width: 768px) {
  .flexrow {
    flex-direction: column;
    align-items: flex-start;
  }
}

</style>
