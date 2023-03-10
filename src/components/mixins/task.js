import drafts from '@/lib/drafts'

/*
 * Helpers to display task information
 */
export const taskMixin = {
  created() {},

  mounted() {},

  computed: {},

  methods: {
    getTask() {
      return this.currentTask || this.task
    },

    getComments() {
      return this.currentTaskComments || this.taskComments
    },

    resetComments() {
      this.taskComments = this.getTaskComments(this.task.id)
    },

    resetModals() {
      if (this.$refs['add-preview-modal']) {
        this.$refs['add-preview-modal'].reset()
      }
      if (this.$refs['add-comment-image-modal']) {
        this.$refs['add-comment-image-modal'].reset()
      }
    },

    resetDraft() {
      const task = this.getTask()
      if (task && this.$refs['add-comment']) {
        const draft = drafts.getTaskDraft(task.id)
        if (draft) {
          this.$refs['add-comment'].text = draft
        } else {
          this.$refs['add-comment'].text = ''
        }
      }
    },

    confirmEditTaskComment(comment) {
      this.loading.editComment = true
      this.errors.editComment = false
      const attachmentFilesToDelete = comment.attachmentFilesToDelete || []
      const newAttachmentFiles = comment.newAttachmentFiles || []
      delete comment.attachmentFilesToDelete
      delete comment.newAttachmentFiles
      Promise.all(
        attachmentFilesToDelete
          .map(attachment => {
            return { attachment, comment: this.commentToEdit }
          })
          .map(this.deleteAttachment)
      )
        .then(comment =>
          this.addAttachmentToComment({
            comment: this.commentToEdit,
            files: newAttachmentFiles
          })
        )
        .then(() =>
          this.editTaskComment({
            taskId: this.getTask().id,
            comment
          })
        )
        .then(() => {
          this.$nextTick(() => {
            this.resetComments()
          })
          this.loading.editComment = false
          this.modals.editComment = false
        })
        .catch(err => {
          console.error(err)
          this.loading.editComment = false
          this.errors.editComment = true
        })
    }
  },

  socket: {
    events: {}
  }
}
