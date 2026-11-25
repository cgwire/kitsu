<template>
  <panel-layout
    class="edit entity-page xyz-in"
    xyz="fade"
    :class="{ 'drawer-open': isDrawerOpen }"
    :side="hasSidePanel"
    v-if="currentProduction"
  >
    <template #filters>
      <div class="page-header flexrow">
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :title="$t('main.back')"
          :to="editsPath"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentEdit"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            v-if="currentEdit"
          />
        </span>
        <div class="entity-title flexrow-item">
          {{ title }}
        </div>
        <div class="filler"></div>
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :title="$t('main.previous_entity')"
          :to="previousEntityPath"
          v-if="previousEntityPath && entityList.length > 1"
        >
          <chevron-left-icon />
        </router-link>
        <router-link
          class="flexrow-item has-text-centered back-link"
          :title="$t('main.next_entity')"
          :to="nextEntityPath"
          v-if="nextEntityPath && entityList.length > 1"
        >
          <chevron-right-icon />
        </router-link>
      </div>
    </template>

    <template #list>
      <div class="entity-data" v-if="!loadError">
        <route-section-tabs
          class="section-tabs"
          :active-tab="currentSection"
          :route="$route"
          :tabs="editTabs"
        />

        <div class="flexrow mt1">
          <div class="filler"></div>
          <template v-if="currentSection === 'schedule'">
            <span class="flexrow-item mt05">
              {{ $t('schedule.zoom_level') }}:
            </span>
            <combobox-number
              class="zoom-level flexrow-item"
              is-simple
              :options="zoomOptions"
              v-model="zoomLevel"
            />
          </template>
        </div>

        <div class="flexcolumn infos" v-show="currentSection === 'infos'">
          <entity-task-list
            class="task-list"
            :entries="currentTasks"
            :is-loading="!currentEdit"
            :is-error="false"
            :selected-task-id="currentTask?.id"
            @task-selected="onTaskSelected"
          />
        </div>

        <div
          class="flexcolumn information"
          v-show="currentSection === 'information'"
        >
          <button-simple
            class="edit-button"
            icon="edit"
            :title="$t('edits.edit_title')"
            @click="showEditModal"
            v-if="isCurrentUserManager"
          />
          <div class="table-body metadata-infos">
            <table class="datatable no-header" v-if="currentEdit">
              <tbody class="datatable-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('edits.fields.description') }}
                  </td>
                  <description-cell :entry="currentEdit" :full="true" />
                </tr>
                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in editMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    <metadata-value
                      :descriptor="descriptor"
                      :entity="currentEdit"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <entity-chat
          :entity="currentEdit"
          :name="currentEdit?.name"
          v-if="currentSection === 'chat'"
        />

        <div
          class="schedule mt1"
          v-if="scheduleItems[0].children.length > 0"
          v-show="currentSection === 'schedule'"
        >
          <error-text
            class="has-text-centered"
            :text="scheduleSaveErrorText"
            v-if="scheduleSaveErrorText"
          />
          <div class="wrapper">
            <schedule
              ref="scheduleWidget"
              :start-date="tasksStartDate"
              :end-date="tasksEndDate"
              :hierarchy="scheduleItems"
              :zoom-level="zoomLevel"
              :is-loading="false"
              :is-estimation-linked="true"
              :hide-root="true"
              :with-milestones="false"
              @item-changed="saveTaskScheduleItem"
              @estimation-changed="event => saveTaskScheduleItem(event.item)"
            />
          </div>
        </div>
        <empty-section
          :icon="CalendarIcon"
          :text="$t('main.empty_schedule')"
          v-else-if="currentSection === 'schedule'"
        />

        <entity-preview-files
          :entity="currentEdit"
          v-if="currentSection === 'preview-files'"
        />

        <entity-time-logs
          :entity="currentEdit"
          v-if="currentSection === 'time-logs'"
        />

        <entity-working-files
          :entity="currentEdit"
          v-if="currentSection === 'working-files'"
        />

        <entity-output-files
          :entity="currentEdit"
          v-if="currentSection === 'output-files'"
        />
      </div>
      <entity-load-error
        class="entity-data"
        :error="loadError"
        @reload="init()"
        v-else
      />
    </template>

    <template #side>
      <task-info :task="currentTask" entity-type="Edit" with-actions>
        <entity-news class="news-column" :entity="currentEdit" />
      </task-info>
    </template>

    <div
      class="drawer-backdrop"
      :class="{ 'is-open': isDrawerOpen }"
      @click="closeTask"
      v-if="hasSidePanel"
    ></div>

    <edit-edit-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-deleted="errors.editDeleted"
      :edit-to-edit="currentEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditEdit"
    />
  </panel-layout>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerLeftUpIcon
} from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { isListOfPageLoaded, useEntity } from '@/composables/entity'
import { isNotFound } from '@/lib/errors'
import { getEntitiesPath } from '@/lib/path'
import editStore from '@/store/modules/edits'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import PanelLayout from '@/components/layouts/PanelLayout.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityLoadError from '@/components/pages/entities/EntityLoadError.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityOutputFiles from '@/components/pages/entities/EntityOutputFiles.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import EntityWorkingFiles from '@/components/pages/entities/EntityWorkingFiles.vue'
import Schedule from '@/components/schedule/Schedule.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import MetadataValue from '@/components/widgets/MetadataValue.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'

