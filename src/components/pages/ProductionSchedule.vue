<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="schedule-toolbar">
        <div class="toolbar-row">
          <combobox
            class="flexrow-item"
            :label="$t('schedule.mode')"
            v-model="mode"
            :options="modeOptions"
            @update:model-value="onModeChanged"
          />
          <div class="flexrow-item" v-if="mode === 'prev'">
            <label class="label">
              {{ $t('schedule.version') }}
            </label>
            <div class="flexrow">
              <combobox
                class="flexrow-item"
                v-model="version"
                :options="versionOptions"
                @update:model-value="onVersionChanged"
              />
              <button-simple
                class="ml05"
                icon="calendar-plus"
                :title="$t('schedule.new_version')"
                @click="openEditScheduleVersion()"
              />
              <button-simple
                class="ml05"
                :disabled="version === 'ref'"
                icon="pencil"
                :title="$t('schedule.edit_version')"
                @click="openEditScheduleVersion(currentVersion)"
              />
              <button-simple
                class="ml05"
                :disabled="version === 'ref'"
                icon="trash"
                :title="$t('schedule.delete_version')"
                @click="openDeleteScheduleVersion(version)"
              />
            </div>
          </div>
          <button-simple
            class="flexrow-item"
            :disabled="loading.expandSchedule"
            icon="export"
            :title="$t('schedule.export')"
            @click="modals.exportSchedule = true"
          />
          <button-simple
            class="flexrow-item"
            :disabled="version === 'ref'"
            icon="save"
            :text="$t('schedule.apply_to_prod')"
            @click="modals.applyScheduleVersion = true"
            v-if="!isTVShow && mode === 'prev'"
          />
          <div class="filler"></div>
          <combobox-number
            class="flexrow-item zoom-level nowrap"
            :label="$t('schedule.zoom_level')"
            :options="zoomOptions"
            v-model="zoomLevel"
            @update:model-value="onZoomLevelChanged"
          />
          <combobox
            class="flexrow-item"
            :label="$t('main.entities')"
            v-model="entityType"
            :options="entityTypeOptions"
            @update:model-value="onEntityTypeChanged"
            v-if="availableEntityTypes.length > 1"
          />
          <div class="flexrow-item" v-if="hasTaskTypeFilter">
            <label class="label">{{ $t('task_types.title') }}</label>
            <combobox-options
              :title="taskTypeFilterTitle"
              :options="taskTypeFilterOptions"
              :model-value="taskTypeVisibilityMap"
              @change="onTaskTypeVisibilityChanged"
            />
          </div>
          <button-simple
            class="flexrow-item toggle-filters"
            :active="showMoreFilters"
            :icon="showMoreFilters ? 'minus' : 'plus'"
            :title="
              showMoreFilters
                ? $t('main.less_filters')
                : $t('main.more_filters')
            "
            @click="showMoreFilters = !showMoreFilters"
          />
        </div>
        <div class="toolbar-row" v-show="showMoreFilters">
          <div class="flexrow-item">
            <date-field
              :can-delete="false"
              :label="$t('main.start_date')"
              utc
              v-model="selectedStartDate"
            />
          </div>
          <div class="flexrow-item">
            <date-field
              :can-delete="false"
              :label="$t('main.end_date')"
              utc
              v-model="selectedEndDate"
            />
          </div>
          <div class="filler"></div>
          <button-simple
            class="flexrow-item"
            icon="clock"
            :text="$t('schedule.today')"
            @click="scrollScheduleToToday"
          />
          <button-simple
            :active="isSidePanelOpen && assignments.type !== 'task'"
            class="flexrow-item"
            :disabled="isLockedSchedule"
            icon="list"
            :text="$t('schedule.batch_schedule')"
            @click="toggleSidePanel"
            v-if="!isAllEpisodes"
          />
        </div>
      </div>

      <schedule
        ref="schedule"
        :start-date="startDate"
        :end-date="endDate"
        :hierarchy="filteredScheduleItems"
        :zoom-level="zoomLevel"
        :is-loading="loading.schedule"
        clip-children
        is-estimation-linked
        hide-man-days
        :multiline="isAllEpisodes"
        :reassignable="!isLockedSchedule && !isAllEpisodes"
        show-expand-all
        :subchildren="!isAllEpisodes"
        :type="mode"
        @expand-all="onScheduleExpandAll"
        @item-assign="onScheduleItemAssigned"
        @item-changed="onScheduleItemChanged"
        @item-selected="selectTaskTypeElement"
        @item-unassign="onScheduleItemUnassigned"
        @root-element-expanded="expandTaskTypeElement"
        @root-element-selected="selectParentElement"
        @task-selected="selectTaskElement"
        @task-unselected="onTaskUnselected"
        @plan-entity="onPlanEntity"
      />
    </div>

    <div
      class="column side-column"
      v-if="isSidePanelOpen && !isLockedSchedule && !isAllEpisodes"
    >
      <div class="side" ref="sidePanel">
        <div class="side-header">
          <h2>
            {{
              assignments.type === 'task'
                ? $t('schedule.edit_task')
                : $t('schedule.batch_schedule')
            }}
          </h2>
          <a
            class="close-button"
            role="button"
            tabindex="0"
            @click="unselectAndCloseSidePanel"
            @keydown.enter.prevent="unselectAndCloseSidePanel"
            @keydown.space.prevent="unselectAndCloseSidePanel"
          >
            <x-icon class="align-middle" :size="16" />
          </a>
        </div>
        <div class="details" v-if="assignments.type !== 'task'">
          <combobox-task-type
            add-placeholder
            :placeholder="$t('schedule.select_task_type')"
            :label="$t('news.task_type')"
            :task-type-list="availableTaskTypes"
            :model-value="selectedTaskType?.task_type_id"
            @update:model-value="onSelectTaskType"
          />
          <button-simple
            icon="user-check"
            :is-on="assignments.assigned"
            :title="$t('schedule.show_assigned')"
            @click="assignments.assigned = !assignments.assigned"
            v-if="!assignments.loading && assignments.entityTypes?.length"
          />
        </div>
        <combobox
          class="mt1"
          :label="entityGroupLabel"
          :options="entityGroupOptions"
          :model-value="assignments.entityTypeId"
          @update:model-value="onSelectEntityGroup"
          v-if="
            !assignments.loading &&
            assignments.entityTypes &&
            assignments.type !== 'task'
          "
        />
        <p class="side-help">{{ sideHelp }}</p>
        <div class="mt2" v-if="assignments.loading">
          <spinner class="mauto" :size="20" />
        </div>
        <div class="assignments" v-else-if="assignments.type">
          <form @submit.prevent="submitAssignments()">
            <div class="flexrow" v-if="assignments.type === 'entity'">
              <div class="flexrow-item">
                <date-field
                  :can-delete="false"
                  :label="$t('main.start_date')"
                  utc
                  v-model="assignments.startDate"
                />
              </div>
              <div class="flexrow-item">
                <date-field
                  :can-delete="false"
                  :label="$t('main.end_date')"
                  utc
                  v-model="assignments.endDate"
                />
              </div>
            </div>
            <template v-if="assignments.type === 'entity'">
              <div class="list-header">
                <span>
                  {{ $t('main.entities') }} ({{ selectedEntities.length }})
                </span>
                <a
                  class="reset-list"
                  :title="$t('schedule.reset_list')"
                  role="button"
                  tabindex="0"
                  @click="assignments.entityExcludes = []"
                  @keydown.enter.prevent="assignments.entityExcludes = []"
                  @keydown.space.prevent="assignments.entityExcludes = []"
                  v-if="assignments.entityExcludes.length"
                >
                  <list-restart-icon
                    class="align-middle"
                    :size="18"
                    :stroke-width="1.5"
                  />
                </a>
              </div>
              <ul class="side-list entities">
                <li
                  :class="{ assigned: entity.assigned }"
                  :key="entity.id"
                  v-for="entity in selectedEntities"
                >
                  <span class="name">{{ entity.name }}</span>
                  <user-check-icon
                    class="assigned-icon"
                    :size="14"
                    v-if="entity.assigned"
                  >
                    <title>{{ $t('schedule.already_assigned') }}</title>
                  </user-check-icon>
                  <button-simple
                    class="is-small"
                    icon="minus"
                    :title="$t('main.remove')"
                    type="button"
                    @click="removeEntity(entity)"
                  />
                </li>
                <li class="empty" v-if="!selectedEntities.length">
                  {{ $t('schedule.no_entity') }}
                </li>
              </ul>
            </template>
            <div class="list-header">
              <span>{{ $t('schedule.assign') }}</span>
              <a
                class="reset-list reset-assignees"
                :title="$t('schedule.reset_list')"
                role="button"
                tabindex="0"
                @click="assignments.excludes = []"
                @keydown.enter.prevent="assignments.excludes = []"
                @keydown.space.prevent="assignments.excludes = []"
                v-if="assignments.excludes.length"
              >
                <list-restart-icon
                  class="align-middle"
                  :size="18"
                  :stroke-width="1.5"
                />
              </a>
            </div>
            <ul class="side-list assignees">
              <li :key="person.id" v-for="person in availablePersons">
                <div class="person">
                  <people-avatar
                    :is-link="false"
                    :font-size="14"
                    :person="person"
                    :size="28"
                  />
                  <people-name :person="person" />
                </div>
                <button-simple
                  class="is-small"
                  icon="minus"
                  :title="
                    $t('main.avatar.unassign', {
                      personName: person.name
                    })
                  "
                  type="button"
                  @click="removeFromAssignments(person)"
                />
              </li>
              <li class="empty" v-if="!availablePersons.length">
                {{ $t('schedule.no_assignee') }}
              </li>
            </ul>
            <checkbox
              class="pa05 mb0 mt1"
              :disabled="!availablePersons.length"
              :label="$t('schedule.force_unassign')"
              :toggle="true"
              v-model="assignments.unassign"
              v-if="assignments.type === 'entity'"
            />
            <p
              class="side-help override-help"
              v-if="assignments.type === 'entity'"
            >
              {{ $t('schedule.force_unassign_help') }}
            </p>
            <div class="quota" v-if="assignments.type === 'entity'">
              <div class="list-header">{{ $t('schedule.daily_quota') }}</div>
              <div class="flexrow">
                <text-field
                  class="mb0 daily-quotas"
                  input-class=" is-small"
                  :placeholder="estimatedDailyQuota.toFixed(2)"
                  :step="0.01"
                  type="number"
                  v-model="assignments.forcedDailyQuota"
                />
                <a
                  class="reset-quotas ml05"
                  role="button"
                  tabindex="0"
                  @click="assignments.forcedDailyQuota = null"
                  @keydown.enter.prevent="assignments.forcedDailyQuota = null"
                  @keydown.space.prevent="assignments.forcedDailyQuota = null"
                  v-if="assignments.forcedDailyQuota"
                >
                  <trash-icon class="align-middle" :size="14" />
                </a>
              </div>
              <p class="side-help">
                {{
                  $t('schedule.daily_quota_help', {
                    quota: estimatedDailyQuota.toFixed(2)
                  })
                }}
              </p>
            </div>
            <div class="flexrow mt2" v-if="assignments.type === 'task'">
              <div class="flexrow-item">
                <date-field
                  :can-delete="false"
                  :label="$t('main.start_date')"
                  utc
                  :with-margin="false"
                  v-model="assignments.task.startDate"
                />
              </div>
              <div class="flexrow-item">
                <date-field
                  :can-delete="false"
                  disabled
                  :label="$t('main.end_date')"
                  utc
                  :with-margin="false"
                  v-model="assignments.task.endDate"
                />
              </div>
            </div>
            <div class="flexrow mt2" v-if="assignments.type === 'task'">
              <text-field
                class="mb0 estimation mr05"
                input-class=" thin"
                :label="$t('main.estimation')"
                :step="0.01"
                placeholder="0.00"
                type="number"
                :unit-label="durationUnit"
                v-model="assignments.task.estimation"
              />
            </div>
            <p class="error has-text-right mt2" v-if="assignments.isError">
              <em>
                {{
                  assignments.type === 'task'
                    ? $t('schedule.save_task_error')
                    : $t('schedule.assign_error')
                }}
              </em>
            </p>
            <p
              class="error has-text-right mt2"
              v-else-if="assignments.nbUnfitTasks"
            >
              <em>
                {{
                  $t('schedule.assign_no_fit', {
                    count: assignments.nbUnfitTasks
                  })
                }}
              </em>
            </p>
            <p
              class="success has-text-right mt2"
              v-if="assignments.nbPlannedTasks"
            >
              <em>
                {{
                  $t('schedule.assign_done', {
                    count: assignments.nbPlannedTasks
                  })
                }}
              </em>
            </p>
            <div class="mt2 has-text-right">
              <button-simple
                :disabled="!hasDraggedEntities || !availablePersons.length"
                :is-loading="assignments.saving"
                is-primary
                :text="$t('main.apply')"
                type="submit"
                v-if="assignments.type === 'entity'"
              />
              <button-simple
                :disabled="!getTaskEstimation(assignments.task)"
                :is-loading="assignments.saving"
                is-primary
                :text="$t('main.apply')"
                type="submit"
                v-if="assignments.type === 'task'"
              />
            </div>
            <progress-bar
              class="mt2"
              :progress="assignments.progress"
              v-if="assignments.progress !== null"
            />
          </form>
        </div>
      </div>
    </div>
  </div>

  <edit-schedule-version-modal
    :schedule-version-to-edit="scheduleVersionToEdit"
    :version="version"
    :version-options="scheduleVersions"
    :is-loading="loading.editScheduleVersion"
    :is-error="errors.editScheduleVersion"
    @cancel="modals.editScheduleVersion = false"
    @confirm="editVersion"
    v-if="modals.editScheduleVersion"
  />

  <hard-delete-modal
    active
    :error-text="$t('schedule.delete_version_error')"
    :is-loading="loading.deleteScheduleVersion"
    :is-error="errors.deleteScheduleVersion"
    :lock-text="scheduleVersionToEdit?.name"
    :text="
      $t('schedule.delete_version_message', {
        name: scheduleVersionToEdit?.name
      })
    "
    @cancel="modals.deleteScheduleVersion = false"
    @confirm="deleteVersion(scheduleVersionToEdit)"
    v-if="modals.deleteScheduleVersion"
  />

  <confirm-modal
    active
    :text="$t('schedule.apply_to_prod_confirm')"
    :error-text="$t('schedule.apply_to_prod_error')"
    :is-loading="loading.applyScheduleVersion"
    :is-error="errors.applyScheduleVersion"
    @cancel="modals.applyScheduleVersion = false"
    @confirm="applyToProduction()"
    v-if="modals.applyScheduleVersion"
  />
  <confirm-modal
    active
    :confirm-button-text="$t('main.export')"
    :text="
      $t('schedule.export_explanation', {
        count: filteredScheduleItems.length
      })
    "
    :error-text="$t('schedule.export_error')"
    :is-error="errors.exportSchedule"
    :is-loading="exportProgress !== null"
    :progress="exportProgress"
    @cancel="cancelExport"
    @confirm="exportSchedule"
    v-if="modals.exportSchedule"
  />
  <confirm-modal
    active
    :text="
      $t('schedule.confirm_move_children', {
        count: pendingParentChange ? pendingParentChange.affected.length : 0
      })
    "
    :is-loading="childMoveProgress !== null"
    :progress="childMoveProgress"
    @cancel="cancelChildMove"
    @confirm="confirmChildMove"
    v-if="modals.confirmChildMove"
  />
