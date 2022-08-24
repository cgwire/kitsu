import drafts from '@/lib/drafts'

/*
 * Helpers to display task information
 */
export const taskMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
    if (this.$refs['add-comment']) {
      const task = this.getTask()
      const lastComment = `${this.$refs['add-comment'].text}`
      drafts.setTaskDraft(task.id, lastComment)
    }
  },

  computed: {
  },

  methods: {
    getTask () {
      return this.currentTask || this.task
    },

    resetModals () {
      if (this.$refs['add-preview-modal']) {
        this.$refs['add-preview-modal'].reset()
      }
      if (this.$refs['add-comment-image-modal']) {
        this.$refs['add-comment-image-modal'].reset()
      }
    },

    resetDraft () {
      const task = this.getTask()
      if (task && this.$refs['add-comment']) {
        const draft = drafts.getTaskDraft(task.id)
        if (draft) {
          this.$refs['add-comment'].text = draft
        } else {
          this.$refs['add-comment'].text = ''
        }
      }
    }
  }
}
