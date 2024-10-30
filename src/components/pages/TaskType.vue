<template>
  <div class="task-type columns fixed-page">
    <div class="column main-column">
      <div class="task-type page" ref="page">
        <div class="task-type-header page-header flexrow-item" ref="header">
          <div class="flexcolumn-item flexrow">
            <router-link class="back-link flexrow-item" :to="backPath">
              <corner-left-up-icon />
            </router-link>
            <div class="flexrow-item"></div>
            <task-type-name
              class="flexrow-item"
              style="font-size: 1.2em"
              :task-type="currentTaskType"
            />
            <div class="filler"></div>
            <button-simple
              class="flexrow-item"
              icon="grid"
              :is-on="contactSheetMode"
              :title="$t('tasks.show_contact_sheet')"
              @click="contactSheetMode = !contactSheetMode"
              v-if="isActiveTab('tasks')"
            />
            <div class="flexrow-item">
              <button-simple
                icon="import"
                :title="$t('main.csv.import_file')"
                @click="showImportModal"
                v-if="!isActiveTab('schedule') && !isActiveTab('estimation')"
              />
            </div>
            <div class="flexrow-item">
              <button-simple
                icon="export"
                :title="$t('main.csv.export_file')"
                @click="onExportClick"
                v-if="!isActiveTab('schedule') && !isActiveTab('estimation')"
              />
            </div>
          </div>

          <div class="tabs mt1">
            <ul>
              <li :class="{ 'is-active': isActiveTab('tasks') }">
                <router-link :to="tasksPath">
                  {{ $t('tasks.tasks') }}
                </router-link>
              </li>
              <li :class="{ 'is-active': isActiveTab('schedule') }">
                <router-link :to="schedulePath">
                  {{ $t('schedule.title') }}
                </router-link>
              </li>
              <li :class="{ 'is-active': isActiveTab('estimation') }">
                <router-link :to="estimationPath">
                  {{ $t('estimation.title') }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="flexcolumn-item flexrow search-options mb1">
            <div class="flexrow-item">
              <search-field
                ref="task-search-field"
                :can-save="true"
                :focus-options="{ preventScroll: true }"
                @change="onSearchChange"
                @save="saveSearchQuery"
                placeholder="ex: retake chara"
              />
            </div>
            <div class="flexrow-item flexrow" v-if="isActiveTab('tasks')">
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.due_date')"
                :options="dueDateOptions"
                locale-key-prefix="tasks."
                v-model="dueDateFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.late')"
                :options="estimationOptions"
                locale-key-prefix="tasks."
                v-model="estimationFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('task_types.fields.priority')"
                :options="priorityOptions"
                locale-key-prefix="tasks."
                v-model="priorityFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.fields.difficulty')"
                :options="difficultyOptions"
                locale-key-prefix="tasks."
                v-model="difficultyFilter"
              />
            </div>
            <div class="filler"></div>
            <div class="flexrow-item" v-if="isActiveTab('tasks')">
              <combobox-styled
                :label="$t('main.sorted_by')"
                :options="sortOptions"
                locale-key-prefix="tasks.fields."
                v-model="currentSort"
              />
            </div>

            <div
              class="flexrow-item"
              v-if="isActiveTab('schedule') && isCurrentUserManager"
            >
              <date-field
                class="flexrow-item"
                :can-delete="false"
                :min-date="startDisabledDates.to"
                :max-date="startDisabledDates.from"
                :label="$t('main.start_date')"
                week-days-disabled
                :with-margin="false"
                v-model="schedule.taskTypeStartDate"
              />
            </div>
            <div
              class="flexrow-item"
              v-if="isActiveTab('schedule') && isCurrentUserManager"
            >
              <date-field
                class="flexrow-item"
                :can-delete="false"
                :min-date="endDisabledDates.to"
                :max-date="endDisabledDates.from"
                :label="$t('main.end_date')"
                week-days-disabled
                :with-margin="false"
                v-model="schedule.taskTypeEndDate"
              />
            </div>

            <div
              class="flexrow-item color-option"
              v-if="isActiveTab('schedule')"
            >
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.colors.title')"
                :options="schedule.colorOptions"
                locale-key-prefix="tasks.colors."
                no-field
                v-model="schedule.currentColor"
              />
            </div>
            <div class="flexrow-item zoom-level" v-if="isActiveTab('schedule')">
              <combobox-number
                class="mt0"
                :label="$t('schedule.zoom_level')"
                :options="schedule.zoomOptions"
                no-field
                v-model="schedule.zoomLevel"
                v-if="isActiveTab('schedule')"
              />
            </div>
          </div>
        </div>
        <div class="query-list">
          <search-query-list
            :queries="searchQueries"
            type="taskType"
            @change-search="changeSearch"
            @remove-search="removeSearchQuery"
            v-if="!loading.entities"
          />
        </div>

        <task-list
          ref="task-list"
          :disabled-dates="disabledDates"
          :entity-type="entityType"
          :is-contact-sheet="contactSheetMode"
          :is-error="errors.entities"
          :is-grouped="currentSort === 'entity_name'"
          :is-loading="loading.entities"
          :tasks="tasks"
          @task-selected="onTaskSelected"
          v-if="isActiveTab('tasks')"
        />

        <div
          class="task-type-schedule flexrow-item"
          v-if="isActiveTab('schedule')"
        >
          <schedule
            ref="schedule-widget"
            :start-date="productionStartDate"
            :end-date="productionEndDate"
            :sub-start-date="taskTypeStartDate"
            :sub-end-date="taskTypeEndDate"
            :hierarchy="schedule.scheduleItems"
            :zoom-level="schedule.zoomLevel"
            :height="schedule.scheduleHeight"
            :is-loading="loading.entities"
            :is-estimation-linked="true"
            @item-changed="saveTaskScheduleItem"
            @root-element-expanded="expandPersonElement"
            @estimation-changed="updateEstimation"
          />
        </div>

        <div
          class="task-type-estimation flexrow-item"
          v-if="isActiveTab('estimation')"
        >
          <estimation-helper
            ref="estimation-widget"
            :entity-type="entityType"
            :tasks="tasks"
            @estimation-changed="updateEstimation"
          />
        </div>

        <import-render-modal
          :active="modals.isImportRenderDisplayed"
          :is-loading="loading.importing"
          :is-error="errors.importing"
          :import-error="errors.importingError"
          :parsed-csv="parsedCSV"
          :form-data="importCsvFormData"
          :columns="[...dataMatchers, ...optionalColumns]"
          :data-matchers="dataMatchers"
          :database="{}"
          :disable-update="true"
          @reupload="resetImport"
          @cancel="hideImportRenderModal"
          @confirm="uploadImportFile"
        />

        <import-modal
          ref="import-modal"
          :active="modals.importing"
          :is-loading="loading.importing"
          :is-error="errors.importing"
          :form-data="importCsvFormData"
          :columns="dataMatchers"
          :optional-columns="optionalColumns"
          @cancel="hideImportModal"
          @confirm="renderImport"
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks >= 1">
      <task-info :task="selectedTasks.values().next().value" with-actions />
    </div>
  </div>
</template>

<script>
import { CornerLeftUpIcon } from 'lucide-vue-next'
import moment from 'moment'
import firstBy from 'thenby'
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import { buildSupervisorTaskIndex, indexSearch } from '@/lib/indexing'
import { sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import {
  addBusinessDays,
  daysToMinutes,
  formatSimpleDate,
  getDatesFromStartDate,
  minutesToDays,
  parseDate
} from '@/lib/time'
import {
  applyFilters,
  getDescFilters,
  getExcludingKeyWords,
  getKeyWords,
  getTaskFilters
} from '@/lib/filtering'

import { formatListMixin } from '@/components/mixins/format'
import { searchMixin } from '@/components/mixins/search'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import TaskList from '@/components/lists/TaskList.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const filters = {
  all(tasks) {
    return tasks
  },

  dueweek(tasks) {
    const todayWeek = moment().isoWeek()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.isoWeek() === todayWeek
    })
  },

  duepreviousweek(tasks) {
    const previousWeek = moment().add(-7, 'days').isoWeek()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.isoWeek() === previousWeek
    })
  },

  duenextweek(tasks) {
    const nextWeek = moment().add(7, 'days').isoWeek()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.isoWeek() === nextWeek
    })
  },

  duebeforetoday(tasks) {
    const today = moment()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.isBefore(today)
    })
  },

  duemonth(tasks) {
    const todayMonth = moment().month()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.month() === todayMonth
    })
  },

  duepreviousmonth(tasks) {
    const previousMonth = moment().add(-1, 'months').month()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.month() === previousMonth
    })
  },

  duenextmonth(tasks) {
    const nextMonth = moment().add(1, 'months').month()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.month() === nextMonth
    })
  },

  dueaftertoday(tasks) {
    const today = moment()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return dueDate.isAfter(today)
    })
  },

  overestimation(tasks) {
    return tasks.filter(t => {
      return t.estimation && t.duration > t.estimation
    })
  },

  approvallate(tasks, taskStatusMap) {
    const today = moment()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return (
        dueDate.isBefore(today) &&
        !(
          taskStatusMap.get(t.task_status_id).is_feedback_request ||
          taskStatusMap.get(t.task_status_id).is_done
        )
      )
    })
  },

  donelate(tasks, taskStatusMap) {
    const today = moment()
    return tasks.filter(t => {
      const dueDate = parseDate(t.due_date)
      return (
        dueDate.isBefore(today) && !taskStatusMap.get(t.task_status_id).is_done
      )
    })
  }
}

