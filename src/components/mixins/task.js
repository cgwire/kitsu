/*
 * Helpers to display task information
 */
export const taskMixin = {
  computed: {
    currentFps() {
      const task = this.getTask()
      if (!task) return 25
      // An entity can override the production fps via data.fps; use it so
      // the player builds its frame model on the rate the video was
      // actually rendered at (otherwise frames get duplicated/dropped).
      // The entity may be a Shot, Edit, Sequence, Episode or Asset, each
      // in its own store map — task.entity is only { id } here.
      const entityFps = parseFloat(this.getTaskEntity(task)?.data?.fps)
      if (entityFps) return entityFps
      return parseInt(this.productionMap.get(task.project_id)?.fps) || 25
    },

    entityFrames() {
      const task = this.getTask()
      if (!task || !task.entity) return 0
      const shot = this.shotMap.get(task.entity.id)
      if (!shot || !shot.nb_frames) return 0

      return shot.nb_frames
    }
  },

  methods: {
    getTask() {
      return this.currentTask || this.task
    },

    getTaskEntity(task) {
      const getterByType = {
        Shot: 'shotMap',
        Episode: 'episodeMap',
        Sequence: 'sequenceMap',
        Edit: 'editMap',
        Asset: 'assetMap'
      }
      const getterName = getterByType[task?.entity_type_name]
      if (!getterName || !task?.entity?.id) return null
      return this.$store.getters[getterName]?.get(task.entity.id) || null
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
  }
}
