<template> <div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="production">
            {{ $t('tasks.fields.production') }}
          </th>
          <th class="thumbnail">
          </th>
          <th class="name">
            {{ $t('tasks.fields.entity') }}
          </th>
          <th class="type">
            {{ $t('tasks.fields.task_type') }}
          </th>
          <th class="status">
            {{ $t('tasks.fields.task_status') }}
          </th>
          <th class="last-comment" v-if="!done">
            {{ $t('tasks.fields.last_comment') }}
          </th>
          <th class="end-date" v-else>
            {{ $t('tasks.fields.end_date') }}
          </th>
          <th class="actions">
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <div class="table-body" v-scroll="onBodyScroll" v-if="entries.length > 0">
    <table class="table">
      <tbody>
        <tr v-for="(entry, i) in entries">
          <production-name-cell
            class="production"
            :entry="{
              name: entry.project_name,
              id: entry.production_id
            }"
            :only-avatar="true"
          >
          </production-name-cell>
          <td class="thumbnail">
            <img
              class="thumbnail-picture"
              :src="'/api/pictures/thumbnails/preview-files/' + entry.entity_preview_file_id + '.png'"
              v-if="entry.entity_preview_file_id.length > 0"
            />
            <span class="thumbnail-picture thumbnail-empty" v-else>
            </span>
          </td>
          <td class="name">
            <router-link :to="entry.entity_path">
              {{ entry.full_entity_name }}
            </router-link>
          </td>
          <task-type-name
            class="type"
            :entry="{
              name: entry.task_type_name,
              color: entry.task_type_color
            }"
          >
          </task-type-name>
          <validation-cell
            class="status unselectable"
            :ref="'validation-' + i + '-0'"
            :task-test="entry"
            :is-border="false"
            :is-assignees="false"
            :selectable="!done"
            :selected="selectionGrid[i][0]"
            :rowX="i"
            :columnY="0"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            :column="entry.taskStatus"
          >
          </validation-cell>
          <last-comment-cell
            class="last-comment"
            :task="entry"
            v-if="!done"
          >
          </last-comment-cell>
          <td class="end-date" v-else>
            {{ formatDate(entry.end_date) }}
          </td>
          <td class="actions"></td>
       </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <p class="has-text-centered footer-info" v-if="!isLoading">
    {{ entries.length }} {{ $tc('tasks.tasks', entries.length) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

import ProductionNameCell from '../cells/ProductionNameCell'
import LastCommentCell from '../cells/LastCommentCell'
import TaskTypeName from '../cells/TaskTypeName'
import ValidationCell from '../cells/ValidationCell'
import TableInfo from '../widgets/TableInfo'
import ValidationTag from '../widgets/ValidationTag'

export default {
  name: 'todos-list',
  components: {
    LastCommentCell,
    ProductionNameCell,
    TableInfo,
    TaskTypeName,
    ValidationCell,
    ValidationTag
  },
  props: [
    'entries',
    'isLoading',
    'isError',
    'done',
    'selectionGrid'
  ],
  computed: {
    ...mapGetters([
      'nbSelectedTasks'
    ])
  },
  methods: {
    ...mapActions([
    ]),

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    },

    formatDate (date) {
      return date ? moment(date).fromNow() : ''
    },

    onTaskSelected (validationInfo) {
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
              validationCell.select({ctrlKey: true, isUserClick: false})
            }
          }
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
      }
      this.$store.commit('ADD_SELECTED_TASK', validationInfo)

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        this.lastSelection = {
          x: validationInfo.x,
          y: 0
        }
      }
    },

    onTaskUnselected (validationInfo) {
      if (!validationInfo.isCtrlKey) {
        if (this.nbSelectedTasks === 1) {
          this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
        } else {
          this.$store.commit('CLEAR_SELECTED_TASKS')
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else {
        this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
      }
    }
  }
}
</script>

<style scoped>
.name {
  width: 230px;
  min-width: 230px;
}

.name a {
  color: inherit;
}

.production {
  width: 70px;
  min-width: 70px;
}

.type {
  width: 150px;
  min-width: 150px;
}

.status {
  width: 80px;
  min-width: 80px;
}

.last-comment {
  width: 500px;
  min-width: 500px;
}

.end-date {
  width: 150px;
  min-width: 150px;
  color: #999;
}

.thumbnail {
  min-width: 60px;
  max-width: 60px;
  width: 60px;
  padding: 0 0 0 0;
}

.thumbnail img {
  margin-top: 5px;
}

span.thumbnail-empty {
  display: block;
  width: 60px;
  height: 40px;
  background: #F3F3F3;
}
</style>