</template>

<script setup>
/*
 * Page to manage the schedule of the big steps of the production. It allows
 * to set milestones too.
 */

import { useHead } from '@unhead/vue'
import {
  ListRestartIcon,
  TrashIcon,
  UserCheckIcon,
  XIcon
} from 'lucide-vue-next'
import moment from 'moment-timezone'
import { firstBy } from 'thenby'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'
import colors from '@/lib/colors'
import { downloadBlob } from '@/lib/download'
import { isFreeEscape } from '@/lib/keyboard'
import { getTaskTypeSchedulePath } from '@/lib/path'
import preferences from '@/lib/preferences'
import {
  DEFAULT_MODE,
  DEFAULT_VERSION,
  DEFAULT_ZOOM,
  formatHiddenTaskTypeIds,
  getMaxDate,
  getMinDate,
  getScheduleRouteChange,
  getTaskTypeFilterOptions,
  getTaskTypeFilterTitle,
  getTaskTypeVisibilityMap,
  getTaskUpdate,
  getVersionedTaskUpdate,
  isTaskTypeFilterShown,
  movedSubItems,
  parseHiddenTaskTypeIds,
  refreshRawDates,
  removeHiddenTaskTypes,
  setTaskTypeVisibility,
  widenParents
} from '@/lib/productionSchedule'
import {
  sortByName,
  sortPeople,
  sortTaskTypeScheduleItems
} from '@/lib/sorting'
import {
  addBusinessDays,
  daysToMinutes,
  durationToMinutes,
  getBusinessDays,
  getDatesFromStartDate,
  getDayOffRange,
  getUserDay,
  minutesToDays,
  parseDate,
  parseSimpleDate
} from '@/lib/time'
import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'
import taskTypeStore from '@/store/modules/tasktypes'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EditScheduleVersionModal from '@/components/modals/EditScheduleVersionModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import Schedule from '@/components/schedule/Schedule.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import ProgressBar from '@/components/widgets/ProgressBar.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TextField from '@/components/widgets/TextField.vue'

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const { durationUnit, formatDuration } = useFormat()

// State
// --------------------------------------------------------------------------
const ZOOM_STORAGE_KEY = 'schedule:zoom'
const ENTITY_TYPE_STORAGE_KEY = 'schedule:type'

const assignments = ref({
  assigned: false,
  entityExcludes: [],
  entityTypeId: '',
  entityTypes: null,
  excludes: [],
  forcedDailyQuota: null,
  isError: false,
  loading: false,
  nbPlannedTasks: 0,
  nbUnfitTasks: 0,
  // percentage of the run saved so far, null outside a run
  progress: null,
  saving: false,
  startDate: null,
  endDate: null,
  task: {},
  type: null,
  unassign: false
})
const daysOffByPerson = ref({})
const daysOffRangeKey = ref(null)
// kind of entity to the promise of its load: a second caller joins the
// load in flight instead of starting its own
const entityLoads = new Map()
const taskEntities = ref([])
const endDate = ref(getUserDay().add(6, 'months').endOf('day'))
const entityType = ref(null)
const expandAll = ref(false)
const hiddenTaskTypeIds = ref([])
const isSidePanelOpen = ref(false)
const resetTimeout = ref(null)
const scheduleItems = ref([])
const startDate = ref(getUserDay())
const selectedStartDate = ref(null)
const selectedEndDate = ref(null)
const selectedTaskType = ref(null)
const zoomLevel = ref(DEFAULT_ZOOM)
const mode = ref(DEFAULT_MODE)
const scheduleVersionToEdit = ref({})
const version = ref(DEFAULT_VERSION)
const showMoreFilters = ref(false)
const loading = ref({
  schedule: false,
  deleteScheduleVersion: false,
  editScheduleVersion: false,
  applyScheduleVersion: false,
  expandSchedule: false
})
const errors = ref({
  editScheduleVersion: false,
  deleteScheduleVersion: false,
  applyScheduleVersion: false,
  exportSchedule: false
})
const modals = ref({
  editScheduleVersion: false,
  deleteScheduleVersion: false,
  applyScheduleVersion: false,
  confirmChildMove: false,
  exportSchedule: false
})
// percentage of the rows loaded for the export, null outside an export
const exportProgress = ref(null)
let exportCancelled = false
const pendingParentChange = ref(null)
// percentage of the confirmed move saved so far, null outside a save
const childMoveProgress = ref(null)
const scheduleRef = useTemplateRef('schedule')
const sidePanelRef = useTemplateRef('sidePanel')

// Bumped when the production or the episode changes and when the page is
// left: an expansion still running then stops, rather than loading the
// stores of the new scope for the rows of the one left.
let scheduleGeneration = 0

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isTVShow = computed(() => store.getters.isTVShow)
const organisation = computed(() => store.getters.organisation)
const personMap = computed(() => store.getters.personMap)
const productionAssetTypes = computed(() => store.getters.productionAssetTypes)
const scheduleVersions = computed(() => store.getters.scheduleVersions)
const user = computed(() => store.getters.user)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)