export default {
  name: 'task-type',

  mixins: [formatListMixin, searchMixin],

  components: {
    ButtonSimple,
    CornerLeftUpIcon,
    ComboboxNumber,
    ComboboxStyled,
    DateField,
    EstimationHelper,
    Schedule,
    SearchField,
    SearchQueryList,
    ImportModal,
    ImportRenderModal,
    TaskList,
    TaskInfo,
    TaskTypeName
  },

  data() {
    return {
      activeTab: 'tasks',
      daysOffByPerson: [],
      currentSort: 'entity_name',
      currentScheduleItem: null,
      currentTask: null,
      contactSheetMode: false,
      dueDateFilter: 'all',
      entityType: 'Asset',
      estimationFilter: 'all',
      priorityFilter: '-1',
      difficultyFilter: '-1',
      tasks: [],
      selection: {},
      difficultyOptions: [
        { label: 'all_tasks', value: '-1' },
        { label: 'difficulty.very_easy', value: '1' },
        { label: 'difficulty.easy', value: '2' },
        { label: 'difficulty.medium', value: '3' },
        { label: 'difficulty.hard', value: '4' },
        { label: 'difficulty.very_hard', value: '5' }
      ],
      dueDateOptions: [
        { label: 'all_tasks', value: 'all' },
        { label: 'due_this_week', value: 'dueweek' },
        { label: 'due_previous_week', value: 'duepreviousweek' },
        { label: 'due_next_week', value: 'duenextweek' },
        { label: 'due_this_month', value: 'duemonth' },
        { label: 'due_previous_month', value: 'duepreviousmonth' },
        { label: 'due_next_month', value: 'duenextmonth' },
        { label: 'due_before_today', value: 'duebeforetoday' },
        { label: 'due_after_today', value: 'dueaftertoday' }
      ],
      estimationOptions: [
        { label: 'all_tasks', value: 'all' },
        { label: 'estimation_over', value: 'overestimation' },
        { label: 'estimation_approval_late', value: 'approvallate' },
        { label: 'estimation_done_late', value: 'donelate' }
      ],
      errors: {
        entities: false,
        importing: false,
        importingError: null
      },
      loading: {
        entities: false,
        importing: false,
        savingSearch: false
      },
      priorityOptions: [
        { label: 'all_tasks', value: '-1' },
        { label: 'priority.normal', value: '0' },
        { label: 'priority.high', value: '1' },
        { label: 'priority.very_high', value: '2' },
        { label: 'priority.emergency', value: '3' }
      ],
      schedule: {
        currentColor: 'status',
        startDate: null,
        endDate: null,
        scheduleItems: [],
        scheduleHeight: 800,
        taskTypeEndDate: null,
        taskTypeStartDate: null,
        zoomLevel: 1,
        zoomOptions: [
          { label: 'Week', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 }
        ],
        colorOptions: [
          { label: 'Neutral', value: 'neutral' },
          { label: 'Status', value: 'status' },
          { label: 'Late', value: 'late' }
        ]
      },
      modals: {
        isImportRenderDisplayed: false,
        importing: false
      },
      parsedCSV: [],
      importCsvFormData: {},
      optionalColumns: ['Estimation', 'Start date', 'Due date'],
      dataMatchers: ['Parent', 'Entity']
    }
  },

  created() {
    if (!this.currentProduction) {
      this.setProduction(this.$route.params.production_id)
    } else {
      const options = { productionId: this.currentProduction.id }
      if (this.currentEpisode) options.episodeId = this.currentEpisode.id
      this.$store.commit('RESET_PRODUCTION_PATH', options)
    }
  },

  mounted() {
    this.searchField.setValue(this.$route.query.search || '')
    this.clearSelectedTasks()
    const isAssets = this.$route.path.includes('assets')
    const isShots = this.$route.path.includes('shots')
    const isEdits = this.$route.path.includes('edits')
    const isSequences = this.$route.path.includes('sequences')
    this.entityType = isAssets
      ? 'Asset'
      : isShots
        ? 'Shot'
        : isEdits
          ? 'Edit'
          : isSequences
            ? 'Sequence'
            : 'Episode'
    this.updateActiveTab()
    setTimeout(() => {
      this.initData(false)
      this.resetScheduleScroll()
    }, 100)
    window.addEventListener('resize', this.resetScheduleHeight)
  },

  beforeUnmount() {
    this.clearSelectedTasks()
    window.removeEventListener('resize', this.resetScheduleHeight)
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsPath',
      'currentEpisode',
      'currentProduction',
      'currentTaskType',
      'editsPath',
      'episodesPath',
      'editMap',
      'episodeMap',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isTVShow',
      'nbSelectedTasks',
      'organisation',
      'personMap',
      'selectedTasks',
      'sequenceMap',
      'sequencesPath',
      'sequenceSubscriptions',
      'shotsByEpisode',
      'shotMap',
      'shotsPath',
      'taskSearchQueries',
      'taskStatusMap',
      'taskMap',
      'user'
    ]),

    taskTypeStartDate() {
      return moment(this.schedule.taskTypeStartDate)
    },

    taskTypeEndDate() {
      return moment(this.schedule.taskTypeEndDate)
    },

    isSupervisorInDepartment() {
      const departments = this.user.departments || []
      return (
        this.isCurrentUserManager ||
        (this.isCurrentUserSupervisor &&
          departments.includes((this.currentTaskType || {}).department_id))
      )
    },

    entityMap() {
      return this[`${this.entityType.toLowerCase()}Map`]
    },

    productionStartDate() {
      return parseDate(this.currentProduction.start_date)
    },

    productionEndDate() {
      return parseDate(this.currentProduction.end_date)
    },

    disabledDates() {
      return {
        to: parseDate(this.currentProduction.start_date).toDate(),
        from: parseDate(this.currentProduction.end_date).toDate(),
        days: [6, 0]
      }
    },

    startDisabledDates() {
      return {
        to: parseDate(this.currentProduction.start_date).toDate(),
        from: parseDate(this.currentProduction.end_date).toDate(),
        days: [6, 0]
      }
    },

    endDisabledDates() {
      return {
        to: parseDate(this.currentProduction.start_date).toDate(),
        from: parseDate(this.currentProduction.end_date).toDate(),
        days: [6, 0]
      }
    },

    entityTasks() {
      return this.getTasks(Array.from(this.entityMap.values()))
    },

    // Meta

    title() {
      if (this.currentProduction) {
        if (this.isTVShow && this.currentEpisode) {
          const episodeName =
            this.currentEpisode.id === 'all'
              ? this.$t('main.all_assets')
              : this.currentEpisode.name
          return (
            `${this.currentProduction.name} / ` +
            `${episodeName} / ` +
            `${this.currentTaskType.name}`
          )
        }
        return `${this.currentProduction.name} / ${this.currentTaskType.name}`
      }
      return 'Loading...'
    },

    // Paths

    backPath() {
      let route = {}
      if (this.isActiveTab('schedule')) {
        route = {
          name: 'schedule',
          params: {
            production_id: this.currentProduction.id
          },
          query: { search: '' }
        }
      } else {
        if (this.currentTaskType.for_entity === 'Shot') {
          route = this.shotsPath
        }
        if (this.currentTaskType.for_entity === 'Asset') {
          route = this.assetsPath
        }
        if (this.currentTaskType.for_entity === 'Edit') {
          route = this.editsPath
        }
        if (this.currentTaskType.for_entity === 'Episode') {
          route = this.episodesPath
        }
        if (this.currentTaskType.for_entity === 'Sequence') {
          route = this.sequencesPath
        }
      }
      return {
        ...route,
        query: { search: '' }
      }
    },

    tasksPath() {
      return this.getRoute('task-type')
    },

    schedulePath() {
      return this.getRoute('task-type-schedule')
    },

    estimationPath() {
      return this.getRoute('task-type-estimation')
    },

    // Helpers

    sortOptions() {
      return [
        'entity_name',
        'task_status_short_name',
        'priority',
        'nb_frames',
        'difficulty',
        'estimation',
        'duration',
        'retake_count',
        'start_date',
        'due_date',
        'real_start_date',
        'end_date',
        'last_comment_date'
      ].map(name => ({ label: name, value: name }))
    },

    searchQueries() {
      return this.taskSearchQueries.filter(
        t => t.entity_type === this.entityType
      )
    },

    team() {
      return sortPeople(
        this.currentProduction.team
          .map(personId => this.personMap.get(personId))
          .filter(person => person && !person.is_bot)
      )
    },

    scheduleWidget() {
      return this.$refs['schedule-widget']
    },

    searchField() {
      return this.$refs['task-search-field']
    }
  },

  methods: {
    ...mapActions([
      'addSelectedTask',
      'clearSelectedTasks',
      'initTaskType',
      'loadAggregatedPersonDaysOff',
      'loadEpisodeScheduleItems',
      'loadScheduleItems',
      'removeTaskSearch',
      'saveScheduleItem',
      'saveTaskSearch',
      'setProduction',
      'subscribeToSequence',
      'updateTask',
      'unsubscribeFromSequence',
      'uploadTaskTypeEstimations'
    ]),

    initData(force) {
      this.resetTasks()
      this.focusSearchField({ preventScroll: true })
      if (this.tasks.length < 2) {
        this.loading.entities = true
        this.errors.entities = false
        this.initTaskType(force)
          .then(this.setCurrentScheduleItem)
          .then(() => {
            this.loading.entities = false
            this.resetTasks()
            this.focusSearchField({ preventScroll: true })
            let searchQuery = this.$route.query.search
            if (!searchQuery && this.searchField) {
              searchQuery = this.searchField.getValue()
            }
            if (searchQuery) this.onSearchChange(searchQuery)
            setTimeout(() => {
              this.setSearchFromUrl()
              this.resetTaskTypeDates()
            }, 200)
            if (this.isActiveTab('schedule')) {
              this.resetScheduleItems()
              this.resetScheduleScroll()
            }

            this.dueDateFilter = this.$route.query.duedate || 'all'
            this.estimationFilter = this.$route.query.late || 'all'
            this.priorityFilter = this.$route.query.priority || '-1'
            this.difficultyFilter = this.$route.query.difficulty || '-1'

            const taskId = this.$route.query.task_id
            const task = this.taskMap.get(taskId)
            if (task) {
              const index = this.tasks.findIndex(t => t.id === taskId)
              this.$nextTick(() => {
                this.$refs['task-list'].selectTask({}, index, task)
              })
            }
          })
          .catch(err => {
            console.error(err)
            this.loading.entities = false
            this.errors.entities = true
          })
      } else {
        this.loading.entities = true
        this.setCurrentScheduleItem().then(() => {
          this.resetTaskTypeDates()
          this.loading.entities = false
          let searchQuery = this.$route.query.search
          if (!searchQuery && this.searchField) {
            searchQuery = this.searchField.getValue()
          }
          if (searchQuery) this.onSearchChange(searchQuery)
          if (this.isActiveTab('schedule')) {
            this.resetScheduleItems()
            this.resetScheduleScroll()
          }
        })
      }
    },

    setCurrentScheduleItem() {
      const isShots = this.$route.path.includes('shots')
      if (this.isTVShow && isShots) {
        return this.loadEpisodeScheduleItems({
          production: this.currentProduction,
          taskType: this.currentTaskType
        }).then(items => {
          if (!items) {
            return []
          }
          this.currentScheduleItem = items.find(
            item =>
              item.task_type_id === this.currentTaskType.id &&
              item.object_id === this.currentEpisode.id
          )
          return this.currentScheduleItem
        })
      }
      return this.loadScheduleItems(this.currentProduction).then(items => {
        if (!items) {
          return []
        }
        this.currentScheduleItem = items.find(
          item => item.task_type_id === this.currentTaskType.id
        )
        return this.currentScheduleItem
      })
    },

    // Tabs

    isActiveTab(tab) {
      return this.activeTab === tab
    },

    updateActiveTab() {
      if (this.$route.path.indexOf('schedule') > 0) {
        this.activeTab = 'schedule'
      } else if (this.$route.path.indexOf('estimation') > 0) {
        this.activeTab = 'estimation'
      } else {
        this.activeTab = 'tasks'
      }
    },

    getRoute(section) {
      const routeTaskTypeId = this.$route.params.task_type_id
      const taskTypeId = this.currentTaskType
        ? this.currentTaskType.id
        : routeTaskTypeId
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId
        }
      }
      if (this.currentTaskType.for_entity === 'Episode') {
        route.name = `episodes-${route.name}`
      } else if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    // Search

    onSearchChange(query) {
      if (query && query.length !== 1) {
        query = query.toLowerCase().trim()
        const descriptors = (this.currentProduction.descriptors || []).filter(
          d => {
            return d.entity_type === this.entityType
          }
        )
        const keywords = getKeyWords(query) || []
        const excludingKeyWords = getExcludingKeyWords(query) || []
        const descFilters = getDescFilters(descriptors, [], query)
        const taskFilters = getTaskFilters(this.$options.taskIndex, query)
        if (
          keywords.length > 0 ||
          excludingKeyWords.length > 0 ||
          descFilters.length > 0 ||
          taskFilters.length > 0
        ) {
          let tasks = []
          const filters = taskFilters.concat(descFilters)
          if (keywords.length > 0) {
            tasks = indexSearch(this.$options.taskIndex, keywords)
          } else {
            this.resetTasks()
            tasks = this.tasks
          }
          tasks = applyFilters(tasks, filters, this.taskMap)
          this.tasks = this.sortTasks(tasks)
          if (this.isActiveTab('schedule')) this.resetScheduleItems()
        } else {
          this.resetTasks()
          if (this.isActiveTab('schedule')) this.resetScheduleItems()
        }
      } else {
        this.resetTasks()
        if (this.isActiveTab('schedule')) this.resetScheduleItems()
      }
      this.setSearchInUrl()
      this.clearSelectedTasks()
      if (filters[this.dueDateFilter]) {
        this.tasks = filters[this.dueDateFilter](this.tasks)
      }
      if (filters[this.estimationFilter]) {
        this.tasks = filters[this.estimationFilter](
          this.tasks,
          this.taskStatusMap
        )
      }
      if (this.priorityFilter !== '-1') {
        this.tasks = this.tasks.filter(
          t => t.priority === parseInt(this.priorityFilter)
        )
      }
      if (this.difficultyFilter !== '-1') {
        this.tasks = this.tasks.filter(
          t => t.difficulty === parseInt(this.difficultyFilter)
        )
      }
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      const entityType = this.entityType
      this.loading.savingSearch = true
      this.saveTaskSearch({ searchQuery, entityType })
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removeTaskSearch(searchQuery).catch(console.error)
    },

    updateUrlParams() {
      const search = this.searchField.getValue()
      const duedate = this.dueDateFilter
      const late = this.estimationFilter
      const priority = this.priorityFilter
      const difficulty = this.difficultyFilter
      this.$router.push({
        query: { search, duedate, late, priority, difficulty }
      })
    },

    // Tasks

    applyTaskFilters() {
      this.onSearchChange(this.searchField.getValue())
      this.sortTasks()
      this.$refs['task-list'].resetSelection()
      this.updateUrlParams()
      this.clearSelectedTasks()
    },

    onTaskSelected(task) {
      this.currentTask = task
      this.updateTaskInQuery()
    },

    updateTaskInQuery() {
      if (this.nbSelectedTasks === 1) {
        const selectedTaskIds = Array.from(this.selectedTasks.keys())
        const taskId = selectedTaskIds[0]
        this.$router.push({
          query: {
            ...this.$route.query,
            task_id: taskId
          }
        })
      } else {
        this.$router.push({
          query: {
            ...this.$route.query,
            task_id: undefined
          }
        })
      }
    },

    resetTasks() {
      let tasks = this.entityTasks

      if (['Episode', 'Sequence'].includes(this.entityTypes)) {
        tasks = tasks.filter(task => {
          const entity = this.entityMap.get(task.entity_id)
          return !entity.canceled
        })
      }
      this.tasks = this.sortTasks(tasks)
      this.resetTaskIndex()
    },

    resetTaskIndex() {
      if (!this.entityTasks) return
      this.$options.taskIndex = buildSupervisorTaskIndex(
        this.entityTasks,
        this.personMap,
        this.taskStatusMap
      )
      this.$options.taskIndex.me = indexSearch(
        this.$options.taskIndex,
        this.user.full_name.split(' ')
      )
    },

    getTasks(entities) {
      const tasks = []
      entities.forEach(entity => {
        const entityTasks = entity.tasks || []
        entityTasks.forEach(taskId => {
          const task = this.taskMap.get(taskId.id || taskId)
          if (task && !entity.canceled) {
            // Hack to allow filtering on linked entity metadata.
            this.$store.commit('SET_TASK_EXTRA_DATA', {
              task,
              data: entity.data
            })
            if (task.task_type_id === this.currentTaskType.id) {
              tasks.push(task)
            }
          }
        })
      })
      return tasks
    },

    sortTasks(tasks) {
      if (!tasks) tasks = this.tasks
      const isDesc = [
        'task_status_short_name',
        'entity_name',
        'due_date'
      ].includes(this.currentSort)
      if (this.currentSort === 'nb_frames') {
        this.tasks = tasks.sort((ta, tb) => {
          const nbFramesA = this.getEntity(ta.entity.id)?.nb_frames || 0
          const nbFramesB = this.getEntity(tb.entity.id)?.nb_frames || 0
          return nbFramesB - nbFramesA
        })
      } else if (this.currentSort !== name) {
        this.tasks = tasks.sort(
          firstBy(this.currentSort, isDesc ? 1 : -1).thenBy('entity_name')
        )
      } else {
        this.tasks = tasks.sort(firstBy('entity_name'))
      }
      return tasks
    },

    getEntity(entityId) {
      return this[`${this.entityType.toLowerCase()}Map`].get(entityId) || {}
    },

    onExportClick() {
      const taskLines = this.$refs['task-list'].getTableData()
      const nameData = [
        formatSimpleDate(moment()),
        this.currentProduction.name,
        this.currentTaskType.name,
        'tasks'
      ]
      if (this.currentEpisode) {
        nameData.splice(1, 0, this.currentEpisode.name)
      }
      const name = stringHelpers.slugify(nameData.join('_'))
      csv.buildCsvFile(name, taskLines)
    },

    updateEstimation({ taskId, days, item, daysOff }) {
      const estimation = daysToMinutes(this.organisation, days)
      const task = this.taskMap.get(taskId)
      let data = { estimation }
      if (!task.start_date) task.start_date = formatSimpleDate(moment())
      const startDate = parseDate(task.start_date)
      const dueDate = task.due_date ? parseDate(task.due_date) : null
      data = getDatesFromStartDate(
        this.organisation,
        startDate,
        dueDate,
        minutesToDays(this.organisation, estimation),
        daysOff
      )
      data.estimation = estimation
      if (item) {
        item.start_date = data.start_date
        item.startDate = parseDate(data.start_date)
        item.end_date = data.due_date
        item.endDate = parseDate(data.due_date)
      }
      if (item && item.startDate && item.endDate) {
        item.parentElement.startDate = this.getMinDate(item.parentElement)
        item.parentElement.endDate = this.getMaxDate(item.parentElement)
      }
      this.updateTask({ taskId, data }).catch(console.error)
    },

    // Schedule

    async resetScheduleItems() {
      const taskAssignationMap = this.buildAssignationMap()

      const assignees = Object.keys(taskAssignationMap).filter(
        id => id !== 'unassigned' && taskAssignationMap[id].length > 0
      )
      await this.loadDaysOff(assignees)

      const scheduleItems = this.team
        .map(person => this.buildPersonElement(person, taskAssignationMap))
        .filter(Boolean)
        .filter(item => item.children.length > 0)

      if (taskAssignationMap.unassigned.length > 0) {
        scheduleItems.push(
          this.buildPersonElement({ id: 'unassigned' }, taskAssignationMap)
        )
      }
      this.schedule.scheduleItems = scheduleItems
    },

    buildAssignationMap() {
      const taskAssignationMap = { unassigned: [] }
      this.team.forEach(person => {
        if (person) taskAssignationMap[person.id] = []
      })
      this.tasks.forEach(task => {
        if (task.assignees.length > 0) {
          task.assignees.forEach(personId => {
            if (!taskAssignationMap[personId]) {
              taskAssignationMap[personId] = []
            }
            taskAssignationMap[personId].push(task)
          })
        } else {
          taskAssignationMap.unassigned.push(task)
        }
      })
      return taskAssignationMap
    },

    async loadDaysOff(personIds) {
      this.daysOffByPerson = []
      for (const personId of personIds) {
        // load sequentially to avoid too many requests
        const daysOff = await this.loadAggregatedPersonDaysOff({
          personId: personId
        }).catch(
          () => [] // fallback if not allowed to fetch days off
        )
        this.daysOffByPerson[personId] = daysOff
      }
    },

    buildPersonElement(person, taskAssignationMap) {
      if (!person) return null

      let manDays = 0
      let minStartDate
      let maxEndDate
      const personTasks = taskAssignationMap[person.id]

      let personElement
      if (person.id === 'unassigned') {
        personElement = {
          avatar: false,
          id: person.id,
          name: 'Unassigned',
          color: '#888',
          priority: 1,
          expanded: true,
          loading: false,
          children: [],
          editable: false
        }
      } else {
        personElement = {
          avatar: true,
          has_avatar: person.has_avatar,
          avatarPath: person.avatarPath,
          initials: person.initials,
          id: person.id,
          name: person.full_name,
          color: person.color,
          priority: 1,
          expanded: true,
          loading: false,
          children: [],
          editable: false,
          daysOff: this.daysOffByPerson[person.id],
          route: {
            name: 'person-tab',
            params: {
              person_id: person.id,
              tab: 'schedule'
            }
          }
        }
      }

      const children = personTasks.map(task => {
        const estimation = task.estimation
        let endDate

        let startDate = moment(this.schedule.taskTypeStartDate)
        if (task.start_date) {
          startDate = parseDate(task.start_date)
        } else if (task.real_start_date) {
          startDate = parseDate(task.real_start_date)
        }

        if (startDate.isAfter(this.schedule.endDate)) {
          startDate = this.schedule.endDate.clone().add(-1, 'days')
        }
        if (startDate.isBefore(this.schedule.startDate)) {
          startDate = this.schedule.startDate.clone()
        }

        if (task.due_date) {
          endDate = parseDate(task.due_date)
        } else if (task.end_date) {
          endDate = parseDate(task.end_date)
        } else if (task.estimation) {
          endDate = addBusinessDays(
            task.startDate,
            Math.ceil(minutesToDays(this.organisation, task.estimation)) - 1,
            personElement.daysOff
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

        if (endDate.isAfter(this.schedule.endDate)) {
          endDate = this.schedule.endDate.clone().add(-1, 'days')
          if (startDate.isAfter(endDate)) {
            startDate = endDate.clone().add(-1, 'days')
          }
        }

        if (estimation) manDays += estimation
        if (!minStartDate || minStartDate.isAfter(startDate)) {
          minStartDate = startDate.clone()
        }
        if (!maxEndDate || maxEndDate.isBefore(endDate)) {
          maxEndDate = endDate.clone()
        }

        return {
          ...task,
          name: task.entity_name,
          startDate,
          endDate,
          expanded: false,
          loading: false,
          man_days: estimation,
          editable: this.isSupervisorInDepartment,
          unresizable: true,
          parentElement: personElement,
          color: this.getTaskElementColor(task, endDate),
          children: []
        }
      })

      return {
        ...personElement,
        children,
        startDate: minStartDate,
        endDate: maxEndDate,
        man_days: manDays
      }
    },

    getTaskElementColor(task, endDate) {
      if (this.schedule.currentColor === 'status') {
        let color = this.taskStatusMap.get(task.task_status_id).color
        if (color === '#f5f5f5') color = '#999'
        return color
      } else if (this.schedule.currentColor === 'late') {
        const isLate =
          !this.taskStatusMap.get(task.task_status_id).is_done &&
          endDate.isBefore(moment())
        return isLate ? '#FF3860' : '#999'
      }
      return null
    },

    saveTaskScheduleItem(item) {
      if (item.estimation) {
        item.endDate = addBusinessDays(
          item.startDate,
          Math.ceil(minutesToDays(this.organisation, item.estimation)) - 1,
          item.parentElement.daysOff
        )
      }
      if (item.startDate && item.endDate) {
        item.parentElement.startDate = this.getMinDate(item.parentElement)
        item.parentElement.endDate = this.getMaxDate(item.parentElement)
        this.updateTask({
          taskId: item.id,
          data: {
            start_date: item.startDate.format('YYYY-MM-DD'),
            due_date: item.endDate.format('YYYY-MM-DD')
          }
        })
      }
    },

    getMinDate(personElement) {
      const endDate = this.productionEndDate
      let minDate = endDate.clone()
      personElement.children.forEach(item => {
        if (item.startDate && item.startDate.isBefore(minDate)) {
          minDate = item.startDate
        }
      })
      return minDate.clone()
    },

    getMaxDate(personElement) {
      const startDate = this.productionStartDate
      let maxDate = startDate.clone()
      personElement.children.forEach(item => {
        if (item.endDate && item.endDate.isAfter(maxDate)) {
          maxDate = item.endDate
        }
      })
      return maxDate.clone()
    },

    expandPersonElement(personElement) {
      personElement.expanded = !personElement.expanded
    },

    resetScheduleHeight() {
      this.$nextTick(() => {
        if (this.isActiveTab('schedule')) {
          const pageHeight = this.$refs.page.offsetHeight
          const headerHeight = this.$refs.header.offsetHeight
          this.schedule.scheduleHeight = pageHeight - headerHeight + 20
          if (this.$refs['schedule-widget']) {
            this.$refs['schedule-widget'].resetScheduleSize()
          }
        }
      })
    },

    showImportModal() {
      this.modals.importing = true
    },

    hideImportModal() {
      this.modals.importing = false
    },

    showImportRenderModal() {
      this.modals.isImportRenderDisplayed = true
    },

    hideImportRenderModal() {
      this.modals.isImportRenderDisplayed = false
    },

    resetImport() {
      this.errors.importing = false
      this.errors.importingError = null
      this.hideImportRenderModal()
      this.importCsvFormData = undefined
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    uploadImportFile(data) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File([csvContent], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.loading.importing = true
      this.errors.importing = false
      this.errors.importingError = null
      this.importCsvFormData = formData

      this.uploadTaskTypeEstimations(this.importCsvFormData) // to change
        .then(() => {
          this.hideImportRenderModal()
        })
        .catch(err => {
          this.errors.importingError = err
          this.errors.importing = true
        })
        .finally(() => {
          this.loading.importing = false
        })
    },

    renderImport(data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data).then(results => {
        this.parsedCSV = results
        this.hideImportModal()
        this.loading.importing = false
        this.showImportRenderModal()
      })
    },

    resetTaskTypeDates() {
      if (this.currentScheduleItem) {
        this.schedule.taskTypeStartDate = parseDate(
          this.currentScheduleItem.start_date
        ).toDate()
        this.schedule.taskTypeEndDate = parseDate(
          this.currentScheduleItem.end_date
        ).toDate()
      }
    },

    resetScheduleScroll() {
      if (this.$refs['schedule-widget']) {
        const today = moment()
        if (
          today.isBefore(moment(this.schedule.taskTypeStartDate)) ||
          today.isAfter(moment(this.schedule.taskTypeEndDate))
        ) {
          this.$refs['schedule-widget'].scrollToDate(
            moment(this.schedule.taskTypeStartDate).add(20, 'days')
          )
        } else {
          this.$refs['schedule-widget'].scrollToToday()
        }
      }
    }
  },

  watch: {
    $route() {
      this.updateActiveTab()
    },

    currentProduction() {
      this.initData(true)
    },

    nbSelectedTasks() {
      this.updateTaskInQuery()
    },

    // Quickfix for the edge case where the backPath is not properly set
    // because it was set when the episode was not fully loaded.
    currentEpisode() {
      if (this.currentEpisode && !this.backPath.params.episode_id) {
        this.$store.commit('RESET_PRODUCTION_PATH', {
          productionId: this.currentProduction.id,
          episodeId: this.currentEpisode.id
        })
      }
    },

    dueDateFilter() {
      this.applyTaskFilters()
    },

    estimationFilter() {
      this.applyTaskFilters()
    },

    priorityFilter() {
      this.applyTaskFilters()
    },

    difficultyFilter() {
      this.applyTaskFilters()
    },

    currentSort() {
      this.sortTasks()
      this.$refs['task-list'].resetSelection()
      this.clearSelectedTasks()
      this.updateTaskInQuery()
    },

    'schedule.currentColor'() {
      this.resetScheduleItems()
    },

    activeTab() {
      if (this.isActiveTab('schedule')) {
        this.resetScheduleItems()
        this.resetScheduleHeight()
        this.$nextTick(() => {
          this.resetScheduleScroll()
        })
      }
    },

    currentScheduleItem() {
      if (this.currentScheduleItem) {
        this.resetTaskTypeDates()
      }
    },

    'schedule.taskTypeStartDate'() {
      const newDate = formatSimpleDate(this.schedule.taskTypeStartDate)
      if (newDate !== this.currentScheduleItem.start_date) {
        this.$store.commit('SET_SCHEDULE_ITEM_DATES', {
          scheduleItem: this.currentScheduleItem,
          dates: {
            startDate: moment(this.schedule.taskTypeStartDate),
            endDate: moment(this.schedule.taskTypeEndDate)
          }
        })
        this.saveScheduleItem(this.currentScheduleItem)
      }
    },

    'schedule.taskTypeEndDate'() {
      const newDate = formatSimpleDate(this.schedule.taskTypeEndDate)
      if (newDate !== this.currentScheduleItem.end_date) {
        this.$store.commit('SET_SCHEDULE_ITEM_DATES', {
          scheduleItem: this.currentScheduleItem,
          dates: {
            startDate: moment(this.schedule.taskTypeStartDate),
            endDate: moment(this.schedule.taskTypeEndDate)
          }
        })
        this.saveScheduleItem(this.currentScheduleItem)
      }
    }
  },

  socket: {
    events: {
      'task:update'(eventData) {
        if (
          this.taskMap.get(eventData.task_id) &&
          !this.isActiveTab('schedule')
        ) {
          setTimeout(() => {
            this.resetTaskIndex()
            this.$nextTick(() => {
              if (!this.selectedTasks.get(eventData.task_id)) {
                this.onSearchChange(this.searchField.getValue())
              }
            })
          }, 1000)
        }
      }
    }
  },

  head() {
    return {
      title: `${this.title} - Kitsu`
    }
  }
}
</script>

<style scoped lang="scss">
.page-header {
  margin-top: 1em;
  margin-right: 0;
}

.search-options {
  align-items: flex-end;
}

.tabs ul {
  margin-left: 0;
}

.page {
  flex: 1;
  height: 100%;
}

.back-link {
  padding-top: 5px;
  margin-right: 5px;
}

.task-type {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.columns {
  display: flex;
  flex-direction: row;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  overflow: hidden;
}

.sorting-combobox {
  padding-top: 3px;
}

.field {
  margin-bottom: 0;
}

.query-list {
  margin-bottom: 0;
  margin-top: 0.2em;
  margin-left: 1em;
  min-height: 25px;
}

.push-right {
  flex: 1;
  text-align: right;
}

.task-type-schedule {
  flex: 1;
}

.zoom-level {
  margin-bottom: 6px;
}

.task-type-estimation {
  display: flex;
  max-height: calc(100% - 200px);
}
</style>
