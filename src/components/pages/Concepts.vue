<template>
  <div class="fixed-page columns">
    <div class="column main-column">
      <div class="concepts page" @dragover="onFileDragover">
        <div
          class="drop-mask"
          @drop="onFileDrop"
          @dragover="onFileDragover"
          @dragleave="onFileDragLeave"
          v-if="isDraggingFile"
        >
          {{ $t('concepts.drop_new_concepts') }}
        </div>
        <div class="page-header">
          <div class="filters">
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
              :label="$t('concepts.fields.asset_type')"
              :options="assetTypeOptions"
              v-model="filters.assetTypeId"
            />
            <span class="field">
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
              class="right"
              :label="$t('main.sorted_by')"
              locale-key-prefix="concepts.fields."
              :options="sortByOptions"
              v-model="filters.sortBy"
            />
          </div>
        </div>
        <table-info
          :is-loading="loading.loadingConcepts"
          :is-error="errors.loadingConcepts"
          v-if="loading.loadingConcepts || errors.loadingConcepts"
        />
        <div class="concept-list pb1" v-else-if="filteredConcepts.length">
          <ul class="items">
            <li
              class="item"
              :class="{
                'selected-item': isSelected(concept)
              }"
              :key="concept.id"
              v-for="concept in filteredConcepts"
            >
              <concept-card
                :concept="concept"
                @click="
                  onSelectConcept(concept, $event.ctrlKey || $event.metaKey)
                "
              />
            </li>
          </ul>
        </div>
        <div class="has-text-centered mb1 mt1 empty-concepts" v-else>
          <strong>
            {{ $t('concepts.empty') }}
          </strong>
        </div>
        <div class="footer mb2">
          <button-simple
            :disabled="loading.loadingConcepts"
            :text="$t('concepts.add_new_concept')"
            @click="openAddConceptModal"
          />
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

    <div class="column side-column">
      <task-info entity-type="Concept" :task="currentTask" with-actions>
        <template #selection>
          <ul class="selected-concepts">
            <li
              class="selected-concept"
              :key="concept.id"
              v-for="concept in selectedConcepts.values()"
            >
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
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { pauseEvent } from '@/composables/dom'
import files from '@/lib/files'
import { sortAssets, sortByName, sortPeople } from '@/lib/sorting'
import assetsStore from '@/store/modules/assets'

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const addPreviewModalRef = useTemplateRef('add-preview-modal')

const isDraggingFile = ref(false)

const errors = reactive({
  addingConcept: false,
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
  loadingConcepts: false
})
const modals = reactive({
  addConcept: false
})

const NO_LINK = 'none'
const imgExtensions = files.IMG_EXTENSIONS_STRING
const sortByOptions = ['created_at', 'updated_at', 'last_comment_date'].map(
  name => ({ label: name, value: name })
)

// Computed
// --------------------------------------------------------------------------
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

const filteredConcepts = computed(() =>
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
    .sort(firstBy(filters.sortBy, -1).thenBy('created_at', -1))
)

const publishers = computed(() => {
  const personIds = new Set(concepts.value.map(concept => concept.created_by))
  return sortPeople(
    [...personIds]
      .map(personId => personMap.value.get(personId))
      .filter(Boolean)
  )
})

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

const refreshConcepts = async () => {
  loading.loadingConcepts = true
  errors.loadingConcepts = false
  try {
    await store.dispatch('loadAssets', { all: true })
    await store.dispatch('loadConcepts')
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
    await store.dispatch('newConcepts', forms)
    closeAddConceptModal()
  } catch (err) {
    console.error(err)
    errors.addingConcept = true
  }
  loading.addingConcept = false
}

const reset = () => {
  store.dispatch('clearSelectedConcepts')
  store.dispatch('clearSelectedTasks')
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
  pauseEvent(event)
  isDraggingFile.value = true
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
  position: relative;
}

.filters {
  display: flex;
  align-items: flex-end;
  gap: 0 20px;
  padding: 10px;

  .field {
    margin-bottom: 1em;

    .label {
      padding-top: 5px;
    }
  }

  .right {
    margin-left: auto;
  }
}

.asset-filter {
  width: 200px;
}

.concept-list {
  flex: 1;
  margin: 0 auto;
  overflow-y: auto;
}

.items {
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  list-style: none;
  margin: 0;

  .item {
    display: flex;
    flex-direction: column;
    background-color: var(--background);
    border-radius: 1em;

    border: 5px solid transparent;
    transition: border-color 0.2s ease-in-out;

    &:hover {
      border-color: var(--background-selectable);
    }

    &.selected-item {
      border-color: var(--background-selected);
    }
  }
}

.selected-concepts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
  margin: 1em 0 0;
}

.selected-concept {
  background-color: var(--background);
  border-radius: 1em;
  cursor: pointer;
}

.page-header {
  margin-top: 0;
  padding: 0;
}

.footer {
  background: transparent;
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 5px;

  .button {
    border-radius: 10px;
    font-size: 1.2em;
    height: 50px;
    transition: background-color 0.1s ease-in-out;
    width: 100%;

    &:hover {
      background-color: var(--background-hover);
    }
  }
}

.drop-mask {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.5em;
  color: white;
  font-size: 2em;
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
  flex: 1;
}
</style>
