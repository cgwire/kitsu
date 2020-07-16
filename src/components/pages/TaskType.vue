<template>
<div class="task-type columns fixed-page">
  <div class="column main-column">
    <div class="task-type page" ref="page">
      <div class="task-type-header page-header flexrow-item" ref="header">
        <div class="flexcolumn-item flexrow">
          <router-link
            class="back-link flexrow-item"
            :to="backPath"
          >
            <chevron-left-icon />
          </router-link>
          <task-type-name
            class="flexrow-item"
            :task-type="currentTaskType"
          />
          <div class="filler"></div>
          <div class="flexrow-item">
            <button-simple
              icon="download"
              :title="$t('main.csv.export_file')"
              @click="onExportClick"
              v-if="!isActiveTab('schedule')"
            />
          </div>
        </div>

        <div class="tabs mt1">
          <ul>
            <li :class="{'is-active': isActiveTab('tasks')}">
              <router-link :to="tasksPath">
                {{ $t('tasks.tasks')}}
              </router-link>
            </li>
            <li :class="{'is-active': isActiveTab('schedule')}">
              <router-link :to="schedulePath">
                {{ $t('schedule.title')}}
              </router-link>
            </li>
            <li :class="{'is-active': isActiveTab('estimation')}">
              <router-link :to="estimationPath">
                {{ $t('estimation.title')}}
              </router-link>
            </li>
          </ul>
        </div>

        <div
          class="flexcolumn-item flexrow"
        >
          <div
            class="flexrow-item"
          >
            <search-field
              ref="task-search-field"
              :can-save="true"
              @change="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: retake chara"
            />
          </div>
          <div class="filler"></div>
          <div
            class="flexrow-item"
            v-if="isActiveTab('tasks')"
          >
            <combobox
              :label="$t('main.sorted_by')"
              :options="sortOptions"
              locale-key-prefix="tasks.fields."
              v-model="currentSort"
            />
          </div>

          <div
            class="flexrow-item field"
            v-if="isActiveTab('schedule') && isCurrentUserManager"
          >
            <label class="label">
              {{ $t('main.start_date') }}
            </label>
            <datepicker
              wrapper-class="datepicker"
              input-class="date-input input"
              :language="locale"
              :disabled-dates="startDisabledDates"
              :monday-first="true"
              format="yyyy-MM-dd"
              v-model="schedule.selectedStartDate"
            />
          </div>
          <div
            class="flexrow-item field"
            v-if="isActiveTab('schedule') && isCurrentUserManager"
          >
            <label class="label">
              {{ $t('main.end_date') }}
            </label>
            <datepicker
              wrapper-class="datepicker"
              input-class="date-input input"
              :language="locale"
              :disabled-dates="endDisabledDates"
              :monday-first="true"
              format="yyyy-MM-dd"
              v-model="schedule.selectedEndDate"
            />
          </div>

          <div
            class="flexrow-item color-option"
            v-if="isActiveTab('schedule')"
          >
            <combobox
              class="flexrow-item"
              :label="$t('tasks.colors.title')"
              :options="schedule.colorOptions"
              locale-key-prefix="tasks.colors."
              v-model="schedule.currentColor"
            />
          </div>
          <div
            class="flexrow-item zoom-level"
            v-if="isActiveTab('schedule')"
          >
            <combobox-number
              :label="$t('schedule.zoom_level')"
              :options="schedule.zoomOptions"
              v-model="schedule.zoomLevel"
              v-if="isActiveTab('schedule')"
            />
          </div>
        </div>
      </div>
      <div class="query-list">
        <search-query-list
          :queries="searchQueries"
          @changesearch="changeSearch"
          @removesearch="removeSearchQuery"
          v-if="!loading.entities"
        />
      </div>

      <task-list
        ref="task-list"
        :tasks="tasks"
        :is-assets="isAssets"
        :is-loading="loading.entities"
        :is-error="errors.entities"
        @task-selected="onTaskSelected"
        v-if="isActiveTab('tasks')"
      />

      <div
        class="task-type-schedule flexrow-item"
        v-if="isActiveTab('schedule')"
      >
        <schedule
          ref="schedule-widget"
          :start-date="schedule.startDate"
          :end-date="schedule.endDate"
          :hierarchy="schedule.scheduleItems"
          :zoom-level=schedule.zoomLevel
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
          :is-assets="isAssets"
          :tasks="tasks"
          @estimation-changed="updateEstimation"
        />
      </div>

    </div>
  </div>

  <div
    class="column side-column"
    v-if="nbSelectedTasks === 1"
  >
    <task-info
      :task="Object.values(selectedTasks)[0]"
    />
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import firstBy from 'thenby'
import moment from 'moment'
import { searchMixin } from '../mixins/search'

