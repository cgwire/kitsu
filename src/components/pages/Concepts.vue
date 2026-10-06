<template>
  <div class="fixed-page columns">
    <div class="column main-column">
      <div class="concepts page" @dragover="onFileDragover">
        <div class="page-header">
          <div class="filters" :class="{ folded: !showExtraFilters }">
            <combobox-status
              :label="$t('main.status')"
              :task-status-list="taskStatusList"
              v-model="filters.taskStatusId"
            />
            <span class="field">
              <label class="label">
                {{ $t('concepts.fields.publisher') }}
              </label>
              <people-field
                small
                :people="publishers"
                v-model="filters.publisher"
              />
            </span>
            <combobox
              class="extra-filter"
              :label="$t('concepts.fields.asset_type')"
              :options="assetTypeOptions"
              v-model="filters.assetTypeId"
            />
            <span class="field extra-filter">
              <label class="label">
                {{ $t('concepts.fields.asset') }}
              </label>
              <multiselect
                class="asset-filter"
                label="name"
                track-by="id"
                :allow-empty="false"
                :model-value="selectedAssetOption"
                :options="assetOptions"
                :show-labels="false"
                @update:model-value="filters.assetId = $event.id"
              >
                <template #noResult></template>
              </multiselect>
            </span>
            <combobox
              class="extra-filter"
              :label="$t('main.sorted_by')"
              locale-key-prefix="concepts.fields."
              :options="sortByOptions"
              v-model="filters.sortBy"
            />
            <button-simple
              class="filters-toggle"
              icon="funnel"
              :active="showExtraFilters"
              :title="$t('main.more_filters')"
              @click="showExtraFilters = !showExtraFilters"
            />
          </div>
        </div>
        <table-info
          :is-loading="loading.loadingConcepts"
          :is-error="errors.loadingConcepts"
          v-if="loading.loadingConcepts || errors.loadingConcepts"
        />
        <div class="concept-panel" v-else>
          <div
            class="drop-mask"
            @drop="onFileDrop"
            @dragover="onFileDragover"
            @dragleave="onFileDragLeave"
            v-if="isDraggingFile"
          >
            {{ $t('concepts.drop_new_concepts') }}
          </div>
          <div class="folder-bar">
            <nav class="folder-path">
              <router-link
                :class="{ 'drop-target': dropTargetId === ROOT }"
                :to="{ query: {} }"
                @dragover="onFolderDragOver(null, $event)"
                @dragleave="onFolderDragLeave"
                @drop="onFolderDrop(null, $event)"
              >
                {{ $t('concepts.title') }}
              </router-link>
              <span>/</span>
              <span class="current-folder" v-if="currentFolder">
                {{ currentFolder.name }}
              </span>
            </nav>
            <span class="filler"></span>
            <button-simple
              class="new-folder"
              icon="plus"
              :text="$t('concepts.folders.new')"
              @click="openFolderModal(null)"
              v-if="isFolderManager && !currentFolder"
            />
            <template v-if="isFolderManager && currentFolder">
              <button-simple
                class="rename-folder"
                icon="edit"
                :title="$t('concepts.folders.rename')"
                @click="openFolderModal(currentFolder)"
              />
              <button-simple
                class="delete-folder"
                icon="trash"
                :title="$t('concepts.folders.delete')"
                @click="openDeleteFolderModal"
              />
            </template>
            <button-simple
              class="add-concepts"
              icon="image"
              :text="$t('concepts.add_new_concept')"
              @click="openAddConceptModal"
            />
          </div>
          <div
            class="concept-list pb1"
            v-if="filteredConcepts.length || shownFolders.length"
          >
            <ul class="folders" v-if="shownFolders.length">
              <li
                :key="folder.id"
                @dragover="onFolderDragOver(folder.id, $event)"
                @dragleave="onFolderDragLeave"
                @drop="onFolderDrop(folder.id, $event)"
                v-for="folder in shownFolders"
              >
                <router-link :to="{ query: { folder: folder.id } }">
                  <concept-folder-tile
                    :count="nbConceptsByFolder.get(folder.id) ?? 0"
                    :highlighted="dropTargetId === folder.id"
                    :name="folder.name"
                  />
                </router-link>
              </li>
            </ul>
            <ul class="items" v-if="filteredConcepts.length">
              <li
                class="item"
                :draggable="isFolderManager"
                :key="concept.id"
                @dragstart="onConceptDragStart(concept, $event)"
                @dragend="onConceptDragEnd"
                v-for="concept in filteredConcepts"
              >
                <concept-card
                  :concept="concept"
                  :selected="isSelected(concept)"
                  @click="
                    onSelectConcept(concept, $event.ctrlKey || $event.metaKey)
                  "
                />
              </li>
            </ul>
          </div>
          <div
            class="empty-concepts"
            role="button"
            tabindex="0"
            @click="openAddConceptModal"
            @keydown.enter.prevent="openAddConceptModal"
            v-else
          >
            <image-icon :size="48" />
            <strong>
              {{
                currentFolder
                  ? $t('concepts.folders.empty')
                  : $t('concepts.empty')
              }}
            </strong>
            <span>{{ $t('concepts.drop_new_concepts') }}</span>
          </div>
        </div>
      </div>
    </div>

    <add-preview-modal
      ref="add-preview-modal"
      :active="modals.addConcept"
      :extensions="imgExtensions"
      is-concept
      :is-error="errors.addingConcept"
      :is-loading="loading.addingConcept"
      message=""
      @cancel="closeAddConceptModal"
      @confirm="confirmAddConceptModal"
    />

    <edit-concept-folder-modal
      :active="modals.editFolder"
      :folder-to-edit="folderToEdit"
      :is-error="errors.editingFolder"
      :is-loading="loading.editingFolder"
      @cancel="modals.editFolder = false"
      @confirm="confirmFolderModal"
    />

    <delete-modal
      :active="modals.deleteFolder"
      :error-text="$t('concepts.folders.delete_error')"
      :is-error="errors.deletingFolder"
      :is-loading="loading.deletingFolder"
      :text="deleteFolderText"
      @cancel="modals.deleteFolder = false"
      @confirm="confirmDeleteFolder"
    />

    <div
      class="drawer-backdrop"
      :class="{ 'is-open': isDrawerOpen }"
      @click="clearSelection"
    ></div>
    <div class="column side-column" :class="{ 'is-open': isDrawerOpen }">
      <task-info entity-type="Concept" :task="currentTask" with-actions>
        <template #selection>
          <ul class="selected-concepts">
            <li :key="concept.id" v-for="concept in selectedConcepts.values()">
              <concept-card
                compact
                :concept="concept"
                @click="onSelectConcept(concept, true)"
              />
            </li>
          </ul>
        </template>
      </task-info>
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import { ImageIcon } from 'lucide-vue-next'
import { firstBy } from 'thenby'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import Multiselect from 'vue-multiselect'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { pauseEvent } from '@/composables/dom'
import files from '@/lib/files'
import { sortAssets, sortByName, sortPeople } from '@/lib/sorting'
import assetsStore from '@/store/modules/assets'

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditConceptFolderModal from '@/components/modals/EditConceptFolderModal.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import ConceptFolderTile from '@/components/widgets/ConceptFolderTile.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const addPreviewModalRef = useTemplateRef('add-preview-modal')

