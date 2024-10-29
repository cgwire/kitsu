<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="flexrow project-dates">
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <date-field
            v-model="selectedStartDate"
            @update:model-value="onUpdateSelectedStartDate"
          />
        </div>
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field
            v-model="selectedEndDate"
            @update:model-value="onUpdateSelectedEndDate"
          />
        </div>
        <combobox-number
          class="flexrow-item zoom-level"
          :label="$t('schedule.zoom_level')"
          :options="zoomOptions"
          v-model="zoomLevel"
        />
        <combobox-department
          class="flexrow-item"
          :label="$t('main.department')"
          v-model="selectedDepartment"
        />
        <combobox-studio
          class="flexrow-item"
          :label="$t('main.studio')"
          v-model="selectedStudio"
        />
        <div class="flexrow-item people-filter">
          <label class="label">
            {{ $t('main.person') }}
          </label>
          <people-field
            ref="people-field"
            :people="selectablePeople"
            :placeholder="$t('team_schedule.person_placeholder')"
            wide
            v-model="selectedPerson"
          />
        </div>
        <div class="filler"></div>
        <div class="flexrow">
          <button-simple
            class="flexrow-item"
            icon="clock"
            :text="$t('schedule.today')"
            @click="scrollScheduleToToday"
          />
          <button-simple
            :active="isTaskSidePanelOpen"
            class="flexrow-item"
            icon="list"
            :text="$t('tasks.unassigned_tasks')"
            @click="toggleTaskSidePanel"
          />
        </div>
      </div>

      <schedule
        ref="schedule"
        :dragged-items="draggedTasks"
        :end-date="endDate"
        :hide-man-days="true"
        :hierarchy="scheduleItems"
        :is-error="errors.schedule"
        :is-estimation-linked="true"
        :multiline="true"
        :reassignable="true"
        :start-date="startDate"
        :with-milestones="false"
        :zoom-level="zoomLevel"
        @item-assign="onScheduleItemAssigned"
        @item-changed="onScheduleItemChanged"
        @item-drop="onScheduleItemDropped"
        @item-unassign="onScheduleItemUnassigned"
        @root-element-expanded="expandPersonElement"
      />
    </div>

    <div class="column side-column" v-if="isTaskSidePanelOpen">
      <task-info>
        <a class="close-button" @click="toggleTaskSidePanel">x</a>
        <h2 class="mt1">
          {{ $t('tasks.unassigned_tasks') }}
          <template v-if="!loading.unassignedTasks">
            ({{ totalUnassignedTasks }})
          </template>
        </h2>
        <div class="mb2">
          <combobox-production
            class="mb05"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="filters.productionId"
            @update:model-value="loadUnassignedTasks()"
          />
          <combobox-task-type
            class="mb05"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            v-model="filters.taskTypeId"
            @update:model-value="loadUnassignedTasks()"
          />
        </div>
        <template v-if="unassignedTasks.length > 0">
          <ul class="task-list">
            <li
              class="task-item"
              :draggable="true"
              :key="task.id"
              @dragstart="onTaskDragStart($event, task)"
              @drag="onTaskDrag"
              @dragend="onTaskDragEnd"
              v-for="task in unassignedTasks"
            >
              <div
                class="ui-droppable"
                :style="{ borderColor: task.type_color }"
              >
                <div class="flexrow">
                  <div class="flexrow-item filler">
                    <production-name
                      class="strong mb05"
                      :production="task.production"
                      :size="25"
                    />
                    <div class="ellipsis">{{ task.full_name }}</div>
                    <em v-if="task.man_days">
                      {{ $t('main.estimation') }}: {{ task.man_days }}
                      {{ $tc('main.man_days', task.man_days) }}
                    </em>
                  </div>
                  <entity-thumbnail
                    class="task-thumbnail flexrow-item"
                    :preview-file-id="task.entity_preview_file_id"
                    v-if="task.entity_preview_file_id"
                  />
                </div>
                <department-name
                  class="task-department"
                  :department="task.department"
                  no-padding
                  only-dot
                  v-if="task.department"
                />
              </div>
            </li>
          </ul>
          <div class="has-text-centered" v-if="loading.hasMoreUnassignedTasks">
            <spinner class="mt2" v-if="loading.unassignedTasks" />
            <button
              class="button mt2"
              @click="loadUnassignedTasks(true)"
              v-else
            >
              {{ $t('main.load_more') }}
            </button>
          </div>
        </template>
        <div v-else-if="loading.unassignedTasks">
          <spinner class="mt2" />
        </div>
        <div v-else-if="errors.unassignedTasks">
          <table-info is-error />
          <div class="has-text-centered pa1">
            <button-simple
              class="has-text-centered"
              :text="$t('main.reload')"
              @click="loadUnassignedTasks()"
            />
          </div>
        </div>
        <div class="has-text-centered" v-else>
          <em>{{ $t('main.no_results') }}</em>
        </div>
      </task-info>
    </div>
  </div>
