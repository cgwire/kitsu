<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="flexrow project-dates">
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
        <combobox
          class="flexrow-item ml1"
          :label="$t('schedule.mode')"
          v-model="mode"
          :options="modeOptions"
          @update:model-value="onModeChanged"
        />
        <div class="flexrow-item ml1" v-if="mode === 'prev'">
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
        <div class="filler"></div>
        <div class="flexrow" style="margin-top: 23px">
          <button-simple
            class="flexrow-item"
            :disabled="loading.exportSchedule || loading.expandSchedule"
            icon="export"
            :is-loading="loading.exportSchedule"
            :title="$t('schedule.export')"
            @click="exportSchedule()"
          />
          <button-simple
            class="flexrow-item"
            :disabled="version === 'ref'"
            icon="save"
            :text="$t('schedule.apply_to_prod')"
            @click="modals.applyScheduleVersion = true"
            v-if="!isTVShow && mode === 'prev'"
          />
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
            :text="$t('menu.assign_tasks')"
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
        @item-drop="onScheduleItemDropped"
        @item-selected="selectTaskTypeElement"
        @item-unassign="onScheduleItemUnassigned"
        @root-element-expanded="expandTaskTypeElement"
        @root-element-selected="selectParentElement"
        @task-selected="selectTaskElement"
        @task-unselected="closeSidePanel()"
      />
    </div>

    <div
      class="column side-column"
      v-if="isSidePanelOpen && !isLockedSchedule && !isAllEpisodes"
    >
      <div class="side">
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
        <h2 class="mt1">
          {{
            assignments.type === 'task'
              ? $t('schedule.edit_task')
              : $t('menu.assign_tasks')
          }}
        </h2>
        <div class="details">
          <combobox-task-type
            class="mb05"
            add-placeholder
            :placeholder="$t('schedule.select_task_type')"
            :label="$t('news.task_type')"
            :task-type-list="availableTaskTypes"
            :model-value="selectedTaskType?.task_type_id"
            @update:model-value="onSelectTaskType"
          />
          <button-simple
            class="mt2 mb05"
            icon="user-check"
            :is-on="assignments.assigned"
            :title="$t('schedule.show_assigned')"
            @click="assignments.assigned = !assignments.assigned"
            v-if="
              !assignments.loading &&
              assignments.entityTypes?.length &&
              !assignments.type
            "
          />
        </div>
        <div class="mt2" v-if="assignments.loading">
          <spinner class="mauto" :size="20" />
        </div>
        <ul class="assignments parent mt1" v-else-if="!assignments.type">
          <li
            :key="entityType.id"
            v-for="entityType in assignments.entityTypes"
          >
            <div
              class="assignment-item"
              draggable="true"
              role="button"
              tabindex="0"
              @dragstart="
                onAssignmentItemDragStart($event, entityType, selectedTaskType)
              "
              @click="onAssignmentItemSelected(entityType)"
              @keydown.enter.prevent="onAssignmentItemSelected(entityType)"
            >
              <grip-vertical-icon class="icon" />
              <span class="name">
                {{ entityType.name }}
                ({{ filteredAssignments(entityType.children).length }})
              </span>
              <span
                class="expand"
                role="button"
                tabindex="0"
                @click.stop="entityType.expanded = !entityType.expanded"
                @keydown.enter.stop.prevent="
                  entityType.expanded = !entityType.expanded
                "
                @keydown.space.stop.prevent="
                  entityType.expanded = !entityType.expanded
                "
              >
                <chevron-right-icon v-if="!entityType.expanded" />
                <chevron-down-icon v-else />
              </span>
            </div>
            <ul class="assignments children" v-if="entityType.expanded">
              <li
                :key="child.id"
                v-for="child in filteredAssignments(entityType.children)"
              >
                <div
                  class="assignment-item"
                  draggable="true"
                  role="button"
                  tabindex="0"
                  @dragstart="
                    onAssignmentItemDragStart(
                      $event,
                      { ...entityType, children: [child] },
                      selectedTaskType
                    )
                  "
                  @click="
                    onAssignmentItemSelected({
                      ...entityType,
                      children: [child]
                    })
                  "
                  @keydown.enter.prevent="
                    onAssignmentItemSelected({
                      ...entityType,
                      children: [child]
                    })
                  "
                >
                  <grip-vertical-icon class="icon" />
                  <span class="name">{{ child.name }}</span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
        <div class="assignments mt1" v-else>
          <form class="mt1" @submit.prevent="submitAssignments()">
            <div class="flexrow">
              <div class="flexrow-item">
                <date-field
                  :can-delete="false"
                  :disabled="assignments.type !== 'entity'"
                  :label="$t('main.start_date')"
                  utc
                  v-model="assignments.startDate"
                />
              </div>
              <div class="flexrow-item">
                <date-field
                  :can-delete="false"
                  :disabled="assignments.type !== 'entity'"
                  :label="$t('main.end_date')"
                  utc
                  v-model="assignments.endDate"
                />
              </div>
            </div>
            <div :key="item.id" v-for="item in draggedEntities">
              <div
                class="dragged-type"
                :style="{
                  background: selectedTaskType.color
                }"
              >
                {{ item.name }}
              </div>
              <div v-if="!item.children.length">
                {{ $t('schedule.no_entity') }}
              </div>
              <ul class="dragged-items" v-else>
                <li
                  class="dragged-item"
                  :key="child.id"
                  :style="{
                    background: `color-mix(in srgb, ${selectedTaskType.color} 40%, transparent)`,
                    'border-left': `4px solid ${selectedTaskType.color}`
                  }"
                  v-for="child in item.children"
                >
                  {{ item.name }} / {{ child.name }}
                </li>
              </ul>
              <hr />
            </div>
            <table class="assignees">
              <thead>
                <tr>
                  <td>
                    {{ $t('schedule.assign') }}
                    <a
                      class="reset-assignees"
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
                  </td>
                </tr>
              </thead>
              <tbody v-if="!availablePersons.length">
                <tr>
                  <td class="has-text-centered">
                    {{ $t('schedule.no_assignee') }}
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr :key="person.id" v-for="person in availablePersons">
                  <td class="assignee">
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
                  </td>
                </tr>
              </tbody>
            </table>
            <checkbox
              class="pa05"
              :disabled="!availablePersons.length"
              :label="$t('schedule.force_unassign')"
              :toggle="true"
              v-model="assignments.unassign"
              v-if="assignments.type === 'entity'"
            />
            <div class="flexrow mt2" v-if="assignments.type === 'entity'">
              <label class="mr05">
                {{ $t('schedule.forced_daily_quotas') }}
              </label>
              <text-field
                class="mb0 daily-quotas"
                input-class=" is-small"
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
            <div class="mt2" v-if="assignments.type === 'entity'">
              {{ $t('schedule.estimated_daily_quotas') }}
              {{ estimatedDailyQuota.toFixed(2) }}
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
            <div class="mt2 has-text-right">
              <template v-if="assignments.type === 'entity'">
                <button-simple
                  :disabled="!hasDraggedEntities || !availablePersons.length"
                  :is-loading="assignments.saving"
                  is-primary
                  :text="$t('main.apply')"
                  type="submit"
                />
                <button
                  class="button is-link ml05"
                  :disabled="assignments.saving"
                  :text="$t('main.back')"
                  type="button"
                  @click="assignments.type = null"
                >
                  {{ $t('main.back') }}
                </button>
              </template>
              <template v-if="assignments.type === 'task'">
                <button-simple
                  :disabled="!assignments.task.estimation"
                  :is-loading="assignments.saving"
                  is-primary
                  :text="$t('main.apply')"
                  type="submit"
                />
                <button
                  class="button is-link ml05"
                  @click="unselectAndCloseSidePanel()"
                >
                  {{ $t('main.cancel') }}
                </button>
              </template>
            </div>
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
    :is-loading="loading.delete"
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
    :text="
      $t('schedule.confirm_move_children', {
        count: pendingParentChange ? pendingParentChange.affected.length : 0
      })
    "
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
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  ListRestartIcon,
  TrashIcon,
  XIcon
} from 'lucide-vue-next'
import moment from 'moment-timezone'
import { firstBy } from 'thenby'
import {
  computed,
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
import { getTaskTypeSchedulePath } from '@/lib/path'
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
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Schedule from '@/components/widgets/Schedule.vue'
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
const assignments = ref({
  assigned: false,
  entityTypes: null,
  excludes: [],
  forcedDailyQuota: null,
  isError: false,
  loading: false,
  nbUnfitTasks: 0,
  saving: false,
  startDate: null,
  endDate: null,
  task: {},
  type: null,
  unassign: false
})
const availableTaskTypes = ref([])
const daysOffByPerson = ref({})
const daysOffRangeKey = ref(null)
const draggedEntities = ref([])
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
const loading = ref({
  schedule: false,
  delete: false,
  editScheduleVersion: false,
  applyScheduleVersion: false,
  expandSchedule: false,
  exportSchedule: false
})
const errors = ref({
  editScheduleVersion: false,
  deleteScheduleVersion: false,
  applyScheduleVersion: false
})
const modals = ref({
  editScheduleVersion: false,
  deleteScheduleVersion: false,
  applyScheduleVersion: false,
  confirmChildMove: false
})
const pendingParentChange = ref(null)
const scheduleRef = useTemplateRef('schedule')

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
  const types = new Set()
  scopedScheduleItems.value.forEach(item => {
    const taskType = taskTypeMap.value.get(item.task_type_id)
    if (taskType?.for_entity) {
      types.add(taskType.for_entity)
    }
  })
  return Array.from(types).sort()
})

