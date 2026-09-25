<template>
  <div
    class="columns fixed-page edit xyz-in"
    xyz="fade"
    v-if="currentProduction"
  >
    <div class="page column main-column">
      <div class="page-header flexrow">
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
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
          :to="previousEntityPath"
          v-if="previousEntityPath && entityList.length > 1"
        >
          <chevron-left-icon />
        </router-link>
        <router-link
          class="flexrow-item has-text-centered back-link"
          :to="nextEntityPath"
          v-if="nextEntityPath && entityList.length > 1"
        >
          <chevron-right-icon />
        </router-link>
      </div>

      <div class="edit-data block">
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
          <page-subtitle :text="$t('edits.tasks')" />
          <entity-task-list
            class="task-list"
            :entries="currentTasks"
            :is-loading="!currentEdit"
            :is-error="false"
            :selected-task-id="currentTask?.id"
            @task-selected="onTaskSelected"
          />
          <div class="flexrow">
            <page-subtitle :text="$t('main.info')" />
            <div class="filler"></div>
            <div class="flexrow-item has-text-right">
              <button-simple
                icon="edit"
                :title="$t('edits.edit_title')"
                @click="modals.edit = true"
                v-if="isCurrentUserManager"
              />
            </div>
          </div>

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

        <entity-news
          :entity="currentEdit"
          v-if="currentSection === 'activity'"
        />

        <entity-time-logs
          :entity="currentEdit"
          v-if="currentSection === 'time-logs'"
        />

        <entity-output-files
          :entity="currentEdit"
          v-if="currentSection === 'output-files'"
        />
      </div>
    </div>

    <div
      class="drawer-backdrop"
      :class="{ 'is-open': isTaskDrawerOpen }"
      @click="closeTask"
      v-show="currentSection === 'infos'"
    ></div>
    <div
      class="column side-column"
      :class="{ 'is-open': isTaskDrawerOpen }"
      v-show="currentSection === 'infos'"
    >
      <task-info :task="currentTask" entity-type="Edit" with-actions>
        <entity-news class="news-column" :entity="currentEdit" />
      </task-info>
    </div>

    <edit-edit-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :edit-to-edit="currentEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditEdit"
    />
  </div>
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

import { useEntity } from '@/composables/entity'
import { getEntitiesPath } from '@/lib/path'
import editStore from '@/store/modules/edits'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityOutputFiles from '@/components/pages/entities/EntityOutputFiles.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import MetadataValue from '@/components/widgets/MetadataValue.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import Schedule from '@/components/widgets/Schedule.vue'

defineOptions({ name: 'edit' })

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State
// --------------------------------------------------------------------------
const currentEdit = ref(null)
const scheduleWidget = ref(null)
const errors = reactive({ edit: false })
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
const isTVShow = computed(() => store.getters.isTVShow)

const entityList = computed(() => editStore.cache.edits)

const title = computed(() => {
  if (!currentEdit.value) return t('main.loading')
  const { episode_name, name } = currentEdit.value
  return episode_name ? `${episode_name} / ${name}` : name
})

const editsPath = computed(() =>
  getEntitiesPath(currentProduction.value.id, 'edits', currentEpisode.value?.id)
)

const editTabs = computed(() => [
  { label: t('main.label.info'), name: 'infos' },
  { label: t('main.label.chat'), name: 'chat' },
  { label: t('main.label.schedule'), name: 'schedule' },
  { label: t('main.label.preview_files'), name: 'preview-files' },
  { label: t('main.activity'), name: 'activity' },
  { label: t('main.label.timelog'), name: 'time-logs' },
  { label: t('main.label.output_files'), name: 'output-files' }
])

const isTaskDrawerOpen = computed(() => Boolean(currentTask.value))

// Functions
// --------------------------------------------------------------------------
const getCurrentEdit = async () => {
  const editId = route.params.edit_id
  let edit = editStore.cache.editMap.get(editId) || null
  if (!edit) {
    await store.dispatch('loadEdits')
    edit = editStore.cache.editMap.get(editId) || null
  }
  return edit
}

