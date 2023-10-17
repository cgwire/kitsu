<template>
  <div class="data-list task-list">
    <div class="datatable-wrapper" ref="body" v-scroll="onBodyScroll">
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
            <th scope="col" class="estimation">
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
            v-for="(entry, i) in displayedTasks"
            :key="entry + '-' + i"
            :class="{
              'datatable-row': true,
              'datatable-row--selectable': true,
              selected:
                selectionGrid && selectionGrid[i] ? selectionGrid[i][0] : false
            }"
            @click="onLineClicked(i, $event)"
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
            <description-cell
              class="description"
              :entry="{ description: entry.entity_description }"
              v-if="isDescriptionPresent && !isToCheck"
            />
            <td class="assignees" v-if="isToCheck">
              <div class="flexrow">
                <people-avatar
                  class="flexrow-item"
                  :key="entry.id + '-' + personId"
                  :person="personMap.get(personId)"
                  :size="30"
                  :font-size="16"
                  v-for="personId in entry.assignees"
                />
              </div>
            </td>
            <td class="estimation">
              {{ formatDuration(entry.estimation) }}
            </td>
            <td class="estimation">
              {{ formatDuration(entry.duration) }}
            </td>
            <td class="start-date" v-if="!isToCheck">
              {{ formatDate(entry.start_date) }}
            </td>
            <td class="due-date">
              {{ formatDate(entry.due_date) }}
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
                    v-for="(option, i) in getDescriptorChecklistValues(
                      getMetadataDescriptor(fieldName, entry)
                    )"
                    :key="`${entry.id}-
                    ${getMetadataDescriptor(fieldName, entry).id}
                    -${i}-${option.text}-div`"
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
              :task-test="entry"
              :is-border="false"
              :is-assignees="false"
              :clickable="false"
              :selected="
                selectionGrid && selectionGrid[i] ? selectionGrid[i][0] : false
              "
              :rowX="i"
              :columnY="0"
              :column="entry.taskStatus"
              @select="onTaskSelected"
              @unselect="onTaskUnselected"
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
import { mapGetters, mapActions } from 'vuex'

import { selectionListMixin } from '@/components/mixins/selection'
import { formatListMixin } from '@/components/mixins/format'
import { descriptorMixin } from '@/components/mixins/descriptors'
import { PAGE_SIZE } from '@/lib/pagination'
import { formatSimpleDate } from '@/lib/time'

import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import DescriptionCell from '@/components/cells/DescriptionCell'
import LastCommentCell from '@/components/cells/LastCommentCell'
import ProductionNameCell from '@/components/cells/ProductionNameCell'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TaskTypeCell from '@/components/cells/TaskTypeCell'
import TableInfo from '@/components/widgets/TableInfo'
import ValidationCell from '@/components/cells/ValidationCell'
import MetadataHeader from '@/components/cells/MetadataHeader'

export default {
  name: 'todos-list',
  mixins: [formatListMixin, selectionListMixin, descriptorMixin],

  components: {
    EntityThumbnail,
    DescriptionCell,
    LastCommentCell,
    PeopleAvatar,
    ProductionNameCell,
    TableInfo,
    TaskTypeCell,
    ValidationCell,
    MetadataHeader
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
    selectionGrid: {
      type: Object,
      default: () => {}
    },
    isToCheck: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      page: 1,
      colTypePosX: '',
      colNamePosX: ''
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

  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters([
      'nbSelectedTasks',
      'openProductions',
      'personMap',
      'productionMap',
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
    }
  },

  methods: {
    ...mapActions([]),

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    formatDate(date) {
      return date ? formatSimpleDate(date) : ''
    },

    onBodyScroll(event, position) {
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.page++
      }
    },

    onLineClicked(i, event) {
      const ref = 'validation-' + i + '-0'
      const validationCell = this.$refs[ref][0]
      if (validationCell) {
        validationCell.select(event)
      }
    },

    onTaskSelected(validationInfo) {
      validationInfo.done = this.done
      if (validationInfo.isShiftKey) {
        if (this.lastSelection) {
          let startX = this.lastSelection.x
          let endX = validationInfo.x
          if (validationInfo.x < this.lastSelection.x) {
            startX = validationInfo.x
            endX = this.lastSelection.x
          }

          for (let i = startX; i <= endX; i++) {
            const ref = 'validation-' + i + '-' + 0
            const validationCell = this.$refs[ref][0]
            if (!this.selectionGrid[i][0]) {
              validationCell.select({ ctrlKey: true, isUserClick: false })
            }
          }
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
        this.$emit('task-selection-cleared')
      }
      this.$store.commit('ADD_SELECTED_TASK', validationInfo)
      this.$emit('task-selection-addition', validationInfo)

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        const x = validationInfo.x
        const y = 0
        this.lastSelection = { x, y }
        const ref = 'validation-' + x + '-' + y
        const validationCell = this.$refs[ref][0]
        this.$nextTick(() => {
          this.scrollToValidationCell(validationCell)
        })
      }
    },

    onTaskUnselected(validationInfo) {
      if (!validationInfo.isCtrlKey) {
        if (this.nbSelectedTasks === 1) {
          this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
          this.$emit('task-selection-removal', validationInfo)
        } else {
          this.$store.commit('CLEAR_SELECTED_TASKS')
          this.$emit('task-selection-cleared')
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
          this.$emit('task-selection-addition', validationInfo)
        }
      } else {
        this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
        this.$emit('task-selection-removal', validationInfo)
      }
    },

    getTaskType(entry) {
      const taskType = this.taskTypeMap.get(entry.task_type_id)
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
      const lastSelection = this.lastSelection
        ? this.lastSelection
        : { x: 0, y: 0 }
      const i = lastSelection.x
      const j = lastSelection.y
      let validationCell = null
      if (event.ctrlKey || event.metaKey) {
        if (event.keyCode === 37) {
          validationCell = this.select(i, j - 1)
        } else if (event.keyCode === 38) {
          validationCell = this.select(i - 1, j)
        } else if (event.keyCode === 39) {
          validationCell = this.select(i, j + 1)
        } else if (event.keyCode === 40) {
          validationCell = this.select(i + 1, j)
        }
        this.scrollToValidationCell(validationCell)
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
  width: 130px;
  max-width: 130px;
}

.status {
  width: 130px;
  min-width: 130px;
}

.estimation {
  width: 60px;
  min-width: 60px;
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
}

.entity-name {
  color: var(--text);
  font-weight: bold;
}
</style>
