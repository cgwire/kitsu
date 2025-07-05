import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'

import { getEntityPath } from '@/lib/path'
import stringHelpers from '@/lib/string'
import {
  daysToMinutes,
  getBusinessDays,
  getFirstStartDate,
  getLastEndDate,
  parseDate,
  parseSimpleDate
} from '@/lib/time'

import assetsStore from '@/store/modules/assets'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'

/*
 * Common functions for asset, edit, episode, sequence and shot pages.
 */
export const entityMixin = {
  data() {
    return {
      currentSection: 'infos',
      zoomLevel: 1,
      entityNavOptions: [
        { label: this.$t('main.label.info'), value: 'infos' },
        { label: this.$t('main.label.chat'), value: 'chat' },
        { label: this.$t('main.label.casting'), value: 'casting' },
        { label: this.$t('main.label.schedule'), value: 'schedule' },
        { label: this.$t('main.label.preview_files'), value: 'preview-files' },
        { label: this.$t('main.label.timelog'), value: 'time-logs' }
      ],
      scheduleItems: [],
      zoomOptions: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ]
    }
  },

  computed: {
    ...mapGetters(['organisation']),

    assetList() {
      return assetsStore.cache.assets
    },

    editList() {
      return editsStore.cache.edits
    },

    episodeList() {
      return episodesStore.cache.episodes
    },

    sequenceList() {
      return sequencesStore.cache.sequences
    },

    shotList() {
      return shotsStore.cache.shots
    },

    entityTabs() {
      return this.entityNavOptions.map(option => {
        return {
          label: option.label,
          name: option.value
        }
      })
    },

    currentEntity() {
      return this[`current${stringHelpers.capitalize(this.type)}`]
    },

    entityList() {
      return this[`${this.type}List`] || []
    },

    previousEntity() {
      if (!this.currentEntity) return null
      const entityIndex = this.getEntityIndex(this.currentEntity.id)
      if (entityIndex === -1) return null
      return entityIndex > 0
        ? this.entityList[entityIndex - 1]
        : this.entityList[this.entityList.length - 1]
    },

    nextEntity() {
      if (!this.currentEntity) return null
      const entityIndex = this.getEntityIndex(this.currentEntity.id)
      if (entityIndex === -1) return null
      return entityIndex < this.entityList.length - 1
        ? this.entityList[entityIndex + 1]
        : this.entityList[0]
    },

    previousEntityPath() {
      const entity = this.previousEntity
      if (!entity) return null
      return getEntityPath(
        entity.id,
        this.currentProduction.id,
        this.type,
        this.currentEpisode?.id
      )
    },

    nextEntityPath() {
      const entity = this.nextEntity
      if (!entity) return null
      return getEntityPath(
        entity.id,
        this.currentProduction.id,
        this.type,
        this.currentEpisode?.id
      )
    },

    thumbnailPath() {
      const previewId = this.currentEntity.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    isPreview() {
      return (
        this.currentEntity &&
        this.currentEntity.preview_file_id &&
        this.currentEntity.preview_file_id.length > 0
      )
    },

    currentTasks() {
      const entity = this[`current${stringHelpers.capitalize(this.type)}`]
      if (!entity || !entity.tasks) return []
      return entity
        ? entity.tasks
            .map(taskId => this.taskMap.get(taskId))
            .filter(task => task)
            .sort((a, b) => {
              const taskTypeAPriority = this.getTaskTypePriority(a.task_type_id)
              const taskTypeBPriority = this.getTaskTypePriority(b.task_type_id)
              return taskTypeAPriority - taskTypeBPriority
            })
        : []
    },

    tasksStartDate() {
      if (
        this.scheduleItems.length > 0 &&
        this.scheduleItems[0].children.length > 0
      ) {
        return getFirstStartDate(this.scheduleItems[0].children)
          .clone()
          .add(-60, 'days')
      } else {
        return parseDate(this.currentProduction.start_date)
      }
    },

    tasksEndDate() {
      if (
        this.scheduleItems.length > 0 &&
        this.scheduleItems[0].children.length > 0
      ) {
        return getLastEndDate(this.scheduleItems[0].children)
          .clone()
          .add(60, 'days')
      } else {
        return parseDate(this.currentProduction.end_date)
      }
    }
  },

  methods: {
    ...mapActions(['addSelectedTask', 'clearSelectedTasks', 'updateTask']),

    getEntityIndex(entityId) {
      return this.entityList.findIndex(entity => entity.id === entityId)
    },

    changeTab(tab) {
      this.selectedTab = tab
    },

    onEditClicked() {
      this.modals.edit = true
    },

    onTaskSelected(task) {
      this.clearSelectedTasks()
      if (!this.currentTask || this.currentTask.id !== task.id) {
        this.addSelectedTask(task)
        this.currentTask = task
      } else {
        this.currentTask = null
      }
    },

    initScheduleItems() {
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
        editable: true
      }
      const limitStartDate = moment()
      const children = this.currentTasks
        .map(task => {
          const estimation = task.estimation
          let startDate = limitStartDate.clone()
          let endDate

          if (
            !task.start_date &&
            !task.real_start_date &&
            !task.due_date &&
            !task.end_date
          )
            return null

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
            editable: true,
            unresizable: false,
            parentElement: rootElement,
            color: taskType.color,
            children: []
          }
        })
        .filter(c => c !== null)
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
      this.scheduleItems = [rootElement]
    },

    saveTaskScheduleItem(item) {
      const daysLength = getBusinessDays(item.startDate, item.endDate)
      const estimation = daysToMinutes(this.organisation, daysLength)
      item.man_days = estimation
      if (item.startDate && item.endDate) {
        this.updateTask({
          taskId: item.id,
          data: {
            estimation,
            start_date: item.startDate.format('YYYY-MM-DD'),
            due_date: item.endDate.format('YYYY-MM-DD')
          }
        })
      }
    }
  },

  watch: {
    $route() {
      const entityId = this.route.params[`${this.type}_id`]
      const currentEntity =
        this[`current${stringHelpers.capitalize(this.type)}`]
      if (currentEntity && currentEntity.id !== entityId) {
        this.init()
      }
      this.currentSection = this.route.query.section || 'infos'
    },

    currentSection() {
      if (this.currentSection === 'schedule' && this.scheduleItems.length > 0) {
        if (this.$refs['schedule-widget']) {
          this.$refs['schedule-widget'].scrollToDate(
            this.scheduleItems[0].startDate
          )
        }
      }
    },

    currentTasks: {
      immediate: true,
      handler() {
        this.initScheduleItems()
      }
    },

    zoomLevel() {
      if (this.$refs['schedule-widget']) {
        this.$refs['schedule-widget'].scrollToDate(
          this.scheduleItems[0].startDate
        )
      }
    }
  }
}
