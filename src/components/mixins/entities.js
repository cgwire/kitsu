import { mapGetters, mapActions } from 'vuex'

import stringHelpers from '@/lib/string'
import func from '@/lib/func'
import preferences from '@/lib/preferences'

/*
 * Common functions to shots and assets pages.
 */
export const entitiesMixin = {
  data() {
    return {
      keepTaskPanelOpen: false
    }
  },

  mounted() {
    const departmentId = preferences.getPreference(
      `${this.pageName}:department`
    )
    const selectableDepartments = this.selectableDepartments(
      stringHelpers.capitalize(this.type)
    ).map(department => department.id)

    if (
      departmentId &&
      !this.isCurrentUserClient &&
      (!this.user.departments.length ||
        selectableDepartments.includes(departmentId) ||
        departmentId === 'ALL')
    ) {
      this.selectedDepartment = departmentId
    } else if (!this.isCurrentUserManager && this.user.departments.length) {
      this.selectedDepartment = 'MY_DEPARTMENTS'
    }
    this.onSelectedDepartmentChanged()
  },

  computed: {
    ...mapGetters([
      'isCurrentUserClient',
      'isCurrentUserManager',
      'nbSelectedTasks',
      'selectedTasks',
      'nbSelectedValidations'
    ]),

    searchField() {
      return this.$refs[`${this.type}-search-field`]
    },

    addThumbnailsModal() {
      return this.$refs['add-thumbnails-modal']
    },

    dataMatchers() {
      return ['Name']
    },

    isTaskSidePanelOpen() {
      return (
        this.nbSelectedTasks > 0 ||
        this.keepTaskPanelOpen ||
        this.nbSelectedEntities > 0 ||
        this.nbSelectedValidations > 0
      )
    },

    nbSelectedEntities() {
      return this.selectedEntities.size
    },

    entityTypeName() {
      return `${this.type[0].toUpperCase()}${this.type.slice(1)}`
    },

    selectedEntities() {
      if (['Episode', 'Sequence'].includes(this.entityTypeName)) return []
      return this[`selected${this.entityTypeName}s`]
    }
  },

  methods: {
    ...mapActions(['clearSelectedTasks']),

    showImportModal() {
      this.modals.isImportDisplayed = true
    },

    hideImportModal() {
      this.modals.isImportDisplayed = false
    },

    showImportRenderModal() {
      this.modals.isImportRenderDisplayed = true
    },

    hideImportRenderModal() {
      this.modals.isImportRenderDisplayed = false
    },

    showCreateTasksModal() {
      this.modals.isCreateTasksDisplayed = true
    },

    hideCreateTasksModal() {
      this.modals.isCreateTasksDisplayed = false
    },

    showAddThumbnailsModal() {
      this.modals.isAddThumbnailsDisplayed = true
    },

    hideAddThumbnailsModal() {
      this.modals.isAddThumbnailsDisplayed = false
    },

    onSelectedDepartmentChanged() {
      const departmentId = this.selectedDepartment
      if (departmentId === 'ALL') {
        this.departmentFilter = []
      } else if (departmentId === 'MY_DEPARTMENTS') {
        this.departmentFilter = this.user.departments
      } else {
        this.departmentFilter = [departmentId]
      }
      preferences.setPreference(`${this.pageName}:department`, departmentId)
    },

    selectableDepartments(forEntity) {
      return this.currentProduction.task_types
        .map(taskTypeId => {
          const taskType = this.taskTypeMap.get(taskTypeId)
          return taskType && taskType.for_entity === forEntity
            ? this.departmentMap.get(taskType.department_id)
            : false
        })
        .filter(
          (department, index, self) =>
            department && self.indexOf(department) === index
        )
    },

    onEntityThumbnailClicked(entityId) {
      if (!entityId) return
      this.previvewFileIdToShow = entityId
      this.modals.isPreviewDisplayed = true
    },

    closeMetadataModal() {
      this.modals.isAddMetadataDisplayed = false
    },

    confirmDeleteMetadata() {
      this.errors.deleteMetadata = false
      this.loading.deleteMetadata = true
      this.deleteMetadataDescriptor(this.descriptorIdToDelete)
        .then(() => {
          this.errors.deleteMetadata = false
          this.loading.deleteMetadata = false
          this.modals.isDeleteMetadataDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.deleteMetadata = true
          this.loading.deleteMetadata = false
        })
    },

    onAddMetadataClicked() {
      this.descriptorToEdit = {}
      this.modals.isAddMetadataDisplayed = true
    },

    onDeleteMetadataClicked(descriptorId) {
      this.descriptorIdToDelete = descriptorId
      this.modals.isDeleteMetadataDisplayed = true
    },

    onEditMetadataClicked(descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    confirmDeleteAllTasks(selectionOnly) {
      const taskTypeId = this.taskTypeForTaskDeletion.id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllTasks({ projectId, taskTypeId, selectionOnly })
        .then(() => {
          this.loading.deleteAllTasks = false
          this.modals.isDeleteAllTasksDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteAllTasks = false
          this.errors.deleteAllTasks = true
        })
    },

    confirmAddThumbnails(forms) {
      const addPreview = form => {
        this.addThumbnailsModal.markLoading(form.task.entity_id)
        return this.commentTaskWithPreview({
          taskId: form.task.id,
          commentText: '',
          taskStatusId: form.task.task_status_id,
          form
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
      func.runPromiseMapAsSeries(forms, addPreview).then(() => {
        this.loading.addThumbnails = false
        this.modals.isAddThumbnailsDisplayed = false
      })
    },

    confirmCreateTasks({ form, selectionOnly }) {
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

    confirmCreateTasksAndStay({ form, selectionOnly }) {
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

    deleteAllTasksText() {
      const taskType = this.taskTypeForTaskDeletion
      if (taskType) {
        return this.$t('tasks.delete_all_text', { name: taskType.name })
      } else {
        return ''
      }
    },

    onDeleteAllTasksClicked(taskTypeId) {
      const taskType = this.taskTypeMap.get(taskTypeId)
      this.taskTypeForTaskDeletion = taskType
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    saveScrollPosition(scrollPosition) {
      this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', scrollPosition)
    },

    onChangeSortClicked(sortInfo) {
      this[`change${this.type[0].toUpperCase()}${this.type.slice(1)}Sort`](
        sortInfo
      )
    },

    onKeepTaskPanelOpenChanged(keepOpen) {
      this.keepTaskPanelOpen = keepOpen
    },

    clearSelection() {
      this[`clearSelected${this.entityTypeName}s`]()
      this.clearSelectedTasks()
    }
  },

  watch: {
    selectedDepartment() {
      this.onSelectedDepartmentChanged()
    }
  }
}