const zoomOptions = computed(() => [
  { label: t('main.week'), value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
])

const modeOptions = computed(() => [
  { label: t('schedule.mode_prev'), value: 'prev' },
  { label: t('schedule.mode_real'), value: 'real' }
])

const selectedGroup = computed(() =>
  assignments.value.entityTypes?.find(
    group => group.id === assignments.value.entityTypeId
  )
)

const selectedEntities = computed(() =>
  selectedGroup.value
    ? filteredAssignments(selectedGroup.value.children).filter(
        entity => !assignments.value.entityExcludes.includes(entity.id)
      )
    : []
)

// what Apply plans: the edited task, or the selected group minus the
// entities taken out
const draggedEntities = computed(() => {
  if (assignments.value.type === 'task') return taskEntities.value
  return selectedGroup.value
    ? [{ ...selectedGroup.value, children: selectedEntities.value }]
    : []
})

const entityGroupLabel = computed(() => {
  const forEntity = selectedTaskType.value?.for_entity
  if (forEntity === 'Asset') return t('asset_types.title')
  if (forEntity === 'Shot') return t('sequences.title')
  if (['Sequence', 'Edit'].includes(forEntity)) return t('episodes.title')
  return t('main.entities')
})

const entityGroupOptions = computed(() => [
  { label: t('schedule.select_entity_group'), value: '' },
  ...(assignments.value.entityTypes ?? []).map(group => ({
    label: `${group.name} (${filteredAssignments(group.children).length})`,
    value: group.id
  }))
])

const sideHelp = computed(() => {
  if (assignments.value.type === 'task') return t('schedule.assign_help_task')
  if (assignments.value.type === 'entity') {
    return t('schedule.assign_help_form')
  }
  return selectedTaskType.value
    ? t('schedule.assign_help_entity_group')
    : t('schedule.assign_help_task_type')
})

const estimatedDailyQuota = computed(() => {
  const rangeStartDate = parseSimpleDate(assignments.value.startDate)
  const rangeEndDate = parseSimpleDate(assignments.value.endDate)
  // whole days: a start at the current time would leave its own day out
  const nbDays = getBusinessDays(
    rangeStartDate.startOf('day'),
    rangeEndDate.startOf('day')
  )
  const nbEntities = draggedEntities.value.reduce(
    (sum, entity) => sum + (entity.children?.length ?? 0),
    0
  )
  // a task goes to a single person: no more people than entities share
  // the work
  const nbAssignees = Math.min(availablePersons.value.length, nbEntities)

  return nbDays && nbAssignees ? nbEntities / nbDays / nbAssignees : 0
})

const assetTypeMap = computed(() => {
  return assetTypeStore.cache.assetTypeMap
})

const availablePersons = computed(() => {
  const taskType = taskTypeMap.value.get(selectedTaskType.value.task_type_id)
  return team.value.filter(
    person =>
      !assignments.value.excludes.includes(person.id) &&
      person.role !== 'client' &&
      (['admin', 'manager'].includes(person.role) ||
        !person.departments.length ||
        person.departments.includes(taskType?.department_id) ||
        // an out-of-department person already assigned to the edited
        // task stays listed: saveTask replaces the full assignee list,
        // so hiding them here would silently unassign them
        assignments.value.task?.assignees?.includes(person.id))
  )
})

const currentVersion = computed(() => {
  return scheduleVersions.value.find(
    scheduleVersion => scheduleVersion.id === version.value
  )
})

const hasDraggedEntities = computed(() => {
  return draggedEntities.value.some(entity => entity.children.length)
})

const isLockedSchedule = computed(() => {
  return (
    mode.value === 'real' ||
    currentVersion.value?.locked ||
    !isCurrentUserManager.value
  )
})

// Concrete episode id for scoping (null for feature films or the 'all'/'main' pseudo-episodes).
const currentEpisodeId = computed(() => {
  const id = currentEpisode.value?.id
  return isTVShow.value && id && !['all', 'main'].includes(id) ? id : null
})

// The 'all' pseudo-episode displays the production-wide planning: one row
// per episode with its own dates, instead of the per-episode entity /
// assignee / task tree.
const isAllEpisodes = computed(() => {
  return isTVShow.value && currentEpisode.value?.id === 'all'
})

// The 'main' pseudo-episode scopes the planning to the main pack: the
// assets attached to no episode.
const isMainPack = computed(() => {
  return isTVShow.value && currentEpisode.value?.id === 'main'
})

// Episode id the drill-down links point at. The main pack is a valid route
// scope, unlike the schedule-items endpoints which only accept a real
// episode.
const linkedEpisodeId = computed(() => {
  return isMainPack.value ? 'main' : currentEpisodeId.value
})

const taskTypeMap = computed(() => {
  return taskTypeStore.cache.taskTypeMap
})

const team = computed(() => {
  return sortPeople(
    currentProduction.value?.team
      .map(personId => personMap.value.get(personId))
      .filter(person => person && !person.is_bot) ?? []
  )
})

const isVersioned = computed(() => {
  return mode.value === 'prev' && version.value !== 'ref'
})

const versionOptions = computed(() => {
  const options = scheduleVersions.value
    .filter(scheduleVersion => !scheduleVersion.canceled)
    .sort(firstBy('created_at'))
    .map(scheduleVersion => ({
      label: scheduleVersion.locked
        ? `${scheduleVersion.name} (${t('schedule.versions.locked')})`
        : scheduleVersion.name,
      value: scheduleVersion.id
    }))

  const fromScheduleVersion = scheduleVersions.value.find(
    scheduleVersion =>
      scheduleVersion.id === currentProduction.value.from_schedule_version_id
  )
  const referenceVersion = {
    label: fromScheduleVersion
      ? `${t('schedule.versions.reference')} (${t('schedule.versions.from')} ${fromScheduleVersion.name})`
      : t('schedule.versions.reference'),
    value: DEFAULT_VERSION,
    separator: true
  }

  return [referenceVersion, ...options]
})

// Task type rows in scope. The main pack only holds assets: the other
// entities (shots, sequences, episodes, edits) all belong to an episode.
const scopedScheduleItems = computed(() => {
  return isMainPack.value
    ? scheduleItems.value.filter(item => item.for_entity === 'Asset')
    : scheduleItems.value
})

const availableEntityTypes = computed(() => {
  const types = scopedScheduleItems.value
    .map(item => taskTypeMap.value.get(item.task_type_id)?.for_entity)
    .filter(Boolean)
  return [...new Set(types)].sort()
})

const entityTypeOptions = computed(() => [
  { label: t('main.all'), value: null },
  ...availableEntityTypes.value.map(type => ({ label: type, value: type }))
])

const entityFilteredScheduleItems = computed(() => {
  if (!entityType.value) {
    return scopedScheduleItems.value
  }
  return scopedScheduleItems.value.filter(item => {
    const taskType = taskTypeMap.value.get(item.task_type_id)
    return taskType && taskType.for_entity === entityType.value
  })
})

const taskTypeFilterOptions = computed(() => {
  return getTaskTypeFilterOptions(entityFilteredScheduleItems.value)
})

const hasTaskTypeFilter = computed(() => {
  return isTaskTypeFilterShown(
    taskTypeFilterOptions.value.length,
    filteredScheduleItems.value.length,
    entityFilteredScheduleItems.value.length
  )
})

const taskTypeFilterTitle = computed(() => {
  return getTaskTypeFilterTitle(
    filteredScheduleItems.value.length,
    taskTypeFilterOptions.value.length,
    t('main.all')
  )
})

const taskTypeVisibilityMap = computed(() => {
  return getTaskTypeVisibilityMap(
    taskTypeFilterOptions.value,
    hiddenTaskTypeIds.value
  )
})

const filteredScheduleItems = computed(() => {
  return removeHiddenTaskTypes(
    entityFilteredScheduleItems.value,
    hiddenTaskTypeIds.value
  )
})

// the batch panel plans the task types the schedule shows, named like
// their rows
const availableTaskTypes = computed(() =>
  filteredScheduleItems.value.map(item => ({
    ...taskTypeMap.value.get(item.task_type_id),
    name: item.name
  }))
)

// Functions
// --------------------------------------------------------------------------

// the task types differ per production, their filter is stored by one
const hiddenTypesStorageKey = () =>
  `schedule:hiddenTypes:${currentProduction.value.id}`

const saveFilterPreferences = () => {
  preferences.setPreference(ZOOM_STORAGE_KEY, zoomLevel.value)
  preferences.setPreference(ENTITY_TYPE_STORAGE_KEY, entityType.value ?? '')
  preferences.setPreference(
    hiddenTypesStorageKey(),
    formatHiddenTaskTypeIds(hiddenTaskTypeIds.value) ?? ''
  )
}

const updateRoute = changes => {
  const change = getScheduleRouteChange(route.query, changes)
  if (change?.isReplace) {
    router.replace({ query: change.query })
  } else if (change) {
    router.push({ query: change.query })
  }
}

const loadData = async () => {
  const production = currentProduction.value
  loading.value.schedule = true
  entityLoads.clear()

  try {
    await store.dispatch('loadScheduleVersions', production)

    const items = await store.dispatch('loadScheduleItems', production)
    // A production switched during the fetches runs its own load.
    if (currentProduction.value?.id !== production.id) return
    const scheduleStartDate = parseDate(selectedStartDate.value)
    const scheduleEndDate = parseDate(selectedEndDate.value)
    const rows = items.map(item => {
      const taskType = taskTypeMap.value.get(item.task_type_id)
      if (!taskType) return null
      let rowStartDate, rowEndDate
      if (item.start_date) {
        rowStartDate = parseDate(item.start_date)
      } else {
        rowStartDate = moment()
      }
      if (rowStartDate.isSameOrAfter(scheduleEndDate)) {
        rowStartDate = scheduleEndDate.clone().add(-1, 'days')
      }

      if (rowStartDate.isBefore(scheduleStartDate)) {
        rowStartDate = scheduleStartDate.clone()
      }

      if (item.end_date) {
        rowEndDate = parseDate(item.end_date)
      } else {
        rowEndDate = rowStartDate.clone().add(1, 'days')
      }
      if (rowEndDate.isSameOrAfter(scheduleEndDate)) {
        rowEndDate = scheduleEndDate.clone()
      }

      const path = getTaskTypeSchedulePath(
        taskType.id,
        currentProduction.value.id,
        linkedEpisodeId.value,
        taskType.for_entity
      )

      return {
        ...item,
        color: taskType.color,
        for_entity: taskType.for_entity,
        name: `${taskType.for_entity} / ${taskType.name}`,
        priority: taskType.priority,
        startDate: rowStartDate,
        endDate: rowEndDate,
        editable: isInDepartment(taskType) && !isLockedSchedule.value,
        expanded: false,
        loading: false,
        route: path,
        children: []
      }
    })
    scheduleItems.value = sortTaskTypeScheduleItems(
      rows.filter(Boolean),
      currentProduction.value,
      taskTypeMap.value
    )
  } catch (err) {
    console.error(err)
  } finally {
    if (currentProduction.value?.id === production.id) {
      loading.value.schedule = false
    }
  }
}

const isStaleSchedule = generation => generation !== scheduleGeneration

const reset = () => {
  scheduleGeneration++
  // the rows of the new production or episode load collapsed
  expandAll.value = false
  // Debounce: cross-prod navigation triggers two close currentEpisode changes (transient 'main' then 'all').
  if (resetTimeout.value) clearTimeout(resetTimeout.value)
  resetTimeout.value = setTimeout(() => {
    resetTimeout.value = null
    loadSchedule()
  }, 50)
}

const loadSchedule = async () => {
  closeSidePanel()

  if (currentProduction.value.start_date) {
    startDate.value = parseDate(currentProduction.value.start_date)
  }
  if (currentProduction.value.end_date) {
    endDate.value = parseDate(currentProduction.value.end_date)
  }
  selectedStartDate.value = startDate.value.toDate()
  selectedEndDate.value = endDate.value.toDate()

  await loadData()

  // the query wins over the filters of the last visit
  const stored = key => preferences.getPreference(key) ?? undefined
  const queryMode = route.query.mode
  const queryType = route.query.type ?? stored(ENTITY_TYPE_STORAGE_KEY)
  const queryVersion = route.query.version
  const queryZoom = Number(route.query.zoom ?? stored(ZOOM_STORAGE_KEY))
  const queryHiddenTypes =
    route.query.hiddenTypes ?? stored(hiddenTypesStorageKey())

  mode.value = modeOptions.value.map(o => o.value).includes(queryMode)
    ? queryMode
    : DEFAULT_MODE
  entityType.value = entityTypeOptions.value
    .map(o => o.value)
    .includes(queryType)
    ? queryType
    : null
  version.value = versionOptions.value.map(o => o.value).includes(queryVersion)
    ? queryVersion
    : DEFAULT_VERSION
  zoomLevel.value = zoomOptions.value.map(o => o.value).includes(queryZoom)
    ? queryZoom
    : DEFAULT_ZOOM
  hiddenTaskTypeIds.value = parseHiddenTaskTypeIds(
    queryHiddenTypes,
    taskTypeMap.value
  )

  // loadData computed the editable flags with the default mode/version,
  // before the query params were applied
  refreshScheduleItemsEditable()
}

const refreshScheduleItemsEditable = () => {
  scheduleItems.value.forEach(item => {
    const taskType = taskTypeMap.value.get(item.task_type_id)
    item.editable = isInDepartment(taskType) && !isLockedSchedule.value
  })
}

const convertScheduleItems = (taskTypeElement, items) => {
  return items.map(item => {
    let itemStartDate
    if (item.start_date) {
      itemStartDate = parseDate(item.start_date)
    } else {
      itemStartDate = moment()
    }
    if (itemStartDate.isBefore(startDate.value)) {
      itemStartDate = startDate.value.clone()
    }
    if (itemStartDate.isAfter(endDate.value)) {
      itemStartDate = endDate.value.clone()
    }
    let itemEndDate
    if (item.end_date) {
      itemEndDate = parseDate(item.end_date)
    } else {
      itemEndDate = itemStartDate.clone().add(1, 'days')
    }
    if (itemEndDate.isBefore(itemStartDate)) {
      itemEndDate = itemStartDate.clone().add(1, 'days')
    }
    if (itemEndDate.isAfter(endDate.value)) {
      itemEndDate = endDate.value.clone()
    }
    return {
      ...item,
      startDate: itemStartDate,
      endDate: itemEndDate,
      expanded: false,
      loading: false,
      editable:
        isInDepartment(taskTypeMap.value.get(item.task_type_id)) &&
        !isLockedSchedule.value,
      children: [],
      parentElement: taskTypeElement
    }
  })
}

const buildTaskFilters = taskType => {
  const filters = {
    project_id: currentProduction.value.id,
    task_type_id: taskType.task_type_id,
    relations: 'true'
  }
  // /tasks?episode_id= only filters shot tasks (shot → sequence → episode);
  // asset tasks are scoped client-side via the episode-scoped assetMap.
  if (currentEpisodeId.value && taskType.for_entity === 'Shot') {
    filters.episode_id = currentEpisodeId.value
  }
  return filters
}

// The plain /assets endpoint rejects episode_id=main (only its with-tasks
// variant maps it to source_id IS NULL), so the main pack loads every asset
// with no episode filter and keeps the right ones client-side. A real
// episode is scoped server-side, so nothing to load wide.
const loadScopedAssets = () => {
  return store.dispatch('loadAssets', {
    all: isMainPack.value,
    withShared: false,
    withTasks: false
  })
}

// The entities behind the rows are the same for every task type of a kind:
// expand all reloaded the whole shot list (9.5 MB on a large production)
// once per shot task type. Load each kind once per production and episode;
// loadData starts afresh.
const entityLoaders = {
  Asset: () => loadScopedAssets(),
  Shot: () => store.dispatch('loadShots'),
  Sequence: () => store.dispatch('loadSequences'),
  Episode: () => store.dispatch('loadEpisodes'),
  Edit: () => store.dispatch('loadEdits')
}

const loadEntities = async forEntity => {
  const loader = entityLoaders[forEntity]
  if (!loader) return
  const key = `${currentProduction.value.id}_${currentEpisodeId.value}_${forEntity}`
  if (!entityLoads.has(key)) {
    entityLoads.set(
      key,
      loader().catch(error => {
        entityLoads.delete(key)
        throw error
      })
    )
  }
  await entityLoads.get(key)
}

// Whether an asset falls in the current scope: for the main pack, only the
// assets attached to no episode; otherwise the assetMap is already scoped
// and every asset it holds belongs. The store may hand over the list of the
// Assets page instead of a list without tasks: that list names the episode
// episode_id rather than source_id, and holds the assets other productions
// share with this one, which never belong.
const assetInScope = asset => {
  return (
    !asset.shared &&
    (!isMainPack.value || !(asset.episode_id || asset.source_id))
  )
}

const expandTaskTypeElement = (
  taskTypeElement,
  refreshScheduleCallBack = null,
  expanded = false,
  resetAssignments = true
) => {
  return isAllEpisodes.value
    ? expandEpisodeRows(taskTypeElement, refreshScheduleCallBack, expanded)
    : expandTaskTypeDrillDown(
        taskTypeElement,
        refreshScheduleCallBack,
        expanded,
        resetAssignments
      )
}

// The production-wide planning stops at the episode level: one row per
// episode, with no entity, assignee or task row to load below it.
const expandEpisodeRows = async (
  taskTypeElement,
  refreshScheduleCallBack = null,
  expanded = false
) => {
  taskTypeElement.expanded = expanded || !taskTypeElement.expanded

  if (taskTypeElement.expanded) {
    await loadEpisodeRows(taskTypeElement)
    if (refreshScheduleCallBack) {
      refreshScheduleCallBack(taskTypeElement)
    }
  }
}

const loadEpisodeRows = async taskTypeElement => {
  try {
    taskTypeElement.loading = true
    taskTypeElement.children = []

    // The episodes endpoint aggregates a task type schedule per episode,
    // whatever the entity it applies to.
    const episodeRows = await store.dispatch('loadEpisodeScheduleItems', {
      production: currentProduction.value,
      taskType: taskTypeMap.value.get(taskTypeElement.task_type_id)
    })
    taskTypeElement.children = sortByName(
      convertScheduleItems(taskTypeElement, episodeRows)
    )
  } catch (err) {
    console.error(err)
    taskTypeElement.children = []
  } finally {
    taskTypeElement.loading = false
  }
}

const expandTaskTypeDrillDown = async (
  taskTypeElement,
  refreshScheduleCallBack = null,
  expanded = false,
  resetAssignments = true
) => {
  taskTypeElement.expanded = expanded || !taskTypeElement.expanded

  if (taskTypeElement.expanded) {
    const generation = scheduleGeneration
    selectedTaskType.value = taskTypeElement
    assignments.value.loading = resetAssignments

    const rawTasks = await loadTaskTypeRows(taskTypeElement)
    if (isStaleSchedule(generation)) return

    if (refreshScheduleCallBack) {
      refreshScheduleCallBack(taskTypeElement)
    }

    selectTaskTypeElement(taskTypeElement, null, resetAssignments, rawTasks)
  }
}

// Fill the entity, assignee and task rows of a task type bar. Returns the
// unversioned task list, shared with the side panel to avoid a reload.
const loadTaskTypeRows = async taskTypeElement => {
  const generation = scheduleGeneration
  let rawTasks = null
  try {
    taskTypeElement.loading = true

    taskTypeElement.children = []
    taskTypeElement.people = {}
    taskTypeElement.entitiesByType = {}

    // one row per asset type (Asset), sequence (Shot/Sequence),
    // episode (Episode) or edit (Edit)
    const scheduleItemLoaders = {
      Asset: payload => store.dispatch('loadAssetTypeScheduleItems', payload),
      Shot: payload => store.dispatch('loadSequenceScheduleItems', payload),
      Sequence: payload => store.dispatch('loadSequenceScheduleItems', payload),
      Episode: payload => store.dispatch('loadEpisodeScheduleItems', payload),
      Edit: payload => store.dispatch('loadEditScheduleItems', payload)
    }
    const loadEntityRows =
      scheduleItemLoaders[taskTypeElement.for_entity] ??
      (payload => store.dispatch('loadAssetTypeScheduleItems', payload))
    const parameters = {
      production: currentProduction.value,
      taskType: taskTypeMap.value.get(taskTypeElement.task_type_id),
      episodeId: currentEpisodeId.value
    }
    const entityRows = await loadEntityRows(parameters)
    if (isStaleSchedule(generation)) return null

    let children = convertScheduleItems(taskTypeElement, entityRows)
    const childrenById = new Map(
      children.map(child => [child.object_id, child])
    )

    // load entities (scoped to the current episode for TV shows) that
    // back the row grouping, the entity name and the episode filter
    await loadEntities(taskTypeElement.for_entity)
    if (isStaleSchedule(generation)) return null

    let tasks = await store.dispatch(
      'loadTasks',
      buildTaskFilters(taskTypeElement)
    )
    if (isStaleSchedule(generation)) return null
    rawTasks = tasks

    // Update tasks for versioned schedules
    if (isVersioned.value) {
      const taskType = taskTypeMap.value.get(taskTypeElement.task_type_id)
      const versionedTasks = await store.dispatch(
        'loadTasksFromScheduleVersion',
        {
          version: { id: version.value },
          taskType
        }
      )
      const versionedTaskMap = new Map(
        versionedTasks.map(versionedTask => [
          versionedTask.task_id,
          versionedTask
        ])
      )
      // a task the version does not plan yet stays on its row as a task
      // without dates, like in the reference
      tasks = tasks.map(task => {
        const versioned = versionedTaskMap.get(task.id)
        return {
          ...task,
          versionedTaskId: versioned?.id,
          start_date: versioned?.start_date ?? null,
          due_date: versioned?.due_date ?? null,
          estimation: versioned?.estimation ?? task.estimation,
          assignees: versioned?.assignees ?? []
        }
      })
    }

    // days off only depend on the production and the date range:
    // reuse them across expands
    const daysOffKey = `${currentProduction.value.id}_${startDate.value.format('YYYY-MM-DD')}_${endDate.value.format('YYYY-MM-DD')}`
    if (daysOffRangeKey.value !== daysOffKey) {
      daysOffByPerson.value = await store
        .dispatch('loadProductionDaysOff', {
          startDate: startDate.value.format('YYYY-MM-DD'),
          endDate: endDate.value.format('YYYY-MM-DD')
        })
        .catch(
          () => ({}) // fallback if not allowed to fetch days off
        )
      daysOffRangeKey.value = daysOffKey
    }
    if (isStaleSchedule(generation)) return null

    // Read the entity maps fresh from the store cache. They are plain,
    // non-reactive Maps replaced on each episode-scoped load, so a cached
    // computed would keep returning the first episode's Map and empty the
    // drill-down after switching episode.
    const assetMap = assetStore.cache.assetMap
    const shotMap = shotStore.cache.shotMap
    const sequenceMap = sequenceStore.cache.sequenceMap
    const episodeMap = episodeStore.cache.episodeMap
    const editMap = editStore.cache.editMap

    // group tasks by entity type and assignee
    const tasksByType = {}
    const people = {}
    const nbUndatedTasksByType = {}
    const nbTasksOutOfRangeByType = {}
    const countTask = (counts, task) => {
      counts[task.entity_type_id] = (counts[task.entity_type_id] || 0) + 1
    }
    tasks.forEach(task => {
      // link entity to task; skip tasks whose entity is not in the
      // current episode (loadTasks is not episode-scoped, but the entity
      // maps are for TV shows). Sequence/Episode/Edit task types group
      // under their own entity id.
      if (taskTypeElement.for_entity === 'Asset') {
        task.entity = assetMap.get(task.entity_id)
        if (!task.entity || !assetInScope(task.entity)) return
        task.entity_type_id = task.entity.asset_type_id
      } else if (taskTypeElement.for_entity === 'Shot') {
        task.entity = shotMap.get(task.entity_id)
        if (!task.entity) return
        task.entity_type_id = task.entity.sequence_id
      } else if (taskTypeElement.for_entity === 'Sequence') {
        task.entity = sequenceMap.get(task.entity_id)
        if (!task.entity) return
        task.entity_type_id = task.entity_id
      } else if (taskTypeElement.for_entity === 'Episode') {
        task.entity = episodeMap.get(task.entity_id)
        if (!task.entity) return
        task.entity_type_id = task.entity_id
      } else if (taskTypeElement.for_entity === 'Edit') {
        task.entity = editMap.get(task.entity_id)
        if (!task.entity) return
        task.entity_type_id = task.entity_id
      } else {
        // unknown for_entity: the task will be dropped by the
        // childrenById guard below
        task.entity_type_id = taskTypeElement.for_entity
      }
      if (task.entity?.canceled) {
        return
      }
      // out of the planning, but its row tells how many wait for dates
      const rawStartDate =
        mode.value === 'real' ? task.real_start_date : task.start_date
      if (!rawStartDate) {
        countTask(nbUndatedTasksByType, task)
        return
      }
      const taskStartDate = parseDate(rawStartDate)
      if (taskStartDate.isAfter(endDate.value)) {
        countTask(nbTasksOutOfRangeByType, task)
        return
      }

      if (!tasksByType[task.entity_type_id]) {
        tasksByType[task.entity_type_id] = {}
      }

      if (!task.assignees.length) {
        task.assignees = ['unassigned']
      }

      let placed = false
      task.assignees.forEach(assigneeId => {
        const entityTypeItem = childrenById.get(task.entity_type_id)
        if (!entityTypeItem) return

        // populate task with start and end dates
        task.startDate = taskStartDate

        let taskEndDate
        if (mode.value === 'real') {
          taskEndDate = task.done_date ? parseDate(task.done_date) : moment.tz()
        } else if (task.due_date) {
          taskEndDate = parseDate(task.due_date)
        } else if (task.end_date) {
          taskEndDate = parseDate(task.end_date)
        } else if (task.estimation) {
          taskEndDate = addBusinessDays(
            task.startDate,
            Math.ceil(minutesToDays(organisation.value, task.estimation)) - 1,
            daysOffByPerson.value[assigneeId]
          )
        }
        if (!taskEndDate || taskEndDate.isBefore(taskStartDate)) {
          const nbDays = taskStartDate.isoWeekday() === 5 ? 3 : 1
          taskEndDate = taskStartDate.clone().add(nbDays, 'days')
        }
        if (taskEndDate.isBefore(startDate.value)) {
          return
        }
        task.endDate = taskEndDate

        // the row encloses the tasks it shows, not the ones left out
        if (taskStartDate.isBefore(entityTypeItem.startDate)) {
          entityTypeItem.startDate = taskStartDate.clone()
        }
        if (taskEndDate.isAfter(entityTypeItem.endDate)) {
          entityTypeItem.endDate = taskEndDate.clone()
        }

        if (!tasksByType[task.entity_type_id][assigneeId]) {
          tasksByType[task.entity_type_id][assigneeId] = []
          people[assigneeId] =
            assigneeId !== 'unassigned'
              ? {
                  ...personMap.value.get(assigneeId),
                  daysOff: daysOffByPerson.value[assigneeId]
                }
              : {
                  id: assigneeId,
                  avatar: false,
                  color: '#888',
                  full_name: t('main.unassigned')
                }
        }

        task.editable = !isLockedSchedule.value
        task.unresizable = false
        task.parentElement = entityTypeItem

        tasksByType[task.entity_type_id][assigneeId].push(task)
        placed = true
      })
      if (!placed) countTask(nbTasksOutOfRangeByType, task)
    })

    if (taskTypeElement.for_entity === 'Asset') {
      // drop the asset type rows with no asset in the current scope (the
      // main pack keeps only the asset types with an episode-less asset)
      const scopedAssetTypeIds = isMainPack.value
        ? new Set(
            [...assetMap.values()]
              .filter(asset => assetInScope(asset))
              .map(asset => asset.asset_type_id)
          )
        : null
      // filtering following custom asset types workflow
      children = children.filter(item => {
        const assetType = assetTypeMap.value.get(item.object_id)
        return (
          assetType &&
          (!assetType.task_types.length ||
            assetType.task_types.includes(taskTypeElement.task_type_id)) &&
          (!scopedAssetTypeIds || scopedAssetTypeIds.has(item.object_id))
        )
      })
    } else if (
      ['Shot', 'Sequence'].includes(taskTypeElement.for_entity) &&
      currentEpisodeId.value
    ) {
      // keep only the sequences of the current episode
      children = children.filter(item => {
        const sequence = sequenceMap.get(item.object_id)
        return sequence && sequence.episode_id === currentEpisodeId.value
      })
    } else if (
      taskTypeElement.for_entity === 'Edit' &&
      currentEpisodeId.value
    ) {
      // keep only the edits of the current episode
      children = children.filter(item => {
        const edit = editMap.get(item.object_id)
        return edit && edit.episode_id === currentEpisodeId.value
      })
    }

    // sort grouped tasks
    const sortEntitiesByUserName = ([keyA], [keyB]) => {
      if (keyA === 'unassigned') return 1
      if (keyB === 'unassigned') return -1
      return people[keyA].full_name.localeCompare(people[keyB].full_name)
    }
    const sortTasksByEntityName = (a, b) =>
      a.entity?.name.localeCompare(b.entity?.name, undefined, {
        numeric: true
      })
    children.forEach(child => {
      const items = tasksByType[child.object_id] || {}
      const sortedChildren = new Map(
        Object.entries(items)
          .sort(sortEntitiesByUserName)
          .map(([key, tasks]) => [key, tasks.sort(sortTasksByEntityName)])
      )

      child.children = sortedChildren
      child.nbUndatedTasks = nbUndatedTasksByType[child.object_id] || 0
      child.nbTasksOutOfRange = nbTasksOutOfRangeByType[child.object_id] || 0
    })

    taskTypeElement.children = sortByName(children)
    taskTypeElement.people = people

    // group all assigned entities by type
    taskTypeElement.entitiesByType = Object.fromEntries(
      Object.entries(tasksByType).map(([entityTypeId, byAssignee]) => [
        entityTypeId,
        Object.entries(byAssignee)
          .flatMap(([assignee, items]) =>
            assignee !== 'unassigned'
              ? items.map(item => item.entity_id)
              : undefined
          )
          .filter(Boolean)
      ])
    )
  } catch (err) {
    console.error(err)
    taskTypeElement.children = []
    taskTypeElement.people = {}
  } finally {
    taskTypeElement.loading = false
  }
  return rawTasks
}

const filteredAssignments = items => {
  return assignments.value.assigned
    ? items
    : items.filter(item => !item.assigned)
}

const saveTaskChanged = task => {
  return isVersioned.value
    ? store.dispatch(
        'updateScheduleVersionedTask',
        getVersionedTaskUpdate(task)
      )
    : store.dispatch('updateTask', getTaskUpdate(task))
}

const onScheduleItemChanged = async item => {
  const affected = item.type === 'Task' ? [] : movedSubItems(item)
  if (affected.length) {
    pendingParentChange.value = { item, affected }
    modals.value.confirmChildMove = true
    return
  }
  await saveChangedItem(item)
}

const saveChangedItem = async item => {
  if (item.type === 'Task') {
    // update dates with weekends and days off
    const daysOff = item.assignees
      .flatMap(assigneeId => daysOffByPerson.value[assigneeId])
      .filter(Boolean)
    item.startDate = addBusinessDays(item.startDate, 0, daysOff)
    item.endDate = addBusinessDays(
      item.startDate,
      Math.ceil(minutesToDays(organisation.value, item.estimation)) - 1,
      daysOff
    )
    await Promise.all([widenScheduleItemParents(item), saveTaskChanged(item)])
    return
  }

  const parentSaves = []
  if (item.startDate && item.endDate && item.parentElement) {
    if (currentEpisodeId.value || isMainPack.value) {
      // the view only holds the rows of one episode, while the task
      // type bar spans the production: they can widen it, not shrink it
      parentSaves.push(widenScheduleItemParents(item))
    } else {
      item.parentElement.startDate = getMinDate(
        item.parentElement,
        endDate.value
      )
      item.parentElement.endDate = getMaxDate(
        item.parentElement,
        startDate.value
      )
      parentSaves.push(updateScheduleItem(item.parentElement))
    }
  }

  await Promise.all([...parentSaves, updateScheduleItem(item)])
}

// save each widened bar once, with both its dates
const widenScheduleItemParents = item =>
  Promise.all(widenParents(item).map(updateScheduleItem))

const updateScheduleItem = async item => {
  refreshRawDates(item)
  if (!isVersioned.value) {
    await store.dispatch('saveScheduleItem', item)
  }
}

const saveMovedElement = element =>
  element.type === 'Task'
    ? saveChangedItem(element)
    : updateScheduleItem(element)

// a thousand tasks at once would flood the browser's connection pool
const SAVE_BATCH_SIZE = 10

const confirmChildMove = async () => {
  if (childMoveProgress.value !== null) return
  const { item, affected } = pendingParentChange.value
  const elements = [item, ...affected]
  childMoveProgress.value = 0
  try {
    for (let start = 0; start < elements.length; start += SAVE_BATCH_SIZE) {
      const batch = elements.slice(start, start + SAVE_BATCH_SIZE)
      await Promise.all(batch.map(saveMovedElement))
      childMoveProgress.value = Math.round(
        ((start + batch.length) / elements.length) * 100
      )
    }
  } finally {
    childMoveProgress.value = null
    pendingParentChange.value = null
    modals.value.confirmChildMove = false
  }
}

const cancelChildMove = () => {
  if (childMoveProgress.value !== null) return
  const { item, affected } = pendingParentChange.value
  item.startDate = item._dragOrigStartDate.clone()
  item.endDate = item._dragOrigEndDate.clone()
  if (item._dragOrigEstimation !== undefined) {
    item.estimation = item._dragOrigEstimation
  }
  affected.forEach(child => {
    child.startDate = child._dragOrigStartDate.clone()
    child.endDate = child._dragOrigEndDate.clone()
  })
  pendingParentChange.value = null
  modals.value.confirmChildMove = false
}

const isInDepartment = taskType =>
  isCurrentUserManager.value ||
  (isCurrentUserSupervisor.value &&
    (!user.value.departments.length ||
      user.value.departments.includes(taskType?.department_id)))

const scrollScheduleToToday = () => {
  scheduleRef.value?.scrollToToday()
}

const resetSidePanel = () => {
  assignments.value = {
    ...assignments.value,
    entityExcludes: [],
    entityTypeId: '',
    entityTypes: null,
    excludes: [],
    forcedDailyQuota: null,
    isError: false,
    loading: false,
    nbPlannedTasks: 0,
    nbUnfitTasks: 0,
    progress: null,
    saving: false,
    startDate: null,
    endDate: null,
    task: {},
    type: null,
    unassign: false
  }
}

const clearAssignmentMessages = () => {
  assignments.value.isError = false
  assignments.value.nbPlannedTasks = 0
  assignments.value.nbUnfitTasks = 0
}

const toggleSidePanel = () => {
  // the task form leaves out everyone but the assignees of the task and
  // turns Override on: the assign mode starts afresh, on the same task type
  if (isSidePanelOpen.value && assignments.value.type === 'task') {
    resetSidePanel()
    isSidePanelOpen.value = false
  }

  isSidePanelOpen.value = !isSidePanelOpen.value

  // expanding a row selects it, and Expand all or the export expand the
  // filtered out rows too: the panel would open on a row out of sight
  if (
    isSidePanelOpen.value &&
    !filteredScheduleItems.value.includes(selectedTaskType.value)
  ) {
    selectedTaskType.value = null
  }

  if (
    isSidePanelOpen.value &&
    assignments.value.type !== 'task' &&
    !assignments.value.entityTypes &&
    selectedTaskType.value
  ) {
    selectTaskTypeElement(selectedTaskType.value)
  }
}

const selectParentElement = element => {
  if (!element.expanded) {
    expandTaskTypeElement(element, () => {
      scheduleRef.value?.refreshItemPositions(element)
    })
  } else {
    selectTaskTypeElement(element)
  }
}

const onSelectTaskType = taskTypeId => {
  clearAssignmentMessages()
  selectedTaskType.value = scheduleItems.value.find(
    item => item.task_type_id === taskTypeId
  )
  refreshTaskTypeElement(selectedTaskType.value)
}

const selectTaskTypeElement = async (
  taskType,
  selectedEntityType = undefined,
  resetAssignments = true,
  preloadedTasks = null
) => {
  // No assignment panel on the production-wide planning.
  if (isAllEpisodes.value) {
    return
  }

  const generation = scheduleGeneration
  selectedTaskType.value = taskType

  if (resetAssignments) {
    resetSidePanel()
  }

  assignments.value.loading = true

  // when called from expandTaskTypeElement, the tasks and entities were
  // just loaded: reuse them instead of refetching everything
  const tasks =
    preloadedTasks ??
    (await store.dispatch(
      'loadTasks',
      buildTaskFilters(selectedTaskType.value)
    ))
  if (isStaleSchedule(generation)) return
  if (!preloadedTasks) {
    await loadEntities(taskType.for_entity)
    if (isStaleSchedule(generation)) return
  }
  const taskEntityIds = new Set(tasks.map(task => task.entity_id))

  // load entity types
  if (taskType.for_entity === 'Asset') {
    assignments.value.entityTypes = productionAssetTypes.value
      .filter(assetType => {
        // filtering following custom asset types workflow
        return (
          !assetType.task_types.length ||
          assetType.task_types.includes(taskType.task_type_id)
        )
      })
      .map(assetType => {
        return {
          id: assetType.id,
          name: assetType.name,
          for_entity: taskType.for_entity,
          expanded: assetType.id === selectedEntityType?.object_id,
          entity_type_id: assetType.id,
          children: assetStore.cache.assets
            .filter(
              asset =>
                asset.asset_type_id === assetType.id &&
                !asset.canceled &&
                !asset.shared &&
                assetInScope(asset) &&
                taskEntityIds.has(asset.id)
            )
            .map(asset => ({
              ...asset,
              assigned: taskType.entitiesByType[assetType.id]?.includes(
                asset.id
              )
            }))
        }
      })
  } else if (taskType.for_entity === 'Shot') {
    const shotsBySequence = shotStore.cache.shots
      .filter(shot => taskEntityIds.has(shot.id))
      .reduce((acc, shot) => {
        if (!acc[shot.parent_id]) {
          acc[shot.parent_id] = []
        }
        shot.assigned = taskType.entitiesByType[shot.parent_id]?.includes(
          shot.id
        )
        acc[shot.parent_id].push(shot)
        return acc
      }, {})

    assignments.value.entityTypes = Object.keys(shotsBySequence).map(
      sequenceId => {
        const shots = shotsBySequence[sequenceId]
        return {
          id: sequenceId,
          name: shots[0].sequence_name,
          for_entity: taskType.for_entity,
          children: shots
        }
      }
    )
  } else if (taskType.for_entity === 'Sequence') {
    // sequences are the assignable entities, grouped by episode
    const sequencesByEpisode = [...sequenceStore.cache.sequenceMap.values()]
      .filter(
        sequence =>
          !sequence.canceled &&
          (!currentEpisodeId.value ||
            sequence.episode_id === currentEpisodeId.value) &&
          taskEntityIds.has(sequence.id)
      )
      .reduce((acc, sequence) => {
        const groupId = sequence.episode_id || taskType.for_entity
        if (!acc[groupId]) {
          acc[groupId] = []
        }
        sequence.assigned = taskType.entitiesByType?.[sequence.id]?.includes(
          sequence.id
        )
        acc[groupId].push(sequence)
        return acc
      }, {})

    assignments.value.entityTypes = Object.keys(sequencesByEpisode).map(
      groupId => {
        const sequences = sequencesByEpisode[groupId]
        return {
          id: groupId,
          name: sequences[0].episode_name || currentProduction.value.name,
          for_entity: taskType.for_entity,
          children: sequences
        }
      }
    )
  } else if (taskType.for_entity === 'Episode') {
    // episodes are the assignable entities, under a single production group
    const episodes = [...episodeStore.cache.episodeMap.values()]
      .filter(
        episode =>
          !episode.canceled &&
          !['all', 'main'].includes(episode.id) &&
          (!currentEpisodeId.value || episode.id === currentEpisodeId.value) &&
          taskEntityIds.has(episode.id)
      )
      .map(episode => ({
        ...episode,
        assigned: taskType.entitiesByType?.[episode.id]?.includes(episode.id)
      }))

    assignments.value.entityTypes = [
      {
        id: taskType.for_entity,
        name: currentProduction.value.name,
        for_entity: taskType.for_entity,
        children: episodes
      }
    ]
  } else if (taskType.for_entity === 'Edit') {
    // edits are the assignable entities, grouped by episode
    const editsByEpisode = [...editStore.cache.editMap.values()]
      .filter(
        edit =>
          !edit.canceled &&
          (!currentEpisodeId.value ||
            edit.episode_id === currentEpisodeId.value) &&
          taskEntityIds.has(edit.id)
      )
      .reduce((acc, edit) => {
        const groupId = edit.episode_id || taskType.for_entity
        if (!acc[groupId]) {
          acc[groupId] = []
        }
        edit.assigned = taskType.entitiesByType?.[edit.id]?.includes(edit.id)
        acc[groupId].push(edit)
        return acc
      }, {})

    assignments.value.entityTypes = Object.keys(editsByEpisode).map(groupId => {
      const edits = editsByEpisode[groupId]
      return {
        id: groupId,
        name: edits[0].episode_name || currentProduction.value.name,
        for_entity: taskType.for_entity,
        children: edits
      }
    })
  }

  // keep the group in use, else open on the row the schedule selected
  if (assignments.value.type !== 'task') {
    const groups = assignments.value.entityTypes ?? []
    const groupId = groups.some(
      group => group.id === assignments.value.entityTypeId
    )
      ? assignments.value.entityTypeId
      : (groups.find(group => group.id === selectedEntityType?.object_id)?.id ??
        '')
    if (groupId !== assignments.value.entityTypeId) {
      onSelectEntityGroup(groupId)
    }
  }
  assignments.value.loading = false
}

// the "schedule its tasks" button of an empty row: the batch form on
// that task type, with the row as the group
const onPlanEntity = (taskType, entityRow) => {
  if (assignments.value.type === 'task') resetSidePanel()
  isSidePanelOpen.value = true
  selectTaskTypeElement(taskType, entityRow)
}

// a click outside the bars or a multi-selection ends a task edit: the
// batch form stays, it is independent from the schedule selection
const onTaskUnselected = () => {
  if (assignments.value.type === 'task') closeSidePanel()
}

const selectTaskElement = (taskType, entityTypeRow, task, selection) => {
  if (selection.length !== 1) {
    onTaskUnselected()
    return
  }

  resetSidePanel()

  isSidePanelOpen.value = true
  selectedTaskType.value = taskType
  taskEntities.value = [{ ...entityTypeRow, children: [{ ...task.entity }] }]

  assignments.value.type = 'task'

  const start_date = taskType.start_date
  const end_date = parseDate(start_date).isAfter(taskType.end_date)
    ? start_date
    : taskType.end_date
  assignments.value.startDate = start_date
  assignments.value.endDate = end_date
  assignments.value.task = {
    ...task,
    // rounded like any estimation shown: the 0.01 steps of the field
    // refused more decimals, which blocked Apply
    estimation: formatDuration(task.estimation, false),
    estimationMinutes: task.estimation,
    startDate: task.startDate.format('YYYY-MM-DD'),
    endDate: task.endDate.format('YYYY-MM-DD')
  }
  assignments.value.excludes = team.value
    .filter(person => !task.assignees.includes(person.id))
    .map(person => person.id)
  assignments.value.unassign = true
}

// Left as shown, the rounded estimation keeps the minutes it stands for,
// even when they round to 0.
const getTaskEstimation = ({ estimation, estimationMinutes }) =>
  estimation === formatDuration(estimationMinutes, false)
    ? estimationMinutes
    : durationToMinutes(organisation.value, estimation)

const closeSidePanel = () => {
  isSidePanelOpen.value = false
  resetSidePanel()
}

// explicit close (close button, task cancel): also drop the schedule
// selection, or the bar keeps its ring and its resize handles swallow
// the next click. closeSidePanel alone must not do it: it also runs
// when a multi-selection starts and would clear it.
const unselectAndCloseSidePanel = () => {
  scheduleRef.value?.resetSelection()
  closeSidePanel()
}

// Escape leaves a task edit, like a modal; the batch form stays, it
// holds a selection worth keeping
const onKeydown = event => {
  if (!isFreeEscape(event) || assignments.value.type !== 'task') return
  unselectAndCloseSidePanel()
}

const onSelectEntityGroup = groupId => {
  clearAssignmentMessages()
  assignments.value.entityTypeId = groupId
  assignments.value.entityExcludes = []
  assignments.value.type = groupId ? 'entity' : null
  if (groupId) {
    // the bar of the group once its row is loaded, else the task type bar
    const row = selectedTaskType.value
    const bar = row.children?.find(child => child.object_id === groupId) ?? row
    assignments.value.startDate = bar.startDate.format('YYYY-MM-DD')
    assignments.value.endDate = bar.endDate.format('YYYY-MM-DD')
  }
}

const removeEntity = entity => {
  assignments.value.entityExcludes.push(entity.id)
}

const removeFromAssignments = person => {
  assignments.value.excludes.push(person.id)
}

const submitAssignments = () => {
  // Enter in a field submits the form while the Apply button spins
  if (assignments.value.saving) return
  if (assignments.value.type === 'entity') {
    saveAssignments()
  } else if (assignments.value.type === 'task') {
    saveTask()
  }
}

const saveAssignments = async () => {
  // the panel can move on to a task during the run: report to the one
  // that started it
  const panel = assignments.value
  panel.saving = true
  panel.progress = 0
  clearAssignmentMessages()
  // the bar shows under the Apply button, at the bottom of a panel that
  // scrolls
  await nextTick()
  sidePanelRef.value?.scrollTo?.({
    top: sidePanelRef.value.scrollHeight,
    behavior: 'smooth'
  })
  try {
    const { nbPlannedTasks, nbUnfitTasks } = await distributeAssignments(
      progress => {
        panel.progress = progress
      }
    )
    panel.nbPlannedTasks = nbPlannedTasks
    panel.nbUnfitTasks = nbUnfitTasks
  } catch (err) {
    console.error(err)
    panel.isError = true
  } finally {
    panel.saving = false
    panel.progress = null
  }
}

// onProgress gets the percentage of the tasks saved so far
const distributeAssignments = async onProgress => {
  const tasks = await store.dispatch(
    'loadTasks',
    buildTaskFilters(selectedTaskType.value)
  )
  // first task per entity, preserving the find() first-match behavior
  const taskByEntityId = new Map()
  tasks.forEach(task => {
    if (!taskByEntityId.has(task.entity_id)) {
      taskByEntityId.set(task.entity_id, task)
    }
  })

  const nbTasks = draggedEntities.value
    .flatMap(entityType => entityType.children)
    .filter(entity => taskByEntityId.has(entity.id)).length
  let nbSavedTasks = 0
  const reportSaved = nbSaved => {
    nbSavedTasks += nbSaved
    onProgress(nbTasks ? Math.round((nbSavedTasks / nbTasks) * 100) : 100)
  }

  // a zero or empty quota would make taskEstimation infinite and hang
  // the distribution loop in addBusinessDays: no task fits
  const dailyQuota =
    parseFloat(assignments.value.forcedDailyQuota) || estimatedDailyQuota.value
  if (dailyQuota <= 0) {
    return { nbPlannedTasks: 0, nbUnfitTasks: nbTasks }
  }
  const taskEstimation = 1 / dailyQuota

  // versioned tasks all belong to the selected task type: load them once
  // instead of once per entity
  let versionedTaskByTaskId = null
  if (isVersioned.value) {
    const versionedTasks = await store.dispatch(
      'loadTasksFromScheduleVersion',
      {
        version: { id: version.value },
        taskType: { id: selectedTaskType.value.task_type_id }
      }
    )
    versionedTaskByTaskId = new Map(
      versionedTasks.map(versionedTask => [
        versionedTask.task_id,
        versionedTask
      ])
    )
  }

  let nbPlannedTasks = 0
  let nbUnfitTasks = 0

  // assign each selected entity to each selected assignee
  for (const taskType of draggedEntities.value) {
    const rangeStartDate = parseDate(assignments.value.startDate)
    const rangeEndDate = parseDate(assignments.value.endDate)

    // accumulated during the distribution loop, flushed as one
    // clear-assignation request plus one assign request per assignee
    const taskIdsToUnassign = []
    const taskIdsByAssignee = new Map()
    const taskUpdates = []

    let cumulatedTasks = 0
    let nextAssigneeIndex = 0
    let nextStartDate = rangeStartDate.clone()

    // distribute the task assignments according to the daily quotas, the task type duration and people's availability.
    const entityTasks = taskType.children
      .map(entity => taskByEntityId.get(entity.id))
      .filter(Boolean)
    for (const task of entityTasks) {
      let versionedTask
      if (isVersioned.value) {
        versionedTask = versionedTaskByTaskId.get(task.id) ?? {
          taskId: task.id,
          version: version.value,
          assignees: []
        }
        task.versionedTaskId = versionedTask.id
      }

      cumulatedTasks++

      let taskStartDate = nextStartDate
      let taskEndDate = null
      while (nextAssigneeIndex < availablePersons.value.length) {
        const taskAssignee = availablePersons.value[nextAssigneeIndex]
        // round off the float noise: 1 / (1 / 49) is 49.00000000000001,
        // which would end a task of whole days a day late
        const cumulatedEstimation =
          Math.round(cumulatedTasks * taskEstimation * 1e6) / 1e6

        taskStartDate = addBusinessDays(
          taskStartDate,
          0,
          daysOffByPerson.value[taskAssignee.id]
        )

        const { due_date } = getDatesFromStartDate(
          organisation.value,
          rangeStartDate,
          taskEndDate,
          cumulatedEstimation,
          daysOffByPerson.value[taskAssignee.id]
        )
        taskEndDate = parseDate(due_date)

        if (taskEndDate.isAfter(rangeEndDate)) {
          // try to assign the task to the next available person
          nextAssigneeIndex++
          cumulatedTasks = 1
          taskStartDate = rangeStartDate.clone()
          taskEndDate = null
        } else {
          // override once the task fits: one that fits nobody keeps its
          // assignees
          if (assignments.value.unassign) {
            if (isVersioned.value) {
              versionedTask.assignees = []
            } else {
              taskIdsToUnassign.push(task.id)
            }
          }
          if (isVersioned.value) {
            versionedTask.startDate = taskStartDate.format('YYYY-MM-DD')
            versionedTask.dueDate = taskEndDate.format('YYYY-MM-DD')
            versionedTask.estimation = daysToMinutes(
              organisation.value,
              taskEstimation
            )
            versionedTask.assignees.push(taskAssignee.id)

            // save versioned task
            if (!versionedTask.id) {
              const createdTask = await store.dispatch(
                'createScheduleVersionedTask',
                versionedTask
              )
              // keep the created id: without it the task edits right
              // after an assignment would post duplicates
              versionedTask.id = createdTask.id
              task.versionedTaskId = createdTask.id
            } else {
              await store.dispatch('updateScheduleVersionedTask', versionedTask)
            }
            reportSaved(1)
          } else {
            // assignation to the current assignee is batched after the loop
            if (!taskIdsByAssignee.has(taskAssignee.id)) {
              taskIdsByAssignee.set(taskAssignee.id, [])
            }
            taskIdsByAssignee.get(taskAssignee.id).push(task.id)
            // task dates & estimation are flushed in batches after the loop
            taskUpdates.push({
              taskId: task.id,
              data: {
                estimation: daysToMinutes(organisation.value, taskEstimation),
                start_date: taskStartDate.format('YYYY-MM-DD'),
                due_date: taskEndDate.format('YYYY-MM-DD')
              }
            })
          }
          // set next start date
          if (cumulatedEstimation % 1 !== 0) {
            nextStartDate = taskEndDate.clone()
          } else {
            nextStartDate = taskEndDate.clone().add(1, 'days')
          }
          break // jump to next task
        }
      }
      // the loop ran out of people: the task fits nobody's range
      if (nextAssigneeIndex === availablePersons.value.length) {
        nbUnfitTasks++
      }
    }

    nbPlannedTasks += taskUpdates.length
    // Chunks of 5 keep the server load reasonable; a bulk endpoint in
    // zou would replace this.
    for (let i = 0; i < taskUpdates.length; i += 5) {
      const chunk = taskUpdates.slice(i, i + 5)
      await Promise.all(
        chunk.map(update => store.dispatch('updateTask', update))
      )
      reportSaved(chunk.length)
    }

    // unassign first so batched assignations are not cleared right after
    if (taskIdsToUnassign.length > 0) {
      await store.dispatch('unassignSelectedTasks', {
        taskIds: taskIdsToUnassign
      })
    }
    // Sequence the per-assignee requests instead of firing them at once.
    for (const [personId, taskIds] of taskIdsByAssignee) {
      await store.dispatch('assignSelectedTasks', { personId, taskIds })
    }

    refreshTaskTypeElement(selectedTaskType.value)
  }

  return { nbPlannedTasks, nbUnfitTasks }
}

const saveTask = async () => {
  // the panel can move on to another task during the save: report to the
  // one that started it
  const panel = assignments.value
  panel.saving = true
  clearAssignmentMessages()
  try {
    const task = {
      ...assignments.value.task,
      startDate: parseDate(assignments.value.task.startDate),
      endDate: parseDate(assignments.value.task.endDate),
      estimation: getTaskEstimation(assignments.value.task),
      assignees: availablePersons.value.map(person => person.id)
    }
    // update task and assignments
    await onScheduleItemChanged(task)
    if (!isVersioned.value) {
      // One task update carrying the full assignee list replaces the
      // unassign request plus one assign request per person.
      await store.dispatch('updateTask', {
        taskId: task.id,
        data: { assignees: task.assignees }
      })
    }
    // refresh task in side panel
    panel.task.startDate = task.startDate.format('YYYY-MM-DD')
    panel.task.endDate = task.endDate.format('YYYY-MM-DD')
    panel.task.estimationMinutes = task.estimation
    refreshTaskTypeElement(selectedTaskType.value)
  } catch (err) {
    console.error(err)
    panel.isError = true
  } finally {
    panel.saving = false
  }
}

const onScheduleExpandAll = async () => {
  if (loading.value.expandSchedule) return

  const generation = scheduleGeneration
  loading.value.expandSchedule = true
  if (!expandAll.value) {
    await expandAllScheduleItems()
  } else {
    collapseAllScheduleItems()
  }
  // Stopped by a production or episode change: the rows shown now are
  // collapsed.
  if (!isStaleSchedule(generation)) expandAll.value = !expandAll.value
  loading.value.expandSchedule = false
}

const onScheduleItemAssigned = async (task, personId) => {
  task.assignees.push(personId)
  task.parentElement.children.get(personId).push(task)

  if (isVersioned.value) {
    return store.dispatch('updateScheduleVersionedTask', {
      id: task.versionedTaskId,
      assignees: task.assignees
    })
  } else {
    await store.dispatch('assignSelectedTasks', {
      personId,
      taskIds: [task.id]
    })
  }
}

const onScheduleItemUnassigned = async (task, personId) => {
  task.assignees = task.assignees.filter(id => id !== personId)
  const tasks = task.parentElement.children.get(personId)
  // guard: splice(-1, 1) on a miss would silently drop another task's bar
  const taskIndex = tasks?.indexOf(task) ?? -1
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1)
  }

  if (isVersioned.value) {
    return store.dispatch('updateScheduleVersionedTask', {
      id: task.versionedTaskId,
      assignees: task.assignees
    })
  } else if (personId !== 'unassigned') {
    // 'unassigned' is a local placeholder, not a person known to the API
    await store.dispatch('unassignPersonFromTask', {
      person: { id: personId },
      task
    })
  }
}

