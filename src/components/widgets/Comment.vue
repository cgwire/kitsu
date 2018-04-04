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
    <people-avatar class="level-item" :person="comment.person">
    </people-avatar>
  </figure>

  <div class="media-content">
    <div class="content">
      <div class="comment-person flexrow">
        <strong class="flexrow-item">
          <people-name class="" :person="comment.person"></people-name>
        </strong>
        <span class="comment-date flexrow-item">
          {{ formatDate(comment.created_at) }}
        </span>
        <router-link
          :to="previewRoute"
          class="revision flexrow-item"
          v-if="comment.preview"
        >
          revision {{ comment.preview.revision }}
        </router-link>
        <button-link
          class="flexrow-item"
          :text="$t('tasks.add_preview')"
          icon="upload"
          :path="{
            name: 'task-add-preview',
            params: {
              task_id: comment.object_id,
              comment_id: comment.id
            }
          }"
          v-if="editable && !comment.preview && comment.task_status.is_reviewable"
        >
        </button-link>
        <button-link
          class="flexrow-item"
          :text="$t('comments.change_preview')"
          icon="upload"
          :path="{
            name: 'task-change-preview',
            params: {
              task_id: comment.object_id,
              comment_id: comment.id
            }
          }"
          v-if="editable && comment.preview && comment.task_status.is_reviewable"
        >
        </button-link>
        <button-link
          icon="edit"
          class="flexrow-item"
          :path="{
            name: 'comment-edit',
            params: {
              task_id: comment.object_id,
              comment_id: comment.id
            }
          }"
          v-if="editable"
        >
        </button-link>
        <button-link
          icon="delete"
          class="flexrow-item"
          :path="{
            name: 'comment-delete',
            params: {
              task_id: comment.object_id,
              comment_id: comment.id
            }
          }"
          v-if="editable"
        >
        </button-link>

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
  padding: 0.6em;
  border-left: 3px solid #CCC;
  box-shadow: 0px 0px 6px #E0E0E0;
  background: white;
  border-radius: 0 5px 5px 0;
}

.comment.highlighted {
  background: #F1EEFF;
}

.comment:first-child {
  padding-top: 1em;
}

.content .comment-person {
  margin-bottom: 0.3em;
}

.comment-date {
  color: #999;
  font-style: italic;
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
</style>
