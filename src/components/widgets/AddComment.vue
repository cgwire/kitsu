<template>
  <article
    ref="wrapper"
    @drop="onDrop"
    @dragover="onDragover"
    @dragleave="onDragleave"
    :class="{
      'add-comment': true,
      'word-break': true,
      media: true,
      'is-dragging': isDragging
    }"
  >
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
        <combobox-status
          class="flexrow-item status-selector"
          :task-status-list="taskStatus"
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
import ComboboxStatus from './ComboboxStatus'
import PeopleAvatar from './PeopleAvatar'

export default {
  name: 'add-comment',

  components: {
    ComboboxStatus,
    PeopleAvatar
  },

  data () {
    return {
      isDragging: false,
      text: '',
      task_status_id: this.task.task_status_id
    }
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
    taskStatus: {
      type: Array,
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

  mounted () {
    [
      'drag', 'dragstart', 'dragend', 'dragover',
      'dragenter', 'dragleave', 'drop'
    ].forEach((evt) => {
      this.$refs.wrapper.addEventListener(evt, (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
    })
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
    },

    onDragover () {
      this.isDragging = true
    },

    onDragleave () {
      this.isDragging = false
    },

    onDrop (event) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const form = new FormData()
        form.append('file', event.dataTransfer.files[i])
        this.$emit('file-drop', form)
      }
      this.isDragging = false
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
  transition: background 0.2s ease;
  word-break: break-all;
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

.is-dragging {
  background-color: $purple;
}
</style>