</template>

<script>
/*
 * Page to manage the schedule of all the people in the studio
 */
import moment from 'moment-timezone'
import { firstBy } from 'thenby'
import { mapGetters, mapActions } from 'vuex'

import { getPersonTabPath } from '@/lib/path'
import { addBusinessDays, minutesToDays, parseSimpleDate } from '@/lib/time'
import colors from '@/lib/colors'

import { formatListMixin } from '@/components/mixins/format'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'team-schedule',

  mixins: [formatListMixin],

  components: {
    ButtonSimple,
    ComboboxDepartment,
    ComboboxNumber,
    ComboboxProduction,
    ComboboxStudio,
    ComboboxTaskType,
    DateField,
    DepartmentName,
    EntityThumbnail,
    PeopleField,
    ProductionName,
    Schedule,
    Spinner,
    TableInfo,
    TaskInfo
  },

  data() {
    return {
      draggedTasks: [],
      endDate: moment().add(3, 'months'),
      isTaskSidePanelOpen: false,
      personDates: {},
      scheduleItems: [],
      selectedDepartment: null,
      selectedEndDate: null,
      selectedPerson: null,
      selectedStartDate: null,
      selectedStudio: null,
      startDate: moment(),
      unassignedTasks: [],
      totalUnassignedTasks: 0,
      zoomLevel: 1,
      zoomOptions: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 }
      ],
      loading: {
        hasMoreUnassignedTasks: false,
        unassignedTasks: false
      },
      errors: {
        unassignedTasks: false,
        schedule: false
      },
      filters: {
        productionId: null,
        taskTypeId: null
      },
      pagination: {
        unassignedTasks: 1
      }
    }
  },

  mounted() {
    this.selectedDepartment = this.$route.query.department || undefined
    this.selectedStudio = this.$route.query.studio || undefined
    const zoom = parseInt(this.$route.query.zoom) || 1
    this.zoomLevel = Math.min(Math.max(zoom, 1), 4)

    this.init()
  },

  computed: {
    ...mapGetters([
      'daysOff',
      'departmentMap',
      'displayedPeople',
      'getProductionTaskTypes',
      'openProductions',
      'organisation',
      'productionMap',
      'studios',
      'taskTypeMap',
      'user'
    ]),

    daysOffByPerson() {
      return this.daysOff.reduce((acc, dayOff) => {
        if (!acc[dayOff.person_id]) {
          acc[dayOff.person_id] = []
        }
        acc[dayOff.person_id].push(dayOff)
        return acc
      }, {})
    },

    selectablePeople() {
      let selectablePeople = this.displayedPeople.filter(
        person => !person.is_bot
      )
      if (this.selectedDepartment) {
        selectablePeople = selectablePeople.filter(person =>
          person.departments.includes(this.selectedDepartment)
        )
      }
      if (this.selectedStudio) {
        selectablePeople = selectablePeople.filter(
          person => person.studio_id === this.selectedStudio
        )
      }
      return selectablePeople
    },

    productionList() {
      return this.addAllValue(this.openProductions)
    },

    taskTypeList() {
      const productionId = this.filters.productionId
      const types = this.getProductionTaskTypes(productionId).filter(
        type => type.for_entity !== 'Concept'
      )
      return this.addAllValue(types)
    }
  },

  methods: {
    ...mapActions([
      'assignSelectedTasks',
      'fetchPersonTasks',
      'getPersonsTasksDates',
      'loadDaysOff',
      'loadOpenTasks',
      'loadPeople',
      'unassignPersonFromTask',
      'updateTask'
    ]),

    addAllValue(list) {
      return [
        {
          id: '',
          color: '#999',
          name: this.$t('main.all'),
          short_name: this.$t('main.all')
        },
        ...list
      ]
    },

    async init() {
      await this.loadPeople()
      await this.loadPersonDates()
      await this.loadDaysOff()

      this.refreshSchedule()
      this.scrollScheduleToToday()

      this.startDate = moment()
      this.endDate = moment().add(3, 'months')
      Object.values(this.personDates).forEach(dates => {
        if (dates.startDate.isBefore(this.startDate)) {
          this.startDate = dates.startDate.clone()
        }
        if (dates.endDate.isAfter(this.endDate)) {
          this.endDate = dates.endDate.clone()
        }
      })

      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()
    },

    toggleTaskSidePanel() {
      this.isTaskSidePanelOpen = !this.isTaskSidePanelOpen

      if (!this.isTaskSidePanelOpen) {
        this.unassignedTasks = []
        this.errors.unassignedTasks = false
      }
    },

    async loadUnassignedTasks(more = false) {
      this.loading.unassignedTasks = true
      this.errors.unassignedTasks = false
      const page = more ? this.pagination.unassignedTasks + 1 : 1
      try {
        const { data, is_more, stats } = await this.loadOpenTasks({
          limit: 20,
          page,
          person_id: 'unassigned',
          project_id: this.filters.productionId,
          task_type_id: this.filters.taskTypeId
        })
        if (more) {
          this.pagination.unassignedTasks++
        } else {
          this.unassignedTasks = []
        }
        this.unassignedTasks = this.unassignedTasks.concat(
          // populate tasks with extra data
          data.map(task => ({
            ...task,
            full_name: `${task.entity_type_name} / ${task.entity_name} / ${task.type_name}`,
            man_days: minutesToDays(this.organisation, task.estimation),
            department: this.departmentMap.get(
              this.taskTypeMap.get(task.task_type_id)?.department_id
            ),
            production: this.productionMap.get(task.project_id)
          }))
        )
        this.totalUnassignedTasks = stats.total
        this.loading.hasMoreUnassignedTasks = is_more
      } catch (err) {
        this.errors.unassignedTasks = true
        console.error(err)
      }
      this.loading.unassignedTasks = false
    },

    async loadPersonDates(syncSchedule = false) {
      const personDatesList = await this.getPersonsTasksDates()
      this.personDates = {}
      personDatesList.forEach(p => {
        this.personDates[p.person_id] = {
          endDate: parseSimpleDate(p.max_date),
          startDate: parseSimpleDate(p.min_date)
        }
      })

      if (syncSchedule) {
        this.scheduleItems.forEach(scheduleItem => {
          const personDates = this.personDates[scheduleItem.id]
          if (personDates) {
            scheduleItem.startDate = personDates.startDate
            scheduleItem.endDate = personDates.endDate
          }
        })
      }
    },

    refreshSchedule() {
      const people = this.selectedPerson
        ? [this.selectedPerson]
        : this.selectablePeople
      this.scheduleItems = this.convertScheduleItems(people)
    },

    convertScheduleItems(scheduleItems) {
      return scheduleItems.map(item => {
        let startDate = moment()
        let endDate = moment()
        const personDates = this.personDates[item.id]
        if (personDates && personDates.startDate && personDates.endDate) {
          startDate = parseSimpleDate(personDates.startDate)
          endDate = parseSimpleDate(personDates.endDate)
        }
        return {
          ...item,
          avatar: true,
          color: item.color || colors.fromString(item.name, true),
          startDate,
          endDate,
          expanded: false,
          loading: false,
          editable: false,
          route: getPersonTabPath(item.id, 'schedule'),
          children: [],
          daysOff: this.daysOffByPerson[item.id]
        }
      })
    },

    buildTaskScheduleItem(parentElement, task) {
      let startDate = moment()
      let endDate

      if (!task.start_date || !task.due_date) {
        return null
      }

      if (task.start_date) {
        startDate = parseSimpleDate(task.start_date)
      }

      if (task.due_date) {
        endDate = parseSimpleDate(task.due_date)
      } else if (task.end_date) {
        endDate = parseSimpleDate(task.end_date)
      } else if (task.estimation) {
        endDate = addBusinessDays(
          task.startDate,
          Math.ceil(minutesToDays(this.organisation, task.estimation)) - 1,
          task.parentElement.daysOff
        )
      }

      if (!endDate || endDate.isBefore(startDate)) {
        endDate = startDate.clone().add(1, 'days')
      }
      const taskType = this.taskTypeMap.get(task.task_type_id)
      return {
        ...task,
        name: `${task.full_entity_name} / ${taskType.name}`,
        startDate,
        endDate,
        man_days: task.estimation,
        editable: true,
        unresizable: false,
        color: taskType.color,
        parentElement
      }
    },

    saveTaskScheduleItem(task) {
      return this.updateTask({
        taskId: task.id,
        data: {
          start_date: task.startDate.format('YYYY-MM-DD'),
          due_date: task.endDate.format('YYYY-MM-DD'),
          estimation: task.estimation
        }
      })
    },

    onTaskDragStart(event, task) {
      event.stopPropagation()
      event.target.classList.add('drag')
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('taskId', task.id)
      this.draggedTasks = [task]
    },

    onTaskDrag(event) {
      event.stopPropagation()
      event.target.classList.add('dragging')
    },

    onTaskDragEnd(event) {
      event.target.classList.remove('drag')
      event.target.classList.remove('dragging')
      this.draggedTasks = []
    },

    async onScheduleItemDropped(item, person, refreshScheduleCallBack) {
      if (item.type === 'Task') {
        const task = this.buildTaskScheduleItem(person, item)
        person.children.push(task)
        person.children.sort(
          firstBy('startDate').thenBy('project_name').thenBy('name')
        )
        if (refreshScheduleCallBack) {
          refreshScheduleCallBack(person)
        }
        await this.assignSelectedTasks({
          personId: person.id,
          taskIds: [task.id]
        })
        await this.saveTaskScheduleItem(task)
        await this.loadUnassignedTasks()
      }
    },

    async onScheduleItemChanged(item) {
      if (item.type === 'Task') {
        if (item.estimation) {
          item.endDate = addBusinessDays(
            item.startDate,
            Math.ceil(minutesToDays(this.organisation, item.estimation)) - 1,
            item.parentElement.daysOff
          )
        }
        await this.saveTaskScheduleItem(item)
        await this.loadPersonDates(true)
        await this.loadDaysOff()
      }
    },

    onScheduleItemAssigned(item, person) {
      if (item.type === 'Task') {
        person.children.sort(
          firstBy('startDate').thenBy('project_name').thenBy('name')
        )
        this.assignSelectedTasks({
          personId: person.id,
          taskIds: [item.id]
        })
      }
    },

    onScheduleItemUnassigned(item, person) {
      if (item.type === 'Task') {
        this.unassignPersonFromTask({
          person,
          task: item
        })
      }
    },

    async expandPersonElement(element, refreshScheduleCallBack) {
      element.expanded = !element.expanded

      if (!element.expanded) {
        return
      }

      element.loading = true
      element.children = []
      try {
        const tasks = await this.fetchPersonTasks(element.id)
        element.children = tasks
          .map(task => this.buildTaskScheduleItem(element, task))
          .filter(Boolean)
          .sort(firstBy('startDate').thenBy('project_name').thenBy('name'))

        if (refreshScheduleCallBack) {
          refreshScheduleCallBack(element)
        }
      } catch (err) {
        console.error(err)
      }
      element.loading = false
    },

    onUpdateSelectedStartDate(date) {
      this.startDate = parseSimpleDate(date)
    },

    onUpdateSelectedEndDate(date) {
      this.endDate = parseSimpleDate(date)
    },

    scrollScheduleToToday() {
      this.$refs.schedule?.scrollToToday()
    },

    updateRoute({ department, studio, zoom }) {
      const query = { ...this.$route.query }

      if (department !== undefined) {
        query.department = department || undefined
      }
      if (studio !== undefined) {
        query.studio = studio || undefined
      }
      if (zoom !== undefined) {
        query.zoom = String(zoom)
      }

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query })
      }
    }
  },

  watch: {
    selectedDepartment(value) {
      this.updateRoute({ department: value })
      if (
        this.selectedPerson &&
        !this.selectablePeople.includes(this.selectedPerson)
      ) {
        this.$refs['people-field'].clear()
      }
      this.refreshSchedule()
    },

    selectedStudio(value) {
      this.updateRoute({ studio: value })
      if (
        this.selectedPerson &&
        !this.selectablePeople.includes(this.selectedPerson)
      ) {
        this.$refs['people-field'].clear()
      }
      this.refreshSchedule()
    },

    selectedPerson() {
      this.refreshSchedule()
    },

    zoomLevel(value) {
      this.updateRoute({ zoom: value })
    },

    isTaskSidePanelOpen: {
      immediate: true,
      handler() {
        if (this.isTaskSidePanelOpen) {
          this.loadUnassignedTasks()
        }
      }
    }
  },

  head() {
    return {
      title: `${this.$t('team_schedule.title_main')} - Kitsu`
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
  border-bottom: 1px solid #eee;
  padding-bottom: 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .overall-man-days {
    width: 120px;
    font-size: 0.9em;
    margin-right: 1em;
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
  white-space: nowrap;
}

.people-filter {
  min-width: 250px;
}

.side-column {
  position: relative;
  top: -30px;
  right: -14px;
  height: calc(100% + 30px + 14px);
  margin-top: 0;

  // Hide the task selection counter
  :deep(.task-info.empty) {
    padding-top: 0;
    > *:not(.empty-section) {
      display: none;
    }
  }

  .close-button {
    position: absolute;
    right: 1em;
    top: 1em;
  }

  .task-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1em;

    .task-item {
      position: relative;
      cursor: move;

      .ui-droppable {
        padding: 0.5em;
        border: 1px solid;
        border-left-width: 5px;
        border-radius: 5px;
        box-shadow: 4px 4px 4px var(--box-shadow);

        background-color: darken(#f8f8f8, 5%);

        .dark & {
          background-color: lighten(#36393f, 5%);
        }
      }

      &:hover .ui-droppable {
        background-color: var(--background-selectable);
      }

      &.drag {
        transform: translate(0, 0); // fix dragging style

        .ui-droppable {
          background-color: var(--background-selected);
          transform: rotate(5deg) scale(0.5);
        }
      }

      &.dragging {
        cursor: grabbing;
        opacity: 0.5;

        .ui-droppable {
          transform: rotate(0);
        }
      }

      .task-thumbnail {
        margin-right: 1em;
      }

      .task-department {
        position: absolute;
        top: 5px;
        right: 0.5em;
      }
    }
  }
}
</style>
