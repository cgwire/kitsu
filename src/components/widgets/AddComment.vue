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
      <div>
        <textarea
          ref="commentTextarea"
          class="textarea"
          :placeholder="$t('comments.add_comment')"
          :disabled="isLoading"
          v-model="text"
          @keyup.enter.ctrl="runAddComment(text, task_status_id)"
          v-focus>
        </textarea>
        <combobox
          :options="taskStatusOptions"
          :is-simple="true"
          v-model="task_status_id"
        />
        <button
          :class="{
            'button': true,
            'is-loading': isLoading
          }"
          @click="runAddComment(text, task_status_id)"
        >
          {{ $t('comments.post_status') }}
        </button>
      </div>
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
    </div>
  </article>
</template>

<script>
import Combobox from './Combobox.vue'
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
    }
  },

  watch: {
    task () {
      this.task_status_id = this.task.task_status_id
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

.control {
  margin-bottom: 0.1em;
}
</style>
