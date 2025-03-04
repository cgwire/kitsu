<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="flexrow project-dates">
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <date-field :can-delete="false" utc v-model="selectedStartDate" />
        </div>
        <div class="flexrow-item field">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field :can-delete="false" utc v-model="selectedEndDate" />
        </div>
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
        :multiline="isTVShow"
        :subchildren="!isTVShow"
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
import {
  addBusinessDays,
  daysToMinutes,
  minutesToDays,
  parseDate
} from '@/lib/time'

import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import DateField from '@/components/widgets/DateField.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'
import shotStore from '@/store/modules/shots'
import taskTypeStore from '@/store/modules/tasktypes'

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
      daysOffByPerson: [],
      endDate: moment().add(6, 'months').endOf('day'),
      scheduleItems: [],
      startDate: moment().startOf('day'),
      selectedStartDate: null,
      selectedEndDate: null,
      zoomLevel: 1,
      zoomOptions: [
        { label: this.$t('main.week'), value: 0 },
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
      'currentEpisode',
      'currentProduction',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isTVShow',
      'organisation',
      'personMap',
      'user'
    ]),

    assetMap() {
      return assetStore.cache.assetMap
    },

    assetTypeMap() {
      return assetTypeStore.cache.assetTypeMap
    },

    shotMap() {
      return shotStore.cache.shotMap
    },

    taskTypeMap() {
      return taskTypeStore.cache.taskTypeMap
    }
  },

  methods: {
    ...mapActions([
      'editProduction',
      'loadAggregatedPersonDaysOff',
      'loadAssets',
      'loadAssetTypeScheduleItems',
      'loadEpisodeScheduleItems',
      'loadScheduleItems',
      'loadSequenceScheduleItems',
      'loadShots',
      'loadTasks',
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
              name: `${taskType.for_entity} / ${taskType.name}`,
              priority: taskType.priority,
              startDate,
              endDate,
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
      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()
      this.loadData()
    },

    convertScheduleItems(taskTypeElement, scheduleItems) {
      return scheduleItems
        .map(item => {
          let startDate
          if (item.start_date) {
            startDate = parseDate(item.start_date)
          } else {
            startDate = moment()
          }
          if (startDate.isAfter(this.endDate)) {
            return
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
          if (endDate.isBefore(this.startDate)) {
            return
          }

          const scheduleItem = {
            ...item,
            startDate,
            endDate,
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
        .filter(Boolean)
    },

    async expandTaskTypeElement(
      taskTypeElement,
      refreshScheduleCallBack = null
    ) {
      taskTypeElement.expanded = !taskTypeElement.expanded

      if (taskTypeElement.expanded) {
        try {
          taskTypeElement.loading = true

          taskTypeElement.children = []
          taskTypeElement.people = []

          const loadScheduleItems = this.isTVShow
            ? ['Asset', 'Shot'].includes(taskTypeElement.for_entity)
              ? this.loadEpisodeScheduleItems
              : this.loadSequenceScheduleItems
            : taskTypeElement.for_entity === 'Shot'
              ? this.loadSequenceScheduleItems
              : this.loadAssetTypeScheduleItems
          const parameters = {
            production: this.currentProduction,
            taskType: this.taskTypeMap.get(taskTypeElement.task_type_id)
          }
          const scheduleItems = await loadScheduleItems(parameters)

          let children = this.convertScheduleItems(
            taskTypeElement,
            scheduleItems
          )

          if (this.isTVShow) {
            taskTypeElement.children = children
          } else {
            // load entities
            if (taskTypeElement.for_entity === 'Asset') {
              await this.loadAssets({ withTasks: false })
            }
            if (taskTypeElement.for_entity === 'Shot') {
              await this.loadShots()
            }

            // load tasks
            const tasks = await this.loadTasks({
              project_id: this.currentProduction.id,
              task_type_id: taskTypeElement.task_type_id,
              relations: 'true'
            })

            // load days off of assignees
            const personIds = [
              ...new Set(tasks.flatMap(task => task.assignees))
            ]
            await this.loadDaysOff(personIds)

            // group tasks by entity type and assignee
            const tasksByType = {}
            const people = {}
            tasks.forEach(task => {
              if (!task.start_date) {
                return
              }

              // link entity to task
              if (taskTypeElement.for_entity === 'Asset') {
                task.entity = this.assetMap.get(task.entity_id)
                task.entity_type_id = task.entity.asset_type_id
              } else if (taskTypeElement.for_entity === 'Shot') {
                task.entity = this.shotMap.get(task.entity_id)
                task.entity_type_id = task.entity.sequence_id
              } else {
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
                // populate task with start and end dates
                const startDate = parseDate(task.start_date)
                if (startDate.isAfter(this.endDate)) {
                  return
                }
                task.startDate = startDate

                let endDate
                if (task.due_date) {
                  endDate = parseDate(task.due_date)
                } else if (task.end_date) {
                  endDate = parseDate(task.end_date)
                } else if (task.estimation) {
                  endDate = addBusinessDays(
                    task.startDate,
                    Math.ceil(
                      minutesToDays(this.organisation, task.estimation)
                    ) - 1,
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

                tasksByType[task.entity_type_id][assigneeId].push(task)
              })
            })

            if (taskTypeElement.for_entity === 'Asset') {
              // filtering following custom asset types workflow
              children = children.filter(item => {
                const assetType = this.assetTypeMap.get(item.object_id)
                return (
                  assetType &&
                  (!assetType.task_types.length ||
                    assetType.task_types.includes(taskTypeElement.task_type_id))
                )
              })
            }

            // sort grouped tasks
            const sortEntitiesByUserName = ([keyA], [keyB]) => {
              if (keyA === 'unassigned') return 1
              if (keyB === 'unassigned') return -1
              return people[keyA].full_name.localeCompare(
                people[keyB].full_name
              )
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
                  .map(([key, tasks]) => [
                    key,
                    tasks.sort(sortTasksByEntityName)
                  ])
              )

              child.children = sortedChildren
            })

            taskTypeElement.children = children
            taskTypeElement.people = people
          }
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
      }
    },

    async loadDaysOff(personIds) {
      this.daysOffByPerson = []
      for (const personId of personIds) {
        // load sequentially to avoid too many requests
        const daysOff = await this.loadAggregatedPersonDaysOff({
          personId
        }).catch(
          () => [] // fallback if not allowed to fetch days off
        )
        this.daysOffByPerson[personId] = daysOff
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
