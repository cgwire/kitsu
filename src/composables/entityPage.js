/*
 * Shared logic of the entity pages (assets, shots, sequences, episodes,
 * edits): search field and URL query, department filter and display
 * settings, task creation and deletion, metadata descriptors, thumbnails.
 * Composition API counterpart of the former entities and search mixins.
 *
 * The page passes the template refs of its list, its search field and its
 * thumbnails modal, plus `reset`, its own reload of the entities.
 */
import moment from 'moment'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import func from '@/lib/func'
import preferences from '@/lib/preferences'
import stringHelpers from '@/lib/string'

export const GENERIC_IMPORT_COLUMNS = [
  'Metadata column name (text value)',
  'Task type name (task status name value)',
  'Task type name + comment (text value)'
]

const DISPLAY_SETTINGS = {
  bigThumbnails: false,
  contactSheetMode: false,
  fullTaskTypeNames: false,
  showAssignations: true,
  showInfos: true
}

const MODALS = {
  isAddMetadataDisplayed: false,
  isAddThumbnailsDisplayed: false,
  isBuildFilterDisplayed: false,
  isCreateTasksDisplayed: false,
  isDeleteAllTasksDisplayed: false,
  isDeleteDisplayed: false,
  isDeleteMetadataDisplayed: false,
  isImportDisplayed: false,
  isImportRenderDisplayed: false,
  isNewDisplayed: false,
  isRestoreDisplayed: false
}

const LOADING = {
  addMetadata: false,
  addThumbnails: false,
  creatingAllTasks: false,
  creatingTasks: false,
  creatingTasksStay: false,
  del: false,
  deleteAllTasks: false,
  deleteMetadata: false,
  edit: false,
  importing: false,
  restore: false,
  savingSearch: false,
  stay: false
}

const ERRORS = {
  addMetadata: false,
  addThumbnails: false,
  creatingTasks: false,
  del: false,
  deleteAllTasks: false,
  deleteMetadata: false,
  edit: false,
  importing: false,
  importingError: null,
  restore: false
}

/*
 * Options:
 * - type: 'asset' | 'edit' | 'episode' | 'sequence' | 'shot'
 * - pageName: the preference key prefix ('Shots')
 * - listRef, searchFieldRef, addThumbnailsModalRef, importModalRef:
 *   template refs
 * - reset: () => void, reloads the entities of the page
 * - loadEntities: () => Promise, the plain load run after a CSV import
 * - dataMatchers: ref of the CSV columns identifying an entity
 * - optionalColumns: ref of the other CSV columns
 * - hasAssignationColumns: the CSV import takes the assignations too
 * - canCancel: deleting an entity with tasks cancels it instead
 * - displaySettings, modals, loading, errors: extra keys of the page
 */