const onZoomLevelChanged = zoom => {
  updateRoute({ zoom })
  saveFilterPreferences()
}

const onEntityTypeChanged = type => {
  updateRoute({ type })
  saveFilterPreferences()
  // the side panel would keep planning a task type no longer displayed
  if (
    selectedTaskType.value &&
    !filteredScheduleItems.value.includes(selectedTaskType.value)
  ) {
    closeSidePanel()
  }
}

const onTaskTypeVisibilityChanged = ({ key, value }) => {
  hiddenTaskTypeIds.value = setTaskTypeVisibility(
    hiddenTaskTypeIds.value,
    key,
    value
  )
  updateRoute({
    hiddenTypes: formatHiddenTaskTypeIds(hiddenTaskTypeIds.value)
  })
  saveFilterPreferences()

  if (!value) {
    // a hidden row leaves the schedule with its tasks still selected: the
    // next drag would move them out of sight
    scheduleRef.value?.resetSelection()
    // the side panel would keep editing a task type no longer displayed
    if (selectedTaskType.value?.task_type_id === key) {
      closeSidePanel()
    }
  }
}

// the mode and the version both decide what is editable and reload the rows
const onScopeChanged = change => {
  updateRoute(change)
  refreshScheduleItemsEditable()
  closeSidePanel()
  refreshSchedule()
}

