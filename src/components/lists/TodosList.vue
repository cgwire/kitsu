<template>
  <div class="data-list task-list">
    <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th
              scope="col"
              class="production datatable-row-header datatable-row-header--nobd"
              ref="th-prod"
            >
              {{ $t('tasks.fields.production') }}
            </th>
            <th
              scope="col"
              class="type datatable-row-header datatable-row-header--nobd"
              ref="th-type"
              :style="{ left: colTypePosX }"
            >
              {{ $t('tasks.fields.task_type') }}
            </th>
            <th
              scope="col"
              class="name datatable-row-header"
              ref="th-name"
              :style="{ left: colNamePosX }"
            >
              {{ $t('tasks.fields.entity') }}
            </th>
            <th scope="col" class="episode" v-if="isEpisodeVisible">
              {{ $t('assets.fields.episode') }}
            </th>

            <th class="assignees" ref="th-assignees" v-if="isToCheck">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th
              class="description"
              scope="col"
              v-if="isDescriptionPresent && !isToCheck"
            >
              {{ $t('assets.fields.description') }}
            </th>
            <th scope="col" class="estimation" :title="$t('main.estimation')">
              {{ $t('main.estimation_short') }}
            </th>
            <th scope="col" class="duration number-cell">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th scope="col" class="start-date" v-if="!isToCheck">
              {{ $t('tasks.fields.start_date_short') }}
            </th>
            <th scope="col" class="due-date">
              {{ $t('tasks.fields.due_date') }}
            </th>
            <metadata-header
              :key="'desc-header' + field_name"
              :descriptor="
                mergeMetadataDescriptors(metadataDescriptorsMap[field_name])
              "
              :no-menu="true"
              v-for="field_name in Object.keys(metadataDescriptorsMap)"
            />
            <th scope="col" class="status">
              {{ $t('tasks.fields.task_status') }}
            </th>
            <template v-if="!isToCheck">
              <th scope="col" class="last-comment" v-if="!done">
                {{ $t('tasks.fields.last_comment') }}
              </th>
              <th scope="col" class="end-date" v-else>
                {{ $t('tasks.fields.end_date') }}
              </th>
            </template>
            <th class="actions" v-else></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="tasks.length > 0">
          <tr
            :key="entry + '-' + i"
            :class="{
              'datatable-row': true,
              'datatable-row--selectable': true,
              selected: selectionGrid[entry.id]
            }"
            @click="selectTask($event, i, entry)"
            v-for="(entry, i) in displayedTasks"
          >
            <td
              class="production datatable-row-header datatable-row-header--nobd"
              scope="row"
            >
              <production-name-cell
                :is-tooltip="true"
                :entry="productionMap.get(entry.project_id)"
                :only-avatar="true"
              />
            </td>
            <task-type-cell
              class="type datatable-row-header datatable-row-header--nobd"
              :production-id="entry.project_id"
              :task-type="getTaskType(entry)"
              :style="{ left: colTypePosX }"
            />
            <td
              class="name datatable-row-header"
              :style="{ left: colNamePosX }"
            >
              <div class="flexrow">
                <entity-thumbnail
                  :empty-width="60"
                  :empty-height="40"
                  :entity="{ preview_file_id: entry.entity_preview_file_id }"
                />
                <router-link class="entity-name" :to="entityPath(entry)">
                  {{ entry.full_entity_name }}
                </router-link>
              </div>
            </td>

            <td class="episode" v-if="isEpisodeVisible">
              <div class="flexrow" :title="assetEpisodes(entry, true)">
                {{ assetEpisodes(entry, false) }}
              </div>
            </td>

            <description-cell
              class="description"
              :entry="{ description: entry.entity_description }"
              v-if="isDescriptionPresent && !isToCheck"
            />
            <td class="assignees" v-if="isToCheck">
              <div class="avatars">
                <people-avatar
                  :key="`${entry.id}-${person.id}`"
                  :person="person"
                  :size="30"
                  :font-size="16"
                  v-for="person in getSortedPeople(entry.assignees)"
                />
              </div>
            </td>
            <td class="estimation number-cell">
              <input
                class="input"
                min="0"
                step="any"
                type="number"
                :value="formatDuration(entry.estimation, false)"
                @change="updateEstimation($event.target.value)"
                v-if="selectionGrid[entry.id]"
              />
              <template v-else>
                {{ formatDuration(entry.estimation) }}
              </template>
            </td>
            <td
              :class="{
                duration: true,
                'number-cell': true,
                error: isEstimationBurned(entry)
              }"
            >
              {{ formatDuration(entry.duration) }}
            </td>
            <td class="start-date">
              <date-field
                class="flexrow-item"
                :min-date="disabledDates"
                :model-value="getDate(entry.start_date)"
                :with-margin="false"
                @update:model-value="updateStartDate"
                v-if="selectionGrid[entry.id]"
              />
              <template v-else>
                {{ formatDate(entry.start_date) }}
              </template>
            </td>
            <td class="due-date">
              <date-field
                class="flexrow-item"
                :min-date="disabledDates"
                :model-value="getDate(entry.due_date)"
                :with-margin="false"
                @update:model-value="updateDueDate"
                v-if="selectionGrid[entry.id]"
              />
              <template v-else>
                {{ formatDate(entry.due_date) }}
              </template>
            </td>
            <td
              class="metadata-descriptor"
              :key="'desc-' + entry.id + '-' + fieldName"
              v-for="fieldName in Object.keys(metadataDescriptorsMap)"
            >
              <div
                v-if="
                  entry.entity_data && getMetadataDescriptor(fieldName, entry)
                "
              >
                <div
                  v-if="
                    getDescriptorChecklistValues(
                      getMetadataDescriptor(fieldName, entry)
                    ).length > 0
                  "
                >
                  <p
                    :key="`${entry.id}-
                    ${getMetadataDescriptor(fieldName, entry).id}
                    -${i}-${option.text}-div`"
                    v-for="(option, i) in getDescriptorChecklistValues(
                      getMetadataDescriptor(fieldName, entry)
                    )"
                  >
                    <input
                      type="checkbox"
                      disabled
                      :id="`${entry.id}
                      -${getMetadataDescriptor(fieldName, entry).id}
                      -${i}-${option.text}-input`"
                      :checked="
                        getMetadataChecklistValues(
                          getMetadataDescriptor(fieldName, entry),
                          entry
                        )[option.text]
                      "
                    />
                    <label
                      style="cursor: pointer"
                      :for="`${entry.id}
                      -${getMetadataDescriptor(fieldName, entry).id}
                      -${i}-${option.text}-input`"
                    >
                      {{ option.text }}
                    </label>
                  </p>
                </div>
                <p v-else>
                  {{
                    getMetadataFieldValue(
                      getMetadataDescriptor(fieldName, entry),
                      entry
                    )
                  }}
                </p>
              </div>
            </td>
            <validation-cell
              class="status unselectable"
              :ref="'validation-' + i + '-0'"
              :clickable="false"
              :column="entry.taskStatus"
              :column-y="0"
              :is-assignees="false"
              :is-border="false"
              :row-x="i"
              :selected="selectionGrid[entry.id]"
              :task-test="entry"
            />
            <template v-if="!isToCheck">
              <last-comment-cell
                class="last-comment"
                :task="entry"
                v-if="!done"
              />
              <td class="end-date" v-else>
                {{ formatDate(entry.end_date) }}
              </td>
            </template>
            <th class="actions" v-else></th>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div
      class="has-text-centered empty-list"
      v-if="tasks.length === 0 && !isLoading"
    >
      <p>
        <img src="../../assets/illustrations/empty_todo.png" />
      </p>
      <p>
        {{ emptyText }}
      </p>
    </div>

    <p class="has-text-centered footer-info" v-if="tasks.length && !isLoading">
      {{ tasks.length }} {{ $tc('tasks.tasks', tasks.length) }} ({{
        formatDuration(timeEstimated)
      }}
      {{ $tc('main.days_estimated', isTimeEstimatedPlural) }},
      {{ formatDuration(timeSpent) }}
      {{ $tc('main.days_spent', isTimeSpentPlural) }})
    </p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import { selectionListMixin } from '@/components/mixins/selection'
import { formatListMixin } from '@/components/mixins/format'
import { descriptorMixin } from '@/components/mixins/descriptors'

import { PAGE_SIZE } from '@/lib/pagination'
import { sortPeople } from '@/lib/sorting'
import {
  daysToMinutes,
  formatSimpleDate,
  getDatesFromEndDate,
  getDatesFromStartDate,
  minutesToDays,
  parseSimpleDate,
  range
} from '@/lib/time'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import LastCommentCell from '@/components/cells/LastCommentCell.vue'
import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import moment from 'moment-timezone'
import DateField from '@/components/widgets/DateField.vue'

export default {
  name: 'todos-list',

  mixins: [formatListMixin, selectionListMixin, descriptorMixin],

  components: {
    EntityThumbnail,
    DateField,
    DescriptionCell,
    LastCommentCell,
    MetadataHeader,
    PeopleAvatar,
    ProductionNameCell,
    TableInfo,
    TaskTypeCell,
    ValidationCell
  },

  props: {
    done: {
      type: Boolean,
      default: false
    },
    tasks: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isToCheck: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: ''
    },
    disabledDates: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['scroll', 'task-selected'],

  data() {
    return {
      page: 1,
      colTypePosX: '',
      colNamePosX: '',
      lastSelection: null,
      selectionGrid: {},
      selectedDate: moment().toDate() // By default current day.
    }
  },

  mounted() {
    this.page = 1
    this.resizeHeaders()
    window.addEventListener('keydown', this.onKeyDown, false)
    this.colTypePosX = this.$refs['th-prod'].offsetWidth + 'px'
    this.colNamePosX =
      this.$refs['th-prod'].offsetWidth +
      this.$refs['th-type'].offsetWidth +
      'px'
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters([
      'nbSelectedTasks',
      'selectedTasks',
      'openProductions',
      'personMap',
      'productionMap',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    displayedTasks() {
      return this.tasks.slice(0, this.page * PAGE_SIZE)
    },

    isDescriptionPresent() {
      return this.tasks.some(task => {
        return task.entity_description && task.entity_description.length > 0
      })
    },

    metadataDescriptorsMap() {
      const metadataDescriptorsMap = {}
      if (!this.isToCheck) {
        this.openProductions.forEach(project => {
          project.descriptors.forEach(descriptor => {
            const isUserDepartment = this.user.departments.some(department =>
              descriptor.departments.includes(department)
            )
            if (isUserDepartment) {
              // group them by field_name if they have the same field_name
              if (!(descriptor.field_name in metadataDescriptorsMap)) {
                metadataDescriptorsMap[descriptor.field_name] = {}
              }
              const descriptorFieldNameEntry =
                metadataDescriptorsMap[descriptor.field_name]
              // group them by entity_type if the have the same entity_type
              if (!(descriptor.entity_type in descriptorFieldNameEntry)) {
                descriptorFieldNameEntry[descriptor.entity_type] = {}
              }
              descriptorFieldNameEntry[descriptor.entity_type][project.id] =
                descriptor
            }
          })
        })
      }
      return metadataDescriptorsMap
    },

    timeSpent() {
      return this.displayedTasks.reduce((acc, task) => acc + task.duration, 0)
    },

    isTimeSpentPlural() {
      return Math.floor((this.timeSpent ? this.timeSpent : 0) / 60 / 8) <= 1
    },

    timeEstimated() {
      return this.displayedTasks.reduce((acc, task) => acc + task.estimation, 0)
    },

    isTimeEstimatedPlural() {
      return (
        Math.floor((this.timeEstimated ? this.timeEstimated : 0) / 60 / 8) <= 1
      )
    },

    isEpisodeVisible() {
      return this.displayedTasks.some(
        task => task.source_id || task.episode_names?.length > 0
      )
    }
  },

  methods: {
    ...mapActions([
      'addSelectedTask',
      'addSelectedTasks',
      'clearSelectedTasks',
      'removeSelectedTask',
      'updateTask'
    ]),

    assetEpisodes(entry, full) {
      if (
        ['Episode', 'Sequence', 'Shot', 'Edit'].includes(entry.entity_type_name)
      )
        return ''
      const mainEpisodeName = entry.episode_name || 'MP'
      const episodeNames = (entry.episode_names || []).filter(
        name => name !== mainEpisodeName
      )
      let episodeNameString = ''
      if (episodeNames.length > 2) {
        if (full) {
          episodeNameString = episodeNames.join(', ')
        } else {
          episodeNameString = episodeNames.slice(0, 2).join(', ') + ', ...'
        }
      } else if (episodeNames.length > 0) {
        episodeNameString = episodeNames.join(', ')
      }
      return episodeNames.length > 0
        ? mainEpisodeName + ', ' + episodeNameString
        : mainEpisodeName
    },

    getSortedPeople(personIds) {
      const people = personIds.map(id => this.personMap.get(id))
      return sortPeople(people)
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    getDate(date) {
      return date ? moment(date, 'YYYY-MM-DD').toDate() : null
    },

    formatDate(date) {
      return date ? formatSimpleDate(date) : ''
    },

    onBodyScroll(event) {
      const position = event.target
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.page++
      }
    },

    getTaskType(entry) {
      const taskType = { ...this.taskTypeMap.get(entry.task_type_id) }
      const production = this.productionMap.get(entry.project_id)
      taskType.episode_id = entry.episode_id
      if (
        production &&
        production.production_type === 'tvshow' &&
        !entry.episode_id
      ) {
        taskType.episode_id = production.first_episode_id
      }
      return taskType
    },

    entityPath(entity) {
      const entityType = entity.sequence_name ? 'shot' : 'asset'
      const route = {
        name: entityType,
        params: {
          production_id: entity.project_id
        }
      }

      if (entityType === 'asset') {
        route.params.asset_id = entity.entity_id
      } else {
        route.params.shot_id = entity.entity_id
      }

      const production = this.productionMap.get(entity.project_id)
      let episodeId = entity.episode_id
      if (production && production.production_type === 'tvshow' && !episodeId) {
        if (entityType === 'shot') {
          episodeId = production.first_episode_id
        } else {
          episodeId = 'main'
        }
      }

      if (episodeId) {
        route.name = `episode-${entityType}`
        route.params.episode_id = episodeId
      }

      return route
    },

    onKeyDown(event) {
      if (this.tasks.length > 0 && event.altKey) {
        let index = this.lastSelection ? this.lastSelection : 0
        if ([37, 38].includes(event.keyCode)) {
          index = index - 1 < 0 ? (index = this.tasks.length - 1) : index - 1
          this.selectTask({}, index, this.tasks[index])
          this.pauseEvent(event)
        } else if ([39, 40].includes(event.keyCode)) {
          index = index + 1 >= this.tasks.length ? (index = 0) : index + 1
          this.selectTask({}, index, this.tasks[index])
          this.pauseEvent(event)
        }
      }
    },

    scrollToValidationCell(validationCell) {
      if (validationCell) {
        const margin = 20
        const rect = validationCell.$el.getBoundingClientRect()
        const listRect = this.$refs.body.getBoundingClientRect()
        const isBelow = rect.bottom > listRect.bottom - margin
        const isAbove = rect.top < listRect.top + margin
        const isRight = rect.right > listRect.right - margin
        const isLeft = rect.left < listRect.left + margin

        if (isBelow) {
          const scrollingRequired = rect.bottom - listRect.bottom + margin
          this.setScrollPosition(this.$refs.body.scrollTop + scrollingRequired)
        } else if (isAbove) {
          const scrollingRequired = listRect.top - rect.top + margin
          this.setScrollPosition(this.$refs.body.scrollTop - scrollingRequired)
        }

        if (isRight) {
          const scrollingRequired = rect.right - listRect.right + margin
          this.setScrollLeftPosition(
            this.$refs.body.scrollLeft + scrollingRequired
          )
        } else if (isLeft) {
          const scrollingRequired = listRect.left - rect.left + margin
          this.setScrollLeftPosition(
            this.$refs.body.scrollLeft - scrollingRequired
          )
        }
      }
    },

    select(i, j) {
      const ref = 'validation-' + i + '-' + j
      const validationCell = this.$refs[ref]
      if (validationCell) validationCell[0].$el.click()
      return validationCell ? validationCell[0] : 0
    },

    resizeHeaders() {
      const tableBody = this.$refs['body-tbody']
      const isTableBodyContainLines = tableBody && tableBody.children
      if (isTableBodyContainLines) {
        const bodyElement = tableBody.children[0]
        const columnDescriptors = [
          { index: 1, name: 'type' },
          { index: 3, name: 'name' }
        ]
        columnDescriptors.forEach(desc => {
          const width = Math.max(
            bodyElement.children[desc.index].offsetWidth,
            100
          )
          this.$refs['th-' + desc.name].style['min-width'] = `${width}px`
        })
      }
    },

    mergeMetadataDescriptors(descriptors) {
      const firstKeyEntityType = Object.keys(descriptors)[0]
      const firstKeyProjectId = Object.keys(descriptors[firstKeyEntityType])[0]
      const mergedDescriptors = {
        departments: [],
        field_name:
          descriptors[firstKeyEntityType][firstKeyProjectId].field_name,
        name: descriptors[firstKeyEntityType][firstKeyProjectId].name
      }
      // merge departments
      Object.keys(descriptors).forEach(entityType =>
        Object.keys(descriptors[entityType]).forEach(projectId => {
          mergedDescriptors.departments = [
            ...new Set([
              ...descriptors[entityType][projectId].departments,
              ...mergedDescriptors.departments
            ])
          ]
        })
      )
      return mergedDescriptors
    },

    getMetadataDescriptor(fieldName, entry) {
      const entityType = entry.task_type_for_entity
      const projectId = entry.project_id
      return this.metadataDescriptorsMap[fieldName] &&
        this.metadataDescriptorsMap[fieldName][entityType] &&
        this.metadataDescriptorsMap[fieldName][entityType][projectId]
        ? this.metadataDescriptorsMap[fieldName][entityType][projectId]
        : null
    },

    isTaskChanged(task, data) {
      const taskStart = task.start_date ? task.start_date.substring(0, 10) : ''
      const taskDue = task.due_date ? task.due_date.substring(0, 10) : ''
      return (
        (data.start_date !== undefined && taskStart !== data.start_date) ||
        (data.due_date !== undefined && taskDue !== data.due_date) ||
        (data.estimation !== undefined && task.estimation !== data.estimation)
      )
    },

    isEstimationBurned(task) {
      return (
        task.estimation &&
        task.estimation > 0 &&
        task.duration > task.estimation
      )
    },

    updateEstimation(duration) {
      const estimation = this.organisation.format_duration_in_hours
        ? duration * 60
        : daysToMinutes(this.organisation, duration)

      this.updateTasksEstimation({ estimation })
    },

    updateTasksEstimation({ estimation }) {
      Object.keys(this.selectionGrid).forEach(taskId => {
        const task = this.taskMap.get(taskId)
        let data = { estimation }
        if (task.start_date) {
          const startDate = moment(task.start_date)
          const dueDate = task.due_date ? moment(task.due_date) : null
          data = getDatesFromStartDate(
            this.organisation,
            startDate,
            dueDate,
            minutesToDays(this.organisation, estimation)
          )
          data.estimation = estimation
        }
        if (this.isTaskChanged(task, data)) {
          this.updateTask({ taskId, data }).catch(console.error)
        }
      })
    },

    updateStartDate(date) {
      Object.keys(this.selectionGrid).forEach(taskId => {
        let data = {
          start_date: null,
          due_date: null
        }
        const task = this.taskMap.get(taskId)
        const dueDate = task.due_date ? parseSimpleDate(task.due_date) : null
        if (date) {
          const startDate = moment(date)
          if (
            task.start_date &&
            task.start_date.substring(0, 10) === formatSimpleDate(startDate)
          )
            return
          data = getDatesFromStartDate(
            this.organisation,
            startDate,
            dueDate,
            minutesToDays(this.organisation, task.estimation)
          )
        } else {
          data = {
            start_date: null,
            due_date: dueDate
          }
        }
        if (this.isTaskChanged(task, data)) {
          this.updateTask({ taskId, data }).catch(console.error)
        }
      })
    },

    updateDueDate(date) {
      Object.keys(this.selectionGrid).forEach(taskId => {
        let data = {
          start_date: null,
          due_date: null
        }
        const task = this.taskMap.get(taskId)
        const startDate = task.start_date
          ? parseSimpleDate(task.start_date)
          : null
        if (date) {
          const dueDate = moment(date)
          if (
            task.due_date &&
            task.due_date.substring(0, 10) === formatSimpleDate(dueDate)
          )
            return
          data = getDatesFromEndDate(
            this.organisation,
            startDate,
            dueDate,
            minutesToDays(this.organisation, task.estimation)
          )
        } else {
          data = {
            start_date: startDate,
            due_date: null
          }
        }
        if (this.isTaskChanged(task, data)) {
          this.updateTask({ taskId, data }).catch(console.error)
        }
      })
    },

    selectTask(event, index, task) {
      if (
        event &&
        event.target &&
        // Dirty hack needed to make date picker and inputs work properly
        (['INPUT'].includes(event.target.nodeName) ||
          // Combo box should not trigger selection
          event.target.className.indexOf('selected-line') >= 0 ||
          event.target.className.indexOf('down-icon') >= 0 ||
          event.target.className.indexOf('flexrow') >= 0 ||
          event.target.className.indexOf('c-mask') >= 0 ||
          event.target.className.indexOf('option-line') >= 0 ||
          event.target.className.indexOf('combobox') >= 0 ||
          event.target.className === '' ||
          (event.target.parentNode &&
            ['HEADER'].includes(event.target.parentNode.nodeName)) ||
          ['cell day selected'].includes(event.target.className))
      )
        return
      const isSelected = this.selectionGrid[task.id]
      const isManySelection = Object.keys(this.selectionGrid).length > 1
      if (!(event.ctrlKey || event.metaKey) && !event.shiftKey) {
        this.clearSelectedTasks()
        this.resetSelection()
      }

      if (!event.shiftKey) {
        if (isSelected && !isManySelection) {
          this.removeSelectedTask({ task })
          this.selectionGrid[task.id] = undefined
        } else if (!isSelected || isManySelection) {
          this.addSelectedTask({ task })
          this.$emit('task-selected', task)
          this.selectionGrid[task.id] = true
          this.lastSelection = index
        }
      } else {
        this.selectionGrid = {}
        let taskIndices = []
        if (this.lastSelection > index) {
          taskIndices = range(index, this.lastSelection)
        } else {
          taskIndices = range(this.lastSelection, index)
        }
        const selection = taskIndices.map(i => ({ task: this.tasks[i] }))
        selection.forEach(task => {
          this.selectionGrid[task.task.id] = true
        })
        this.addSelectedTasks(selection)
      }
      this.scrollToLine(task.id)
    },

    resetSelection() {
      this.selectionGrid = {}
      this.lastSelection = null
    },

    scrollToLine(taskId) {
      const taskLine = this.$refs[`task-${taskId}`]
      if (taskLine && this.$refs.body) {
        const margin = 30
        const rect = taskLine[0].getBoundingClientRect()
        const listRect = this.$refs.body.getBoundingClientRect()
        const isBelow = rect.bottom > listRect.bottom - margin
        const isAbove = rect.top < listRect.top + margin

        if (isBelow) {
          const scrollingRequired = rect.bottom - listRect.bottom + margin
          this.setScrollPosition(this.$refs.body.scrollTop + scrollingRequired)
        } else if (isAbove) {
          const scrollingRequired = listRect.top - rect.top + margin
          this.setScrollPosition(this.$refs.body.scrollTop - scrollingRequired)
        }
      }
    }
  },

  watch: {
    tasks() {
      this.page = 1
      this.resetSelection()
    },

    nbSelectedTasks() {
      if (this.nbSelectedTasks === 0) this.resetSelection()
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.datatable .datatable-row {
  cursor: pointer;
}

.name {
  width: 300px;
  min-width: 300px;
}

.description {
  width: 200px;
  min-width: 200px;
}

.description li {
  list-style-type: disc;
  margin-left: 2em;
}

.name a {
  color: inherit;
}

.production {
  width: 70px;
  min-width: 70px;
  max-width: 70px;
}

.type {
  width: 130px;
  min-width: 130px;
}

.assignees {
  width: 140px;
  max-width: 140px;

  .avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.status {
  width: 130px;
  min-width: 130px;
}

.duration,
.estimation {
  width: 60px;
  min-width: 60px;
}

.selected {
  .estimation {
    padding: 0;
  }
}

td.estimation {
  text-align: right;
}

.start-date,
.due-date {
  min-width: 110px;
  text-align: center;
  width: 110px;
}

td.due-date {
  border-right: 1px solid var(--border);
}

th.last-comment {
  max-width: 100%;
  width: 100%;
}

td.last-comment {
  min-width: 450px;
}

td.end-date {
  width: 100%;
  min-width: 150px;
  color: $grey;
}

.thumbnail {
  min-width: 60px;
  max-width: 60px;
  width: 60px;
  padding: 0;
}

.empty-list img {
  max-width: 80vh;
  -webkit-filter: brightness(103%);
}

.entity-name {
  color: var(--text);
  font-weight: bold;
}

.episode {
  min-width: 130px;
  width: 130px;
}

.input {
  padding: 0.5em;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.error {
  color: $red;
}
</style>
