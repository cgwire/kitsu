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
      <at-ta
        :members="team"
        name-key="full_name"
        :limit="2"
      >
        <template slot="item" slot-scope="team">
          <div class="flexrow">
            <people-avatar
              class="flexrow-item"
              :person="team.item"
              :size="20"
              :font-size="11"
              :no-cache="true"
            />
            <span class="flexrow-item">
              {{ team.item.full_name }}
            </span>
          </div>
        </template>
        <textarea
          ref="comment-textarea"
          class="textarea flexrow-item"
          :placeholder="$t('comments.add_comment')"
          :disabled="isLoading"
          v-model="text"
          @keyup.enter.ctrl="runAddComment(text, attachment, checklist, task_status_id)"
          @keyup.enter.meta="runAddComment(text, attachment, checklist, task_status_id)"
          v-focus>
        </textarea>
      </at-ta>
      <checklist
        :checklist="checklist"
        @add-item="onAddChecklistItem"
        @remove-task="removeTask"
        v-if="checklist.length > 0"
      />
      <div class="flexrow preview-section">
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
      <group-button class="mt1">
        <combobox-status
          class="status-selector"
          :narrow="true"
          :task-status-list="taskStatus"
          v-model="task_status_id"
        />
        <button-simple
          :class="{
            'button': true,
            'active': checklist.length !== 0
          }"
          icon="list"
          :title="$t('comments.add_checklist')"
          @click="addChecklistEntry(-1)"
        >
        </button-simple>
        <button-simple
          :class="{
            'button': true,
            'active': attachment.length !== 0
          }"
          icon="image"
          :title="$t('comments.add_attachment')"
          @click="onAddCommentAttachmentClicked()"
        >
        </button-simple>
        <button
          :class="{
            'button': true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          :style="{
            'background-color': taskStatusColor
          }"
          @click="runAddComment(text, attachment, checklist, task_status_id)"
        >
          {{ $t('comments.post_status') }}
        </button>
      </group-button>
      <div
        class="error pull-right"
        v-if="isError"
      >
        <em>{{ $t('comments.error') }}</em>
      </div>
    </div>

    <add-comment-image-modal
      ref="add-comment-image-modal"
      :active="modals.addCommentAttachment"
      :is-loading="loading.addCommentAttachment"
      :is-error="errors.addCommentAttachment"
      @cancel="onCloseCommentAttachment"
      @confirm="createCommentAttachment"
    />
  </article>
</template>

<script>
import { mapGetters } from 'vuex'
import { remove } from '@/lib/models'
import colors from '@/lib/colors'

import AtTa from 'vue-at/dist/vue-at-textarea'
import AddCommentImageModal from '@/components/modals/AddCommentImageModal'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import GroupButton from '@/components/widgets/GroupButton'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import Checklist from '@/components/widgets/Checklist'

export default {
  name: 'add-comment',

  components: {
    AtTa,
    AddCommentImageModal,
    ComboboxStatus,
    PeopleAvatar,
    GroupButton,
    ButtonSimple,
    Checklist
  },

  data () {
    return {
      isDragging: false,
      text: '',
      attachment: [],
      checklist: [],
      task_status_id: this.task.task_status_id,
      errors: {
        addCommentAttachment: false
      },
      loading: {
        addCommentAttachment: false
      },
      modals: {
        addCommentAttachment: false
      }
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
      default: () => {}
    },
    taskStatus: {
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
    },
    team: {
      type: Array,
      default: () => []
    }
  },

  mounted () {
    [
      'drag', 'dragstart', 'dragend', 'dragover',
      'dragenter', 'dragleave', 'drop'
    ].forEach((evt) => {
      if (this.$refs.wrapper) {
        this.$refs.wrapper.addEventListener(evt, (e) => {
          e.preventDefault()
          e.stopPropagation()
        })
      }
    })
  },

  computed: {
    ...mapGetters([
      'isDarkTheme'
    ]),

    isFileAttached () {
      return (
        this.attachedFileName !== undefined &&
        this.attachedFileName.length > 0
      )
    },

    taskStatusColor () {
      const status = this.taskStatus.find(t => t.id === this.task_status_id) ||
        this.taskStatus[0]
      if (status.short_name === 'todo') return '#666'
      const color = status.color
      if (this.isDarkTheme) {
        return colors.darkenColor(color)
      } else {
        return color
      }
    },

    isAddChecklistAllowed () {
      const status = this.taskStatus.find(t => t.id === this.task_status_id) ||
        this.taskStatus[0]
      return status.is_retake &&
        this.checklist.length === 0
    }
  },

  methods: {
    runAddComment (text, attachment, checklist, taskStatusId) {
      this.$emit('add-comment', text, attachment, checklist, taskStatusId)
      this.text = ''
      this.attachment = []
      this.checklist = []
    },

    updateValue (value) {
      this.task_status_id = this.$refs.statusSelect.value
    },

    focus () {
      this.$refs['comment-textarea'].focus()
    },

    onDragover () {
      this.isDragging = true
    },

    onDragleave () {
      this.isDragging = false
    },

    onDrop (event) {
      const forms = []
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const form = new FormData()
        form.append('file', event.dataTransfer.files[i])
        forms.push(form)
      }
      this.$emit('file-drop', forms)
      this.isDragging = false
    },

    onAddCommentAttachmentClicked (comment) {
      this.modals.addCommentAttachment = true
    },

    createCommentAttachment (forms) {
      this.onCloseCommentAttachment()
      this.attachment = forms
    },

    onCloseCommentAttachment () {
      this.modals.addCommentAttachment = false
    },

    addChecklistEntry (index) {
      if (index === -1 || index === this.checklist.length - 1) {
        this.checklist.push({
          text: '',
          checked: false
        })
      }
    },

    removeTask (entry) {
      this.checklist = remove(this.checklist, entry)
    },

    setValue (comment) {
      this.checklist = comment.checklist
      this.$nextTick(() => {
        this.$refs['comment-textarea'].value = comment.text
      })
    },

    onAddChecklistItem (item) {
      this.checklist[item.index].text = this.checklist[item.index].text.trim()
      delete item.index
      this.checklist.push(item)
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
.dark textarea:disabled {
  background: #555;
}

.add-comment {
  border-radius: 5px;
  background: white;
  transition: background 0.2s ease;

  textarea {
    min-height: 7em;
    margin-bottom: 0.3em;
  }

  textarea:focus,
  textarea:active {
    border-color: $green;
  }
}

.control {
  margin-bottom: 0.1em;
}

.preview-section {
  word-break: break-all;
}

.post-button-wrapper {
  margin: 0;

  .button.is-primary {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    height: 34px;
    margin-top: 1px;
  }
}

.mt1 {
  margin-top: 0.5em;
}

.is-dragging {
  background-color: $purple;
}

.button.is-primary {
  border-radius: 2em;
}

.button.active {
  background: var(--background-selected);
}

.status-selector {
  margin: 0;
}
</style>
