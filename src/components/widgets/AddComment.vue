<template>
  <article class="add-comment word-break media">
    <figure class="media-left" v-if="!light">
      <div class="level">
        <div class="level-left">
          <people-avatar class="level-item" :person="user" />
        </div>
      </div>
    </figure>
    <div class="media-content">
      <textarea
        ref="commentTextarea"
        class="textarea flexrow-item"
        :placeholder="$t('comments.add_comment')"
        :disabled="isLoading"
        v-model="text"
        @keyup.enter.ctrl="runAddComment(text, task_status_id)"
        v-focus>
      </textarea>
      <div class="flexrow">
        <button
          class="button flexrow-item"
          @click="$emit('add-preview')"
        >
          {{ $t('comments.add_preview') }}
        </button>
        <span
          class="attachment-file flexrow-item"
        >
          <em
            v-if="!isFileAttached"
          >
            {{ $t('comments.no_file_attached') }}
          </em>
          <em
            v-if="isFileAttached"
          >
            {{ attachedFileName }}
          </em>
        </span>
      </div>
      <div class="flexrow mt1">
        <span class="flexrow-item">
          {{ $t('comments.set_status_to') }}
        </span>
        <combobox
          class="flexrow-item status-selector"
          :options="taskStatusOptions"
          :is-simple="true"
          v-model="task_status_id"
        />

        <div class="flexrow-item post-button-wrapper">
        <button
          :class="{
            'button': true,
            'button': true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="runAddComment(text, task_status_id)"
        >
          {{ $t('comments.post_status') }}
        </button>
        </div>
      </div>
      <div
        class="error pull-right"
        v-if="isError"
      >
        <em>{{ $t('comments.error') }}</em>
      </div>
    </div>
  </article>
</template>

<script>
import Combobox from './Combobox'
import PeopleAvatar from './PeopleAvatar'

export default {
  name: 'add-comment',
  data () {
    return {
      text: '',
      task_status_id: this.task.task_status_id
    }
  },

  components: {
    Combobox,
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
    isError: {
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
    },
    attachedFileName: {
      type: String,
      default: ''
    }
  },

  computed: {
    isFileAttached () {
      return (
        this.attachedFileName !== undefined &&
        this.attachedFileName.length > 0
      )
    }
  },

  methods: {
    runAddComment (text, taskStatusId) {
      this.$emit('add-comment', text, taskStatusId)
      this.text = ''
    },

    updateValue (value) {
      this.task_status_id = this.$refs.statusSelect.value
    },

    focus () {
      this.$refs.commentTextarea.focus()
    }
  },

  watch: {
    task () {
      this.task_status_id = this.task.task_status_id
    }
  }
}
</script>

<style lang="scss" scoped>
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
  border-color: $green;
}

.control {
  margin-bottom: 0.1em;
}

.dark textarea:disabled {
  background: #555;
}

.post-button-wrapper {
  flex: 1;
  text-align: right
}

.mt1 {
  margin-top: 0.5em;
}

.status-selector {
  margin-top: 4px;
}
</style>