defineOptions({ name: 'edit' })

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const store = useStore()
const clientAccess = computed(() => store.getters.clientAccess)

// State
// --------------------------------------------------------------------------
const currentEdit = ref(null)
const scheduleWidget = ref(null)
const errors = reactive({ edit: false, editDeleted: false })
const loading = reactive({ edit: false })
const modals = reactive({ edit: false })

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const editMetadataDescriptors = computed(
  () => store.getters.editMetadataDescriptors
)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)

// The list of the page, once loaded: a load replaces the cached array out of
// sight of Vue, and its scope and loading flag have it read again.
const entityList = computed(() =>
  isListOfPageLoaded(store.getters, 'edit') ? editStore.cache.edits : []
)

const title = computed(() => {
  if (!currentEdit.value) return loadTitle.value
  const { episode_name, name } = currentEdit.value
  return episode_name ? `${episode_name} / ${name}` : name
})

const editsPath = computed(() =>
  getEntitiesPath(currentProduction.value.id, 'edits', currentEpisode.value?.id)
)

const editTabs = computed(() => [
  // the section of the tasks keeps its name: links and the default use it
  { label: t('main.tasks'), name: 'infos' },
  { label: t('main.label.metadata'), name: 'information' },
  { label: t('main.label.chat'), name: 'chat' },
  { label: t('main.label.schedule'), name: 'schedule' },
  { label: t('main.label.timelog'), name: 'time-logs' },
  { label: t('main.label.preview_files'), name: 'preview-files' },
  { label: t('main.label.working_files'), name: 'working-files' },
  { label: t('main.label.output_files'), name: 'output-files' }
])

// the task panel belongs to the section of the tasks
const hasSidePanel = computed(
  () =>
    clientAccess.value.isTaskPanelVisible && currentSection.value === 'infos'
)
const isDrawerOpen = computed(() => Boolean(currentTask.value))

// Functions
// --------------------------------------------------------------------------
// By id: the list of the page, that of the episode of the URL in a TV show,
// may not hold it, and needs that episode set.
const getCurrentEdit = async () => {
  const editId = route.params.edit_id
  if (!editId) return null
  let edit = editStore.cache.editMap.get(editId) || null
  if (!edit) {
    await store.dispatch('loadEdit', editId)
    edit = editStore.cache.editMap.get(editId) || null
  }
  return edit
}

const scrollScheduleToStart = () => {
  scheduleWidget.value?.scrollToDate(scheduleItems.value[0].startDate)
}

// Close leaves the error of the last save: opening drops it.
const showEditModal = () => {
  errors.edit = false
  modals.edit = true
}

const confirmEditEdit = async form => {
  const data = { ...form, id: currentEdit.value.id }
  loading.edit = true
  errors.edit = false
  try {
    await store.dispatch('editEdit', data)
    // The store writes the changes into its cached edit out of sight of Vue: a
    // copy shows them, unless the page moved on to another edit. Not after a
    // refusal: the modal, open on the error, would reset what was typed.
    const edit = editStore.cache.editMap.get(data.id)
    if (edit && currentEdit.value?.id === data.id) {
      currentEdit.value = { ...edit }
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
    errors.editDeleted = isNotFound(err)
  }
  loading.edit = false
}

const closeTask = () => {
  if (currentTask.value) onTaskSelected(currentTask.value)
}

const {
  init,
  loadError,
  loadTitle,
  currentSection,
  currentTask,
  zoomLevel,
  zoomOptions,
  scheduleItems,
  previousEntityPath,
  nextEntityPath,
  currentTasks,
  tasksStartDate,
  tasksEndDate,
  onTaskSelected,
  saveTaskScheduleItem,
  scheduleSaveErrorText
} = useEntity({
  type: 'edit',
  currentEntity: currentEdit,
  entityList,
  readEntity: getCurrentEdit,
  scheduleWidget,
  onEntityRead: (edit, isListRead) => {
    if (!isListRead) setTimeout(scrollScheduleToStart, 100)
  },
  loadList: () => store.dispatch('loadEdits')
})

// Watchers
// --------------------------------------------------------------------------
watch(currentSection, () => {
  if (currentSection.value === 'schedule' && scheduleItems.value.length > 0) {
    scrollScheduleToStart()
  }
})

watch(zoomLevel, scrollScheduleToStart)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  store.dispatch('clearSelectedTasks')
  init()
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${title.value} - Kitsu`) })
</script>

<style lang="scss" scoped>
@use '@/styles/entity-page.scss' as entity;

@include entity.page;
</style>
