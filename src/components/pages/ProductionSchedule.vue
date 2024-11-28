<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="flexrow project-dates">
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <date-field v-model="selectedStartDate" />
        </div>
        <div class="flexrow-item field">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field v-model="selectedEndDate" />
        </div>
        <!--
        <text-field
          class="flexrow-item overall-man-days"
          type="number"
          v-model="overallManDays"
          :label="$t('schedule.overall_man_days')"
          :disabled="!isCurrentUserAdmin"
        />
        -->
        <combobox-number
          class="flexrow-item zoom-level"
          :label="$t('schedule.zoom_level')"
          :options="zoomOptions"
          v-model="zoomLevel"
        />
      </div>

      <schedule
        :start-date="startDate"
        :end-date="endDate"
        :hierarchy="scheduleItems"
        :zoom-level="zoomLevel"
        :is-loading="loading.schedule"
        :is-error="errors.schedule"
        :hide-man-days="true"
        @item-changed="scheduleItemChanged"
        @estimation-changed="estimationChanged"
        @root-element-expanded="expandTaskTypeElement"
      />
    </div>

    <div
      class="column side-column is-hidden-mobile hide-small-screen"
      v-if="currentTask"
    >
      <task-info :task="currentTask" :is-loading="false" />
    </div>
  </div>
</template>

<script>
/*
 * Page to manage the schedule of the big steps of the production. It allows
 * to set milestones too.
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

import { getTaskTypeSchedulePath } from '@/lib/path'
import { sortTaskTypeScheduleItems } from '@/lib/sorting'
import { daysToMinutes, parseDate } from '@/lib/time'

import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import DateField from '@/components/widgets/DateField.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'production-schedule',
  components: {
    ComboboxNumber,
    DateField,
    Schedule,
    TaskInfo
  },

  data() {
    return {
      currentTask: null,
      // overallManDays: 0,
      endDate: moment().add(6, 'months').endOf('day'),
      scheduleItems: [],
      startDate: moment().startOf('day'),
      selectedStartDate: null,
      selectedEndDate: null,
      zoomLevel: 1,
      zoomOptions: [
        { label: 'Week', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ],
      loading: {
        schedule: false
      },
      errors: {
        schedule: false
      }
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    ...mapGetters([
      'assetTypeMap',
      'currentEpisode',
      'currentProduction',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isTVShow',
      'organisation',
      'taskTypeMap',
      'user'
    ])
  },

  methods: {
    ...mapActions([
      'editProduction',
      'loadAssetTypeScheduleItems',
      'loadEpisodeScheduleItems',
      'loadScheduleItems',
      'loadSequenceScheduleItems',
      'saveScheduleItem'
    ]),

    loadData() {
      this.loading.schedule = true
      this.loadScheduleItems(this.currentProduction)
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
              this.currentEpisode ? this.currentEpisode.id : null,
              taskType.for_entity
            )

            return {
              ...item,
              color: taskType.color,
              for_entity: taskType.for_entity,
              name: taskType.name,
              priority: taskType.priority,
              startDate: startDate,
              endDate: endDate,
              editable: this.isInDepartment(taskType),
              expanded: false,
              loading: false,
              route:
                taskType.for_entity === 'Shot' && this.isTVShow ? null : path,
              children: []
            }
          })
          this.scheduleItems = sortTaskTypeScheduleItems(
            scheduleItems,
            this.currentProduction,
            this.taskTypeMap
          )
          this.loading.schedule = false
        })
        .catch(err => {
          console.error(err)
          this.loading.schedule = false
        })
    },

    reset() {
      if (this.currentProduction.start_date) {
        this.startDate = parseDate(this.currentProduction.start_date)
      }
      if (this.currentProduction.end_date) {
        this.endDate = parseDate(this.currentProduction.end_date)
      }
      // this.overallManDays = this.currentProduction.man_days
      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()
      this.loadData()
    },

    convertScheduleItems(taskTypeElement, scheduleItems) {
      return scheduleItems.map(item => {
        let startDate, endDate
        if (item.start_date) {
          startDate = parseDate(item.start_date)
        } else {
          startDate = moment()
        }
        if (taskTypeElement && startDate.isBefore(taskTypeElement.startDate)) {
          startDate = taskTypeElement.startDate.clone()
        }
        if (taskTypeElement && startDate.isAfter(taskTypeElement.endDate)) {
          startDate = taskTypeElement.endDate.clone().add(-1, 'days')
        }
        if (item.end_date) {
          endDate = parseDate(item.end_date)
        } else {
          endDate = startDate.clone().add(1, 'days')
        }
        if (endDate.isBefore(startDate)) {
          endDate = startDate.clone().add(1, 'days')
        }
        const scheduleItem = {
          ...item,
          startDate: startDate,
          endDate: endDate,
          expanded: false,
          loading: false,
          editable: this.isInDepartment(
            this.taskTypeMap.get(item.task_type_id)
          ),
          children: [],
          parentElement: taskTypeElement
        }
        if (this.isTVShow) {
          scheduleItem.route = getTaskTypeSchedulePath(
            item.task_type_id,
            this.currentProduction.id,
            item.object_id,
            taskTypeElement.for_entity
          )
        }
        return scheduleItem
      })
    },

    expandTaskTypeElement(taskTypeElement) {
      const parameters = {
        production: this.currentProduction,
        taskType: this.taskTypeMap.get(taskTypeElement.task_type_id)
      }

      taskTypeElement.expanded = !taskTypeElement.expanded
      if (taskTypeElement.expanded) {
        taskTypeElement.loading = true
        let action = 'loadAssetTypeScheduleItems'
        if (taskTypeElement.for_entity === 'Shot') {
          if (this.isTVShow) action = 'loadEpisodeScheduleItems'
          else action = 'loadSequenceScheduleItems'
        }

        this[action](parameters)
          .then(scheduleItems => {
            taskTypeElement.loading = false
            taskTypeElement.children = this.convertScheduleItems(
              taskTypeElement,
              scheduleItems
            )
          })
          .catch(err => {
            console.error(err)
            taskTypeElement.loading = false
            taskTypeElement.children = []
          })
      }
    },

    estimationChanged({ item, days }) {
      item.man_days = daysToMinutes(this.organisation, days)
      this.saveScheduleItem(item)
    },

    scheduleItemChanged(item) {
      if (item.startDate && item.endDate && item.parentElement) {
        item.parentElement.startDate = this.getMinDate(item.parentElement)
        item.parentElement.endDate = this.getMaxDate(item.parentElement)
        this.saveScheduleItem(item.parentElement)
      } else if (!item.parentElement) {
        const minDate = this.getMinDate(item)
        const maxDate = this.getMaxDate(item)
        if (item.startDate.isAfter(minDate)) item.startDate = minDate
        if (item.endDate.isBefore(maxDate)) {
          item.endDate = maxDate.add(-1, 'days')
        }
      }
      this.saveScheduleItem(item)
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
          ...this.currentProduction,
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
          ...this.currentProduction,
          end_date
        })
      }
    },

    // overallManDays() {
    //   if (this.overallManDays !== this.currentProduction.man_days) {
    //     this.editProduction({
    //       ...this.currentProduction,
    //       man_days: this.overallManDays
    //     })
    //   }
    // },

    currentProduction() {
      this.reset()
    }
  },

  head() {
    return {
      title:
        `${this.currentProduction.name} ` +
        `| ${this.$t('schedule.title')} - Kitsu`
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
}
</style>
