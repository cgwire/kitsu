<template>
<article :class="'media comment ' + getStatusClass(comment.task_status.name)">
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
          <people-name class="" :person="comment.person">
          </people-name>
        </strong>
        <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
      </p>
      <p v-if="comment.task_status.name === 'RETAKE'">
        <span class="is-danger">RETAKE</span>
        <span class="version">version 01</span>
      </p>
      <p v-if="comment.task_status.name === 'WFA'">
        <span class="is-wfa">Validation Needed</span>
        <span class="version">version 01</span>
      </p>
      <p class="version" v-if="comment.task_status.name === 'RETAKE'">
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
import moment from 'moment'

import PeopleAvatar from './PeopleAvatar.vue'
import PeopleName from './PeopleName.vue'

export default {
  name: 'add-comment',
  components: {
    PeopleAvatar,
    PeopleName
  },
  props: [
    'comment'
  ],
  methods: {
    formatDate (date) {
      return moment(date).fromNow()
    },
    compileMarkdown (input) {
      return marked(input || '')
    },
    getStatusClass (taskStatus) {
      if (taskStatus === 'WIP') {
        return 'is-info'
      } else if (taskStatus === 'DONE') {
        return 'is-success'
      } else if (taskStatus === 'Confirmed') {
        return 'is-warning'
      } else if (taskStatus === 'DONE') {
        return 'is-success'
      } else if (taskStatus === 'WFA') {
        return 'is-primary'
      } else if (taskStatus === 'RETAKE') {
        return 'is-danger'
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.comment {
  padding-left: 0.6em;
  border-left: 3px solid #CCC;
}
.comment p {
}

.comment-date {
  color: #999;
  font-style: italic;
  margin-left: 0.5em;
}

.comment.is-success {
  border-left: 3px solid #23d160;
}

.comment.is-warning {
  border-left: 3px solid #ffdb4a;
}

.comment.is-danger {
  border-left: 3px solid #ff2b56;
}

.comment.is-info {
  border-left: 3px solid #3273dc;
}

.comment.is-primary {
  border-left: 3px solid #00d1b2;
}

.comment.is-success {
  border-left: 3px solid #22c65b;
}

span.is-danger {
  color: #ff2b56;
  font-size: 0.9em;
  font-weight: bold;
  margin: 0;
}

span.is-wfa {
  color: #23d160;
  font-size: 0.9em;
  font-weight: bold;
  margin: 0;
}

span.version {
  color: #999;
  font-size: 0.8em;
  font-style: italic;
  margin: 0;
}
</style>
