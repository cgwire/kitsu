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
            <th class="description" scope="col" v-if="isDescriptionPresent">
              {{ $t('assets.fields.description') }}
            </th>
            <th scope="col" class="estimation" :title="$t('main.estimation')">
              {{ $t('main.estimation_short') }}
            </th>
            <th scope="col" class="duration">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th scope="col" class="start-date">
              {{ $t('doodle.start_date') }}
            </th>
            <th scope="col" class="due-date">
              {{ $t('doodle.end_date') }}
            </th>
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
              class="datatable-row-header datatable-row-header--nobd"
              scope="row"
            >
              <div class="flexrow">
                <input
                  type="checkbox"
                  class="mr1"
                  :checked="entry.checked ? entry.checked : false"
                  @input="event => onCheckChanged(entry, event)"
                />
                <production-name-cell
                  :is-tooltip="true"
                  :entry="productionMap.get(entry.project_id)"
                  :only-avatar="true"
                />
              </div>
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
              v-if="isDescriptionPresent"
            />
            <td class="estimation">
              {{ formatDuration(entry.estimation) }}
            </td>
            <td class="duration">
              {{ formatDuration(entry.duration) }}
            </td>
            <td class="start-date">
              {{ formatDate(entry.start_date) || formatDate(entry.created_at) }}
            </td>
            <td class="due-date">
              {{ formatDate(entry.due_date) || formatDate(entry.updated_at) }}
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
import TaskTypeCell from '@/components/cells/TaskTypeCell'
import TableInfo from '@/components/widgets/TableInfo'

export default {
  name: 'work-sheet-add-task-list',
  mixins: [formatListMixin, selectionListMixin, descriptorMixin],

  components: {
    EntityThumbnail,
    DescriptionCell,
    ProductionNameCell,
    TableInfo,
    TaskTypeCell
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

    onCheckChanged(entry, event) {
      entry.checked = event.target.checked
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

.duration {
  width: 60px;
  min-width: 60px;
}

td.duration {
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
  min-width: 100px;
  width: 100px;
}

.input-editor {
  text-align: right;
  color: $grey-strong;
  height: 100%;
  width: 100%;
  background: transparent;
}
</style>
