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
        :is-error="errors.schedule"
        clip-children
        is-estimation-linked
        hide-man-days
        :multiline="isAllEpisodes"
        :reassignable="!isLockedSchedule"
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
          @click="toggleSidePanel"
          @keydown.enter.prevent="toggleSidePanel"
          @keydown.space.prevent="toggleSidePanel"
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
                <button class="button is-link ml05" @click="closeSidePanel()">
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
      $t(
        'schedule.confirm_move_children',
        pendingParentChange ? pendingParentChange.affected.length : 0
      )
    "
    @cancel="cancelChildMove"
    @confirm="confirmChildMove"
    v-if="modals.confirmChildMove"
  />
</template>

<script>
/*
 * Page to manage the schedule of the big steps of the production. It allows
 * to set milestones too.
 */

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
import { mapGetters, mapActions } from 'vuex'

import colors from '@/lib/colors'
import { downloadBlob } from '@/lib/download'
import { getTaskTypeSchedulePath } from '@/lib/path'
import {
  sortByName,
  sortPeople,
  sortTaskTypeScheduleItems
} from '@/lib/sorting'
import {
  addBusinessDays,
  daysToMinutes,
  getBusinessDays,
  getDatesFromStartDate,
  getDayOffRange,
  minutesToDays,
  parseDate,
  parseSimpleDate
} from '@/lib/time'

import { formatListMixin } from '@/components/mixins/format'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import DateField from '@/components/widgets/DateField.vue'
import EditScheduleVersionModal from '@/components/modals/EditScheduleVersionModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TextField from '@/components/widgets/TextField.vue'

import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'
import taskTypeStore from '@/store/modules/tasktypes'

export const DEFAULT_MODE = 'prev'
export const DEFAULT_VERSION = 'ref'
export const DEFAULT_ZOOM = 1

