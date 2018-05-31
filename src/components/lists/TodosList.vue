  <div style="overflow: hidden">
    <template> <div class="data-list">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="production">
            {{ $t('tasks.fields.production') }}
          </th>
          <th class="type">
            {{ $t('tasks.fields.task_type') }}
          </th>
          <th class="thumbnail">
          </th>
          <th class="name">
            {{ $t('tasks.fields.entity') }}
          </th>
          <th class="description">
            {{ $t('assets.fields.description') }}
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
            :entry="productionMap[entry.project_id]"
            :only-avatar="true"
          >
          </production-name-cell>
          <task-type-name
            class="type"
            :production-id="entry.project_id"
            :entry="{
              id: entry.task_type_id,
              name: entry.task_type_name,
              color: entry.task_type_color
            }"
          >
          </task-type-name>
          <td class="thumbnail">
            <entity-thumbnail
              :empty-width="60"
              :empty-height="40"
              :entity="{preview_file_id: entry.entity_preview_file_id}"
            >
            </entity-thumbnail>
          </td>

          <td class="name">
            <router-link :to="entry.entity_path">
              {{ entry.full_entity_name }}
            </router-link>
          </td>
          <description-cell
            class="description"
            :entry="{description: entry.entity_description}"
          >
          </description-cell>
          <validation-cell
            class="status unselectable"
            :ref="'validation-' + i + '-0'"
            :task-test="entry"
            :is-border="false"
            :is-assignees="false"
            :selectable="!done"
            :selected="selectionGrid && selectionGrid[i] ? selectionGrid[i][0] : false"
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

import DescriptionCell from '../cells/DescriptionCell'
import ProductionNameCell from '../cells/ProductionNameCell'
import LastCommentCell from '../cells/LastCommentCell'
import TaskTypeName from '../cells/TaskTypeName'
import ValidationCell from '../cells/ValidationCell'
import TableInfo from '../widgets/TableInfo'
import ValidationTag from '../widgets/ValidationTag'
import EntityThumbnail from '../widgets/EntityThumbnail'

export default {
  name: 'todos-list',
  components: {
    DescriptionCell,
    EntityThumbnail,
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
      'nbSelectedTasks',
      'productionMap'
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

.description {
  width: 250px;
  min-width: 250px;
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
  padding: 0;
}
</style>