const entityTypeOptions = computed(() => {
  const options = [{ label: t('main.all'), value: null }]
  availableEntityTypes.value.forEach(type => {
    options.push({ label: type, value: type })
  })
  return options
})

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

// Functions
// --------------------------------------------------------------------------

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
  availableTaskTypes.value = []

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

    availableTaskTypes.value = scopedScheduleItems.value.map(item => ({
      ...taskTypeMap.value.get(item.task_type_id),
      name: item.name
    }))
  } catch (err) {
    console.error(err)
  } finally {
    if (currentProduction.value?.id === production.id) {
      loading.value.schedule = false
    }
  }
}

const reset = () => {
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

  const queryMode = route.query.mode
  const queryType = route.query.type
  const queryVersion = route.query.version
  const queryZoom = Number(route.query.zoom)
  const queryHiddenTypes = route.query.hiddenTypes

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
    const scheduleItem = {
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
    return scheduleItem
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

// Whether an asset falls in the current scope: for the main pack, only the
// assets attached to no episode (source_id null); otherwise the assetMap is
// already scoped and every asset it holds belongs.
const assetInScope = asset => {
  return !isMainPack.value || !asset.source_id
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

    if (refreshScheduleCallBack) {
      refreshScheduleCallBack(taskTypeElement)
    }
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
    // unversioned task list shared with the side panel to avoid a reload
    let rawTasks = null
    try {
      taskTypeElement.loading = true

      selectedTaskType.value = taskTypeElement
      assignments.value.loading = resetAssignments

      taskTypeElement.children = []
      taskTypeElement.people = {}
      taskTypeElement.entitiesByType = {}

      // one row per asset type (Asset), sequence (Shot/Sequence),
      // episode (Episode) or edit (Edit)
      const scheduleItemLoaders = {
        Asset: payload => store.dispatch('loadAssetTypeScheduleItems', payload),
        Shot: payload => store.dispatch('loadSequenceScheduleItems', payload),
        Sequence: payload =>
          store.dispatch('loadSequenceScheduleItems', payload),
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

      let children = convertScheduleItems(taskTypeElement, entityRows)
      const childrenById = new Map(
        children.map(child => [child.object_id, child])
      )

      // load entities (scoped to the current episode for TV shows) that
      // back the row grouping, the entity name and the episode filter
      if (taskTypeElement.for_entity === 'Asset') {
        await loadScopedAssets()
      } else if (taskTypeElement.for_entity === 'Shot') {
        await store.dispatch('loadShots')
      } else if (taskTypeElement.for_entity === 'Sequence') {
        await store.dispatch('loadSequences')
      } else if (taskTypeElement.for_entity === 'Episode') {
        await store.dispatch('loadEpisodes')
      } else if (taskTypeElement.for_entity === 'Edit') {
        await store.dispatch('loadEdits')
      }

      let tasks = await store.dispatch(
        'loadTasks',
        buildTaskFilters(taskTypeElement)
      )
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
        tasks = tasks
          .map(task => {
            const versioned = versionedTaskMap.get(task.id)
            if (!versioned?.start_date) {
              return null
            }
            return {
              ...task,
              versionedTaskId: versioned.id,
              start_date: versioned.start_date,
              due_date: versioned.due_date,
              estimation: versioned.estimation,
              assignees: versioned.assignees
            }
          })
          .filter(Boolean)
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
      tasks.forEach(task => {
        if (!task.start_date) {
          return
        }

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

        if (!tasksByType[task.entity_type_id]) {
          tasksByType[task.entity_type_id] = {}
        }

        if (!task.assignees.length) {
          task.assignees = ['unassigned']
        }

        task.assignees.forEach(assigneeId => {
          const entityTypeItem = childrenById.get(task.entity_type_id)
          if (!entityTypeItem) return

          // populate task with start and end dates

          let taskStartDate
          if (mode.value === 'real') {
            if (!task.real_start_date) {
              return
            }
            taskStartDate = parseDate(task.real_start_date)
          } else {
            taskStartDate = parseDate(task.start_date)
          }
          if (taskStartDate.isAfter(endDate.value)) {
            return
          }
          if (taskStartDate.isBefore(entityTypeItem.startDate)) {
            entityTypeItem.startDate = taskStartDate.clone()
          }
          task.startDate = taskStartDate

          let taskEndDate
          if (mode.value === 'real') {
            taskEndDate = task.done_date
              ? parseDate(task.done_date)
              : moment.tz()
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
          if (taskEndDate.isAfter(entityTypeItem.endDate)) {
            entityTypeItem.endDate = taskEndDate.clone()
          }
          task.endDate = taskEndDate

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
        })
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

    if (refreshScheduleCallBack) {
      refreshScheduleCallBack(taskTypeElement)
    }

    selectTaskTypeElement(taskTypeElement, null, resetAssignments, rawTasks)
  }
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
    widenScheduleItemParents(item)
    await saveTaskChanged(item)
    return
  }

  if (item.startDate && item.endDate && item.parentElement) {
    if (currentEpisodeId.value || isMainPack.value) {
      // the view only holds the rows of one episode, while the task
      // type bar spans the production: they can widen it, not shrink it
      widenScheduleItemParents(item)
    } else {
      item.parentElement.startDate = getMinDate(
        item.parentElement,
        endDate.value
      )
      item.parentElement.endDate = getMaxDate(
        item.parentElement,
        startDate.value
      )
      updateScheduleItem(item.parentElement)
    }
  } else if (!item.parentElement) {
    if (!Array.isArray(item.children)) {
      await updateScheduleItem(item)
      return
    }
    const affected = item.children.filter(
      child =>
        child._dragOrigStartDate &&
        child._dragOrigEndDate &&
        (!child.startDate.isSame(child._dragOrigStartDate) ||
          !child.endDate.isSame(child._dragOrigEndDate))
    )
    if (!affected.length) {
      await updateScheduleItem(item)
      return
    }
    pendingParentChange.value = { item, affected }
    modals.value.confirmChildMove = true
    return
  }

  await updateScheduleItem(item)
}

// save each widened bar once, with both its dates
const widenScheduleItemParents = item => {
  widenParents(item).forEach(parent => {
    updateScheduleItem(parent)
  })
}

const updateScheduleItem = async item => {
  refreshRawDates(item)
  if (!isVersioned.value) {
    await store.dispatch('saveScheduleItem', item)
  }
}

const confirmChildMove = async () => {
  const { item, affected } = pendingParentChange.value
  try {
    await Promise.all(
      [item, ...affected].map(element => updateScheduleItem(element))
    )
  } finally {
    pendingParentChange.value = null
    modals.value.confirmChildMove = false
  }
}

const cancelChildMove = () => {
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

const isInDepartment = taskType => {
  if (isCurrentUserManager.value) {
    return true
  } else if (isCurrentUserSupervisor.value) {
    if (user.value.departments.length === 0) {
      return true
    } else {
      return (
        taskType?.department_id &&
        user.value.departments.includes(taskType.department_id)
      )
    }
  } else {
    return false
  }
}

const scrollScheduleToToday = () => {
  scheduleRef.value?.scrollToToday()
}

const resetSidePanel = () => {
  assignments.value = {
    ...assignments.value,
    entityTypes: null,
    excludes: [],
    forcedDailyQuota: null,
    isError: false,
    loading: false,
    nbUnfitTasks: 0,
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
  assignments.value.nbUnfitTasks = 0
}

const toggleSidePanel = () => {
  if (isSidePanelOpen.value && assignments.value.type === 'task') {
    assignments.value.type = null
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
  // clear the filters hiding the selected row, or the expand below would
  // fill the panel while the schedule shows nothing
  const query = {}
  if (
    entityType.value &&
    selectedTaskType.value &&
    selectedTaskType.value.for_entity !== entityType.value
  ) {
    entityType.value = null
    query.type = null
  }
  if (hiddenTaskTypeIds.value.includes(taskTypeId)) {
    hiddenTaskTypeIds.value = setTaskTypeVisibility(
      hiddenTaskTypeIds.value,
      taskTypeId,
      true
    )
    query.hiddenTypes = formatHiddenTaskTypeIds(hiddenTaskTypeIds.value)
  }
  updateRoute(query)
  // refresh schedule
  expandTaskTypeElement(
    selectedTaskType.value,
    () => {
      scheduleRef.value?.refreshItemPositions(selectedTaskType.value)
    },
    true,
    false
  )
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
  const taskEntityIds = new Set(tasks.map(task => task.entity_id))

  // load entity types
  if (taskType.for_entity === 'Asset') {
    if (!preloadedTasks) {
      await loadScopedAssets()
    }

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
    if (!preloadedTasks) {
      await store.dispatch('loadShots')
    }

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
          expanded: sequenceId === selectedEntityType?.object_id,
          children: shots
        }
      }
    )
  } else if (taskType.for_entity === 'Sequence') {
    if (!preloadedTasks) {
      await store.dispatch('loadSequences')
    }

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
          expanded: groupId === selectedEntityType?.object_id,
          children: sequences
        }
      }
    )
  } else if (taskType.for_entity === 'Episode') {
    if (!preloadedTasks) {
      await store.dispatch('loadEpisodes')
    }

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
        expanded: true,
        children: episodes
      }
    ]
  } else if (taskType.for_entity === 'Edit') {
    if (!preloadedTasks) {
      await store.dispatch('loadEdits')
    }

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
        expanded: groupId === selectedEntityType?.object_id,
        children: edits
      }
    })
  }
  assignments.value.loading = false
}

