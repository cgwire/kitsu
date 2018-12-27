<template>
  <article class="add-comment media">
    <figure class="media-left" v-if="!light">
      <div class="level">
        <div class="level-left">
          <people-avatar class="level-item" :person="user" />
        </div>
      </div>
    </figure>
    <div class="media-content">
      <p class="control">
        <textarea
          ref="commentTextarea"
          class="textarea"
          :placeholder="$t('comments.add_comment')"
          :disabled="isLoading"
          v-model="text"
          @keyup.enter.ctrl="runAddComment(text, task_status_id)"
          v-focus>
        </textarea>
        <span class="select">
          <select
            ref="statusSelect"
            @change="updateValue"
          >
            <option
              v-for="(option, i) in taskStatusOptions"
              :key="i + '-' + option.label"
              :value="option.value"
              :selected="option.value === task_status_id"
            >
              {{ option.label }}
            </option>
          </select>
        </span>
        <button
          :class="{
            'button': true,
            'is-loading': isLoading
          }"
          @click="runAddComment(text, task_status_id)"
        >
          {{ $t('comments.post_status') }}
        </button>
        <button
          class="button"
          @click="$emit('add-preview')"
        >
          {{ $t('comments.add_preview') }}
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
    addComment: {
      type: Function,
      default: null
    },
    isLoading: {
      type: Boolean,
      default: null
    },
    light: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      default: () => []
    },
    taskStatusOptions: {
      type: Array,
      default: () => []
    },
    user: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    runAddComment (text, taskStatusId) {
      this.$emit('add-comment', text, taskStatusId)
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
  background: white;
}

.add-comment textarea {
  min-height: 7em;
  margin-bottom: 0.3em;
}

.add-comment textarea:focus,
.add-comment textarea:active {
  border-color: #00B242;
}
</style>
