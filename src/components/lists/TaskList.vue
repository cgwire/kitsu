<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead ref="thead">
        <tr>
          <th class="thumbnail" ref="th-thumbnail">
          </th>
          <th class="asset-type" ref="th-type" v-if="isAssets">
            {{ $t('tasks.fields.asset_type') }}
          </th>
          <th class="sequence" ref="th-type" v-else>
            {{ $t('tasks.fields.sequence') }}
          </th>
          <th class="name" ref="th-name">
            {{ $t('tasks.fields.entity_name') }}
          </th>
          <th class="status" ref="th-status">
            {{ $t('tasks.fields.task_status') }}
          </th>
          <th class="assignees" ref="th-assignees">
            {{ $t('tasks.fields.assignees') }}
          </th>
          <th class="estimation" ref="th-estimation">
            {{ $t('tasks.fields.estimation').substring(0, 3) }}.
          </th>
          <th class="duration" ref="th-duration">
            {{ $t('tasks.fields.duration').substring(0, 3) }}.
          </th>
          <th class="retake-count" ref="th-retake-count">
            {{ $t('tasks.fields.retake_count') }}
          </th>
          <th class="real-start-date" ref="th-status">
            {{ $t('tasks.fields.real_start_date') }}
          </th>
          <th class="real-end-date" ref="th-status">
            {{ $t('tasks.fields.real_end_date') }}
          </th>
          <th class="last-comment-date" ref="th-status">
            {{ $t('tasks.fields.last_comment_date') }}
          </th>
          <th class="empty" ref="">
            &nbsp;
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <div
    ref="body"
    class="table-body"
    v-scroll="onBodyScroll"
    v-if="!isLoading"
  >
    <table
      class="table unselectable"
    >
      <tbody
        class="tbody"
        ref="body-tbody"
      >
        <tr
          :key="task.id"
          :class="{
            'task-line': true,
            selected: selectionGrid[task.id]
          }"
          @click="selectTask($event, index, task)"
          v-for="(task, index) in tasks"
        >
          <td class="thumbnail">
            <entity-thumbnail
              :entity="getEntity(task.entity.id)"
              :width="50"
            />
          </td>
          <td class="asset-type" v-if="isAssets">
            {{ getEntity(task.entity.id).asset_type_name }}
          </td>
          <td class="sequence" v-else>
            {{ getEntity(task.entity.id).sequence_name }}
          </td>
          <td class="name">
            {{ getEntity(task.entity.id).name }}
          </td>
          <validation-cell
            class="status unselectable"
            :task-test="task"
            :is-border="false"
            :is-assignees="false"
            :selectable="false"
          />
          <td class="assignees">
            <div class="flexrow">
              <people-avatar
                class="flexrow-item"
                :key="task.id + '-' + personId"
                :person="personMap[personId]"
                :size="30"
                :font-size="17"
                v-for="personId in task.assignees"
              />
            </div>
          </td>
          <td class="estimation">
            {{ task.estimation }}
          </td>
          <td class="duration">
            {{ formatDuration(task.duration) }}
          </td>
          <td class="retake-count">
            <span
              v-for="index in task.retake_count"
              :key="index"
            >
              &bull;
            </span>
          </td>
          <td class="real-start-date">
            {{ formatDate(task.real_start_date) }}
          </td>
          <td class="real-end-date">
            {{ formatDate(task.real_end_date) }}
          </td>
          <td class="last-comment-date">
            {{ formatDate(task.last_comment_date) }}
          </td>
          <td>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p
    class="has-text-centered nb-tasks"
    v-if="!isLoading"
  >
    {{ tasks.length }} tasks
  </p>
</div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import {
  ChevronDownIcon
} from 'vue-feather-icons'
import { range } from '../../lib/helpers'

import DescriptionCell from '../cells/DescriptionCell'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import ButtonLink from '../widgets/ButtonLink'
import ButtonSimple from '../widgets/ButtonSimple'
import EntityThumbnail from '../widgets/EntityThumbnail'
import PageTitle from '../widgets/PageTitle'
import RowActions from '../widgets/RowActions'
import TableHeaderMenu from '../widgets/TableHeaderMenu'
import TableInfo from '../widgets/TableInfo'
import TableMetadataHeaderMenu from '../widgets/TableMetadataHeaderMenu'
import PeopleAvatar from '../widgets/PeopleAvatar'
import ValidationCell from '../cells/ValidationCell'