const onModeChanged = mode => onScopeChanged({ mode })

const onVersionChanged = version => onScopeChanged({ version })

const refreshSchedule = () => {
  // scopedScheduleItems, not scheduleItems: under the main pack only the
  // Asset rows are in scope, and drilling an Edit / Shot / Sequence /
  // Episode row would forward episode_id=main to an endpoint that rejects
  // it. Same array reference in every other mode.
  scopedScheduleItems.value
    .filter(item => item.expanded)
    .forEach(refreshTaskTypeElement)
}

// reload the rows of an expanded task type, the side panel kept as is
const refreshTaskTypeElement = item =>
  expandTaskTypeElement(
    item,
    () => {
      scheduleRef.value?.refreshItemPositions(item)
    },
    true,
    false
  )

const openEditScheduleVersion = (scheduleVersion = {}) => {
  scheduleVersionToEdit.value = scheduleVersion
  modals.value.editScheduleVersion = true
}

const openDeleteScheduleVersion = versionId => {
  scheduleVersionToEdit.value = scheduleVersions.value.find(
    ({ id }) => id === versionId
  )
  modals.value.deleteScheduleVersion = true
}

// run a version action behind its modal: the modal shows the spinner and
// the error, and closes once the action is done. Whether it succeeded.
const runVersionAction = async (key, action) => {
  loading.value[key] = true
  errors.value[key] = false
  try {
    await action()
    modals.value[key] = false
    return true
  } catch (err) {
    console.error(err)
    errors.value[key] = true
    return false
  } finally {
    loading.value[key] = false
  }
}

