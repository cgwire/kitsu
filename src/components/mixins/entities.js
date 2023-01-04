import func from '@/lib/func'
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
    searchField () {
      return this.$refs[`${this.type}-search-field`]
    },

    addThumbnailsModal () {
      return this.$refs['add-thumbnails-modal']
    },

    dataMatchers () {
      return ['Name']
    }
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
    },

    closeMetadataModal () {
      this.modals.isAddMetadataDisplayed = false
    },

    confirmDeleteMetadata () {
      this.errors.deleteMetadata = false
      this.loading.deleteMetadata = true
      this.deleteMetadataDescriptor(this.descriptorIdToDelete)
        .then(() => {
          this.errors.deleteMetadata = false
          this.loading.deleteMetadata = false
          this.modals.isDeleteMetadataDisplayed = false
        }).catch((err) => {
          console.error(err)
          this.errors.deleteMetadata = true
          this.loading.deleteMetadata = false
        })
    },

    onAddMetadataClicked () {
      this.descriptorToEdit = {}
      this.modals.isAddMetadataDisplayed = true
    },

    onDeleteMetadataClicked (descriptorId) {
      this.descriptorIdToDelete = descriptorId
      this.modals.isDeleteMetadataDisplayed = true
    },

    onEditMetadataClicked (descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    confirmDeleteAllTasks (selectionOnly) {
      const taskTypeId = this.taskTypeForTaskDeletion.id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllEpisodeTasks({ projectId, taskTypeId, selectionOnly })
        .then(() => {
          this.loading.deleteAllTasks = false
          this.modals.isDeleteAllTasksDisplayed = false
        }).catch((err) => {
          console.error(err)
          this.loading.deleteAllTasks = false
          this.errors.deleteAllTasks = true
        })
    },

    confirmAddThumbnails (forms) {
      const addPreview = (form) => {
        this.addThumbnailsModal.markLoading(form.task.entity_id)
        return this.commentTaskWithPreview({
          taskId: form.task.id,
          commentText: '',
          taskStatusId: form.task.task_status_id,
          form: form
        })
          .then(({ newComment, preview }) => {
            return this.setPreview({
              taskId: form.task.id,
              entityId: form.task.entity_id,
              previewId: preview.id
            })
          })
          .then(() => {
            this.addThumbnailsModal.markUploaded(form.task.entity_id)
            return Promise.resolve()
          })
      }
      this.loading.addThumbnails = true
      func.runPromiseMapAsSeries(forms, addPreview)
        .then(() => {
          this.loading.addThumbnails = false
          this.modals.isAddThumbnailsDisplayed = false
        })
    },

    confirmCreateTasks ({ form, selectionOnly }) {
      this.loading.creatingTasks = true
      this.runTasksCreation(form, selectionOnly)
        .then(() => {
          this.reset()
          this.hideCreateTasksModal()
          this.loading.creatingTasks = false
        })
        .catch(err => {
          this.errors.creatingTasks = true
          console.error(err)
        })
    },

    confirmCreateTasksAndStay ({ form, selectionOnly }) {
      this.loading.creatingTasksStay = true
      this.runTasksCreation(form, selectionOnly)
        .then(() => {
          this.reset()
          this.loading.creatingTasksStay = false
        })
        .catch(err => {
          this.errors.creatingTasks = true
          console.error(err)
        })
    },

    deleteAllTasksText () {
      const taskType = this.taskTypeForTaskDeletion
      if (taskType) {
        return this.$t('tasks.delete_all_text', { name: taskType.name })
      } else {
        return ''
      }
    },

    onDeleteAllTasksClicked (taskTypeId) {
      const taskType = this.taskTypeMap.get(taskTypeId)
      this.taskTypeForTaskDeletion = taskType
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    saveScrollPosition (scrollPosition) {
      this.$store.commit(
        'SET_EDIT_LIST_SCROLL_POSITION',
        scrollPosition
      )
    },

    onSearchChange () {
      if (!this.searchField) return
      this.isSearchActive = false
      const searchQuery = this.searchField.getValue() || ''
      this.applySearch(searchQuery)
    },

    onChangeSortClicked (sortInfo) {
      this.changeEpisodeSort(sortInfo)
    },

    confirmBuildFilter (query) {
      this.modals.isBuildFilterDisplayed = false
      this.searchField.setValue(query)
      this.applySearch(query)
    }
  },

  watch: {
    selectedDepartment () {
      this.onSelectedDepartmentChanged()
    }
  }
}
