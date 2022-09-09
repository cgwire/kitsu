import preferences from '@/lib/preferences'

/*
 * Common functions to shots and assets pages.
 */
export const entitiesMixin = {

  created () {
  },

  mounted () {
    const departmentId = preferences
      .getPreference(this.pageName + ':departement')
    if (departmentId) {
      this.selectedDepartment = departmentId
    } else {
      if (!this.isCurrentUserManager && this.user.departments.length > 0) {
        this.selectedDepartment = 'MY_DEPARTMENTS'
      }
    }
    this.onSelectedDepartmentChanged()
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

    onSelectedDepartmentChanged () {
      const departmentId = this.selectedDepartment
      if (departmentId === 'ALL') {
        this.departmentFilter = []
      } else if (departmentId === 'MY_DEPARTMENTS') {
        this.departmentFilter = this.user.departments
      } else {
        this.departmentFilter = [departmentId]
      }
      preferences.setPreference(this.pageName + ':departement', departmentId)
    },

    selectableDepartments (forEntity) {
      return this.currentProduction.task_types
        .map(taskTypeId => {
          const taskType = this.taskTypeMap.get(taskTypeId)
          return (taskType.for_entity === forEntity)
            ? this.departmentMap.get(taskType.department_id) : false
        })
        .filter((department, index, self) =>
          department && self.indexOf(department) === index)
    },

    onEntityThumbnailClicked (entityId) {
      if (!entityId) return
      this.previvewFileIdToShow = entityId
      this.modals.isPreviewDisplayed = true
    }
  },

  watch: {
    selectedDepartment () {
      this.onSelectedDepartmentChanged()
    }
  }
}
