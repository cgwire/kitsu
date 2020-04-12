<template>
<div class="user-timesheet data-list">
  <div class="flexrow timesheet-header">
    <div class="flexrow-item current-date">
      <datepicker
        wrapper-class="datepicker"
        input-class="date-field input"
        :language="locale"
        :disabled-dates="disabledDates"
        :monday-first="true"
        format="d MMMM yyyy"
        v-model="selectedDate"
      />
    </div>
    <div class="flexrow time-spent-total">
    -&nbsp;&nbsp;
    {{ timeSpentTotal }} {{ $t('timesheets.hours') }}
    </div>
  </div>

  <div
    class="datatable-wrapper"
    ref="body"
    v-scroll="onBodyScroll"
  >
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="datatable-row-header production">
            {{ $t('tasks.fields.production') }}
          </th>
          <th scope="col" class="type">
            {{ $t('tasks.fields.task_type') }}
          </th>
          <th scope="col" class="name">
            {{ $t('tasks.fields.entity') }}
          </th>
          <th scope="col" class="time-spent">
            {{ $t('timesheets.time_spents') }}
          </th>
        </tr>
      </thead>
      <tbody class="datatable-body" v-if="tasks.length > 0 && !isLoading">
        <tr
          class="datatable-row"
          v-for="(task, i) in displayedTasks"
          :key="task.id + '-' + i"
        >
          <th class="production datatable-row-header" scope="row">
            <production-name-cell
              :entry="productionMap[task.project_id]"
              :only-avatar="true"
            />
          </th>
          <task-type-name
            class="type"
            :production-id="task.project_id"
            :entry="taskTypeMap[task.task_type_id]"
          />

          <td class="name">
            <router-link :to="entityPath(task)">
              {{ task.full_entity_name }}
            </router-link>
          </td>
          <time-slider-cell
            :duration="timeSpentMap[task.id] ? timeSpentMap[task.id].duration / 60 : 0"
            class="time-spent"
            :task-id="task.id"
            @change="onSliderChange"
          />
       </tr>
      </tbody>
      <tbody class="datatable-body" v-if="!isLoading && !hideDone">
        <tr v-if="!hideDone" class="datatable-type-header">
          <th colspan="4" scope="rowgroup">
            <div class="datatable-row-header">
              <page-subtitle
                :text="$t('timesheets.done_tasks')"
              />
            </div>
          </th>
        </tr>
        <tr
          class="datatable-row"
          v-for="(task, i) in doneTasks"
          :key="task + '-' + i"
        >
          <th class="production datatable-row-header" scope="row">
           <production-name-cell
             :entry="productionMap[task.project_id]"
             :only-avatar="true"
           />
          </th>
          <task-type-name
           class="type"
           :production-id="task.project_id"
           :entry="{
             id: task.task_type_id,
             name: task.task_type_name,
             color: task.task_type_color
           }"
          />
          <td class="name">
           <router-link :to="task.entity_path">
             {{ task.full_entity_name }}
           </router-link>
          </td>
          <time-slider-cell
           :duration="timeSpentMap[task.id] ? timeSpentMap[task.id].duration / 60 : 0"
           class="time-spent"
           :task-id="task.id"
           @change="onSliderChange"
          />
        </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <p class="has-text-centered footer-info" v-if="!isLoading">
    {{ tasks.length }} {{ $tc('tasks.tasks', tasks.length) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import Datepicker from 'vuejs-datepicker'
import { en, fr } from 'vuejs-datepicker/dist/locale'

import { PAGE_SIZE } from '../../lib/pagination'
import PageSubtitle from '../widgets/PageSubtitle'
import ProductionNameCell from '../cells/ProductionNameCell'
import TaskTypeName from '../cells/TaskTypeName'
import TimeSliderCell from '../cells/TimeSliderCell'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'timesheet-list',

  components: {
    Datepicker,
    ProductionNameCell,
    PageSubtitle,
    TableInfo,
    TaskTypeName,
    TimeSliderCell
  },

  data () {
    return {
      disabledDates: {
        from: moment().toDate() // Disable dates after today.
      },
      page: 1,
      selectedDate: moment().toDate() // By default current day.
    }
  },

  props: {
    tasks: {
      default: () => [],
      type: Array
    },
    doneTasks: {
      default: () => [],
      type: Array
    },
    isLoading: {
      default: false,
      type: Boolean
    },
    isError: {
      default: false,
      type: Boolean
    },
    done: {
      default: false,
      type: Boolean
    },
    timeSpentMap: {
      default: () => {},
      type: Object
    },
    timeSpentTotal: {
      default: 0,
      type: Number
    },
    hideDone: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters([
      'nbSelectedTasks',
      'productionMap',
      'taskTypeMap',
      'user'
    ]),

    locale () {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    },

    displayedTasks () {
      return this.tasks.slice(0, this.page * (PAGE_SIZE / 2))
    }
  },

  methods: {
    ...mapActions([
    ]),

    onBodyScroll (event, position) {
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.page++
      }
    },

    currentDate () {
      return moment().format('LL')
    },

    onSliderChange (valueInfo) {
      this.$emit('time-spent-change', valueInfo)
    },

    entityPath (entity) {
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

      if (entity.episode_id) {
        route.name = `episode-${entityType}`
        route.params.episode_id = entity.episode_id
      }

      return route
    }
  },

  watch: {
    selectedDate () {
      this.$emit('date-changed', this.selectedDate)
    }
  }
}
</script>

<style lang="scss" scoped>

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 230px;
  min-width: 230px;
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
  width: 160px;
  min-width: 160px;
}

.status {
  width: 80px;
  min-width: 80px;
}

.time-spent {
  width: 100%;
}

td.name {
  font-weight: bold;
}

.thumbnail {
  min-width: 60px;
  max-width: 60px;
  width: 60px;
  padding: 0;
}

.timesheet-header {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 0.5em;
}

.calendar {
  font-size: 0.6em;
}

.time-spent-total {
  font-size: 1.6em;
  line-height: 1.7em;
}

.vue-slider {
  z-index: 0;
}
</style>