// The concepts of a card drag, read on the folder the drag ends on: the
// drag data is not readable before the drop.
const draggedConceptIds = ref([])
const showExtraFilters = ref(false)
const dropTargetId = ref(null)
const folderToEdit = ref(null)
const isDraggingFile = ref(false)

const errors = reactive({
  addingConcept: false,
  deletingFolder: false,
  editingFolder: false,
  loadingConcepts: false
})
const filters = reactive({
  assetId: '',
  assetTypeId: '',
  publisher: null,
  sortBy: 'created_at',
  taskStatusId: null
})
const loading = reactive({
  addingConcept: false,
  deletingFolder: false,
  editingFolder: false,
  loadingConcepts: false
})
const modals = reactive({
  addConcept: false,
  deleteFolder: false,
  editFolder: false
})

const NO_LINK = 'none'
const ROOT = 'root'
const imgExtensions = files.IMG_EXTENSIONS_STRING
const sortByOptions = ['created_at', 'updated_at', 'last_comment_date'].map(
  name => ({ label: name, value: name })
)

// Computed
// --------------------------------------------------------------------------
const conceptFolders = computed(() => store.getters.conceptFolders)
const concepts = computed(() => store.getters.concepts)
const currentProduction = computed(() => store.getters.currentProduction)
const personMap = computed(() => store.getters.personMap)
const selectedConcepts = computed(() => store.getters.selectedConcepts)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

