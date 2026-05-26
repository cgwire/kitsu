import { mapGetters, mapActions } from 'vuex'

import func from '@/lib/func'
import preferences from '@/lib/preferences'
import stringHelpers from '@/lib/string'

/*
 * Common functions to entity pages (assets, shots, sequences, edits, episodes).
 */
export const entitiesMixin = {
  data() {
    return {
      displaySettings: {
        bigThumbnails: false,
        contactSheetMode: false,
        showAssignations: true,
        showInfos: true
      },
      keepTaskPanelOpen: false
    }
  },

  mounted() {
    const departmentId = preferences.getPreference(
      `${this.pageName}:department`
    )
    const selectableDepartments = this.selectableDepartments(
      this.entityTypeName
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

    this.displaySettings = {
      ...this.displaySettings,
      ...preferences.getObjectPreference(`${this.type}s:display_settings`)
    }
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
      return stringHelpers.capitalize(this.type)
    },

    selectedEntities() {
      if (['Episode', 'Sequence'].includes(this.entityTypeName)) {
        return new Map()
      }
      return this[`selected${this.entityTypeName}s`]
    },

    deleteAllTasksText() {
      const taskType = this.taskTypeForTaskDeletion
      return taskType
        ? this.$t('tasks.delete_all_text', { name: taskType.name })
        : ''
    },

    restoreText() {
      const entity = this[`${this.type}ToRestore`]
      return entity
        ? this.$t(`${this.type}s.restore_text`, { name: entity.name })
        : ''
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
      this.clearSelectedTasks()
      preferences.setPreference(`${this.pageName}:department`, departmentId)
    },

    selectableDepartments(forEntity) {
      if (!this.currentProduction) {
        return []
      }
      return [
        ...new Set(
          this.currentProduction.task_types
            .map(id => this.taskTypeMap.get(id))
            .filter(taskType => taskType?.for_entity === forEntity)
            .map(taskType => this.departmentMap.get(taskType.department_id))
            .filter(Boolean)
        )
      ]
    },

    closeMetadataModal() {
      this.modals.isAddMetadataDisplayed = false
    },

    confirmAddMetadata(form) {
      this.loading.addMetadata = true
      form.entity_type = this.entityTypeName
      this.addMetadataDescriptor(form)
        .then(() => {
          this.modals.isAddMetadataDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.addMetadata = true
        })
        .finally(() => {
          this.loading.addMetadata = false
        })
    },

    confirmDeleteMetadata() {
      this.errors.deleteMetadata = false
      this.loading.deleteMetadata = true
      this.deleteMetadataDescriptor(this.descriptorIdToDelete)
        .then(() => {
          this.modals.isDeleteMetadataDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.deleteMetadata = true
        })
        .finally(() => {
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
      this[`deleteAll${this.entityTypeName}Tasks`]({
        projectId,
        taskTypeId,
        selectionOnly
      })
        .then(() => {
          if (!selectionOnly) this.reset()
          this.modals.isDeleteAllTasksDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.deleteAllTasks = true
        })
        .finally(() => {
          this.loading.deleteAllTasks = false
        })
    },

    confirmAddThumbnails(forms) {
      const addPreview = form => {
        this.addThumbnailsModal?.markLoading(form.task.entity_id)
        return this.commentTaskWithPreview({
          taskId: form.task.id,
          commentText: '',
          taskStatusId: form.task.task_status_id,
          form
        })
          .then(({ preview }) => {
            return this.setPreview({
              taskId: form.task.id,
              entityId: form.task.entity_id,
              previewId: preview.id
            })
          })
          .then(() => {
            this.addThumbnailsModal?.markUploaded(form.task.entity_id)
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

    runTasksCreation(form, selectionOnly) {
      this.errors.creatingTasks = false
      return this.createTasks({
        type: `${this.type}s`,
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        selectionOnly
      })
    },

    onDeleteAllTasksClicked(taskTypeId) {
      const taskType = this.taskTypeMap.get(taskTypeId)
      this.taskTypeForTaskDeletion = taskType
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    onRestoreClicked(entity) {
      this[`${this.type}ToRestore`] = entity
      this.modals.isRestoreDisplayed = true
    },

    saveScrollPosition(scrollPosition) {
      this.$store.commit(
        `SET_${this.type.toUpperCase()}_LIST_SCROLL_POSITION`,
        scrollPosition
      )
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) return
      this.loading.savingSearch = true
      this[`save${this.entityTypeName}Search`](searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this[`remove${this.entityTypeName}Search`](searchQuery).catch(
        console.error
      )
    },

    getPath(section) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id
        }
      }
      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${section}`
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    },

    onChangeSortClicked(sortInfo) {
      this[`change${this.entityTypeName}Sort`](sortInfo)
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
    },

    currentProduction(newProd, oldProd) {
      if (!oldProd || !newProd || oldProd.id === newProd.id) return
      this.keepTaskPanelOpen = false
      this.clearSelection()
    },

    displaySettings: {
      deep: true,
      handler(newSettings) {
        preferences.setObjectPreference(
          `${this.type}s:display_settings`,
          newSettings
        )
      }
    }
  }
}