const scrollScheduleToStart = () => {
  scheduleWidget.value?.scrollToDate(scheduleItems.value[0].startDate)
}

const init = async () => {
  try {
    currentEdit.value = await getCurrentEdit()
    currentSection.value = route.query.section || 'infos'
    setTimeout(scrollScheduleToStart, 100)
  } catch (err) {
    console.error(err)
  }
}

const confirmEditEdit = async form => {
  loading.edit = true
  errors.edit = false
  try {
    await store.dispatch('editEdit', { ...form, id: currentEdit.value.id })
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const closeTask = () => {
  if (currentTask.value) onTaskSelected(currentTask.value)
}

const {
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
  saveTaskScheduleItem
} = useEntity({ type: 'edit', currentEntity: currentEdit, entityList, init })

// Watchers
// --------------------------------------------------------------------------
// needed when reloading the page with F5
watch(currentProduction, () => {
  if (!isTVShow.value) init()
})

watch(currentEpisode, () => {
  if (isTVShow.value && editStore.cache.editMap.size === 0) init()
})

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
.dark {
  .table-body {
    border: 1px solid var(--border);
  }

  .wrapper {
    background: var(--background);
  }
}

.main-column {
  display: flex;
  flex-direction: column;
  background: var(--background-page);
  padding-bottom: 1em;
}

h2.subtitle {
  border-bottom: 0;
  margin-top: 0;
  margin-bottom: 0.5em;
  font-size: 1.5em;
}

.page-header {
  align-items: center;
  margin-top: calc(50px + 2em);
  margin-bottom: 0.8em;
  margin-left: 1em;
  margin-right: 1em;

  .entity-title {
    font-weight: 500;
  }
}

.edit-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  max-height: 100%;
  overflow: hidden;
}

.field-label {
  font-weight: bold;
  width: 140px;
}

.back-link {
  padding-top: 3px;
}

.task-list {
  flex: 1;
  margin-bottom: 3em;
  min-height: 150px;
  min-width: 100%;
  overflow: hidden;
}

.datatable-row {
  user-select: text;
}

.schedule {
  position: relative;
  height: 100%;
  overflow: hidden;

  .wrapper {
    height: 100%;
    border-radius: 10px;
  }
}

.entity-thumbnail {
  margin-bottom: 0;
  border-radius: 10px;
}

@media screen and (max-width: 768px) {
  .edit {
    overflow: visible;
  }

  .main-column {
    flex: 1;
    margin: 0;
    max-width: 100%;
    min-height: 0;
    overflow-y: auto;
    width: 100%;
  }

  .column:first-child {
    margin-right: 0;
  }

  .page-header {
    margin: calc(60px + 1em) 0.5em 0.5em;
  }

  .entity-title {
    font-size: 1.3em;
    line-height: 1.5em;
  }

  .edit-data {
    margin: 0 0.5em;
    max-height: none;
    overflow: visible;
  }

  .infos,
  .schedule {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .infos .button {
    display: none;
  }

  .task-list {
    min-height: 0;
    overflow: visible;
  }

  .schedule {
    height: 60vh;
    overflow-x: auto;

    .wrapper {
      min-width: 520px;
    }
  }

  .news-column {
    max-height: none;
  }
}

.section-tabs {
  min-height: 36px;
  margin-bottom: 0;
}

.infos {
  height: 100%;
  margin-top: 1em;
  margin-bottom: 1em;
  max-height: 100%;
  overflow-y: auto;

  .metadata-infos {
    flex: unset;
    min-height: 100px;
    overflow: auto;
  }
}

.news-column {
  max-height: 85%;
}

.drawer-backdrop {
  display: none;
}

@media (max-width: 1024px) {
  .edit {
    animation-fill-mode: none;
  }

  .side-column {
    background: var(--background);
    bottom: 0;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    margin-top: 0 !important;
    max-width: min(100vw, 420px) !important;
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
    display: block;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    transition: opacity 0.25s ease;
    z-index: 249;

    &.is-open {
      opacity: 1;
      pointer-events: auto;
    }
  }
}
</style>