export default {
  name: 'production-schedule',

  mixins: [formatListMixin],

  components: {
    ButtonSimple,
    Checkbox,
    ChevronDownIcon,
    ChevronRightIcon,
    Combobox,
    ComboboxNumber,
    ComboboxTaskType,
    ConfirmModal,
    DateField,
    EditScheduleVersionModal,
    GripVerticalIcon,
    HardDeleteModal,
    ListRestartIcon,
    PeopleAvatar,
    PeopleName,
    Schedule,
    Spinner,
    TrashIcon,
    TextField,
    XIcon
  },

  data() {
    return {
      assignments: {
        assigned: false,
        entityTypes: null,
        excludes: [],
        forcedDailyQuota: null,
        loading: false,
        saving: false,
        startDate: null,
        endDate: null,
        task: {},
        type: null,
        unassign: false
      },
      availableTaskTypes: [],
      daysOffByPerson: {},
      draggedEntities: [],
      endDate: moment().add(6, 'months').endOf('day'),
      entityType: null,
      isSidePanelOpen: false,
      resetTimeout: null,
      scheduleItems: [],
      startDate: moment().startOf('day'),
      selectedStartDate: null,
      selectedEndDate: null,
      selectedTaskType: null,
      zoomLevel: DEFAULT_ZOOM,
      zoomOptions: [
        { label: this.$t('main.week'), value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ],
      mode: DEFAULT_MODE,
      modeOptions: [
        { label: this.$t('schedule.mode_prev'), value: 'prev' },
        { label: this.$t('schedule.mode_real'), value: 'real' }
      ],
      scheduleVersionToEdit: {},
      version: DEFAULT_VERSION,
      loading: {
        schedule: false,
        editScheduleVersion: false,
        applyScheduleVersion: false,
        expandSchedule: false,
        exportSchedule: false
      },
      errors: {
        schedule: false,
        editScheduleVersion: false,
        deleteScheduleVersion: false,
        applyScheduleVersion: false
      },
      modals: {
        editScheduleVersion: false,
        deleteScheduleVersion: false,
        applyScheduleVersion: false,
        confirmChildMove: false
      },
      pendingParentChange: null
    }
  },

  mounted() {
    this.reset()
  },

  beforeUnmount() {
    if (this.resetTimeout) clearTimeout(this.resetTimeout)
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isTVShow',
      'organisation',
      'personMap',
      'productionAssetTypes',
      'scheduleVersions',
      'user'
    ]),

    estimatedDailyQuota() {
      const startDate = parseSimpleDate(this.assignments.startDate)
      const endDate = parseSimpleDate(this.assignments.endDate)
      const nbDays = getBusinessDays(startDate, endDate)
      const nbEntities = this.draggedEntities.reduce(
        (sum, entity) => sum + (entity.children?.length ?? 0),
        0
      )
      const nbAssignees = this.availablePersons.length

      return nbDays && nbAssignees ? nbEntities / nbDays / nbAssignees : 0
    },

    assetTypeMap() {
      return assetTypeStore.cache.assetTypeMap
    },

    availablePersons() {
      const taskType = this.taskTypeMap.get(this.selectedTaskType.task_type_id)
      return this.team.filter(
        person =>
          !this.assignments.excludes.includes(person.id) &&
          person.role !== 'client' &&
          (['admin', 'manager'].includes(person.role) ||
            !person.departments.length ||
            person.departments.includes(taskType?.department_id))
      )
    },

    currentVersion() {
      return this.scheduleVersions.find(version => version.id === this.version)
    },

    hasDraggedEntities() {
      return this.draggedEntities.some(entity => entity.children.length)
    },

    isLockedSchedule() {
      return (
        this.mode === 'real' ||
        this.currentVersion?.locked ||
        !this.isCurrentUserManager
      )
    },

    // Concrete episode id for scoping (null for feature films or the 'all'/'main' pseudo-episodes).
    currentEpisodeId() {
      const id = this.currentEpisode?.id
      return this.isTVShow && id && !['all', 'main'].includes(id) ? id : null
    },

    // The 'all' pseudo-episode displays the production-wide planning: one row
    // per episode with its own dates, instead of the per-episode entity /
    // assignee / task tree.
    isAllEpisodes() {
      return this.isTVShow && this.currentEpisode?.id === 'all'
    },

    // The 'main' pseudo-episode scopes the planning to the main pack: the
    // assets attached to no episode.
    isMainPack() {
      return this.isTVShow && this.currentEpisode?.id === 'main'
    },

    // Episode id the drill-down links point at. The main pack is a valid route
    // scope, unlike the schedule-items endpoints which only accept a real
    // episode.
    linkedEpisodeId() {
      return this.isMainPack ? 'main' : this.currentEpisodeId
    },

    taskTypeMap() {
      return taskTypeStore.cache.taskTypeMap
    },

    team() {
      return sortPeople(
        this.currentProduction?.team
          .map(personId => this.personMap.get(personId))
          .filter(person => person && !person.is_bot) ?? []
      )
    },

    isVersioned() {
      return this.mode === 'prev' && this.version !== 'ref'
    },

    versionOptions() {
      const options = this.scheduleVersions
        .filter(version => !version.canceled)
        .sort(firstBy('created_at'))
        .map(version => ({
          label: version.locked
            ? `${version.name} (${this.$t('schedule.versions.locked')})`
            : version.name,
          value: version.id
        }))

      const fromScheduleVersion = this.scheduleVersions.find(
        version =>
          version.id === this.currentProduction.from_schedule_version_id
      )
      const referenceVersion = {
        label: fromScheduleVersion
          ? `${this.$t('schedule.versions.reference')} (${this.$t('schedule.versions.from')} ${fromScheduleVersion.name})`
          : this.$t('schedule.versions.reference'),
        value: DEFAULT_VERSION,
        separator: true
      }

      return [referenceVersion, ...options]
    },

    // Task type rows in scope. The main pack only holds assets: the other
    // entities (shots, sequences, episodes, edits) all belong to an episode.
    scopedScheduleItems() {
      return this.isMainPack
        ? this.scheduleItems.filter(item => item.for_entity === 'Asset')
        : this.scheduleItems
    },

    availableEntityTypes() {
      const types = new Set()
      this.scopedScheduleItems.forEach(item => {
        const taskType = this.taskTypeMap.get(item.task_type_id)
        if (taskType?.for_entity) {
          types.add(taskType.for_entity)
        }
      })
      return Array.from(types).sort()
    },

    entityTypeOptions() {
      const options = [{ label: this.$t('main.all'), value: null }]
      this.availableEntityTypes.forEach(type => {
        options.push({ label: type, value: type })
      })
      return options
    },

    filteredScheduleItems() {
      if (!this.entityType) {
        return this.scopedScheduleItems
      }
      return this.scopedScheduleItems.filter(item => {
        const taskType = this.taskTypeMap.get(item.task_type_id)
        return taskType && taskType.for_entity === this.entityType
      })
    }
  },

  methods: {
    ...mapActions([
      'applyScheduleVersionToProduction',
      'assignSelectedTasks',
      'createScheduleVersion',
      'createScheduleVersionedTask',
      'deleteScheduleVersion',
      'editProduction',
      'loadAssets',
      'loadAssetTypeScheduleItems',
      'loadEdits',
      'loadEditScheduleItems',
      'loadEpisodeScheduleItems',
      'loadEpisodes',
      'loadProductionDaysOff',
      'loadScheduleItems',
      'loadScheduleVersions',
      'loadSequences',
      'loadSequenceScheduleItems',
      'loadShots',
      'loadTasks',
      'loadTasksFromScheduleVersion',
      'saveScheduleItem',
      'unassignPersonFromTask',
      'unassignSelectedTasks',
      'updateScheduleVersion',
      'updateScheduleVersionedTask',
      'updateTask'
    ]),

    updateRoute({ mode, type, version, zoom }) {
      const query = { ...this.$route.query }

      if (mode !== undefined) {
        query.mode = mode || undefined
      }
      if (type !== undefined) {
        query.type = type || undefined
      }
      if (version !== undefined) {
        query.version = version || undefined
      }
      if (zoom !== undefined) {
        query.zoom = String(zoom)
      }

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query })
      }
    },

    async loadData() {
      this.loading.schedule = true
      this.availableTaskTypes = []

      await this.loadScheduleVersions(this.currentProduction)

      return this.loadScheduleItems(this.currentProduction)
        .then(scheduleItems => {
          const scheduleStartDate = parseDate(this.selectedStartDate)
          const scheduleEndDate = parseDate(this.selectedEndDate)
          scheduleItems = scheduleItems.map(item => {
            const taskType = this.taskTypeMap.get(item.task_type_id)
            let startDate, endDate
            if (item.start_date) {
              startDate = parseDate(item.start_date)
            } else {
              startDate = moment()
            }
            if (startDate.isSameOrAfter(scheduleEndDate)) {
              startDate = scheduleEndDate.clone().add(-1, 'days')
            }

            if (startDate.isBefore(scheduleStartDate)) {
              startDate = scheduleStartDate.clone()
            }

            if (item.end_date) {
              endDate = parseDate(item.end_date)
            } else {
              endDate = startDate.clone().add(1, 'days')
            }
            if (endDate.isSameOrAfter(scheduleEndDate)) {
              endDate = scheduleEndDate.clone()
            }

            const path = getTaskTypeSchedulePath(
              taskType.id,
              this.currentProduction.id,
              this.linkedEpisodeId,
              taskType.for_entity
            )

            return {
              ...item,
              color: taskType.color,
              for_entity: taskType.for_entity,
              name: `${taskType.for_entity} / ${taskType.name}`,
              priority: taskType.priority,
              startDate,
              endDate,
              editable: this.isInDepartment(taskType) && !this.isLockedSchedule,
              expanded: false,
              loading: false,
              route: path,
              children: []
            }
          })
          this.scheduleItems = sortTaskTypeScheduleItems(
            scheduleItems,
            this.currentProduction,
            this.taskTypeMap
          )

          this.availableTaskTypes = this.scopedScheduleItems.map(item => ({
            ...this.taskTypeMap.get(item.task_type_id),
            name: item.name
          }))
        })
        .finally(() => {
          this.loading.schedule = false
        })
    },

    reset() {
      // Debounce: cross-prod navigation triggers two close currentEpisode changes (transient 'main' then 'all').
      if (this.resetTimeout) clearTimeout(this.resetTimeout)
      this.resetTimeout = setTimeout(() => {
        this.resetTimeout = null
        this.loadSchedule()
      }, 50)
    },

    async loadSchedule() {
      this.closeSidePanel()

      if (this.currentProduction.start_date) {
        this.startDate = parseDate(this.currentProduction.start_date)
      }
      if (this.currentProduction.end_date) {
        this.endDate = parseDate(this.currentProduction.end_date)
      }
      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()

      await this.loadData()

      const mode = this.$route.query.mode
      const type = this.$route.query.type
      const version = this.$route.query.version
      const zoom = Number(this.$route.query.zoom)

      this.mode = this.modeOptions.map(o => o.value).includes(mode)
        ? mode
        : DEFAULT_MODE
      this.entityType = this.entityTypeOptions.map(o => o.value).includes(type)
        ? type
        : null
      this.version = this.versionOptions.map(o => o.value).includes(version)
        ? version
        : DEFAULT_VERSION
      this.zoomLevel = this.zoomOptions.map(o => o.value).includes(zoom)
        ? zoom
        : DEFAULT_ZOOM
    },

    convertScheduleItems(taskTypeElement, scheduleItems) {
      return scheduleItems.map(item => {
        let startDate
        if (item.start_date) {
          startDate = parseDate(item.start_date)
        } else {
          startDate = moment()
        }
        if (startDate.isBefore(this.startDate)) {
          startDate = this.startDate.clone()
        }
        if (startDate.isAfter(this.endDate)) {
          startDate = this.endDate.clone()
        }
        let endDate
        if (item.end_date) {
          endDate = parseDate(item.end_date)
        } else {
          endDate = startDate.clone().add(1, 'days')
        }
        if (endDate.isBefore(startDate)) {
          endDate = startDate.clone().add(1, 'days')
        }
        if (endDate.isAfter(this.endDate)) {
          endDate = this.endDate.clone()
        }
        const scheduleItem = {
          ...item,
          startDate,
          endDate,
          expanded: false,
          loading: false,
          editable:
            this.isInDepartment(this.taskTypeMap.get(item.task_type_id)) &&
            !this.isLockedSchedule,
          children: [],
          parentElement: taskTypeElement
        }
        return scheduleItem
      })
    },

    buildTaskFilters(taskType) {
      const filters = {
        project_id: this.currentProduction.id,
        task_type_id: taskType.task_type_id,
        relations: 'true'
      }
      // /tasks?episode_id= only filters shot tasks (shot → sequence → episode);
      // asset tasks are scoped client-side via the episode-scoped assetMap.
      if (this.currentEpisodeId && taskType.for_entity === 'Shot') {
        filters.episode_id = this.currentEpisodeId
      }
      return filters
    },

    // The plain /assets endpoint rejects episode_id=main (only its with-tasks
    // variant maps it to source_id IS NULL), so the main pack loads every asset
    // with no episode filter and keeps the right ones client-side. A real
    // episode is scoped server-side, so nothing to load wide.
    loadScopedAssets() {
      return this.loadAssets({
        all: this.isMainPack,
        withShared: false,
        withTasks: false
      })
    },

    // Whether an asset falls in the current scope: for the main pack, only the
    // assets attached to no episode (source_id null); otherwise the assetMap is
    // already scoped and every asset it holds belongs.
    assetInScope(asset) {
      return !this.isMainPack || !asset.source_id
    },

    expandTaskTypeElement(
      taskTypeElement,
      refreshScheduleCallBack = null,
      expanded = false,
      resetAssignments = true
    ) {
      return this.isAllEpisodes
        ? this.expandEpisodeRows(
            taskTypeElement,
            refreshScheduleCallBack,
            expanded
          )
        : this.expandTaskTypeDrillDown(
            taskTypeElement,
            refreshScheduleCallBack,
            expanded,
            resetAssignments
          )
    },

    // The production-wide planning stops at the episode level: one row per
    // episode, with no entity, assignee or task row to load below it.
    async expandEpisodeRows(
      taskTypeElement,
      refreshScheduleCallBack = null,
      expanded = false
    ) {
      taskTypeElement.expanded = expanded || !taskTypeElement.expanded

      if (taskTypeElement.expanded) {
        try {
          taskTypeElement.loading = true
          taskTypeElement.children = []

          // The episodes endpoint aggregates a task type schedule per episode,
          // whatever the entity it applies to.
          const scheduleItems = await this.loadEpisodeScheduleItems({
            production: this.currentProduction,
            taskType: this.taskTypeMap.get(taskTypeElement.task_type_id)
          })
          taskTypeElement.children = sortByName(
            this.convertScheduleItems(taskTypeElement, scheduleItems)
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
    },

    async expandTaskTypeDrillDown(
      taskTypeElement,
      refreshScheduleCallBack = null,
      expanded = false,
      resetAssignments = true
    ) {
      taskTypeElement.expanded = expanded || !taskTypeElement.expanded

      if (taskTypeElement.expanded) {
        try {
          taskTypeElement.loading = true

          this.selectedTaskType = taskTypeElement
          this.assignments.loading = resetAssignments

          taskTypeElement.children = []
          taskTypeElement.people = {}
          taskTypeElement.entitiesByType = {}

          // one row per asset type (Asset), sequence (Shot/Sequence),
          // episode (Episode) or edit (Edit)
          const scheduleItemLoaders = {
            Asset: this.loadAssetTypeScheduleItems,
            Shot: this.loadSequenceScheduleItems,
            Sequence: this.loadSequenceScheduleItems,
            Episode: this.loadEpisodeScheduleItems,
            Edit: this.loadEditScheduleItems
          }
          const loadScheduleItems =
            scheduleItemLoaders[taskTypeElement.for_entity] ??
            this.loadAssetTypeScheduleItems
          const parameters = {
            production: this.currentProduction,
            taskType: this.taskTypeMap.get(taskTypeElement.task_type_id),
            episodeId: this.currentEpisodeId
          }
          const scheduleItems = await loadScheduleItems(parameters)

          let children = this.convertScheduleItems(
            taskTypeElement,
            scheduleItems
          )
          const childrenById = new Map(
            children.map(child => [child.object_id, child])
          )

          // load entities (scoped to the current episode for TV shows) that
          // back the row grouping, the entity name and the episode filter
          if (taskTypeElement.for_entity === 'Asset') {
            await this.loadScopedAssets()
          } else if (taskTypeElement.for_entity === 'Shot') {
            await this.loadShots()
          } else if (taskTypeElement.for_entity === 'Sequence') {
            await this.loadSequences()
          } else if (taskTypeElement.for_entity === 'Episode') {
            await this.loadEpisodes()
          } else if (taskTypeElement.for_entity === 'Edit') {
            await this.loadEdits()
          }

          let tasks = await this.loadTasks(
            this.buildTaskFilters(taskTypeElement)
          )

          // Update tasks for versioned schedules
          if (this.isVersioned) {
            const taskType = this.taskTypeMap.get(taskTypeElement.task_type_id)
            const versionedTasks = await this.loadTasksFromScheduleVersion({
              version: { id: this.version },
              taskType
            })
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

          this.daysOffByPerson = await this.loadProductionDaysOff({
            startDate: this.startDate.format('YYYY-MM-DD'),
            endDate: this.endDate.format('YYYY-MM-DD')
          }).catch(
            () => ({}) // fallback if not allowed to fetch days off
          )

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
              if (!task.entity || !this.assetInScope(task.entity)) return
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

              let startDate
              if (this.mode === 'real') {
                if (!task.real_start_date) {
                  return
                }
                startDate = parseDate(task.real_start_date)
              } else {
                startDate = parseDate(task.start_date)
              }
              if (startDate.isAfter(this.endDate)) {
                return
              }
              if (startDate.isBefore(entityTypeItem.startDate)) {
                entityTypeItem.startDate = startDate.clone()
              }
              task.startDate = startDate

              let endDate
              if (this.mode === 'real') {
                endDate = task.done_date
                  ? parseDate(task.done_date)
                  : moment.tz()
              } else if (task.due_date) {
                endDate = parseDate(task.due_date)
              } else if (task.end_date) {
                endDate = parseDate(task.end_date)
              } else if (task.estimation) {
                endDate = addBusinessDays(
                  task.startDate,
                  Math.ceil(minutesToDays(this.organisation, task.estimation)) -
                    1,
                  this.daysOffByPerson[assigneeId]
                )
              }
              if (!endDate || endDate.isBefore(startDate)) {
                const nbDays = startDate.isoWeekday() === 5 ? 3 : 1
                endDate = startDate.clone().add(nbDays, 'days')
              }
              if (!endDate.isSameOrAfter(startDate)) {
                const nbDays = startDate.isoWeekday() === 5 ? 3 : 1
                endDate = startDate.clone().add(nbDays, 'days')
              }
              if (endDate.isBefore(this.startDate)) {
                return
              }
              if (endDate.isAfter(entityTypeItem.endDate)) {
                entityTypeItem.endDate = endDate.clone()
              }
              task.endDate = endDate

              if (!tasksByType[task.entity_type_id][assigneeId]) {
                tasksByType[task.entity_type_id][assigneeId] = []
                people[assigneeId] =
                  assigneeId !== 'unassigned'
                    ? {
                        ...this.personMap.get(assigneeId),
                        daysOff: this.daysOffByPerson[assigneeId]
                      }
                    : {
                        id: assigneeId,
                        avatar: false,
                        color: '#888',
                        full_name: this.$t('main.unassigned')
                      }
              }

              task.editable = !this.isLockedSchedule
              task.unresizable = false
              task.parentElement = entityTypeItem

              tasksByType[task.entity_type_id][assigneeId].push(task)
            })
          })

          if (taskTypeElement.for_entity === 'Asset') {
            // drop the asset type rows with no asset in the current scope (the
            // main pack keeps only the asset types with an episode-less asset)
            const scopedAssetTypeIds = this.isMainPack
              ? new Set(
                  [...assetMap.values()]
                    .filter(asset => this.assetInScope(asset))
                    .map(asset => asset.asset_type_id)
                )
              : null
            // filtering following custom asset types workflow
            children = children.filter(item => {
              const assetType = this.assetTypeMap.get(item.object_id)
              return (
                assetType &&
                (!assetType.task_types.length ||
                  assetType.task_types.includes(
                    taskTypeElement.task_type_id
                  )) &&
                (!scopedAssetTypeIds || scopedAssetTypeIds.has(item.object_id))
              )
            })
          } else if (
            ['Shot', 'Sequence'].includes(taskTypeElement.for_entity) &&
            this.currentEpisodeId
          ) {
            // keep only the sequences of the current episode
            children = children.filter(item => {
              const sequence = sequenceMap.get(item.object_id)
              return sequence && sequence.episode_id === this.currentEpisodeId
            })
          } else if (
            taskTypeElement.for_entity === 'Edit' &&
            this.currentEpisodeId
          ) {
            // keep only the edits of the current episode
            children = children.filter(item => {
              const edit = editMap.get(item.object_id)
              return edit && edit.episode_id === this.currentEpisodeId
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
          taskTypeElement.people = []
        } finally {
          taskTypeElement.loading = false
        }

        if (refreshScheduleCallBack) {
          refreshScheduleCallBack(taskTypeElement)
        }

        this.selectTaskTypeElement(taskTypeElement, null, resetAssignments)
      }
    },

    filteredAssignments(items) {
      return this.assignments.assigned
        ? items
        : items.filter(item => !item.assigned)
    },

    saveTaskChanged(task) {
      if (this.isVersioned) {
        return this.updateScheduleVersionedTask({
          id: task.versionedTaskId,
          estimation: task.estimation,
          startDate: task.startDate.format('YYYY-MM-DD'),
          dueDate: task.endDate.format('YYYY-MM-DD'),
          assignees: task.assignees
        })
      } else {
        return this.updateTask({
          taskId: task.id,
          data: {
            estimation: task.estimation,
            start_date: task.startDate.format('YYYY-MM-DD'),
            due_date: task.endDate.format('YYYY-MM-DD')
          }
        })
      }
    },

    async onScheduleItemChanged(item) {
      if (item.type === 'Task') {
        // update dates with weekends and days off
        const daysOff = item.assignees
          .flatMap(assigneeId => this.daysOffByPerson[assigneeId])
          .filter(Boolean)
        item.startDate = addBusinessDays(item.startDate, 0, daysOff)
        item.endDate = addBusinessDays(
          item.startDate,
          Math.ceil(minutesToDays(this.organisation, item.estimation)) - 1,
          daysOff
        )
        // update parents
        if (item.startDate.isBefore(item.parentElement.startDate)) {
          item.parentElement.startDate = item.startDate.clone()
          this.updateScheduleItem(item.parentElement)
          if (
            item.parentElement.startDate.isBefore(
              item.parentElement.parentElement.startDate
            )
          ) {
            item.parentElement.parentElement.startDate =
              item.parentElement.startDate.clone()
            this.updateScheduleItem(item.parentElement.parentElement)
          }
        }
        if (item.endDate.isAfter(item.parentElement.endDate)) {
          item.parentElement.endDate = item.endDate.clone()
          this.updateScheduleItem(item.parentElement)
          if (
            item.parentElement.endDate.isAfter(
              item.parentElement.parentElement.endDate
            )
          ) {
            item.parentElement.parentElement.endDate =
              item.parentElement.endDate.clone()
            this.updateScheduleItem(item.parentElement.parentElement)
          }
        }
        await this.saveTaskChanged(item)
        return
      }

      if (item.startDate && item.endDate && item.parentElement) {
        item.parentElement.startDate = this.getMinDate(item.parentElement)
        item.parentElement.endDate = this.getMaxDate(item.parentElement)
        if (!this.isVersioned) {
          this.saveScheduleItem(item.parentElement)
        }
      } else if (!item.parentElement) {
        if (!Array.isArray(item.children)) {
          await this.updateScheduleItem(item)
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
          await this.updateScheduleItem(item)
          return
        }
        this.pendingParentChange = { item, affected }
        this.modals.confirmChildMove = true
        return
      }

      await this.updateScheduleItem(item)
    },

    async updateScheduleItem(item) {
      const scheduleItem = this.scheduleItems.find(
        scheduleItem => scheduleItem === item
      )
      if (scheduleItem) {
        scheduleItem.startDate = item.startDate
        scheduleItem.start_date = item.startDate.format('YYYY-MM-DD')
        scheduleItem.endDate = item.endDate
        scheduleItem.end_date = item.endDate.format('YYYY-MM-DD')
      }
      if (!this.isVersioned) {
        await this.saveScheduleItem(item)
      }
    },

    async confirmChildMove() {
      const { item, affected } = this.pendingParentChange
      try {
        await Promise.all(
          [item, ...affected].map(element => this.updateScheduleItem(element))
        )
      } finally {
        this.pendingParentChange = null
        this.modals.confirmChildMove = false
      }
    },

    cancelChildMove() {
      const { item, affected } = this.pendingParentChange
      item.startDate = item._dragOrigStartDate.clone()
      item.endDate = item._dragOrigEndDate.clone()
      if (item._dragOrigEstimation !== undefined) {
        item.estimation = item._dragOrigEstimation
      }
      affected.forEach(child => {
        child.startDate = child._dragOrigStartDate.clone()
        child.endDate = child._dragOrigEndDate.clone()
      })
      this.pendingParentChange = null
      this.modals.confirmChildMove = false
    },

    getMinDate(parentElement) {
      let minDate = this.endDate.clone()
      parentElement.children.forEach(item => {
        if (item.startDate && item.startDate.isBefore(minDate)) {
          minDate = item.startDate
        }
      })
      return minDate.clone()
    },

    getMaxDate(parentElement) {
      let maxDate = this.startDate.clone()
      parentElement.children.forEach(item => {
        if (item.endDate && item.endDate.isAfter(maxDate)) {
          maxDate = item.endDate
        }
      })
      return maxDate.clone()
    },

    isInDepartment(taskType) {
      if (this.isCurrentUserManager) {
        return true
      } else if (this.isCurrentUserSupervisor) {
        if (this.user.departments.length === 0) {
          return true
        } else {
          return (
            taskType.department_id &&
            this.user.departments.includes(taskType.department_id)
          )
        }
      } else {
        return false
      }
    },

    scrollScheduleToToday() {
      this.$refs.schedule?.scrollToToday()
    },

    resetSidePanel() {
      this.assignments = {
        ...this.assignments,
        entityTypes: null,
        excludes: [],
        forcedDailyQuota: null,
        loading: false,
        saving: false,
        startDate: null,
        endDate: null,
        task: {},
        type: null,
        unassign: false
      }
    },

    toggleSidePanel() {
      if (this.isSidePanelOpen && this.assignments.type === 'task') {
        this.assignments.type = null
        this.isSidePanelOpen = false
      }

      this.isSidePanelOpen = !this.isSidePanelOpen

      if (
        this.isSidePanelOpen &&
        this.assignments.type !== 'task' &&
        !this.assignments.entityTypes &&
        this.selectedTaskType
      ) {
        this.selectTaskTypeElement(this.selectedTaskType)
      }
    },

    selectParentElement(element) {
      if (!element.expanded) {
        this.expandTaskTypeElement(element, () => {
          this.$refs.schedule?.refreshItemPositions(element)
        })
      } else {
        this.selectTaskTypeElement(element)
      }
    },

    onSelectTaskType(taskTypeId) {
      this.selectedTaskType = this.scheduleItems.find(
        item => item.task_type_id === taskTypeId
      )
      // refresh schedule
      this.expandTaskTypeElement(
        this.selectedTaskType,
        () => {
          this.$refs.schedule?.refreshItemPositions(this.selectedTaskType)
        },
        true,
        false
      )
    },

    async selectTaskTypeElement(
      taskType,
      selectedEntityType = undefined,
      resetAssignments = true
    ) {
      // No assignment panel on the production-wide planning.
      if (this.isAllEpisodes) {
        return
      }

      this.selectedTaskType = taskType

      if (resetAssignments) {
        this.resetSidePanel()
      }

      this.assignments.loading = true

      // load tasks
      const tasks = await this.loadTasks(
        this.buildTaskFilters(this.selectedTaskType)
      )

      // load entity types
      if (taskType.for_entity === 'Asset') {
        await this.loadScopedAssets()

        this.assignments.entityTypes = this.productionAssetTypes
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
                    this.assetInScope(asset) &&
                    tasks.some(task => task.entity_id === asset.id)
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
        await this.loadShots()

        const shotsBySequence = shotStore.cache.shots
          .filter(shot => tasks.some(task => task.entity_id === shot.id))
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

        this.assignments.entityTypes = Object.keys(shotsBySequence).map(
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
        await this.loadSequences()

        // sequences are the assignable entities, grouped by episode
        const sequencesByEpisode = [...sequenceStore.cache.sequenceMap.values()]
          .filter(
            sequence =>
              !sequence.canceled &&
              (!this.currentEpisodeId ||
                sequence.episode_id === this.currentEpisodeId) &&
              tasks.some(task => task.entity_id === sequence.id)
          )
          .reduce((acc, sequence) => {
            const groupId = sequence.episode_id || taskType.for_entity
            if (!acc[groupId]) {
              acc[groupId] = []
            }
            sequence.assigned = taskType.entitiesByType?.[
              sequence.id
            ]?.includes(sequence.id)
            acc[groupId].push(sequence)
            return acc
          }, {})

        this.assignments.entityTypes = Object.keys(sequencesByEpisode).map(
          groupId => {
            const sequences = sequencesByEpisode[groupId]
            return {
              id: groupId,
              name: sequences[0].episode_name || this.currentProduction.name,
              for_entity: taskType.for_entity,
              expanded: groupId === selectedEntityType?.object_id,
              children: sequences
            }
          }
        )
      } else if (taskType.for_entity === 'Episode') {
        await this.loadEpisodes()

        // episodes are the assignable entities, under a single production group
        const episodes = [...episodeStore.cache.episodeMap.values()]
          .filter(
            episode =>
              !episode.canceled &&
              !['all', 'main'].includes(episode.id) &&
              (!this.currentEpisodeId ||
                episode.id === this.currentEpisodeId) &&
              tasks.some(task => task.entity_id === episode.id)
          )
          .map(episode => ({
            ...episode,
            assigned: taskType.entitiesByType?.[episode.id]?.includes(
              episode.id
            )
          }))

        this.assignments.entityTypes = [
          {
            id: taskType.for_entity,
            name: this.currentProduction.name,
            for_entity: taskType.for_entity,
            expanded: true,
            children: episodes
          }
        ]
      } else if (taskType.for_entity === 'Edit') {
        await this.loadEdits()

        // edits are the assignable entities, grouped by episode
        const editsByEpisode = [...editStore.cache.editMap.values()]
          .filter(
            edit =>
              !edit.canceled &&
              (!this.currentEpisodeId ||
                edit.episode_id === this.currentEpisodeId) &&
              tasks.some(task => task.entity_id === edit.id)
          )
          .reduce((acc, edit) => {
            const groupId = edit.episode_id || taskType.for_entity
            if (!acc[groupId]) {
              acc[groupId] = []
            }
            edit.assigned = taskType.entitiesByType?.[edit.id]?.includes(
              edit.id
            )
            acc[groupId].push(edit)
            return acc
          }, {})

        this.assignments.entityTypes = Object.keys(editsByEpisode).map(
          groupId => {
            const edits = editsByEpisode[groupId]
            return {
              id: groupId,
              name: edits[0].episode_name || this.currentProduction.name,
              for_entity: taskType.for_entity,
              expanded: groupId === selectedEntityType?.object_id,
              children: edits
            }
          }
        )
      }
      this.assignments.loading = false
    },

    selectTaskElement(taskType, entityType, task, selection) {
      if (selection.length !== 1) {
        this.closeSidePanel()
        return
      }

      this.resetSidePanel()

      this.isSidePanelOpen = true
      this.selectedTaskType = taskType
      this.draggedEntities = [{ ...entityType, children: [{ ...task.entity }] }]

      this.assignments.type = 'task'

      const start_date = taskType.start_date
      const end_date = parseDate(start_date).isAfter(taskType.end_date)
        ? start_date
        : taskType.end_date
      this.assignments.startDate = start_date
      this.assignments.endDate = end_date
      this.assignments.task = {
        ...task,
        estimation: minutesToDays(this.organisation, task.estimation),
        startDate: task.startDate.format('YYYY-MM-DD'),
        endDate: task.endDate.format('YYYY-MM-DD')
      }
      this.assignments.excludes = this.team
        .filter(person => !task.assignees.includes(person.id))
        .map(person => person.id)
      this.assignments.unassign = true
    },

    closeSidePanel() {
      this.isSidePanelOpen = false
      this.resetSidePanel()
    },

    onAssignmentItemSelected(item) {
      const today = moment().utc().toDate()
      this.assignments.type = 'entity'
      this.assignments.startDate = item.start_date || today
      this.assignments.endDate = item.end_date || today

      item.children = this.filteredAssignments(item.children)
      this.draggedEntities = [item]
    },

    onAssignmentItemDragStart(event, item, type) {
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData(`task-type-${type.task_type_id}`, true) // use for hack on drag over (must be lowercase)
      event.dataTransfer.setData('taskTypeId', type.task_type_id)
      event.dataTransfer.setData('entityId', item.id)

      item.children = this.filteredAssignments(item.children)
      this.draggedEntities = [item]
    },

    onScheduleItemDropped(event, item) {
      this.assignments.type = 'entity'
      const start_date = event.start_date || item.start_date
      const end_date = parseDate(start_date).isAfter(item.end_date)
        ? start_date
        : item.end_date
      this.assignments.startDate = start_date
      this.assignments.endDate = end_date
    },

    removeFromAssignments(person) {
      this.assignments.excludes.push(person.id)
    },

    submitAssignments() {
      if (this.assignments.type === 'entity') {
        this.saveAssignments()
      } else if (this.assignments.type === 'task') {
        this.saveTask()
      }
    },

    async saveAssignments() {
      this.assignments.saving = true

      // load tasks
      const tasks = await this.loadTasks(
        this.buildTaskFilters(this.selectedTaskType)
      )

      const dailyQuota =
        this.assignments.forcedDailyQuota ?? this.estimatedDailyQuota
      const taskEstimation = 1 / dailyQuota

      // assign each selected entity to each selected assignee
      for (const taskType of this.draggedEntities) {
        const startDate = parseDate(this.assignments.startDate)
        const endDate = parseDate(this.assignments.endDate)

        // accumulated during the distribution loop, flushed as one
        // clear-assignation request plus one assign request per assignee
        const taskIdsToUnassign = []
        const taskIdsByAssignee = new Map()

        let cumulatedTasks = 0
        let nextAssigneeIndex = 0
        let nextStartDate = startDate.clone()

        // distribute the task assignments according to the daily quotas, the task type duration and people's availability.
        for (const entity of taskType.children) {
          const task = tasks.find(task => task.entity_id === entity.id)
          if (!task) {
            continue // no task found for this entity
          }

          let versionedTask
          if (this.isVersioned) {
            const versionedTasks = await this.loadTasksFromScheduleVersion({
              version: { id: this.version },
              taskType: { id: task.task_type_id }
            })
            versionedTask = versionedTasks.find(t => t.task_id === task.id) ?? {
              taskId: task.id,
              version: this.version,
              assignees: []
            }
            task.versionedTaskId = versionedTask.id
          }

          if (this.assignments.unassign) {
            if (this.isVersioned) {
              versionedTask.assignees = []
            } else {
              taskIdsToUnassign.push(task.id)
            }
          }

          cumulatedTasks++

          let taskStartDate = nextStartDate
          let taskEndDate = null
          while (nextAssigneeIndex < this.availablePersons.length) {
            const taskAssignee = this.availablePersons[nextAssigneeIndex]

            taskStartDate = addBusinessDays(
              taskStartDate,
              0,
              this.daysOffByPerson[taskAssignee.id]
            )

            const { due_date } = getDatesFromStartDate(
              this.organisation,
              startDate,
              taskEndDate,
              cumulatedTasks * taskEstimation,
              this.daysOffByPerson[taskAssignee.id]
            )
            taskEndDate = parseDate(due_date)

            if (taskEndDate.isAfter(endDate)) {
              // try to assign the task to the next available person
              nextAssigneeIndex++
              cumulatedTasks = 1
              taskStartDate = startDate.clone()
              taskEndDate = null
            } else {
              if (this.isVersioned) {
                versionedTask.startDate = taskStartDate.format('YYYY-MM-DD')
                versionedTask.dueDate = taskEndDate.format('YYYY-MM-DD')
                versionedTask.estimation = daysToMinutes(
                  this.organisation,
                  taskEstimation
                )
                versionedTask.assignees.push(taskAssignee.id)

                // save versioned task
                if (!versionedTask.id) {
                  await this.createScheduleVersionedTask(versionedTask)
                } else {
                  await this.updateScheduleVersionedTask(versionedTask)
                }
              } else {
                // assignation to the current assignee is batched after the loop
                if (!taskIdsByAssignee.has(taskAssignee.id)) {
                  taskIdsByAssignee.set(taskAssignee.id, [])
                }
                taskIdsByAssignee.get(taskAssignee.id).push(task.id)
                // save task dates & estimation
                await this.updateTask({
                  taskId: task.id,
                  data: {
                    estimation: daysToMinutes(
                      this.organisation,
                      taskEstimation
                    ),
                    start_date: taskStartDate.format('YYYY-MM-DD'),
                    due_date: taskEndDate.format('YYYY-MM-DD')
                  }
                })
              }
              // set next start date
              if ((cumulatedTasks * taskEstimation) % 1 !== 0) {
                nextStartDate = taskEndDate.clone()
              } else {
                nextStartDate = taskEndDate.clone().add(1, 'days')
              }
              break // jump to next task
            }
          }
        }

        // unassign first so batched assignations are not cleared right after
        if (taskIdsToUnassign.length > 0) {
          await this.unassignSelectedTasks({ taskIds: taskIdsToUnassign })
        }
        // Sequence the per-assignee requests instead of firing them at once.
        for (const [personId, taskIds] of taskIdsByAssignee) {
          await this.assignSelectedTasks({ personId, taskIds })
        }

        // refresh schedule
        this.expandTaskTypeElement(
          this.selectedTaskType,
          () => {
            this.$refs.schedule?.refreshItemPositions(this.selectedTaskType)
          },
          true,
          false
        )
      }

      this.assignments.saving = false
    },

    async saveTask() {
      this.assignments.saving = true
      try {
        const task = {
          ...this.assignments.task,
          startDate: parseDate(this.assignments.task.startDate),
          endDate: parseDate(this.assignments.task.endDate),
          estimation: daysToMinutes(
            this.organisation,
            this.assignments.task.estimation
          ),
          assignees: this.availablePersons.map(person => person.id)
        }
        // update task and assignments
        await this.onScheduleItemChanged(task)
        if (!this.isVersioned) {
          // One task update carrying the full assignee list replaces the
          // unassign request plus one assign request per person.
          await this.updateTask({
            taskId: task.id,
            data: { assignees: task.assignees }
          })
        }
        // refresh task in side panel
        this.assignments.task.startDate = task.startDate.format('YYYY-MM-DD')
        this.assignments.task.endDate = task.endDate.format('YYYY-MM-DD')
        // refresh schedule
        this.expandTaskTypeElement(
          this.selectedTaskType,
          () => {
            this.$refs.schedule?.refreshItemPositions(this.selectedTaskType)
          },
          true,
          false
        )
      } catch (err) {
        console.error(err)
      } finally {
        this.assignments.saving = false
      }
    },

    async onScheduleExpandAll() {
      if (this.loading.expandSchedule) return

      this.loading.expandSchedule = true
      if (!this.expandAll) {
        await this.expandAllScheduleItems()
      } else {
        this.collapseAllScheduleItems()
      }
      this.expandAll = !this.expandAll
      this.loading.expandSchedule = false
    },

    async onScheduleItemAssigned(task, personId) {
      // update task to refresh the schedule
      task.assignees.push(personId)
      task.parentElement.children.get(personId).push(task)

      // save change
      if (this.isVersioned) {
        return this.updateScheduleVersionedTask({
          id: task.versionedTaskId,
          assignees: task.assignees
        })
      } else {
        await this.assignSelectedTasks({
          personId,
          taskIds: [task.id]
        })
      }
    },

    async onScheduleItemUnassigned(task, personId) {
      // update task to refresh the schedule
      task.assignees = task.assignees.filter(id => id !== personId)
      const tasks = task.parentElement.children.get(personId)
      tasks.splice(tasks.indexOf(task), 1)

      // save change
      if (this.isVersioned) {
        return this.updateScheduleVersionedTask({
          id: task.versionedTaskId,
          assignees: task.assignees
        })
      } else {
        await this.unassignPersonFromTask({
          person: { id: personId },
          task
        })
      }
    },

    onZoomLevelChanged(zoom) {
      this.updateRoute({ zoom })
    },

    onEntityTypeChanged(type) {
      this.updateRoute({ type })
    },

    onModeChanged(mode) {
      this.updateRoute({ mode })
      this.closeSidePanel()
      this.refreshSchedule()
    },

    onVersionChanged(version) {
      this.updateRoute({ version })
      this.closeSidePanel()
      this.refreshSchedule()
    },

    refreshSchedule() {
      // scopedScheduleItems, not scheduleItems: under the main pack only the
      // Asset rows are in scope, and drilling an Edit / Shot / Sequence /
      // Episode row would forward episode_id=main to an endpoint that rejects
      // it. Same array reference in every other mode.
      this.scopedScheduleItems.forEach(item => {
        if (!item.expanded) {
          return
        }
        // refresh schedule
        this.expandTaskTypeElement(
          item,
          () => {
            this.$refs.schedule?.refreshItemPositions(item)
          },
          true,
          false
        )
      })
    },

    openEditScheduleVersion(scheduleVersion = {}) {
      this.scheduleVersionToEdit = scheduleVersion
      this.modals.editScheduleVersion = true
    },

    openDeleteScheduleVersion(versionId) {
      this.scheduleVersionToEdit = this.scheduleVersions.find(
        ({ id }) => id === versionId
      )
      this.modals.deleteScheduleVersion = true
    },

    async editVersion(version) {
      this.modals.editScheduleVersion = false
      if (!version.id) {
        const newVersion = await this.createScheduleVersion({
          production: this.currentProduction,
          version
        })
        this.version = newVersion.id
        this.onVersionChanged(this.version)
      } else {
        await this.updateScheduleVersion(version)
      }
      this.scheduleVersionToEdit = {}
    },

    async deleteVersion(version) {
      this.modals.deleteScheduleVersion = false
      await this.deleteScheduleVersion(version)
      if (this.version === version.id) {
        this.version = DEFAULT_VERSION
        this.onVersionChanged(this.version)
      }
      this.scheduleVersionToEdit = {}
    },

    async applyToProduction() {
      this.loading.applyScheduleVersion = true
      this.errors.applyScheduleVersion = false
      try {
        await this.applyScheduleVersionToProduction(this.version)
        this.modals.applyScheduleVersion = false
      } catch (err) {
        console.error(err)
        this.errors.applyScheduleVersion = true
      } finally {
        this.loading.applyScheduleVersion = false
      }
      // refresh version list
      await this.loadScheduleVersions(this.currentProduction)
    },

    async expandAllScheduleItems() {
      // scopedScheduleItems keeps the main pack to its in-scope Asset rows:
      // drilling an out-of-scope row would forward episode_id=main to an
      // endpoint that rejects it. Same array reference in every other mode.
      // run sequentially to avoid overloading the server
      for (const element of this.scopedScheduleItems) {
        if (!element.expanded) {
          await this.expandTaskTypeElement(
            element,
            () => {
              this.$refs.schedule?.refreshItemPositions(element)
            },
            true,
            false
          )
        }
      }
    },

    collapseAllScheduleItems() {
      this.scheduleItems.forEach(element => {
        element.expanded = false
      })
    },

    async exportSchedule(expandAll = true) {
      this.loading.exportSchedule = true

      try {
        if (expandAll) {
          await this.expandAllScheduleItems()
        }

        const data = this.$refs.schedule?.exportData()

        const ExcelJS = (await import('exceljs')).default
        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet(this.$t('schedule.title'))

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

          const row = sheet.addRow([null, item.name])
          row.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: item.color.slice(1) }
          }
          row.getCell(2).alignment = { vertical: 'top' }
          row.getCell(2).note =
            `${item.name}\n${item.start_date} - ${item.end_date}`
          row.height = 30

          // fill timebar
          const start = dates.indexOf(item.start_date)
          const end = dates.indexOf(item.end_date)
          const color = item.color.slice(1)
          const color2 = colors.lightenColor(item.color, 0.2).hex().slice(1)
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
                ? this.personMap.get(assigneeId)
                : {
                    id: assigneeId,
                    avatar: false,
                    color: '#888',
                    full_name: this.$t('main.unassigned')
                  }

              const row = sheet.addRow([
                null,
                null,
                null,
                assignee.full_name,
                isAssigned ? this.$t('days_off.title') : null
              ])
              row.getCell(4).alignment = { vertical: 'top' }
              row.getCell(5).alignment = { vertical: 'middle' }

              // fill days off
              const daysOff = getDayOffRange(this.daysOffByPerson[assigneeId])
              daysOff.forEach(dayOff => {
                const index = dates.findIndex(date => date === dayOff.date)
                if (index !== -1) {
                  const cell = row.getCell(datesColumn + index)
                  cell.note = `${this.$t('days_off.title')}\n${dayOff.description}`
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
                  this.mode === 'real'
                    ? this.formatDuration(task.duration)
                    : this.formatDuration(task.estimation)

                const row = sheet.addRow([
                  null,
                  null,
                  null,
                  null,
                  `${task.entity.name} (${duration}${this.durationUnit})`
                ])

                // fill task timebar
                const start_date = task.startDate.format('YYYY-MM-DD')
                const end_date = task.endDate.format('YYYY-MM-DD')
                const startIndex = dates.indexOf(start_date)
                const endIndex = dates.indexOf(end_date)
                for (let i = startIndex; i > -1 && i <= endIndex; i++) {
                  const cell = row.getCell(datesColumn + i)
                  cell.note = `${task.entity.name}\n${start_date} - ${end_date}\n${duration} ${this.durationUnit}`
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
        const ajustColumnWidth = (
          columnIndex,
          minWidth = 10,
          maxWidth = 100
        ) => {
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
        const filename = `Kitsu - ${this.currentProduction.name} - ${this.$t('schedule.title')}`
        const mode = this.modeOptions.find(
          ({ value }) => value === this.mode
        )?.label
        const version = this.versionOptions.find(
          ({ value }) => value === this.version
        )?.label
        const release = this.isVersioned ? `${mode} - ${version}` : mode
        downloadBlob(new Blob([buffer]), `${filename} (${release}).xlsx`)
      } catch (err) {
        console.error(err)
        alert(this.$t('schedule.export_error'))
      } finally {
        this.loading.exportSchedule = false
      }
    }
  },

  watch: {
    selectedStartDate() {
      this.startDate = parseDate(this.selectedStartDate)
      const start_date = this.startDate.format('YYYY-MM-DD')
      if (
        this.currentProduction.start_date &&
        this.currentProduction.start_date !== start_date
      ) {
        this.editProduction({
          id: this.currentProduction.id,
          start_date
        })
      }
    },

    selectedEndDate() {
      this.endDate = parseDate(this.selectedEndDate)
      const end_date = this.endDate.format('YYYY-MM-DD')
      if (
        this.currentProduction.end_date &&
        this.currentProduction.end_date !== end_date
      ) {
        this.editProduction({
          id: this.currentProduction.id,
          end_date
        })
      }
    },

    currentProduction(value) {
      if (!value) return
      this.reset()
    },

    currentEpisode(value) {
      if (!value) return
      if (this.isTVShow) this.reset()
    }
  },

  head() {
    const context =
      this.isTVShow && this.currentEpisode?.name
        ? `${this.currentProduction.name} | ${this.currentEpisode.name}`
        : this.currentProduction.name
    return {
      title: `${context} | ${this.$t('schedule.title')} - Kitsu`
    }
  }
}
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