const selectTaskElement = (taskType, entityTypeRow, task, selection) => {
  if (selection.length !== 1) {
    closeSidePanel()
    return
  }

  resetSidePanel()

  isSidePanelOpen.value = true
  selectedTaskType.value = taskType
  draggedEntities.value = [{ ...entityTypeRow, children: [{ ...task.entity }] }]

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

// Left as shown, the rounded estimation keeps the minutes it stands for.
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

const onAssignmentItemSelected = item => {
  const today = getUserDay().toDate()
  assignments.value.type = 'entity'
  assignments.value.startDate = item.start_date || today
  assignments.value.endDate = item.end_date || today

  // copy: filtering item.children in place permanently dropped the
  // assigned entities from the side panel list
  draggedEntities.value = [
    { ...item, children: filteredAssignments(item.children) }
  ]
  clearAssignmentMessages()
}

const onAssignmentItemDragStart = (event, item, type) => {
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData(`task-type-${type.task_type_id}`, true) // use for hack on drag over (must be lowercase)
  event.dataTransfer.setData('taskTypeId', type.task_type_id)
  event.dataTransfer.setData('entityId', item.id)

  draggedEntities.value = [
    { ...item, children: filteredAssignments(item.children) }
  ]
}

const onScheduleItemDropped = (event, item) => {
  clearAssignmentMessages()
  assignments.value.type = 'entity'
  const start_date = event.start_date || item.start_date
  const end_date = parseDate(start_date).isAfter(item.end_date)
    ? start_date
    : item.end_date
  assignments.value.startDate = start_date
  assignments.value.endDate = end_date
}

const removeFromAssignments = person => {
  assignments.value.excludes.push(person.id)
}

const submitAssignments = () => {
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
  clearAssignmentMessages()
  try {
    panel.nbUnfitTasks = await distributeAssignments()
  } catch (err) {
    console.error(err)
    panel.isError = true
  } finally {
    panel.saving = false
  }
}

const distributeAssignments = async () => {
  // load tasks
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

  // a zero or empty quota would make taskEstimation infinite and hang
  // the distribution loop in addBusinessDays: no task fits
  const dailyQuota =
    parseFloat(assignments.value.forcedDailyQuota) || estimatedDailyQuota.value
  if (dailyQuota <= 0) {
    return draggedEntities.value
      .flatMap(entityType => entityType.children)
      .filter(entity => taskByEntityId.has(entity.id)).length
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
    for (const entity of taskType.children) {
      const task = taskByEntityId.get(entity.id)
      if (!task) {
        continue // no task found for this entity
      }

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

    // Chunks of 5 keep the server load reasonable; a bulk endpoint in
    // zou would replace this.
    for (let i = 0; i < taskUpdates.length; i += 5) {
      await Promise.all(
        taskUpdates
          .slice(i, i + 5)
          .map(update => store.dispatch('updateTask', update))
      )
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

    // refresh schedule
    expandTaskTypeElement(
      selectedTaskType.value,
      () => {
        scheduleRef.value?.refreshItemPositions(selectedTaskType.value)
      },
      true,
      false
    )
  }

  return nbUnfitTasks
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
    // refresh schedule
    expandTaskTypeElement(
      selectedTaskType.value,
      () => {
        scheduleRef.value?.refreshItemPositions(selectedTaskType.value)
      },
      true,
      false
    )
  } catch (err) {
    console.error(err)
    // Assign tasks can switch the same panel to the assign mode meanwhile
    if (panel.type === 'task') panel.isError = true
  } finally {
    panel.saving = false
  }
}

const onScheduleExpandAll = async () => {
  if (loading.value.expandSchedule) return

  loading.value.expandSchedule = true
  if (!expandAll.value) {
    await expandAllScheduleItems()
  } else {
    collapseAllScheduleItems()
  }
  expandAll.value = !expandAll.value
  loading.value.expandSchedule = false
}

const onScheduleItemAssigned = async (task, personId) => {
  // update task to refresh the schedule
  task.assignees.push(personId)
  task.parentElement.children.get(personId).push(task)

  // save change
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
  // update task to refresh the schedule
  task.assignees = task.assignees.filter(id => id !== personId)
  const tasks = task.parentElement.children.get(personId)
  // guard: splice(-1, 1) on a miss would silently drop another task's bar
  const taskIndex = tasks?.indexOf(task) ?? -1
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1)
  }

  // save change
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
}