// The assets at least one concept is linked to. The asset cache is not
// reactive: it is read here, behind the concepts loaded after the assets.
const linkedAssets = computed(() =>
  sortAssets(
    [...new Set(concepts.value.flatMap(getLinks))]
      .map(assetId => assetsStore.cache.assetMap.get(assetId))
      .filter(Boolean)
  )
)

const assetTypeOptions = computed(() => [
  { label: t('main.all'), value: '' },
  ...sortByName(
    [...new Set(linkedAssets.value.map(asset => asset.asset_type_id))].map(
      id => ({
        id,
        name: linkedAssets.value.find(asset => asset.asset_type_id === id)
          .asset_type_name
      })
    )
  ).map(type => ({ label: type.name, value: type.id }))
])

// Without a type, the full name tells two assets of the same name apart.
const assetOptions = computed(() => [
  { id: '', name: t('main.all') },
  ...(filters.assetTypeId || concepts.value.every(hasLinks)
    ? []
    : [{ id: NO_LINK, name: t('concepts.actions.empty') }]),
  ...linkedAssets.value
    .filter(
      asset =>
        !filters.assetTypeId || asset.asset_type_id === filters.assetTypeId
    )
    .map(asset => ({
      id: asset.id,
      name: filters.assetTypeId ? asset.name : asset.full_name
    }))
])

const selectedAssetOption = computed(() =>
  assetOptions.value.find(option => option.id === filters.assetId)
)

const isFolderManager = computed(
  () =>
    store.getters.isCurrentUserManager || store.getters.isCurrentUserSupervisor
)

// A folder id the production does not carry (deleted folder, old link)
// shows the root.
const currentFolder = computed(
  () =>
    conceptFolders.value.find(folder => folder.id === route.query.folder) ??
    null
)

const shownFolders = computed(() =>
  currentFolder.value ? [] : conceptFolders.value
)

const deleteFolderText = computed(() =>
  t('concepts.folders.delete_text', { name: currentFolder.value?.name })
)

// The concepts the filters keep, whatever their folder.
const matchingConcepts = computed(() =>
  concepts.value
    .filter(isLinkedToFilteredType)
    .filter(isLinkedToFilteredAsset)
    .filter(
      concept =>
        !filters.taskStatusId ||
        concept.tasks[0].task_status_id === filters.taskStatusId
    )
    .filter(
      concept =>
        !filters.publisher || concept.created_by === filters.publisher.id
    )
)

const filteredConcepts = computed(() =>
  matchingConcepts.value
    .filter(
      concept => getFolderId(concept) === (currentFolder.value?.id ?? null)
    )
    .sort(firstBy(filters.sortBy, -1).thenBy('created_at', -1))
)

const nbConceptsByFolder = computed(() =>
  matchingConcepts.value.reduce(
    (counts, concept) =>
      counts.set(concept.parent_id, (counts.get(concept.parent_id) ?? 0) + 1),
    new Map()
  )
)

const publishers = computed(() => {
  const personIds = new Set(concepts.value.map(concept => concept.created_by))
  return sortPeople(
    [...personIds]
      .map(personId => personMap.value.get(personId))
      .filter(Boolean)
  )
})

const isDrawerOpen = computed(() => selectedConcepts.value.size > 0)

const currentConcept = computed(() =>
  selectedConcepts.value.size === 1
    ? selectedConcepts.value.values().next().value
    : null
)

const currentTask = computed(() => currentConcept.value?.tasks?.[0])