export default {
  name: 'task-list',
  mixins: [],

  components: {
    ButtonLink,
    ButtonSimple,
    ButtonHrefLink,
    DescriptionCell,
    EntityThumbnail,
    ChevronDownIcon,
    PeopleAvatar,
    PageTitle,
    RowActions,
    TableInfo,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    ValidationCell
  },

  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isAssets: {
      type: Boolean,
      default: true
    },
    taskType: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      lastSelection: null,
      options: [],
      selectionGrid: {}
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'shotMap',
      'nbSelectedTasks',
      'selectedTasks',
      'personMap'
    ])
  },

  mounted () {
    window.addEventListener('keydown', this.onKeyDown, false)
    this.$nextTick(this.resizeHeaders)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    ...mapActions([
      'addSelectedTask',
      'addSelectedTasks',
      'clearSelectedTasks',
      'removeSelectedTask'
    ]),

    formatDuration (duration) {
      if (duration) {
        return (duration / 60 / 8).toLocaleString(
          'fullwide', { maximumFractionDigits: 1 }
        )
      } else {
        return 0
      }
    },

    formatDate (date) {
      if (date) return moment(date).format('YYYY-MM-DD')
      else return ''
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
    },

    selectTask (event, index, task) {
      const isSelected = this.selectionGrid[task.id]
      const isManySelection = Object.keys(this.selectionGrid).length > 1
      if (!event.ctrlKey && !event.shiftKey) {
        this.clearSelectedTasks({ task })
        this.resetSelection()
      }

      if (!event.shiftKey) {
        if (this.selectionGrid[task.id]) {
          this.removeSelectedTask({ task })
          Vue.set(this.selectionGrid, task.id, undefined)
        } else if (!isSelected || isManySelection) {
          this.addSelectedTask({ task })
          this.$emit('task-selected', task)
          Vue.set(this.selectionGrid, task.id, true)
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
          Vue.set(this.selectionGrid, task.task.id, true)
        })
        this.addSelectedTasks(selection)
      }
    },

    onKeyDown (event) {
      if (this.tasks.length > 0 && event.ctrlKey) {
        let index = this.lastSelection ? this.lastSelection : 0
        if ([37, 38].includes(event.keyCode)) {
          index = (index - 1) < 0 ? index = this.tasks.length - 1 : index - 1
          this.selectTask({}, index, this.tasks[index])
        } else if ([39, 40].includes(event.keyCode)) {
          index = (index + 1) >= this.tasks.length ? index = 0 : index + 1
          this.selectTask({}, index, this.tasks[index])
        }
      }
    },

    resetSelection () {
      this.selectionGrid = {}
      this.lastSelection = null
    },

    getEntity (entityId) {
      if (this.isAssets) {
        return this.assetMap[entityId]
      } else {
        return this.shotMap[entityId]
      }
    },

    resizeHeaders () {
      if (
        this.$refs['body-tbody'] &&
        this.$refs['body-tbody'].children.length > 0
      ) {
        console.log('ok')
        const bodyElement = this.$refs['body-tbody'].children[0]
        const columnDescriptors = [
          {index: 1, name: 'type'},
          {index: 2, name: 'name'},
          {index: 4, name: 'assignees'}
        ]
        columnDescriptors.forEach(desc => {
          const width = Math.max(
            bodyElement.children[desc.index].offsetWidth,
            100
          )
          this.$refs['th-' + desc.name].style['min-width'] = `${width}px`
        })
      }
    }
  },

  watch: {
    tasks () {
      this.resetSelection()
      this.$nextTick(this.resizeHeaders)
    },

    nbSelectedTasks () {
      if (this.nbSelectedTasks === 0) this.resetSelection()
    }
  }
}
</script>

<style scoped lang="scss">
.dark .table-body tr.task-line.selected {
  background: $dark-purple;
}

.thumbnail {
  min-width: 80px;
  width: 80px;
  max-width: 80px;
}

.asset-type {
  min-width: 120px;
  width: 120px;
}

.sequence {
  min-width: 120px;
  width: 120px;
}

.name {
  min-width: 120px;
  width: 120px;
  font-weight: bold;
}

.status {
  min-width: 80px;
  width: 80px;
}

.assignees {
  min-width: 130px;
  width: 130px;
}

.estimation {
  min-width: 60px;
  width: 60px;
  text-align: center;
}

.duration {
  min-width: 60px;
  width: 60px;
  text-align: center;
}

.retake-count {
  min-width: 80px;
  width: 80px;
}

.last-comment-date,
.real-start-date,
.real-end-date {
  min-width: 130px;
  width: 130px;
}

.empty {
  width: 100%
}

.avatar {
}

td.retake-count {
  color: $red;
  font-weight: bold;
  font-size: 1.6em;
  padding-left: 2px;
}

.nb-tasks {
  padding: 0.5em;
}

.table-header th {
  padding: 0.5em 0;
}

.table-body {
  td,
  tr {
    padding: 0;
  }

  tr.task-line {
    cursor: pointer;

    &.selected {
      border: 0;
      background: $purple;
    }
  }
}
</style>
