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
        <div class="flexrow-item">
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
        <div class="filler"></div>
        <div class="flexrow">
          <button-simple
            class="flexrow-item"
            icon="clock"
            :text="$t('schedule.today')"
            @click="scrollScheduleToToday"
          />
        </div>
      </div>

      <schedule
        ref="schedule"
        :start-date="startDate"
        :end-date="endDate"
        :hierarchy="scheduleItems"
        :zoom-level="zoomLevel"
        :is-loading="loading.schedule"
        :is-error="errors.schedule"
        is-estimation-linked
        hide-man-days
        :multiline="isTVShow"
        :reassignable="true"
        :subchildren="!isTVShow"
        @item-assign="onScheduleItemAssigned"
        @item-changed="onScheduleItemChanged"
        @item-drop="onScheduleItemDropped"
        @item-selected="selectTaskTypeElement"
        @item-unassign="onScheduleItemUnassigned"
        @root-element-expanded="expandTaskTypeElement"
        @root-element-selected="selectParentElement"
        @task-selected="selectTaskElement"
      />
    </div>

    <div class="column side-column" v-if="selectedTaskType">
      <div class="side">
        <a class="close-button" @click="closeSidePanel">
          <x-icon class="align-middle" :size="16" />
        </a>
        <h2 class="mt1">
          {{
            assignments.item === 'task'
              ? $t('schedule.edit_task')
              : $t('menu.assign_tasks')
          }}
        </h2>
        <div class="details">
          <task-type-name
            class="task-type"
            :production-id="currentProduction.id"
            :task-type="selectedTaskType"
          />
          <button-simple
            icon="user-check"
            :is-on="assignments.assigned"
            :title="$t('schedule.show_assigned')"
            @click="assignments.assigned = !assignments.assigned"
            v-if="!assignments.item"
          />
        </div>
        <div class="mt2" v-if="assignments.loading">
          <spinner class="mauto" :size="20" />
        </div>
        <ul class="assignments mt1" v-else-if="!assignments.item">
          <li
            :key="entityType.id"
            v-for="entityType in assignments.entityTypes"
          >
            <div
              class="assignment-item"
              draggable="true"
              @dragstart="
                onAssignmentItemDragStart($event, entityType, selectedTaskType)
              "
            >
              <grip-vertical-icon class="icon" />
              <span class="name">
                {{ entityType.name }}
                ({{ filteredAssignments(entityType.children).length }})
              </span>
              <span
                class="expand"
                @click="entityType.expanded = !entityType.expanded"
              >
                <chevron-right-icon v-if="!entityType.expanded" />
                <chevron-down-icon v-else />
              </span>
            </div>
            <ul class="assignments" v-if="entityType.expanded">
              <li
                :key="child.id"
                v-for="child in filteredAssignments(entityType.children)"
              >
                <div
                  class="assignment-item"
                  draggable="true"
                  @dragstart="
                    onAssignmentItemDragStart(
                      $event,
                      { ...entityType, children: [child] },
                      selectedTaskType
                    )
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
                  :disabled="assignments.item !== 'dropped'"
                  :label="$t('main.start_date')"
                  utc
                  v-model="assignments.startDate"
                />
              </div>
              <div class="flexrow-item">
                <date-field
                  :can-delete="false"
                  :disabled="assignments.item !== 'dropped'"
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
                      @click="assignments.excludes = []"
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
              v-if="assignments.item === 'dropped'"
            />
            <div class="flexrow mt2" v-if="assignments.item === 'dropped'">
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
                @click="assignments.forcedDailyQuota = null"
                v-if="assignments.forcedDailyQuota"
              >
                <trash-icon class="align-middle" :size="14" />
              </a>
            </div>
            <div class="mt2" v-if="assignments.item === 'dropped'">
              {{ $t('schedule.estimated_daily_quotas') }}
              {{ estimatedDailyQuota.toFixed(2) }}
            </div>
            <div class="flexrow mt2" v-if="assignments.item === 'task'">
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
            <div class="flexrow mt2" v-if="assignments.item === 'task'">
              <text-field
                class="mb0 estimation mr05"
                input-class=" thin"
                :label="$t('main.estimation')"
                :step="0.01"
                placeholder="0.00"
                type="number"
                :unit-label="$t('schedule.md')"
                v-model="assignments.task.estimation"
              />
            </div>
            <div class="mt2 has-text-right">
              <template v-if="assignments.item === 'dropped'">
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
                  :text="$t('main.cancel')"
                  type="button"
                  @click="assignments.item = null"
                >
                  {{ $t('main.cancel') }}
                </button>
              </template>
              <template v-if="assignments.item === 'task'">
                <button-simple
                  :disabled="!assignments.task.estimation"
                  :is-loading="assignments.saving"
                  is-primary
                  :text="$t('main.apply')"
                  type="submit"
                />
                <button class="button is-link ml05" @click="closeSidePanel">
                  {{ $t('main.cancel') }}
                </button>
              </template>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
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
import { mapGetters, mapActions } from 'vuex'

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
  minutesToDays,
  parseDate,
  parseSimpleDate
} from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import TextField from '@/components/widgets/TextField.vue'