const taskStatusList = computed(() => [
  {
    id: null,
    color: '#999',
    name: t('main.all'),
    short_name: t('main.all')
  },
  ...sortByName(
    [...taskStatusMap.value.values()].filter(status => status.for_concept)
  )
])

// Functions
// --------------------------------------------------------------------------
const getLinks = concept => concept.entity_concept_links ?? []

const hasLinks = concept => getLinks(concept).length > 0

const isLinkedToFilteredType = concept =>
  !filters.assetTypeId ||
  getLinks(concept).some(
    assetId =>
      assetsStore.cache.assetMap.get(assetId)?.asset_type_id ===
      filters.assetTypeId
  )

const isLinkedToFilteredAsset = concept => {
  if (!filters.assetId) return true
  if (filters.assetId === NO_LINK) return !hasLinks(concept)
  return getLinks(concept).includes(filters.assetId)
}

// A concept whose folder is gone stays reachable from the root.
const getFolderId = concept =>
  conceptFolders.value.some(folder => folder.id === concept.parent_id)
    ? concept.parent_id
    : null

const refreshConcepts = async () => {
  loading.loadingConcepts = true
  errors.loadingConcepts = false
  try {
    await store.dispatch('loadAssets', { all: true })
    await store.dispatch('loadConcepts')
    await store.dispatch('loadConceptFolders')
  } catch (err) {
    console.error(err)
    errors.loadingConcepts = true
  }
  loading.loadingConcepts = false
}

const isSelected = concept => selectedConcepts.value.has(concept.id)

const onSelectConcept = (concept, isMultipleSelection = false) => {
  const selection = isMultipleSelection
    ? new Map(selectedConcepts.value)
    : new Map()
  if (
    (isMultipleSelection && isSelected(concept)) ||
    (!isMultipleSelection && concept === currentConcept.value)
  ) {
    selection.delete(concept.id)
  } else {
    selection.set(concept.id, concept)
  }
  store.dispatch('clearSelectedConcepts')
  store.dispatch('addSelectedConcepts', selection)

  store.dispatch('clearSelectedTasks')
  if (currentTask.value) {
    store.dispatch('addSelectedTask', currentTask.value)
  }
}

const openAddConceptModal = () => {
  errors.addingConcept = false
  modals.addConcept = true
}

const closeAddConceptModal = () => {
  modals.addConcept = false
}

const confirmAddConceptModal = async forms => {
  loading.addingConcept = true
  errors.addingConcept = false
  try {
    await store.dispatch('newConcepts', {
      forms,
      parentId: currentFolder.value?.id ?? null
    })
    closeAddConceptModal()
  } catch (err) {
    console.error(err)
    errors.addingConcept = true
  }
  loading.addingConcept = false
}

const openFolderModal = folder => {
  folderToEdit.value = folder
  errors.editingFolder = false
  modals.editFolder = true
}

const confirmFolderModal = async name => {
  loading.editingFolder = true
  errors.editingFolder = false
  try {
    await (folderToEdit.value
      ? store.dispatch('editConceptFolder', { id: folderToEdit.value.id, name })
      : store.dispatch('newConceptFolder', name))
    modals.editFolder = false
  } catch (err) {
    console.error(err)
    errors.editingFolder = true
  }
  loading.editingFolder = false
}

const openDeleteFolderModal = () => {
  errors.deletingFolder = false
  modals.deleteFolder = true
}

const confirmDeleteFolder = async () => {
  loading.deletingFolder = true
  errors.deletingFolder = false
  try {
    await store.dispatch('deleteConceptFolder', currentFolder.value)
    modals.deleteFolder = false
    router.push({ query: {} })
  } catch (err) {
    console.error(err)
    errors.deletingFolder = true
  }
  loading.deletingFolder = false
}

const clearSelection = () => {
  store.dispatch('clearSelectedConcepts')
  store.dispatch('clearSelectedTasks')
}

const reset = () => {
  clearSelection()
  refreshConcepts()
}

const onFileDrop = async event => {
  pauseEvent(event)
  const droppedFiles = event.dataTransfer.files
  openAddConceptModal()
  isDraggingFile.value = false
  await nextTick()
  addPreviewModalRef.value.setFiles(droppedFiles)
}