import csv from '../../lib/csv'
import { buildSupervisorTaskIndex, indexSearch } from '../../lib/indexing'
import { sortPeople } from '../../lib/sorting'
import { slugify } from '../../lib/string'
import {
  daysToMinutes,
  formatSimpleDate,
  getDatesFromStartDate,
  minutesToDays,
  parseDate
} from '../../lib/time'
import {
  applyFilters,
  getDescFilters,
  getExcludingKeyWords,
  getKeyWords,
  getTaskFilters
} from '../../lib/filtering'

import { formatListMixin } from '../lists/format_mixin.js'

import { ChevronLeftIcon } from 'vue-feather-icons'
import ButtonSimple from '../widgets/ButtonSimple'
import Datepicker from 'vuejs-datepicker'
import Combobox from '../widgets/Combobox'
import ComboboxNumber from '../widgets/ComboboxNumber'
import EstimationHelper from './tasktype/EstimationHelper'
import Schedule from './schedule/Schedule'
import SearchField from '../widgets/SearchField'
import SearchQueryList from '../widgets/SearchQueryList'
import TaskInfo from '../sides/TaskInfo'
import TaskList from '../lists/TaskList'
import TaskTypeName from '../widgets/TaskTypeName'

export default {
  name: 'task-type-page',
  mixins: [formatListMixin, searchMixin],
  components: {
    ButtonSimple,
    ChevronLeftIcon,
    Combobox,
    ComboboxNumber,
    Datepicker,
    EstimationHelper,
    Schedule,
    SearchField,
    SearchQueryList,
    TaskList,
    TaskInfo,
    TaskTypeName
  },

  entityListCache: [],

  data () {
    return {
      activeTab: 'tasks',
      currentSort: 'entity_name',
      currentScheduleItem: null,
      currentTask: null,
      isAssets: true,
      tasks: [],
      selection: {},
      errors: {
        entities: false
      },
      loading: {
        entities: false
      },
      schedule: {
        currentColor: 'status',
        endDate: moment().add(3, 'months'),
        scheduleItems: [],
        scheduleHeight: 800,
        selectedEndDate: moment().add(3, 'months').toDate(),
        selectedStartDate: moment().add(-1, 'months').toDate(),
        startDate: moment().add(-1, 'months'),
        zoomLevel: 1,
        zoomOptions: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 }
        ],
        colorOptions: [
          { label: 'Neutral', value: 'neutral' },
          { label: 'Status', value: 'status' },
          { label: 'Late', value: 'late' }
        ]
      }
    }
  },

  created () {
    if (!this.currentProduction) {
      this.setProduction(this.$route.params.production_id)
    } else {
      const options = { productionId: this.currentProduction.id }
      if (this.currentEpisode) options.episodeId = this.currentEpisode.id
      this.$store.commit('RESET_PRODUCTION_PATH', options)
    }
  },

  mounted () {
    this.isAssets = this.$route.path.includes('assets')
    this.updateActiveTab()
    setTimeout(() => {
      this.initData(false)
      this.$refs['schedule-widget'].scrollToToday()
    }, 100)
    window.addEventListener('resize', this.resetScheduleHeight)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resetScheduleHeight)
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsPath',
      'currentEpisode',
      'currentProduction',
      'currentTaskType',
      'isCurrentUserManager',
      'isTVShow',
      'nbSelectedTasks',
      'organisation',
      'personMap',
      'selectedTasks',
      'sequenceSubscriptions',
      'shotsByEpisode',
      'shotMap',
      'shotsPath',
      'taskSearchQueries',
      'taskStatusMap',
      'taskMap',
      'user'
    ]),

    locale () {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    },

    startDisabledDates () {
      return {
        to: parseDate(this.currentProduction.start_date).toDate(),
        from: this.schedule.endDate.toDate(),
        days: [6, 0]
      }
    },

    endDisabledDates () {
      return {
        to: this.schedule.startDate.toDate(),
        from: parseDate(this.currentProduction.end_date).toDate(),
        days: [6, 0]
      }
    },

    // Meta

    assetTasks () {
      return this.getTasks(Object.values(this.assetMap))
    },

    shotTasks () {
      return this.getTasks(Object.values(this.shotMap))
    },

    title () {
      if (this.currentProduction) {
        if (this.isTVShow && this.currentEpisode) {
          return `${this.currentProduction.name} / ` +
                 `${this.currentEpisode.name} / ` +
                 `${this.currentTaskType.name}`
        } else {
          return `${this.currentProduction.name} / ${this.currentTaskType.name}`
        }
      } else {
        return 'Loading...'
      }
    },

    // Paths

    backPath () {
      if (this.isActiveTab('schedule')) {
        return {
          name: 'schedule',
          params: {
            production_id: this.currentProduction.id
          }
        }
      } else {
        if (this.currentTaskType.for_shots) {
          return this.shotsPath
        } else {
          return this.assetsPath
        }
      }
    },

    tasksPath () {
      return this.getRoute('task-type')
    },

    schedulePath () {
      return this.getRoute('task-type-schedule')
    },

    estimationPath () {
      return this.getRoute('task-type-estimation')
    },

    // Helpers

    sortOptions () {
      return [
        'entity_name',
        'task_status_short_name',
        'priority',
        'estimation',
        'duration',
        'retake_count',
        'due_date',
        'real_start_date',
        'end_date',
        'last_comment_date'
      ].map((name) => ({ label: name, value: name }))
    },

    searchQueries () {
      if (this.isAssets) {
        return this.taskSearchQueries.filter(t => t.entity_type === 'Asset')
      } else {
        return this.taskSearchQueries
      }
    },

    scheduleTeam () {
      const scheduleTeam = this.currentProduction.team.map((personId) => {
        return this.personMap[personId]
      })
      return sortPeople(scheduleTeam)
    },

    scheduleWidget () {
      return this.$refs['schedule-widget']
    },

    searchField () {
      return this.$refs['task-search-field']
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'initTaskType',
      'loadEpisodeScheduleItems',
      'loadScheduleItems',
      'removeTaskSearch',
      'saveScheduleItem',
      'saveTaskSearch',
      'setProduction',
      'subscribeToSequence',
      'updateTask',
      'unsubscribeFromSequence'
    ]),

    initData (force) {
      this.resetTasks()
      this.resetTaskIndex()
      this.focusSearchField()
      if (this.tasks.length === 0) {
        this.loading.entities = true
        this.errors.entities = false
        this.initTaskType(force)
          .then(this.setCurrentScheduleItem)
          .then(() => {
            this.loading.entities = false
            this.resetTasks()
            this.resetTaskIndex()
            this.focusSearchField()
            const searchQuery = this.searchField.getValue()
            if (searchQuery) this.onSearchChange(searchQuery)
            setTimeout(() => {
              this.setSearchFromUrl()
            }, 200)
            if (this.isActiveTab('schedule')) {
              this.resetScheduleItems()
              this.$refs['schedule-widget'].scrollToToday()
            }
          })
          .catch((err) => {
            console.error(err)
            this.loading.entities = false
            this.errors.entities = true
          })
      } else {
        this.loading.entities = true
        this.setCurrentScheduleItem()
          .then(() => {
            this.loading.entities = false
            if (this.isActiveTab('schedule')) {
              this.resetScheduleItems()
              this.$refs['schedule-widget'].scrollToToday()
            }
          })
      }
    },

    setCurrentScheduleItem () {
      if (this.isTVShow) {
        return this.loadEpisodeScheduleItems({
          production: this.currentProduction,
          taskType: this.currentTaskType
        })
          .then((items) => {
            if (!items) {
              Promise.resolve([])
            } else {
              this.currentScheduleItem = items.find((item) => {
                return (
                  item.task_type_id === this.currentTaskType.id &&
                  item.object_id === this.currentEpisode.id
                )
              })
              Promise.resolve(this.currentScheduleItem)
            }
          })
      } else {
        return this.loadScheduleItems(this.currentProduction)
          .then((items) => {
            if (!items) {
              Promise.resolve([])
            } else {
              this.currentScheduleItem = items.find((item) => {
                return item.task_type_id === this.currentTaskType.id
              })
              Promise.resolve(this.currentScheduleItem)
            }
          })
      }
    },

    // Tabs

    isActiveTab (tab) {
      return this.activeTab === tab
    },

    updateActiveTab () {
      if (this.$route.path.indexOf('schedule') > 0) {
        this.activeTab = 'schedule'
      } else if (this.$route.path.indexOf('estimation') > 0) {
        this.activeTab = 'estimation'
      } else {
        this.activeTab = 'tasks'
      }
    },

    getRoute (section) {
      const routeTaskTypeId = this.$route.params.task_type_id
      const taskTypeId =
        this.currentTaskType ? this.currentTaskType.id : routeTaskTypeId
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId
        }
      }
      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    },

    // Search

    onSearchChange (query) {
      if (query && query.length !== 1) {
        query = query.toLowerCase().trim()
        const descriptors = this.currentProduction.descriptors
          .filter(d => d.entityType === this.isAssets ? 'Asset' : 'Shot')
        const keywords = getKeyWords(query) || []
        const excludingKeyWords = getExcludingKeyWords(query) || []
        const descFilters = getDescFilters(descriptors, query)
        if (
          keywords.length > 0 ||
          excludingKeyWords.length > 0 ||
          descFilters.length > 0
        ) {
          let tasks = []
          const filters = getTaskFilters(this.$options.taskIndex, query)
            .concat(descFilters)
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
    },

    saveSearchQuery (searchQuery) {
      const entityType = this.isAssets ? 'Asset' : 'Shot'
      this.saveTaskSearch({ searchQuery, entityType })
        .then(() => {
        })
        .catch((err) => {
          console.error(err)
        })
    },

    removeSearchQuery (searchQuery) {
      this.removeTaskSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          console.error(err)
        })
    },

    // Tasks

    onTaskSelected (task) {
      this.currentTask = task
    },

    resetTasks () {
      if (this.isAssets) {
        this.tasks = this.assetTasks
      } else {
        this.tasks = this.shotTasks
      }
      this.tasks = this.sortTasks()
    },

    resetTaskIndex () {
      if (this.isAssets) {
        this.$options.taskIndex = buildSupervisorTaskIndex(
          this.assetTasks, this.personMap
        )
      } else {
        this.$options.taskIndex = buildSupervisorTaskIndex(
          this.shotTasks, this.personMap
        )
      }
      this.$options.taskIndex.me =
        indexSearch(this.$options.taskIndex, this.user.full_name.split(' '))
    },

    getTasks (entities) {
      const tasks = []
      entities.forEach((entity) => {
        entity.tasks.forEach((taskId) => {
          const task = this.taskMap[taskId]
          // Hack to allow filtering on linked entity metadata.
          task.data = entity.data
          if (task && task.task_type_id === this.currentTaskType.id) {
            tasks.push(task)
          }
        })
      })
      return tasks
    },

    sortTasks (tasks) {
      if (!tasks) tasks = this.tasks
      const isDesc = [
        'task_status_short_name',
        'entity_name',
        'due_date'
      ].includes(
        this.currentSort
      )
      return tasks.sort(
        firstBy(this.currentSort, isDesc ? 1 : -1)
          .thenBy('entity_name')
      )
    },

    onExportClick () {
      const taskLines = this.$refs['task-list'].getTableData()
      const nameData = [
        moment().format('YYYY-MM-DD'),
        this.currentProduction.name,
        this.currentTaskType.name,
        'tasks'
      ]
      if (this.currentEpisode) {
        nameData.splice(1, 0, this.currentEpisode.name)
      }
      const name = slugify(nameData.join('_'))
      csv.buildCsvFile(name, taskLines)
    },

    updateEstimation ({ taskId, days, item }) {
      const estimation = daysToMinutes(this.organisation, parseInt(days))
      const task = this.taskMap[taskId]
      let data = { estimation }
      if (!task.start_date) task.start_date = moment().format('YYYY-MM-DD')
      const startDate = moment(task.start_date)
      const dueDate = task.due_date ? moment(task.due_date) : null
      data = getDatesFromStartDate(
        startDate,
        dueDate,
        minutesToDays(this.organisation, estimation)
      )
      data.estimation = estimation
      if (item && !item.startDate) {
        item.startDate = moment.tz(data.end_date, 'YYYY-MM-DD', 'UTC')
      }
      if (item && !item.endDate) {
        item.endDate = moment.tz(data.end_date, 'YYYY-MM-DD', 'UTC')
      }
      if (item && item.startDate && item.endDate) {
        item.parentElement.startDate = this.getMinDate(item.parentElement)
        item.parentElement.endDate = this.getMaxDate(item.parentElement)
      }

      this.updateTask({ taskId, data })
        .catch(console.error)
    },

    // Schedule

    resetScheduleItems () {
      const taskAssignationMap = this.buildAssignationMap()
      let scheduleItems = this.scheduleTeam
        .map(person => this.buildPersonElement(person, taskAssignationMap))
        .filter(item => item)
        .filter(item => item.children.length > 0)

      if (taskAssignationMap.unassigned.length !== 0) {
        scheduleItems = scheduleItems.concat([
          this.buildPersonElement({ id: 'unassigned' }, taskAssignationMap)
        ])
      }
      this.schedule.scheduleItems = scheduleItems
    },

    buildAssignationMap () {
      const taskAssignationMap = { unassigned: [] }
      this.scheduleTeam.forEach((person) => {
        if (person) taskAssignationMap[person.id] = []
      })
      this.tasks.forEach((task) => {
        if (task.assignees.length > 0) {
          task.assignees.forEach((personId) => {
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

    buildPersonElement (person, taskAssignationMap) {
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
          for_shots: false,
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
          uniqueHash: person.uniqueHash,
          initials: person.initials,
          id: person.id,
          name: person.full_name,
          color: person.color,
          for_shots: false,
          priority: 1,
          expanded: true,
          loading: false,
          children: [],
          editable: false
        }
      }

      const children = personTasks.map((task) => {
        const estimation = this.formatEstimation(task.estimation)
        let endDate

        let startDate = moment()
        if (task.start_date) {
          startDate = moment(task.start_date, 'YYYY-MM-DD')
        } else if (task.real_start_date) {
          startDate = moment(task.real_start_date, 'YYYY-MM-DD')
        }

        if (task.due_date) {
          endDate = moment(task.due_date, 'YYYY-MM-DD')
        } else if (task.end_date) {
          endDate = moment(task.end_date, 'YYYY-MM-DD')
        } else if (task.estimation) {
          endDate = startDate.add(estimation, 'days')
        }
        if (!endDate || endDate.isBefore(startDate)) {
          const nbDays = startDate.isoWeekday() === 5 ? 3 : 1
          endDate = startDate.add(nbDays, 'days')
        }

        if (!startDate) startDate = moment()
        if (!endDate.isAfter(startDate)) {
          const nbDays = startDate.isoWeekday() === 5 ? 3 : 1
          endDate = startDate.clone().add(nbDays, 'days')
        }

        if (estimation) manDays += parseInt(estimation)
        if (!minStartDate || minStartDate.isAfter(startDate)) {
          minStartDate = startDate.clone()
        }
        if (!maxEndDate || maxEndDate.isBefore(endDate)) {
          maxEndDate = endDate.clone()
        }

        return {
          ...task,
          name: task.entity_name,
          startDate: startDate,
          endDate: endDate,
          expanded: false,
          loading: false,
          man_days: estimation,
          editable: this.isCurrentUserManager,
          unresizable: estimation > 0,
          parentElement: personElement,
          color: this.getTaskElementColor(task, endDate),
          children: []
        }
      })
      Object.assign(personElement, {
        children: children,
        startDate: minStartDate,
        endDate: maxEndDate,
        man_days: manDays
      })
      return personElement
    },

    getTaskElementColor (task, endDate) {
      if (this.schedule.currentColor === 'status') {
        let color = this.taskStatusMap[task.task_status_id].color
        if (color === '#f5f5f5') color = '#999'
        return color
      } else if (this.schedule.currentColor === 'late') {
        const isLate = (
          !this.taskStatusMap[task.task_status_id].is_done &&
          endDate.isBefore(moment())
        )
        return isLate ? '#FF3860' : null
      } else {
        return null
      }
    },

    saveTaskScheduleItem (item) {
      if (!this.$options.savingBuffer) this.$options.savingBuffer = {}
      if (!this.$options.savingBuffer[item.id]) {
        this.$options.savingBuffer[item.id] = item
        setTimeout(() => {
          item = { ...this.$options.savingBuffer[item.id] }
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
          this.$options.savingBuffer[item.id] = undefined
        }, 1000)
      } else {
        this.$options.savingBuffer[item.id] = item
      }
    },

    getMinDate (personElement) {
      let minDate = this.schedule.endDate.clone()
      personElement.children.forEach((item) => {
        if (item.startDate && item.startDate.isBefore(minDate)) {
          minDate = item.startDate
        }
      })
      return minDate.clone()
    },

    getMaxDate (personElement) {
      let maxDate = this.schedule.startDate.clone()
      personElement.children.forEach((item) => {
        if (item.endDate && item.endDate.isAfter(maxDate)) {
          maxDate = item.endDate
        }
      })
      return maxDate.clone()
    },

    expandPersonElement (personElement) {
      personElement.expanded = !personElement.expanded
    },

    resetScheduleHeight () {
      this.$nextTick(() => {
        if (this.isActiveTab('schedule')) {
          const pageHeight = this.$refs.page.offsetHeight
          const headerHeight = this.$refs.header.offsetHeight
          this.schedule.scheduleHeight = pageHeight - headerHeight + 20
          this.$refs['schedule-widget'].resetScheduleSize()
        }
      })
    }
  },

  watch: {
    $route () {
      this.updateActiveTab()
    },

    currentProduction () {
      this.initData(true)
    },

    currentSort () {
      this.sortTasks()
      this.$refs['task-list'].resetSelection()
      this.clearSelectedTasks()
    },

    'schedule.currentColor' () {
      this.resetScheduleItems()
    },

    activeTab () {
      if (this.isActiveTab('schedule')) {
        this.resetScheduleItems()
        this.resetScheduleHeight()
        this.$nextTick(() => {
          if (this.$refs['schedule-widget']) {
            this.$refs['schedule-widget'].scrollToToday()
          }
        })
      }
    },

    currentScheduleItem () {
      if (this.currentScheduleItem) {
        this.schedule.startDate =
          parseDate(this.currentScheduleItem.start_date)
        this.schedule.endDate = parseDate(this.currentScheduleItem.end_date)
        this.schedule.selectedStartDate = this.schedule.startDate.toDate()
        this.schedule.selectedEndDate = this.schedule.endDate.toDate()
      }
    },

    'schedule.selectedStartDate' () {
      const newDate = formatSimpleDate(this.schedule.selectedStartDate)
      if (newDate !== this.currentScheduleItem.start_date) {
        this.schedule.startDate = parseDate(newDate)
        this.currentScheduleItem.startDate = this.schedule.startDate
        this.currentScheduleItem.endDate = this.schedule.endDate
        this.saveScheduleItem(this.currentScheduleItem)
      }
    },

    'schedule.selectedEndDate' () {
      const newDate = formatSimpleDate(this.schedule.selectedEndDate)
      if (newDate !== this.currentScheduleItem.end_date) {
        this.schedule.endDate = parseDate(newDate)
        this.currentScheduleItem.startDate = this.schedule.startDate
        this.currentScheduleItem.endDate = this.schedule.endDate
        this.saveScheduleItem(this.currentScheduleItem)
      }
    }
  },

  socket: {
    events: {
      'task:update' (eventData) {
        if (this.taskMap[eventData.task_id]) {
          setTimeout(this.resetTaskIndex, 1000)
        }
      }
    }
  },

  metaInfo () {
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

.supervisor-asset-type,
.supervisor-sequence {
  text-transform: uppercase;
  color: $grey;
  border-bottom: 1px solid $light-grey;
  font-size: 1.2em;
  margin-bottom: 1em;
  padding-bottom: 0.5em;
}

.supervisor-asset-list,
.supervisor-shot-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
  border-right: 3px solid $light-grey;
  overflow: hidden;
}

.sorting-combobox {
  padding-top: 3px;
}

.field {
  margin: 0;
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
  margin-top: -8px;
}

.task-type-estimation {
  display: flex;
  max-height: calc(100% - 200px);
}
</style>