import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'
import shotStore from '@/store/modules/shots'
import taskTypeStore from '@/store/modules/tasktypes'

export default {
  name: 'production-schedule',

  components: {
    ButtonSimple,
    Checkbox,
    ChevronDownIcon,
    ChevronRightIcon,
    ComboboxNumber,
    DateField,
    GripVerticalIcon,
    ListRestartIcon,
    PeopleAvatar,
    PeopleName,
    Schedule,
    Spinner,
    TrashIcon,
    TaskTypeName,
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
        item: null,
        loading: false,
        saving: false,
        startDate: null,
        endDate: null,
        task: {},
        unassign: false
      },
      daysOffByPerson: [],
      draggedEntities: [],
      endDate: moment().add(6, 'months').endOf('day'),
      scheduleItems: [],
      startDate: moment().startOf('day'),
      selectedStartDate: null,
      selectedEndDate: null,
      selectedTaskType: null,
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
      'productionAssetTypes',
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

    assetMap() {
      return assetStore.cache.assetMap
    },

    assets() {
      return assetStore.cache.assets
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

    hasDraggedEntities() {
      return this.draggedEntities.some(entity => entity.children.length)
    },

    shotMap() {
      return shotStore.cache.shotMap
    },

    shots() {
      return shotStore.cache.shots
    },

    taskTypeMap() {
      return taskTypeStore.cache.taskTypeMap
    },

    team() {
      return sortPeople(
        this.currentProduction.team
          .map(personId => this.personMap.get(personId))
          .filter(person => person && !person.is_bot)
      )
    }
  },

  methods: {
    ...mapActions([
      'assignSelectedTasks',
      'editProduction',
      'loadAggregatedPersonDaysOff',
      'loadAssets',
      'loadAssetTypeScheduleItems',
      'loadEpisodeScheduleItems',
      'loadScheduleItems',
      'loadSequenceScheduleItems',
      'loadShots',
      'loadTasks',
      'saveScheduleItem',
      'unassignPersonFromTask',
      'unassignSelectedTasks',
      'updateTask'
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
      this.closeSidePanel()

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

    async expandTaskTypeElement(
      taskTypeElement,
      refreshScheduleCallBack = null,
      expanded = false,
      resetAssignments = true
    ) {
      taskTypeElement.expanded = expanded || !taskTypeElement.expanded

      if (taskTypeElement.expanded) {
        try {
          taskTypeElement.loading = true

          this.selectedTaskType = !this.isTVShow ? taskTypeElement : null
          this.assignments.loading = resetAssignments

          taskTypeElement.children = []
          taskTypeElement.people = {}
          taskTypeElement.entitiesByType = {}

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
          const childrenById = new Map(
            children.map(child => [child.object_id, child])
          )

          if (this.isTVShow) {
            taskTypeElement.children = children
          } else {
            // load entities
            if (taskTypeElement.for_entity === 'Asset') {
              await this.loadAssets({ withShared: false, withTasks: false })
            }
            if (taskTypeElement.for_entity === 'Shot') {
              await this.loadShots()
            }

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
                const entityTypeItem = childrenById.get(task.entity_type_id)

                // populate task with start and end dates
                const startDate = parseDate(task.start_date)
                if (startDate.isAfter(this.endDate)) {
                  return
                }
                if (startDate.isBefore(entityTypeItem.startDate)) {
                  entityTypeItem.startDate = startDate.clone()
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

                task.editable = true
                task.unresizable = false
                task.parentElement = entityTypeItem

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

        this.selectTaskTypeElement(taskTypeElement, null, resetAssignments)
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

    filteredAssignments(items) {
      return this.assignments.assigned
        ? items
        : items.filter(item => !item.assigned)
    },

    saveTaskChanged(task) {
      return this.updateTask({
        taskId: task.id,
        data: {
          estimation: task.estimation,
          start_date: task.startDate.format('YYYY-MM-DD'),
          due_date: task.endDate.format('YYYY-MM-DD')
        }
      })
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
        this.saveScheduleItem(item.parentElement)
      } else if (!item.parentElement) {
        const minDate = this.getMinDate(item)
        const maxDate = this.getMaxDate(item)
        if (item.startDate.isAfter(minDate)) {
          item.startDate = minDate
        }
        if (item.endDate.isBefore(maxDate)) {
          item.endDate = maxDate
        }
      }

      await this.updateScheduleItem(item)
    },

    updateScheduleItem(item) {
      const scheduleItem = this.scheduleItems.find(
        scheduleItem => scheduleItem === item
      )
      if (scheduleItem) {
        scheduleItem.startDate = item.startDate
        scheduleItem.start_date = item.startDate.format('YYYY-MM-DD')
        scheduleItem.endDate = item.endDate
        scheduleItem.end_date = item.endDate.format('YYYY-MM-DD')
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
        item: null,
        loading: false,
        saving: false,
        startDate: null,
        endDate: null,
        task: {},
        unassign: false
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

    async selectTaskTypeElement(
      taskType,
      selectedEntityType = undefined,
      resetAssignments = true
    ) {
      if (this.isTVShow) {
        return
      }

      this.selectedTaskType = taskType

      if (resetAssignments) {
        this.resetSidePanel()
      }

      this.assignments.loading = true

      // load tasks
      const tasks = await this.loadTasks({
        project_id: this.currentProduction.id,
        task_type_id: this.selectedTaskType.task_type_id,
        relations: 'true'
      })

      // load entity types
      if (taskType.for_entity === 'Asset') {
        await this.loadAssets({ withShared: false, withTasks: false })

        this.assignments.entityTypes = this.productionAssetTypes
          .filter(assetType => {
            // filtering following custom asset types workflow
            return (
              !assetType.task_types.length ||
              assetType.task_types.includes(taskType.task_type_id)
            )
          })
          .map((assetType, index) => {
            return {
              id: assetType.id,
              name: assetType.name,
              for_entity: taskType.for_entity,
              expanded: assetType.id === selectedEntityType?.object_id,
              entity_type_id: assetType.id,
              children: this.assets
                .filter(
                  asset =>
                    asset.asset_type_id === assetType.id &&
                    !asset.canceled &&
                    !asset.shared &&
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

        const shotsBySequence = this.shots
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
      }
      this.assignments.loading = false
    },

    selectTaskElement(taskType, entityType, task, selection) {
      if (selection.length !== 1) {
        this.closeSidePanel()
        return
      }

      this.resetSidePanel()

      this.selectedTaskType = taskType
      this.draggedEntities = [{ ...entityType, children: [{ ...task.entity }] }]

      this.assignments.item = 'task'

      const start_date = event.start_date || taskType.start_date
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
      this.selectedTaskType = null
      this.resetSidePanel()
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
      this.assignments.item = 'dropped'
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

    submitAssignments(event) {
      if (this.assignments.item === 'dropped') {
        this.saveAssignments()
      } else if (this.assignments.item === 'task') {
        this.saveTask()
      }
    },

    async saveAssignments() {
      this.assignments.saving = true

      // load tasks
      const tasks = await this.loadTasks({
        project_id: this.currentProduction.id,
        task_type_id: this.selectedTaskType.task_type_id,
        relations: 'true'
      })

      const dailyQuota =
        this.assignments.forcedDailyQuota ?? this.estimatedDailyQuota
      const taskEstimation = 1 / dailyQuota

      // assign each selected entity to each selected assignee
      for (const taskType of this.draggedEntities) {
        const startDate = parseDate(this.assignments.startDate)
        const endDate = parseDate(this.assignments.endDate)

        let cumulatedTasks = 0
        let nextAssigneeIndex = 0
        let nextStartDate = startDate.clone()

        // distribute the task assignments according to the daily quotas, the task type duration and people's availability.
        for (const entity of taskType.children) {
          const task = tasks.find(task => task.entity_id === entity.id)
          if (!task) {
            continue // no task found for this entity
          }

          if (this.assignments.unassign) {
            await this.unassignSelectedTasks({ taskIds: [task.id] })
          }

          cumulatedTasks++

          let taskStartDate = nextStartDate
          let taskEndDate = null
          let taskAssignee = null
          while (nextAssigneeIndex < this.availablePersons.length) {
            taskAssignee = this.availablePersons[nextAssigneeIndex]

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
              await Promise.all([
                // assign task to the current assignee
                this.assignSelectedTasks({
                  personId: taskAssignee.id,
                  taskIds: [task.id]
                }),
                // save task dates & estimation
                this.updateTask({
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
              ])
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
        await this.unassignSelectedTasks({ taskIds: [task.id] })
        await Promise.all(
          task.assignees.map(personId =>
            this.assignSelectedTasks({
              personId,
              taskIds: [task.id]
            })
          )
        )
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

    async onScheduleItemAssigned(task, personId) {
      // update task to refresh the schedule
      task.assignees.push(personId)
      task.parentElement.children.get(personId).push(task)

      // save change
      await this.assignSelectedTasks({
        personId,
        taskIds: [task.id]
      })
    },

    async onScheduleItemUnassigned(task, personId) {
      // update task to refresh the schedule
      task.assignees = task.assignees.filter(id => id !== personId)
      const tasks = task.parentElement.children.get(personId)
      tasks.splice(tasks.indexOf(task), 1)

      // save change
      await this.unassignPersonFromTask({
        person: { id: personId },
        task
      })
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

  .assignments {
    margin-left: 2em;
  }

  .assignment-item {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-selectable);
    border: 1px solid $grey;
    margin-top: -1px;
    padding: 1em 1em 1em 0.5em;
    cursor: grab;

    .icon {
      color: $grey;
      margin-right: 0.5em;
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

  li:nth-child(even) .assignment-item {
    background: color-mix(in srgb, var(--background-selectable) 70%, white 30%);
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