const editVersion = async scheduleVersion => {
  const done = await runVersionAction('editScheduleVersion', async () => {
    if (!scheduleVersion.id) {
      const newVersion = await store.dispatch('createScheduleVersion', {
        production: currentProduction.value,
        version: scheduleVersion
      })
      version.value = newVersion.id
      onVersionChanged(version.value)
    } else {
      await store.dispatch('updateScheduleVersion', scheduleVersion)
    }
  })
  if (done) scheduleVersionToEdit.value = {}
}

const deleteVersion = async scheduleVersion => {
  const done = await runVersionAction('deleteScheduleVersion', async () => {
    await store.dispatch('deleteScheduleVersion', scheduleVersion)
    if (version.value === scheduleVersion.id) {
      version.value = DEFAULT_VERSION
      onVersionChanged(version.value)
    }
  })
  if (done) scheduleVersionToEdit.value = {}
}

const applyToProduction = async () => {
  const isApplied = await runVersionAction('applyScheduleVersion', () =>
    store.dispatch('applyScheduleVersionToProduction', version.value)
  )
  // refresh version list
  await store.dispatch('loadScheduleVersions', currentProduction.value)
  if (isApplied) {
    // the applied version is locked now: rebuild the rows built while it
    // was open, the expanded ones included, read-only
    unselectAndCloseSidePanel()
    refreshScheduleItemsEditable()
    refreshSchedule()
  }
}

