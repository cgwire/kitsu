<template>
  <article class="add-comment media">
    <figure class="media-left">
      <div class="level">
        <div class="level-left">
          <people-avatar class="level-item" :person="user">
          </people-avatar>
        </div>
      </div>
    </figure>
    <div class="media-content">
      <p class="control">
        <textarea
          class="textarea"
          :placeholder="$t('comments.add_comment')"
          @keyup.enter.ctrl="runAddComment(text, task_status_id)"
          :disabled="isAddCommentLoading"
          v-model="text"
          ref="commentTextarea"
          v-focus>
        </textarea>
        <span class="select">
          <select
            ref="statusSelect"
            @change="updateValue"
          >
            <option
              v-for="option in taskStatusOptions"
              :value="option.value"
              :selected="option.value === task_status_id"
            >
              {{ option.label }}
            </option>
          </select>
        </span>
        <button
          v-bind:class="{
            'button': true,
            'is-loading': isAddCommentLoading
          }"
          @click="runAddComment(text, task_status_id)"
        >
          {{ $t('comments.post_status') }}
        </button>
      </p>
    </div>
  </article>
</template>

<script>
import PeopleAvatar from './PeopleAvatar.vue'

export default {
  name: 'add-comment',
  data () {
    return {
      text: '',
      task_status_id: this.task.task_status_id
    }
  },
  components: {
    PeopleAvatar
  },
  props: {
    user: {
      type: Object,
      default: {}
    },
    addComment: {
      type: Function,
      default: null
    },
    isAddCommentLoading: {
      type: Boolean,
      default: null
    },
    taskStatusOptions: {
      type: Array,
      default: []
    },
    task: {
      type: Object,
      default: []
    }
  },
  methods: {
    runAddComment (text, taskStatusId) {
      this.addComment(text, taskStatusId)
      this.text = ''
    },
    updateValue (value) {
      this.task_status_id = this.$refs.statusSelect.value
    }
  }
}
</script>

<style scoped>
.add-comment {
  border-radius: 5px;
  padding: 1em;
  box-shadow: 0px 0px 6px #E0E0E0;
  background: white;
}

.add-comment textarea {
  max-height: 5em;
  min-height: 5em;
  margin-bottom: 0.3em;
}
</style>
