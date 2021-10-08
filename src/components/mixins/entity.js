import {
  getFirstStartDate,
  getLastEndDate,
  parseDate
} from '@/lib/time'
import moment from 'moment'

/*
 * Common functions to shot and asset pages.
 */
export const entityMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
    currentTasks () {
      const entity = this.currentAsset || this.currentShot
      return entity
        ? entity
          .tasks
          .map(taskId => this.taskMap.get(taskId))
          .filter(task => task)
          .sort((a, b) => {
            const taskTypeA = this.taskTypeMap.get(a.task_type_id)
            const taskTypeB = this.taskTypeMap.get(b.task_type_id)
            return taskTypeA.priority > taskTypeB.priority
          })
        : []
    },

    tasksStartDate () {
      if (this.scheduleItems.length > 0) {
        return getFirstStartDate(this.scheduleItems[0].children)
      } else {
        return moment()
      }
    },

    tasksEndDate () {
      if (this.scheduleItems.length > 0) {
        return getLastEndDate(this.scheduleItems[0].children)
      } else {
        return moment().add(30, 'days')
      }
    },

    scheduleItems () {
      console.log(this.currentTasks)
      let manDays = 0
      const rootElement = {
        avatar: false,
        id: 'root',
        name: 'Tasks',
        color: '#888',
        for_shots: false,
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
          startDate = parseDate(task.start_date)
        } else if (task.real_start_date) {
          startDate = parseDate(task.real_start_date)
        }

        if (task.due_date) {
          endDate = parseDate(task.due_date)
        } else if (task.end_date) {
          endDate = parseDate(task.end_date)
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
      const rootStartDate = getFirstStartDate(children)
      const rootEndDate = getLastEndDate(children)
      console.log(children)
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
  }
}
