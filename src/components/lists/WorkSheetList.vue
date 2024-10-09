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
            <th scope="col" class="episode">
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
            <th scope="col" class="estimation">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th scope="col" class="start-date" v-if="!isToCheck">
              {{ $t('doodle.start_date') }}
            </th>
            <th scope="col" class="due-date">
              {{ $t('doodle.end_date') }}
            </th>
            <th scope="col" class="time-remark">
              {{ $t('doodle.time_remark') }}
            </th>
            <th scope="col" class="user-remark">
              {{ $t('doodle.user_remark') }}
            </th>
            <metadata-header
              :key="'desc-header' + field_name"
              :descriptor="
                mergeMetadataDescriptors(metadataDescriptorsMap[field_name])
              "
              :no-menu="true"
              v-for="field_name in Object.keys(metadataDescriptorsMap)"
            />
            <template v-if="!isToCheck">
              <th scope="col" class="last-comment" v-if="!done">
                {{ $t('doodle.action') }}
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
            v-show="entry && !entry.visible"
          >
            <td
              class="datatable-row-header datatable-row-header--nobd"
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

            <td class="episode">
              <div class="flexrow" :title="''">
                {{ getEpisodes(entry) }}
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
            <td class="estimation">
              <input
                class="input-editor"
                @keyup.enter="event => durationDate(event, entry)"
                min="0"
                :value="getDurationValue(entry.duration)"
              />
            </td>
            <td class="start-date" v-if="!isToCheck">
              {{ formatDate(entry.start_time) }}
            </td>
            <td class="due-date">
              {{ formatDate(entry.end_time) }}
            </td>
            <td class="time-remark">
              {{ entry.time_remark }}
            </td>
            <td class="user-remark">
              {{ entry.user_remark }}
            </td>
            <td class="actions has-text-right">
              <button
                class="button"
                data-test="button-delete"
                tabindex="-1"
                @click="onRemove(entry)"
              >
                <trash-icon class="icon is-small only-icon" />
              </button>
            </td>
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
        <!-- <img src="../../assets/illustrations/empty_todo.png" /> -->
      </p>
      <p>
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { selectionListMixin } from '@/components/mixins/selection'
import { formatListMixin } from '@/components/mixins/format'
import { descriptorMixin } from '@/components/mixins/descriptors'

import { PAGE_SIZE } from '@/lib/pagination'
import { sortPeople } from '@/lib/sorting'
import { formatSimpleDate } from '@/lib/time'

import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import DescriptionCell from '@/components/cells/DescriptionCell'
import ProductionNameCell from '@/components/cells/ProductionNameCell'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TaskTypeCell from '@/components/cells/TaskTypeCell'
import TableInfo from '@/components/widgets/TableInfo'
import MetadataHeader from '@/components/cells/MetadataHeader'


export default {
  name: 'work-sheet-list',
  mixins: [formatListMixin, selectionListMixin, descriptorMixin],

  components: {
    EntityThumbnail,
    DescriptionCell,
    PeopleAvatar,
    ProductionNameCell,
    TableInfo,
    TaskTypeCell,
    MetadataHeader,
  },

  props: {
    checkboxShow: {
      default: false,
      type: Boolean
    },
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
    },
    yearString: {
      type: String,
      default: ''
    },
    monthString: {
      type: String,
      default: ''
    },
    userId: {
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
    this.colTypePosX = this.$refs['th-prod'].offsetWidth + 'px'
    this.colNamePosX =
      this.$refs['th-prod'].offsetWidth +
      this.$refs['th-type'].offsetWidth +
      'px'
  },

  beforeDestroy() {},

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

    isEpisodeVisible() {
      return this.displayedTasks.some(
        task => task.source_id || task.episode_names?.length > 0
      )
    }
  },

  methods: {
    getSortedPeople(personIds) {
      const people = personIds.map(id => this.personMap.get(id))
      return sortPeople(people)
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    formatDate(date) {
      return date ? formatSimpleDate(date) : ''
    },

    getDurationValue(duration) {
      return Number(duration / (1000 * 1000 * 60 * 60)).toFixed(1)
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
      console.log('validation-' + i + '-0')
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

    onRemove(entry) {
      if (!entry.doodle_task_id) {
        alert(this.$t('doodle.calculate_tip'))
        return
      }
      const time_task_id = entry.doodle_task_id
      const action = 'removeTaskTime'
      const l_params = {
        time_task_id
      }
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('removeTaskTime Done')
          this.$emit('remove-sort-task', entry)
        })
        .catch(err => {
          console.log('removeTaskTime Error')
          console.error(err)
          if (err.response) {
            alert(err.response.text)
          } else {
            alert(err.message)
          }
        })
    },

    durationDate(event, entry) {
      const duration = event.target.value
      const user_id = this.userId
      const year = this.yearString
      const month = this.monthString
      const task_id = entry.doodle_task_id
      if (!task_id) {
        alert(this.$t('doodle.calculate_tip'))
        return
      }
      const action = 'setTaskTime'
      const l_params = {
        user_id,
        year,
        month,
        task_id,
        duration
      }
      this.$store
        .dispatch(action, l_params)
        .then(res => {
          console.log('setTaskTime Done')
          if (res.data) {
            this.$emit('set-sort-task', res.data)
          }
        })
        .catch(err => {
          console.log('getUserInfo Error')
          console.error(err)
          if (err.response) {
            alert(err.response.text)
          } else {
            alert(err.message)
          }
        })
    },

    getEpisodes(entry) {
      let episodes = ''
      const theTaskType = this.taskTypeMap.get(entry.task_type_id)
      if (theTaskType.for_entity.includes('Shot')) {
        episodes = entry.sequence_name.replaceAll('EP', '') ?? ''
      } else {
        episodes = entry.entity_data.ji_shu_lie
      }
      return episodes
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

.time-remark {
  min-width: 400px;
}

.user-remark {
  min-width: 250px;
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

.episode {
  min-width: 60px;
  width: 60px;
}

.input-editor {
  text-align: right;
  color: $grey-strong;
  height: 100%;
  width: 100%;
  background: transparent;
}

.actions {
  min-width: 80px;
  padding: 0.4em;
}
</style>