export const useEntityPage = ({
  type,
  pageName,
  listRef,
  searchFieldRef,
  addThumbnailsModalRef = ref(null),
  importModalRef = ref(null),
  reset,
  loadEntities = () => Promise.resolve(),
  dataMatchers = computed(() => ['Name']),
  optionalColumns = ref([]),
  hasAssignationColumns = false,
  canCancel = false,
  displaySettings: extraDisplaySettings = {},
  modals: extraModals = {},
  loading: extraLoading = {},
  errors: extraErrors = {}
}) => {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  const entityTypeName = stringHelpers.capitalize(type)
  const TYPE = type.toUpperCase()

  // State
  // --------------------------------------------------------------------------

  const deleteAllTasksLockText = ref(null)
  const departmentFilter = ref([])
  const descriptorIdToDelete = ref(null)
  const descriptorToEdit = ref({})
  const displaySettings = ref({ ...DISPLAY_SETTINGS, ...extraDisplaySettings })
  const entityToDelete = ref(null)
  const entityToEdit = ref(null)
  const entityToRestore = ref(null)
  const keepTaskPanelOpen = ref(false)
  const parsedCSV = ref([])
  const selectedDepartment = ref('ALL')
  const taskTypeForTaskDeletion = ref(null)

  const errors = reactive({ ...ERRORS, ...extraErrors })
  const loading = reactive({ ...LOADING, ...extraLoading })
  const modals = reactive({ ...MODALS, ...extraModals })
  // Only the asset modal reads it: the other edit modals close on success.
  const success = reactive({ edit: false })

  // Computed
  // --------------------------------------------------------------------------

  const currentEpisode = computed(() => store.getters.currentEpisode)
  const currentProduction = computed(() => store.getters.currentProduction)
  const departmentMap = computed(() => store.getters.departmentMap)
  const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
  const isCurrentUserManager = computed(
    () => store.getters.isCurrentUserProductionManager
  )
  const isTVShow = computed(() => store.getters.isTVShow)
  const listScrollPosition = computed(
    () => store.getters[`${type}ListScrollPosition`]
  )
  const loadingKey = computed(() => store.getters[`${type}sLoadingKey`])
  const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
  const nbSelectedValidations = computed(
    () => store.getters.nbSelectedValidations
  )
  const productionTaskTypes = computed(
    () => store.getters[`production${entityTypeName}TaskTypes`]
  )
  const searchText = computed(() => store.getters[`${type}SearchText`])
  const taskTypeMap = computed(() => store.getters.taskTypeMap)
  const user = computed(() => store.getters.user)

  // The episode and sequence pages have no line selection.
  const selectedEntities = computed(() =>
    ['Episode', 'Sequence'].includes(entityTypeName)
      ? new Map()
      : store.getters[`selected${entityTypeName}s`]
  )

  const nbSelectedEntities = computed(() => selectedEntities.value.size)

  const isTaskSidePanelOpen = computed(
    () =>
      nbSelectedTasks.value > 0 ||
      keepTaskPanelOpen.value ||
      nbSelectedEntities.value > 0 ||
      nbSelectedValidations.value > 0
  )

  const deleteAllTasksText = computed(() => {
    const taskType = taskTypeForTaskDeletion.value
    return taskType ? t('tasks.delete_all_text', { name: taskType.name }) : ''
  })

  const restoreText = computed(() => {
    const entity = entityToRestore.value
    return entity ? t(`${type}s.restore_text`, { name: entity.name }) : ''
  })

  const deleteText = computed(() => {
    const entity = entityToDelete.value
    if (!entity?.name) return ''
    const isCanceled =
      canCancel && !entity.canceled && entity.tasks && entity.tasks.length > 0
    return t(`${type}s.${isCanceled ? 'cancel_text' : 'delete_text'}`, {
      name: entity.name
    })
  })

  const renderColumns = computed(() => [
    ...dataMatchers.value,
    ...optionalColumns.value,
    ...productionTaskTypes.value.flatMap(taskType => [
      taskType.name,
      `${taskType.name} comment`,
      ...(hasAssignationColumns ? [`${taskType.name} assignations`] : [])
    ])
  ])

  // Search
  // --------------------------------------------------------------------------

  const getSearchValue = () => searchFieldRef.value?.getValue() || ''

  const setSearchInUrl = query => {
    const searchQuery = query || searchFieldRef.value?.getValue()
    router.push({
      query: { ...route.query, search: searchQuery || undefined }
    })
  }

  const setSearchFromUrl = () => {
    const searchFromUrl = route.query.search
    if (!getSearchValue() && searchFromUrl) {
      searchFieldRef.value?.setValue(searchFromUrl)
    }
  }

  const applySearch = (search, force = true) => {
    if (search === searchFieldRef.value?.getValue() && !force) return
    searchFieldRef.value?.setValue(search)
    store.dispatch(`set${entityTypeName}Search`, search || '')
  }

  const applySearchFromUrl = (force = true) => {
    const search = route.query.search
    applySearch(search?.length > 0 ? `${search}` : '', force)
  }

  const clearSelection = () => {
    store.dispatch(`clearSelected${entityTypeName}s`)
    store.dispatch('clearSelectedTasks')
  }

  // The URL carries the search: its watcher applies the query written here.
  const onSearchChange = (clearSelectionAfter = true) => {
    if (!searchFieldRef.value) return
    setSearchInUrl(getSearchValue())
    if (clearSelectionAfter) setTimeout(clearSelection, 10)
  }

  const confirmBuildFilter = query => {
    modals.isBuildFilterDisplayed = false
    searchFieldRef.value.setValue(query)
    setSearchInUrl(query)
    onSearchChange()
  }

  const focusSearchField = options => {
    searchFieldRef.value?.focus(options)
  }

  const saveSearchQuery = async searchQuery => {
    if (loading.savingSearch) return
    loading.savingSearch = true
    try {
      await store.dispatch(`save${entityTypeName}Search`, searchQuery)
    } catch (err) {
      console.error(err)
    } finally {
      loading.savingSearch = false
    }
  }

  const removeSearchQuery = searchQuery => {
    store
      .dispatch(`remove${entityTypeName}Search`, searchQuery)
      .catch(console.error)
  }

  // Scroll and scope
  // --------------------------------------------------------------------------

  const setScrollPosition = () => {
    listRef.value?.setScrollPosition(listScrollPosition.value)
  }

  const clearSearchAndScroll = () => {
    searchFieldRef.value?.setValue('')
    store.commit(`SET_${TYPE}_LIST_SCROLL_POSITION`, 0)
  }

  // The topbar sets the current episode before the page instance exists,
  // so its episode watcher cannot fire on a fresh mount: the scope of the
  // last load tells whether the cache of another episode is displayed.
  const isLoadedScopeStale = () => {
    const scope = isTVShow.value ? (currentEpisode.value?.id ?? '') : ''
    return (
      Boolean(currentProduction.value) &&
      loadingKey.value !== `${currentProduction.value.id}/${scope}`
    )
  }

  // Departments and display
  // --------------------------------------------------------------------------

  const selectableDepartments = forEntity => {
    if (!currentProduction.value) return []
    return [
      ...new Set(
        currentProduction.value.task_types
          .map(id => taskTypeMap.value.get(id))
          .filter(taskType => taskType?.for_entity === forEntity)
          .map(taskType => departmentMap.value.get(taskType.department_id))
          .filter(Boolean)
      )
    ]
  }

  const onSelectedDepartmentChanged = () => {
    const departmentId = selectedDepartment.value
    if (departmentId === 'ALL') {
      departmentFilter.value = []
    } else if (departmentId === 'MY_DEPARTMENTS') {
      departmentFilter.value = user.value.departments
    } else {
      departmentFilter.value = [departmentId]
    }
    store.dispatch('clearSelectedTasks')
    preferences.setPreference(`${pageName}:department`, departmentId)
  }

  const onKeepTaskPanelOpenChanged = keepOpen => {
    keepTaskPanelOpen.value = keepOpen
  }

  const onChangeSortClicked = sortInfo => {
    store.dispatch(`change${entityTypeName}Sort`, sortInfo)
  }

  const saveScrollPosition = scrollPosition => {
    store.commit(`SET_${TYPE}_LIST_SCROLL_POSITION`, scrollPosition)
  }

  const getPath = section => {
    const path = {
      name: section,
      params: { production_id: currentProduction.value.id }
    }
    if (isTVShow.value && currentEpisode.value) {
      path.name = `episode-${section}`
      path.params.episode_id = currentEpisode.value.id
    }
    return path
  }

  // Modals
  // --------------------------------------------------------------------------

  const showImportModal = () => {
    modals.isImportDisplayed = true
  }

  const hideImportModal = () => {
    modals.isImportDisplayed = false
  }

  const showImportRenderModal = () => {
    modals.isImportRenderDisplayed = true
  }

  const hideImportRenderModal = () => {
    modals.isImportRenderDisplayed = false
  }

  const showCreateTasksModal = () => {
    modals.isCreateTasksDisplayed = true
  }

  const hideCreateTasksModal = () => {
    modals.isCreateTasksDisplayed = false
  }

  const showAddThumbnailsModal = () => {
    errors.addThumbnails = false
    modals.isAddThumbnailsDisplayed = true
  }

  const hideAddThumbnailsModal = () => {
    modals.isAddThumbnailsDisplayed = false
  }

  const closeMetadataModal = () => {
    modals.isAddMetadataDisplayed = false
  }

  // Entity edition
  // --------------------------------------------------------------------------

  // Runs a store action behind the loading and error flags of its key.
  const runAction = async (key, action, onSuccess) => {
    loading[key] = true
    errors[key] = false
    try {
      await action()
      onSuccess()
    } catch (err) {
      console.error(err)
      errors[key] = true
    } finally {
      loading[key] = false
    }
  }

  // Close leaves the messages of the last save: opening drops them.
  const openEditModal = (entity = {}) => {
    errors.edit = false
    success.edit = false
    entityToEdit.value = entity
    modals.isNewDisplayed = true
  }

  const onDeleteClicked = entity => {
    entityToDelete.value = entity
    modals.isDeleteDisplayed = true
  }

  const confirmDelete = () =>
    runAction(
      'del',
      () => store.dispatch(`delete${entityTypeName}`, entityToDelete.value),
      () => {
        modals.isDeleteDisplayed = false
      }
    )

  const confirmRestore = () =>
    runAction(
      'restore',
      () => store.dispatch(`restore${entityTypeName}`, entityToRestore.value),
      () => {
        modals.isRestoreDisplayed = false
      }
    )

  const onMetadataChanged = async ({ entry, descriptor, value }) => {
    await store.dispatch(`edit${entityTypeName}`, {
      id: entry.id,
      data: { [descriptor.field_name]: value }
    })
    applySearchFromUrl(false)
  }

  // CSV export
  // --------------------------------------------------------------------------

  // `episodeName` goes in the file name when given.
  const exportCsv = async (headers, episodeName) => {
    const lines = await store.dispatch(`get${entityTypeName}sCsvLines`)
    const name = stringHelpers.slugify(
      [
        moment().format('YYYY-MM-DD'),
        'kitsu',
        currentProduction.value.name,
        ...(episodeName ? [episodeName] : []),
        t(`${type}s.title`)
      ].join('_')
    )
    csv.buildCsvFile(name, [headers, ...lines])
  }

  // Metadata descriptors
  // --------------------------------------------------------------------------

  // Close leaves the error of the last save: opening drops it.
  const onAddMetadataClicked = () => {
    errors.addMetadata = false
    descriptorToEdit.value = {}
    modals.isAddMetadataDisplayed = true
  }

  const onEditMetadataClicked = descriptorId => {
    errors.addMetadata = false
    descriptorToEdit.value = currentProduction.value.descriptors.find(
      descriptor => descriptor.id === descriptorId
    )
    modals.isAddMetadataDisplayed = true
  }

  const onDeleteMetadataClicked = descriptorId => {
    descriptorIdToDelete.value = descriptorId
    modals.isDeleteMetadataDisplayed = true
  }

  const confirmAddMetadata = async form => {
    loading.addMetadata = true
    errors.addMetadata = false
    try {
      await store.dispatch('addMetadataDescriptor', {
        ...form,
        entity_type: entityTypeName
      })
      modals.isAddMetadataDisplayed = false
    } catch (err) {
      console.error(err)
      errors.addMetadata = true
    } finally {
      loading.addMetadata = false
    }
  }

  const confirmDeleteMetadata = async () => {
    errors.deleteMetadata = false
    loading.deleteMetadata = true
    try {
      await store.dispatch(
        'deleteMetadataDescriptor',
        descriptorIdToDelete.value
      )
      modals.isDeleteMetadataDisplayed = false
    } catch (err) {
      console.error(err)
      errors.deleteMetadata = true
    } finally {
      loading.deleteMetadata = false
    }
  }

  // Tasks
  // --------------------------------------------------------------------------

  const onDeleteAllTasksClicked = taskTypeId => {
    const taskType = taskTypeMap.value.get(taskTypeId)
    taskTypeForTaskDeletion.value = taskType
    deleteAllTasksLockText.value = taskType.name
    modals.isDeleteAllTasksDisplayed = true
  }

  const confirmDeleteAllTasks = async selectionOnly => {
    errors.deleteAllTasks = false
    loading.deleteAllTasks = true
    try {
      await store.dispatch(`deleteAll${entityTypeName}Tasks`, {
        projectId: currentProduction.value.id,
        taskTypeId: taskTypeForTaskDeletion.value.id,
        selectionOnly
      })
      if (!selectionOnly) reset()
      modals.isDeleteAllTasksDisplayed = false
    } catch (err) {
      console.error(err)
      errors.deleteAllTasks = true
    } finally {
      loading.deleteAllTasks = false
    }
  }

  const createTasksForType = (taskTypeId, selectionOnly) =>
    store.dispatch('createTasks', {
      type: `${type}s`,
      task_type_id: taskTypeId,
      project_id: currentProduction.value.id,
      selectionOnly
    })

  const runTasksCreation = async (loadingKey, create, closeModal) => {
    errors.creatingTasks = false
    loading[loadingKey] = true
    try {
      await create()
      reset()
      if (closeModal) hideCreateTasksModal()
    } catch (err) {
      console.error(err)
      errors.creatingTasks = true
    } finally {
      loading[loadingKey] = false
    }
  }

  const confirmCreateTasks = ({ form, selectionOnly }) =>
    runTasksCreation(
      'creatingTasks',
      () => createTasksForType(form.task_type_id, selectionOnly),
      true
    )

  const confirmCreateTasksAndStay = ({ form, selectionOnly }) =>
    runTasksCreation(
      'creatingTasksStay',
      () => createTasksForType(form.task_type_id, selectionOnly),
      false
    )

  const confirmCreateAllMissingTasks = ({
    missingTaskTypeIds,
    selectionOnly
  }) =>
    runTasksCreation(
      'creatingAllTasks',
      () =>
        func.runPromiseMapAsSeries(missingTaskTypeIds, taskTypeId =>
          createTasksForType(taskTypeId, selectionOnly)
        ),
      true
    )

  // CSV import
  // --------------------------------------------------------------------------

  const renderImport = async (data, mode) => {
    loading.importing = true
    errors.importing = false
    parsedCSV.value = await csv.processCSV(
      mode === 'file' ? data.get('file') : data
    )
    hideImportModal()
    loading.importing = false
    showImportRenderModal()
  }

  const uploadImportFile = async (data, toUpdate) => {
    const formData = new FormData()
    const csvContent = csv.turnEntriesToCsvString(data)
    formData.append(
      'file',
      new File([csvContent], 'import.csv', { type: 'text/csv' })
    )
    loading.importing = true
    errors.importing = false
    errors.importingError = null
    store.commit(`${TYPE}_CSV_FILE_SELECTED`, formData)
    try {
      await store.dispatch(`upload${entityTypeName}File`, toUpdate)
      store.dispatch('loadEpisodes').catch(console.error)
      hideImportRenderModal()
      loadEntities()
    } catch (err) {
      console.error(err)
      errors.importingError = err
      errors.importing = true
    } finally {
      loading.importing = false
    }
  }

  const resetImport = () => {
    errors.importing = false
    hideImportRenderModal()
    store.commit(`${TYPE}_CSV_FILE_SELECTED`, null)
    importModalRef.value?.reset()
    showImportModal()
  }

  // Thumbnails
  // --------------------------------------------------------------------------

  const confirmAddThumbnails = forms => {
    const addPreview = async form => {
      addThumbnailsModalRef.value?.markLoading(form.task.entity_id)
      const { preview } = await store.dispatch('commentTaskWithPreview', {
        taskId: form.task.id,
        commentText: '',
        taskStatusId: form.task.task_status_id,
        form
      })
      await store.dispatch('setPreview', {
        taskId: form.task.id,
        entityId: form.task.entity_id,
        previewId: preview.id
      })
      addThumbnailsModalRef.value?.markUploaded(form.task.entity_id)
    }
    return runAction(
      'addThumbnails',
      () => func.runPromiseMapAsSeries(forms, addPreview),
      () => {
        modals.isAddThumbnailsDisplayed = false
      }
    )
  }

  const onRestoreClicked = entity => {
    entityToRestore.value = entity
    modals.isRestoreDisplayed = true
  }

  // Watchers
  // --------------------------------------------------------------------------

  watch(selectedDepartment, onSelectedDepartmentChanged)

  watch(currentProduction, (production, previous) => {
    if (!previous || !production || previous.id === production.id) return
    keepTaskPanelOpen.value = false
    clearSelection()
  })

  watch(
    displaySettings,
    settings => {
      preferences.setObjectPreference(`${type}s:display_settings`, settings)
    },
    { deep: true }
  )

  // The URL drives the selection and the search: a task id selects its
  // cell, a search different from the applied one is applied.
  watch(
    () => route.query,
    (query, previousQuery) => {
      if (query.episode_id !== previousQuery.episode_id) {
        clearSelection()
      } else if (query.task_id !== previousQuery.task_id) {
        if (query.task_id) {
          clearSelection()
          listRef.value?.selectTaskFromQuery()
        }
      } else if (query.search !== searchText.value) {
        applySearchFromUrl()
        clearSelection()
      }
    }
  )

  // Lifecycle
  // --------------------------------------------------------------------------

  onMounted(() => {
    const departmentId = preferences.getPreference(`${pageName}:department`)
    const departmentIds = selectableDepartments(entityTypeName).map(
      department => department.id
    )
    if (
      departmentId &&
      !isCurrentUserClient.value &&
      (!user.value.departments.length ||
        departmentIds.includes(departmentId) ||
        departmentId === 'ALL')
    ) {
      selectedDepartment.value = departmentId
    } else if (!isCurrentUserManager.value && user.value.departments.length) {
      selectedDepartment.value = 'MY_DEPARTMENTS'
    }
    onSelectedDepartmentChanged()

    displaySettings.value = {
      ...displaySettings.value,
      ...preferences.getObjectPreference(`${type}s:display_settings`)
    }
  })

  return {
    dataMatchers,
    deleteAllTasksLockText,
    departmentFilter,
    descriptorToEdit,
    displaySettings,
    entityToDelete,
    entityToEdit,
    entityToRestore,
    entityTypeName,
    errors,
    keepTaskPanelOpen,
    loading,
    modals,
    parsedCSV,
    selectedDepartment,
    success,
    taskTypeForTaskDeletion,

    deleteAllTasksText,
    deleteText,
    isTaskSidePanelOpen,
    nbSelectedEntities,
    renderColumns,
    restoreText,
    selectedEntities,

    applySearch,
    applySearchFromUrl,
    clearSearchAndScroll,
    clearSelection,
    closeMetadataModal,
    confirmAddMetadata,
    confirmAddThumbnails,
    confirmBuildFilter,
    confirmCreateAllMissingTasks,
    confirmCreateTasks,
    confirmCreateTasksAndStay,
    confirmDelete,
    confirmDeleteAllTasks,
    confirmDeleteMetadata,
    confirmRestore,
    exportCsv,
    focusSearchField,
    getPath,
    hideAddThumbnailsModal,
    hideCreateTasksModal,
    hideImportModal,
    hideImportRenderModal,
    isLoadedScopeStale,
    onAddMetadataClicked,
    onChangeSortClicked,
    onDeleteAllTasksClicked,
    onDeleteClicked,
    onDeleteMetadataClicked,
    onEditMetadataClicked,
    onKeepTaskPanelOpenChanged,
    onMetadataChanged,
    onRestoreClicked,
    openEditModal,
    onSearchChange,
    onSelectedDepartmentChanged,
    removeSearchQuery,
    renderImport,
    resetImport,
    saveScrollPosition,
    saveSearchQuery,
    selectableDepartments,
    setScrollPosition,
    setSearchFromUrl,
    setSearchInUrl,
    showAddThumbnailsModal,
    showCreateTasksModal,
    showImportModal,
    showImportRenderModal,
    uploadImportFile
  }
}