const expandAllScheduleItems = async () => {
  const generation = scheduleGeneration
  // scopedScheduleItems keeps the main pack to its in-scope Asset rows:
  // drilling an out-of-scope row would forward episode_id=main to an
  // endpoint that rejects it. Same array reference in every other mode.
  // run sequentially to avoid overloading the server
  for (const element of scopedScheduleItems.value) {
    if (isStaleSchedule(generation)) return
    if (!element.expanded) {
      await expandTaskTypeElement(
        element,
        () => {
          scheduleRef.value?.refreshItemPositions(element)
        },
        true,
        false
      )
    }
  }
}

const collapseAllScheduleItems = () => {
  scheduleItems.value.forEach(element => {
    element.expanded = false
  })
}

// The rows load behind the scenes, collapsed: the planning stays as it is
// and the modal reports the progress. Cancel stops between two rows.
const exportSchedule = async () => {
  if (exportProgress.value !== null) return
  const generation = scheduleGeneration
  const rows = filteredScheduleItems.value.filter(row => !row.expanded)
  const loadRows = isAllEpisodes.value ? loadEpisodeRows : loadTaskTypeRows
  exportCancelled = false
  exportProgress.value = 0
  errors.value.exportSchedule = false

  try {
    for (const [index, row] of rows.entries()) {
      if (exportCancelled || isStaleSchedule(generation)) return
      await loadRows(row)
      exportProgress.value = Math.round(((index + 1) / rows.length) * 100)
    }
    if (exportCancelled || isStaleSchedule(generation)) return
    await buildExportFile()
    modals.value.exportSchedule = false
  } catch (err) {
    console.error(err)
    errors.value.exportSchedule = true
  } finally {
    exportProgress.value = null
  }
}