const onFileDragover = event => {
  if (draggedConceptIds.value.length) return
  pauseEvent(event)
  isDraggingFile.value = true
}

// A card outside the selection goes alone, and becomes the selection.
const onConceptDragStart = (concept, event) => {
  draggedConceptIds.value = isSelected(concept)
    ? [...selectedConcepts.value.keys()]
    : [concept.id]
  if (!isSelected(concept)) onSelectConcept(concept)
  event.dataTransfer.effectAllowed = 'move'
  // Firefox starts no drag without data.
  event.dataTransfer.setData('text/plain', draggedConceptIds.value.join(','))
}

const onConceptDragEnd = () => {
  draggedConceptIds.value = []
  dropTargetId.value = null
}

const onFolderDragOver = (folderId, event) => {
  if (!draggedConceptIds.value.length) return
  pauseEvent(event)
  event.dataTransfer.dropEffect = 'move'
  dropTargetId.value = folderId ?? ROOT
}

const onFolderDragLeave = event => {
  // Entering a child of the target fires a leave on the target itself.
  if (!event.currentTarget.contains(event.relatedTarget)) {
    dropTargetId.value = null
  }
}

const onFolderDrop = async (folderId, event) => {
  const conceptIds = draggedConceptIds.value
  if (!conceptIds.length) return
  pauseEvent(event)
  onConceptDragEnd()
  if (folderId === (currentFolder.value?.id ?? null)) return
  try {
    await store.dispatch('moveConcepts', { conceptIds, folderId })
    clearSelection()
  } catch (err) {
    console.error(err)
  }
}

const onFileDragLeave = () => {
  isDraggingFile.value = false
}

