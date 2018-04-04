<template>
<article
  :class="{
    media: true,
    comment: true,
    highlighted: highlighted
  }"
  :style="{
    'border-left': '3px solid ' + comment.task_status.color
  }"
>

  <figure class="media-left">
    <div class="level">
      <div class="level-left">
        <people-avatar class="level-item" :person="comment.person">
        </people-avatar>
      </div>
    </div>
  </figure>

  <div class="media-content">
    <div class="content">
      <p class="comment-person">
        <strong>
          <people-name class="" :person="comment.person"></people-name>
        </strong>
        <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
      </p>

      <div class="level" v-if="comment.task_status.is_reviewable">

        <div class="level-left">
          <span class="level-item" :style="{'color': comment.task_status.color}">
            {{ comment.task_status.name }}
          </span>
          <router-link
            :to="previewRoute"
            class="revision"
            v-if="comment.preview"
          >
            revision {{ comment.preview.revision }}
          </router-link>
          <button-link
            class="level-item"
            :text="$t('tasks.add_preview')"
            icon="upload"
            :path="'/tasks/' + comment.object_id + '/comments/' + comment.id + '/add-preview'"
            v-else
          >
          </button-link>
        </div>
        </button-link>
      </div>

      <p v-if="comment.task_status.name === 'Done'">
        <span :style="{'color': comment.task_status.color}">
        {{ $t('comments.validated') }}
        </span>
      </p>

      <p class="version" v-if="comment.task_status_name === 'RETAKE'">
      </p>

      <p v-html="compileMarkdown(comment.text)" class="comment-text">
      </p>

      <p class="comment-date">
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
    }
  },
  computed: {
    previewRoute () {
      if (this.comment.preview) {
        return {
          name: 'task-preview',
          params: {
            task_id: this.comment.object_id,
            preview_id: this.comment.preview.id
          }
        }
      } else {
        return {name: 'task', params: {task_id: this.comment.object_id}}
      }
    }
  },

  methods: {
    formatDate (date) {
      const utcDate = moment.tz(date, 'UTC')
      return moment(utcDate.format()).fromNow()
    },

    compileMarkdown (input) {
      return marked(input || '')
    }
  }
}
</script>

<style scoped>
.comment {
  padding-left: 0.6em;
  border-left: 3px solid #CCC;
}

.comment.highlighted {
  background: #F1EEFF;
}

.comment:first-child {
  padding-top: 1em;
}

.comment-date {
  color: #999;
  font-style: italic;
  margin-left: 0.5em;
}

a.revision {
  color: #999;
  font-size: 0.8em;
  font-style: italic;
  margin: 0;
}

a.revision:hover {
  text-decoration: underline;
}
</style>