const cancelExport = () => {
  exportCancelled = true
  modals.value.exportSchedule = false
}

const buildExportFile = async () => {
  const data = scheduleRef.value?.exportData()

  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(t('schedule.title'))

  // init header
  const header = ['', 'Task Type', 'Entity', 'Assignee', 'Description']
  const dates = data.header.map(item => item.format('YYYY-MM-DD'))
  const headerRow = sheet.addRow([...header, ...dates])

  headerRow.font = { bold: true }
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDDDDD' } // grey light
    }
    cell.border = {
      bottom: { style: 'thin' }
    }
  })
  const datesColumn = header.length + 1

  // level 1: Task Types
  let startRowLevel1 = 2
  let endRowLevel1 = null
  data.hierarchy.forEach(item => {
    endRowLevel1 = startRowLevel1

    // ExcelJS expects 8-digit ARGB values, 6-digit hex shifts the
    // channels and renders wrong colors
    const lightened = colors.lightenColor(item.color, 0.2).hex()
    const color = `FF${item.color.slice(1)}`.toUpperCase()
    const color2 = `FF${lightened.slice(1)}`.toUpperCase()

    const row = sheet.addRow([null, item.name])
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color }
    }
    row.getCell(2).alignment = { vertical: 'top' }
    row.getCell(2).note = `${item.name}\n${item.start_date} - ${item.end_date}`
    row.height = 30

    // fill timebar
    const start = dates.indexOf(item.start_date)
    const end = dates.indexOf(item.end_date)
    for (let i = start; i > -1 && i <= end; i++) {
      const cell = row.getCell(5 + i)
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      }
    }

    endRowLevel1++

    // level 2: Entity Types
    let startRowLevel2 = endRowLevel1
    let endRowLevel2 = null
    item.children.forEach(type => {
      endRowLevel2 = startRowLevel2

      const row = sheet.addRow([null, null, type.name, ''])
      row.getCell(3).alignment = { vertical: 'top' }
      row.getCell(3).note =
        `${type.name}\n${type.start_date} - ${type.end_date}`

      // fill timebar
      const start = dates.indexOf(type.start_date)
      const end = dates.indexOf(type.end_date)
      for (let i = start; i > -1 && i <= end; i++) {
        const cell = row.getCell(datesColumn + i)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color2 }
        }
      }

      endRowLevel1++
      endRowLevel2++

      // level 3: Persons
      let startRowLevel3 = endRowLevel2
      let endRowLevel3 = null
      type.children.forEach((tasks, assigneeId) => {
        endRowLevel3 = startRowLevel3
        const isAssigned = assigneeId !== 'unassigned'

        const assignee = isAssigned
          ? personMap.value.get(assigneeId)
          : {
              id: assigneeId,
              avatar: false,
              color: '#888',
              full_name: t('main.unassigned')
            }

        const row = sheet.addRow([
          null,
          null,
          null,
          assignee.full_name,
          isAssigned ? t('days_off.title') : null
        ])
        row.getCell(4).alignment = { vertical: 'top' }
        row.getCell(5).alignment = { vertical: 'middle' }

        // fill days off
        const daysOff = getDayOffRange(daysOffByPerson.value[assigneeId])
        daysOff.forEach(dayOff => {
          const index = dates.findIndex(date => date === dayOff.date)
          if (index !== -1) {
            const cell = row.getCell(datesColumn + index)
            cell.note = `${t('days_off.title')}\n${dayOff.description}`
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFAAAAAA' } // grey dark
            }
          }
        })

        endRowLevel1++
        endRowLevel2++
        endRowLevel3++

        // level 4: Tasks
        tasks.forEach(task => {
          const duration =
            mode.value === 'real'
              ? formatDuration(task.duration)
              : formatDuration(task.estimation)

          const row = sheet.addRow([
            null,
            null,
            null,
            null,
            `${task.entity.name} (${duration}${durationUnit.value})`
          ])

          // fill task timebar
          const start_date = task.startDate.format('YYYY-MM-DD')
          const end_date = task.endDate.format('YYYY-MM-DD')
          const startIndex = dates.indexOf(start_date)
          const endIndex = dates.indexOf(end_date)
          for (let i = startIndex; i > -1 && i <= endIndex; i++) {
            const cell = row.getCell(datesColumn + i)
            cell.note = `${task.entity.name}\n${start_date} - ${end_date}\n${duration} ${durationUnit.value}`
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: color }
            }
          }

          endRowLevel1++
          endRowLevel2++
          endRowLevel3++
        })

        // group cells of level 3
        sheet.mergeCells(startRowLevel3, 4, endRowLevel3 - 1, 4)

        startRowLevel3 = endRowLevel3
      })

      // group cells of level 2
      sheet.mergeCells(startRowLevel2, 3, endRowLevel2 - 1, 3)

      startRowLevel2 = endRowLevel2
    })

    // group cells of level 1
    sheet.mergeCells(startRowLevel1, 1, endRowLevel1 - 1, 1)
    sheet.mergeCells(startRowLevel1, 2, endRowLevel1 - 1, 2)

    // stylize borders
    sheet.getRow(endRowLevel1 - 1).border = {
      bottom: {
        style: 'medium',
        color: { argb: color }
      }
    }

    startRowLevel1 = endRowLevel1
  })

  // customize columns size
  sheet.getColumn(1).width = 5
  for (let i = 0; i < dates.length; i++) {
    sheet.getColumn(header.length + 1 + i).width = 10
  }
  const ajustColumnWidth = (columnIndex, minWidth = 10, maxWidth = 100) => {
    const column = sheet.getColumn(columnIndex)
    let maxLength = minWidth
    column.eachCell({ includeEmpty: false }, cell => {
      const cellValue = cell.value ? cell.value.toString() : ''
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length
      }
    })
    column.width = Math.min(maxLength, maxWidth)
  }
  ajustColumnWidth(2) // task type
  ajustColumnWidth(3) // entity
  ajustColumnWidth(4) // assignee
  ajustColumnWidth(5) // description

  // generate an XLSX file
  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `Kitsu - ${currentProduction.value.name} - ${t('schedule.title')}`
  const modeLabel = modeOptions.value.find(
    ({ value }) => value === mode.value
  )?.label
  const versionLabel = versionOptions.value.find(
    ({ value }) => value === version.value
  )?.label
  const release = isVersioned.value
    ? `${modeLabel} - ${versionLabel}`
    : modeLabel
  downloadBlob(new Blob([buffer]), `${filename} (${release}).xlsx`)
}

// Watchers
// --------------------------------------------------------------------------

// a picked range date moves the schedule and, once the production has
// one, its own date
const watchRangeDate = (selectedDate, rangeDate, field) =>
  watch(selectedDate, () => {
    rangeDate.value = parseDate(selectedDate.value)
    const date = rangeDate.value.format('YYYY-MM-DD')
    if (
      currentProduction.value[field] &&
      currentProduction.value[field] !== date
    ) {
      store.dispatch('editProduction', {
        id: currentProduction.value.id,
        [field]: date
      })
    }
  })

watchRangeDate(selectedStartDate, startDate, 'start_date')
watchRangeDate(selectedEndDate, endDate, 'end_date')

watch(currentProduction, value => {
  if (!value) return
  reset()
})

watch(currentEpisode, value => {
  if (!value) return
  if (isTVShow.value) reset()
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  reset()
})

onBeforeUnmount(() => {
  scheduleGeneration++
  window.removeEventListener('keydown', onKeydown)
  if (resetTimeout.value) clearTimeout(resetTimeout.value)
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() => {
    const context =
      isTVShow.value && currentEpisode.value?.name
        ? `${currentProduction.value.name} | ${currentEpisode.value.name}`
        : currentProduction.value.name
    return `${context} | ${t('schedule.title')} - Kitsu`
  })
})
</script>

<style lang="scss" scoped>
.dark .schedule-toolbar {
  color: var(--text);
}

.schedule-toolbar {
  background: var(--background-panel);
  border-radius: 12px;
  margin-bottom: 1em;
  padding: 0.5em 1em 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  // Every control sits on the row bottom at the select height: the date
  // inputs (40px), the options combo (39.6px plus 1px of margin), the
  // buttons (32px) and the zoom number box (35px around a 42px select)
  // each deviate on their own, and so do their label margins.
  :deep(.label) {
    margin-bottom: 5px;
    padding-top: 0;
  }

  :deep(.combo) {
    align-items: center;
    display: inline-flex;
    height: 42px;
    margin-top: 0;
  }

  :deep(.button) {
    height: 42px;
  }

  .zoom-level :deep(.control),
  .zoom-level :deep(.select) {
    height: 42px;
  }
}

// #app .dp--input sets the height globally; the id outranks the scope
#app .schedule-toolbar :deep(.dp--input) {
  height: 42px;
}

// the picker's dark input (#26292f) vanishes on the #25282e panel
.dark .schedule-toolbar :deep(.dp--input) {
  background: var(--background);
}

.toolbar-row {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  row-gap: 0.5em;

  & + & {
    margin-top: 0.75em;
  }

  > :last-child {
    margin-right: 0;
  }
}

.fixed-page {
  padding: 1em;
  // the 60px topbar, then the same 1em as the sides
  padding-top: calc(60px + 1em);
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}

.side-column {
  margin-top: 0;
  padding: 0 0 0 1em;

  .side {
    background: var(--background-panel);
    border-radius: 12px;
    height: 100%;
    overflow-y: auto;
    padding: 1em;
  }

  .side-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1em;

    h2 {
      border: none;
      color: var(--text-strong);
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      margin: 0;
      text-transform: capitalize;
    }
  }

  .close-button {
    color: var(--text);
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }

  .details {
    display: flex;
    align-items: flex-end;
    gap: 0.5em;

    > :first-child {
      flex: 1;
      margin-bottom: 0;
    }

    :deep(.button) {
      height: 42px;
    }
  }

  .side-help {
    color: var(--text);
    font-size: 0.9em;
    line-height: 1.4;
    margin: 0.75em 0 1em;

    &.override-help {
      margin: 0.25em 0 1em 0.5em;
    }
  }
}

// the page background App.vue gives every side column
.dark .side-column {
  background: transparent;
}

.assignments {
  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text);
    font-size: 0.8em;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin: 1em 0 0.4em;
    text-transform: uppercase;

    .reset-list {
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
  }

  // same height for the entities and the assignees, whatever their count
  .side-list {
    height: 150px;
    overflow-y: auto;
    // --border is the dark panel background itself, invisible on the panel
    border: 1px solid var(--border-alt);
    border-radius: 10px;
    list-style-type: none;
    margin: 0;
    padding: 0.4em;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--background-block);
      border-radius: 10px;
      color: var(--text-strong);
      padding: 0.3em 0.4em 0.3em 0.75em;

      & + li {
        margin-top: 0.3em;
      }

      &.empty {
        background: none;
        color: var(--text);
        justify-content: center;
        padding: 1em;
      }

      .name {
        flex: 1;
      }

      // shown on demand: fainter than the entities still to plan
      &.assigned {
        background: transparent;
        border: 1px dashed var(--border-alt);
        color: var(--text);
      }

      .assigned-icon {
        color: $green;
        flex: none;
        margin-right: 0.6em;
      }
    }

    .person {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .quota {
    margin-top: 1.5em;
  }

  .daily-quotas {
    width: 80px;
  }
  .reset-quotas {
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }

  .estimation {
    :deep(.input) {
      font-size: 1rem;
      padding: 0 1rem;
      width: 90px;
    }
  }
}
</style>