const onEntityTypeChanged = type => {
  updateRoute({ type })
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

const onModeChanged = newMode => {
  updateRoute({ mode: newMode })
  refreshScheduleItemsEditable()
  closeSidePanel()
  refreshSchedule()
}

const onVersionChanged = versionId => {
  updateRoute({ version: versionId })
  refreshScheduleItemsEditable()
  closeSidePanel()
  refreshSchedule()
}

const refreshSchedule = () => {
  // scopedScheduleItems, not scheduleItems: under the main pack only the
  // Asset rows are in scope, and drilling an Edit / Shot / Sequence /
  // Episode row would forward episode_id=main to an endpoint that rejects
  // it. Same array reference in every other mode.
  scopedScheduleItems.value.forEach(item => {
    if (!item.expanded) {
      return
    }
    // refresh schedule
    expandTaskTypeElement(
      item,
      () => {
        scheduleRef.value?.refreshItemPositions(item)
      },
      true,
      false
    )
  })
}

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

const editVersion = async scheduleVersion => {
  loading.value.editScheduleVersion = true
  errors.value.editScheduleVersion = false
  try {
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
    modals.value.editScheduleVersion = false
    scheduleVersionToEdit.value = {}
  } catch (err) {
    console.error(err)
    errors.value.editScheduleVersion = true
  } finally {
    loading.value.editScheduleVersion = false
  }
}

const deleteVersion = async scheduleVersion => {
  loading.value.delete = true
  errors.value.deleteScheduleVersion = false
  try {
    await store.dispatch('deleteScheduleVersion', scheduleVersion)
    if (version.value === scheduleVersion.id) {
      version.value = DEFAULT_VERSION
      onVersionChanged(version.value)
    }
    modals.value.deleteScheduleVersion = false
    scheduleVersionToEdit.value = {}
  } catch (err) {
    console.error(err)
    errors.value.deleteScheduleVersion = true
  } finally {
    loading.value.delete = false
  }
}

const applyToProduction = async () => {
  let isApplied = false
  loading.value.applyScheduleVersion = true
  errors.value.applyScheduleVersion = false
  try {
    await store.dispatch('applyScheduleVersionToProduction', version.value)
    modals.value.applyScheduleVersion = false
    isApplied = true
  } catch (err) {
    console.error(err)
    errors.value.applyScheduleVersion = true
  } finally {
    loading.value.applyScheduleVersion = false
  }
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
  // scopedScheduleItems keeps the main pack to its in-scope Asset rows:
  // drilling an out-of-scope row would forward episode_id=main to an
  // endpoint that rejects it. Same array reference in every other mode.
  // run sequentially to avoid overloading the server
  for (const element of scopedScheduleItems.value) {
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

const exportSchedule = async (withAllRows = true) => {
  loading.value.exportSchedule = true

  try {
    if (withAllRows) {
      await expandAllScheduleItems()
    }

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
      row.getCell(2).note =
        `${item.name}\n${item.start_date} - ${item.end_date}`
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
  } catch (err) {
    console.error(err)
    alert(t('schedule.export_error'))
  } finally {
    loading.value.exportSchedule = false
  }
}

// Watchers
// --------------------------------------------------------------------------

watch(selectedStartDate, () => {
  startDate.value = parseDate(selectedStartDate.value)
  const start_date = startDate.value.format('YYYY-MM-DD')
  if (
    currentProduction.value.start_date &&
    currentProduction.value.start_date !== start_date
  ) {
    store.dispatch('editProduction', {
      id: currentProduction.value.id,
      start_date
    })
  }
})

watch(selectedEndDate, () => {
  endDate.value = parseDate(selectedEndDate.value)
  const end_date = endDate.value.format('YYYY-MM-DD')
  if (
    currentProduction.value.end_date &&
    currentProduction.value.end_date !== end_date
  ) {
    store.dispatch('editProduction', {
      id: currentProduction.value.id,
      end_date
    })
  }
})

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
  reset()
})

onBeforeUnmount(() => {
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
.dark {
  .project-dates {
    color: $white-grey;
    border-bottom: 1px solid $grey;
  }
}

.project-dates {
  border-bottom: 1px solid $white-grey;
  padding-bottom: 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

.fixed-page {
  padding: 1em;
  padding-top: 90px;
  padding-left: 2em;
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}

.zoom-level {
  margin-top: -10px;
}

.ml2 {
  margin-left: 2em;
}

.side-column {
  position: relative;
  top: -30px;
  right: -14px;
  height: calc(100% + 44px);
  margin-top: 0;
  padding: 0 1em 1em 1em;
  background: var(--background-alt);
  min-height: 100%;

  .close-button {
    position: absolute;
    right: 1em;
  }

  .details {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.assignments {
  list-style-type: none;
  margin-left: 0;

  .assignment-item {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-selectable);
    border: 1px solid $grey;
    margin-top: -1px;
    padding: 1em 1em 1em 0.5em;
    cursor: pointer;

    .icon {
      color: $grey;
      margin-right: 0.5em;
      cursor: grab;
    }

    .name {
      flex: 1;
    }

    .expand {
      cursor: pointer;
      opacity: 0.5;
      height: 24px;

      &:hover {
        opacity: 1;
      }
    }
  }

  // odd/event items background
  &.parent {
    $alt-background: color-mix(
      in srgb,
      var(--background-selectable) 70%,
      white 30%
    );
    > li:nth-child(odd) {
      > .assignment-item {
        background: $alt-background;
      }
      .assignments.children {
        > li:nth-child(even) > .assignment-item {
          background: $alt-background;
        }
      }
    }
    > li:nth-child(even) {
      .assignments.children {
        > li:nth-child(odd) > .assignment-item {
          background: $alt-background;
        }
      }
    }
  }

  &.children {
    margin-left: 2em;
  }

  .dragged-type {
    font-size: 12px;
    font-weight: 600;
    padding: 5px;
    margin-bottom: 1em;
    border-radius: 0.2em;
    text-align: center;
  }

  .dragged-items {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
    list-style: none;
    margin: 0;
  }

  .dragged-item {
    padding: 0 0.7em;
    border-radius: 0.2em;
  }

  .assignees {
    .reset-assignees {
      position: absolute;
      right: 1.5em;
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
    td {
      padding: 0.5em;
    }
    tbody {
      background: var(--background);

      tr {
        border: 1px solid var(--border);
      }
    }
    .assignee {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .person {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .daily-quotas {
    width: 50px;
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
