import {
  getFirstStartDate,
  getLastEndDate,
  parseSimpleDate
} from '@/lib/time'
import moment from 'moment'

/*
 * Common functions to shot, asset and edit pages.
 */
export const entityMixin = {
  data () {
    return {
      currentSection: 'Casting',
      zoomLevel: 1,
      entityNavOptions: [
        { label: 'Casting', value: 'casting' },
        { label: 'Schedule', value: 'schedule' },
        { label: 'Preview Files', value: 'preview-files' },
        { label: 'Activity', value: 'activity' },
        { label: 'Timelog', value: 'time-logs' }
      ],
      zoomOptions: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ]
    }
  },

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
    currentTasks () {
      const entity = this.currentAsset || this.currentShot || this.currentEdit
      return entity
        ? entity
          .tasks
          .map(taskId => this.taskMap.get(taskId))
          .filter(task => task)
          .sort((a, b) => {
            const taskTypeAPriority = this.getTaskTypePriority(a.task_type_id)
            const taskTypeBPriority = this.getTaskTypePriority(b.task_type_id)
            return taskTypeAPriority - taskTypeBPriority
          })
        : []
    },

    tasksStartDate () {
      if (this.scheduleItems.length > 0 &&
          this.scheduleItems[0].children.length > 0) {
        return getFirstStartDate(this.scheduleItems[0].children)
          .clone()
          .add(-60, 'days')
      } else {
        return moment()
      }
    },

    tasksEndDate () {
      if (this.scheduleItems.length > 0 &&
          this.scheduleItems[0].children.length > 0) {
        return getLastEndDate(this.scheduleItems[0].children)
          .clone()
          .add(60, 'days')
      } else {
        return moment().add(30, 'days')
      }
    },

    scheduleItems () {
      let manDays = 0
      const rootElement = {
        avatar: false,
        id: 'root',
        name: 'Tasks',
        color: '#888',
        priority: 1,
        expanded: true,
        loading: false,
        children: [],
        editable: false
      }
      const limitStartDate = moment()
      const children = this.currentTasks.map(task => {
        const estimation = this.formatDuration(task.estimation)
        let startDate = limitStartDate.clone()
        let endDate

        if (!task.start_date && !task.real_start_date &&
            !task.due_date && !task.end_date) return null

        if (task.start_date) {
          startDate = parseSimpleDate(task.start_date)
        } else if (task.real_start_date) {
          startDate = parseSimpleDate(task.real_start_date)
        }

        if (task.due_date) {
          endDate = parseSimpleDate(task.due_date)
        } else if (task.end_date) {
          endDate = parseSimpleDate(task.end_date)
        } else if (task.estimation) {
          endDate = startDate.clone().add(estimation, 'days')
        }

        if (!endDate || endDate.isBefore(startDate)) {
          endDate = startDate.clone().add(1, 'days')
        }
        if (estimation) manDays += task.estimation
        const taskType = this.taskTypeMap.get(task.task_type_id)

        return {
          ...task,
          name: taskType.name,
          startDate: startDate,
          endDate: endDate,
          expanded: false,
          loading: false,
          man_days: estimation,
          editable: false,
          unresizable: false,
          parentElement: rootElement,
          color: taskType.color,
          children: []
        }
      }).filter(c => c !== null)
      let rootStartDate = moment()
      let rootEndDate = moment().add(1, 'days')
      if (children.length > 0) {
        rootStartDate = getFirstStartDate(children)
        rootEndDate = getLastEndDate(children)
      }
      Object.assign(rootElement, {
        children: children,
        startDate: rootStartDate,
        endDate: rootEndDate,
        man_days: manDays
      })
      return [rootElement]
    }
  },

  methods: {
    onTaskSelected (task) {
      if (!this.currentTask || this.currentTask.id !== task.id) {
        this.currentTask = task
      } else {
        this.currentTask = null
      }
    }
  },

  watch: {
    currentSection () {
      this.$router.push({
        query: { section: this.currentSection }
      })
      const schedule = this.$refs['schedule-widget']
      if (this.currentSection === 'schedule' && schedule) {
        schedule.scrollToToday()
      }
    }
  }
}
