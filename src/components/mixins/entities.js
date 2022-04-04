/*
 * Common functions to shots and assets pages.
 */
export const entitiesMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
  },

  methods: {
    showImportModal () {
      this.modals.isImportDisplayed = true
    },

    hideImportModal () {
      this.modals.isImportDisplayed = false
    },

    showImportRenderModal () {
      this.modals.isImportRenderDisplayed = true
    },

    hideImportRenderModal () {
      this.modals.isImportRenderDisplayed = false
    },

    showCreateTasksModal () {
      this.modals.isCreateTasksDisplayed = true
    },

    hideCreateTasksModal () {
      this.modals.isCreateTasksDisplayed = false
    },

    showAddThumbnailsModal () {
      this.modals.isAddThumbnailsDisplayed = true
    },

    hideAddThumbnailsModal () {
      this.modals.isAddThumbnailsDisplayed = false
    },

    onSelectedDepartment (departmentId) {
      if (departmentId === 'ALL') {
        this.departmentFilter = []
      } else if (departmentId === 'MY_DEPARTMENTS') {
        this.departmentFilter = this.user.departments
      } else {
        this.departmentFilter = [departmentId]
      }
    }
  }
}