const onTaskStatusChanged = eventData => {
  const concept = concepts.value.find(
    concept => concept.tasks[0].id === eventData.task_id
  )
  if (concept) {
    store.commit('UPDATE_TASK', {
      task: concept.tasks[0],
      taskStatusId: eventData.new_task_status_id
    })
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(
  currentProduction,
  () => {
    // HACK: the store init a wrong current production by default
    if (currentProduction.value?.id === route.params.production_id) reset()
  },
  { immediate: true }
)

// The selection of a folder is out of sight in another one.
watch(() => currentFolder.value?.id, clearSelection)

// A filter whose value is no longer offered would hide every concept.
watch(assetTypeOptions, options => {
  if (!options.some(option => option.value === filters.assetTypeId)) {
    filters.assetTypeId = ''
  }
})

watch(assetOptions, options => {
  if (!options.some(option => option.id === filters.assetId)) {
    filters.assetId = ''
  }
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  socket.on('task:status-changed', onTaskStatusChanged)
})

onBeforeUnmount(() => {
  socket.off('task:status-changed', onTaskStatusChanged)
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(
    () => `${currentProduction.value?.name} | ${t('concepts.title')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
.concepts {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  // the global .page gutter (2em) is wide for a panel layout
  padding-left: 16px;
  padding-right: 16px;
}

.filters {
  display: flex;
  align-items: flex-end;
  background: var(--background-panel);
  border-radius: 12px;
  gap: 0 20px;
  padding: 6px 14px 0;

  .field {
    margin-bottom: 1em;

    .label {
      padding-top: 5px;
    }
  }

  // every filter fits on one row on desktop: the toggle only serves the
  // wrapping layouts below
  .filters-toggle {
    display: none;
  }

  // inline-block leaves a 1px line gap under the status box, which lifts
  // its label above the other labels of the row (measured 2026-10-06)
  :deep(.status-combo) {
    display: block;
  }
}

.asset-filter {
  width: 200px;
}

.add-concepts {
  // the --purple token is a pale lavender in light theme, which reads
  // badly under dark text: the button keeps a saturated purple with white
  // text in both themes
  background: $dark-purple;
  border: 0;
  border-radius: 10px;
  color: $white;
  transition: background 150ms ease-out;

  &:hover {
    background: $purple-strong;
    color: $white;
  }
}

.concept-panel {
  background: var(--background-panel);
  border-radius: 12px;
  display: flex;
  flex: 1;
  flex-direction: column;
  // closes the page with the same gap as the top
  margin: 10px 0 10px;
  min-height: 0;
  position: relative;
}

.concept-list {
  flex: 1;
  overflow-y: auto;
  // 10px here plus the 4px ring room of the lists below: the cards and the
  // folders line up on the 14px gutter of the path above
  padding: 0 10px;
}

.items {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  list-style: none;
  margin: 0;
  // room for the selection ring and the hover lift of the cards
  padding: 4px;
}

.folder-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
}

.folder-path {
  align-items: baseline;
  color: var(--text-alt);
  display: flex;
  font-size: 1.1em;
  gap: 0.5em;

  a {
    color: var(--text-alt);

    &:hover {
      color: var(--text);
      text-decoration: underline;
    }
  }

  .current-folder {
    color: var(--text-strong);
    font-size: 1.25em;
    font-weight: 600;
  }

  .drop-target {
    color: var(--text-selected);
    text-decoration: underline;
  }
}

.folders {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
  margin: 0 0 20px;
  padding: 0 4px;
}

.selected-concepts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  list-style: none;
  margin: 1em 0 0;
  padding: 4px;
}

.page-header {
  margin-top: 0;
  padding: 10px 0 0;
}

.drop-mask {
  // the mask paints over the panels, so a plain page color + opacity
  // keeps the layout readable underneath
  background: rgba(var(--background-selectable-rgb), 0.6);
  border: 3px dashed var(--background-selected);
  border-radius: 12px;
  color: var(--text-strong);
  font-size: 1.5em;
  font-weight: 600;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.empty-concepts {
  align-items: center;
  border: 2px dashed var(--border-alt);
  border-radius: 12px;
  color: var(--text-alt);
  cursor: pointer;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5em;
  justify-content: center;
  margin: 0 14px 14px;
  outline: none;
  padding: 2em;
  text-align: center;
  transition:
    background 150ms ease-out,
    border-color 150ms ease-out;

  strong {
    color: var(--text);
  }

  // background-hover jumps too far from the panel in dark mode: a faint
  // border wash and the stronger dashes are enough
  &:hover,
  &:focus-visible {
    background: rgba(var(--border-rgb), 0.15);
    border-color: var(--text-alt);
  }
}

.drawer-backdrop {
  display: none;
}

@media (max-width: 1000px) {
  .filters {
    flex-wrap: wrap;
    gap: 0 12px;

    .filters-toggle {
      display: inline-flex;
      margin-bottom: 1em;
      margin-left: auto;
    }

    &.folded .extra-filter {
      display: none;
    }
  }

  // Under 1000px the side panel slides in from the right over the page,
  // like the Asset page drawers. The backdrop catches outside taps.
  .side-column {
    background: var(--background);
    bottom: 0;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    margin-top: 0 !important;
    max-width: min(100vw, 420px) !important;
    // TaskInfo writes its resizable panel width inline on the side column.
    min-width: 0 !important;
    overflow-y: auto;
    position: fixed;
    right: 0;
    top: 60px;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    width: min(100vw, 420px) !important;
    z-index: 250;

    &.is-open {
      transform: translateX(0);
    }
  }

  .drawer-backdrop {
    background: rgba(0, 0, 0, 0.4);
    bottom: 0;
    display: block;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 0;
    transition: opacity 0.25s ease;
    z-index: 249;

    &.is-open {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

// Mobile is read-only: no upload, no folder management, no drag.
@media (max-width: 768px) {
  .concepts {
    padding-left: 8px;
    padding-right: 8px;
  }

  .filters {
    padding: 6px 10px 0;
  }

  .folder-bar {
    padding: 10px;
  }

  .add-concepts,
  .new-folder,
  .rename-folder,
  .delete-folder {
    display: none;
  }

  .items {
    gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .empty-concepts {
    cursor: default;
    margin: 0 10px 10px;
    pointer-events: none;

    span {
      display: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .side-column,
  .drawer-backdrop {
    transition: none;
  }
}
</style>
