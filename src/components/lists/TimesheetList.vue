<template>
  <div class="user-timesheet data-list">
    <div class="flexrow timesheet-header">
      <div class="flexrow-item current-date">
        <datepicker
          wrapper-class="datepicker"
          input-class="date-field input short"
          :language="locale"
          :disabled-dates="disabledDates"
          :monday-first="true"
          format="yyyy-MM-dd"
          v-model="selectedDate"
        />
      </div>
      <div class="flexrow-item flexrow time-spent-total">
        -&nbsp;&nbsp;
        {{ timeSpentTotal }} {{ $t('timesheets.hours') }}
      </div>
      <div class="filler"></div>
      <button-simple
        class="flexrow-item"
        :text="$t('timesheets.day_off')"
        :active="personIsDayOff"
        @click="toggleDayOff"
        v-if="!hideDayOff"
      />
    </div>

    <div class="datatable-wrapper" ref="body" v-scroll="onBodyScroll">
      <table class="datatable multi-section">
        <thead class="datatable-head">
          <tr>
            <th
              scope="col"
              class="datatable-row-header datatable-row-header--nobd production"
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
              :style="{ left: colNamePosX }"
            >
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
            <th
              class="production datatable-row-header datatable-row-header--nobd"
              scope="row"
            >
              <production-name-cell
                :entry="productionMap.get(task.project_id)"
                :only-avatar="true"
              />
            </th>
            <task-type-cell
              class="type datatable-row-header datatable-row-header--nobd"
              :production-id="task.project_id"
              :task-type="taskTypeMap.get(task.task_type_id)"
              :style="{ left: colTypePosX }"
            />

            <th
              class="name datatable-row-header"
              :style="{ left: colNamePosX }"
            >
              <router-link :to="entityPath(task)">
                <div class="flexrow">
                  <entity-thumbnail
                    :empty-width="60"
                    :empty-height="40"
                    :entity="{ preview_file_id: task.entity_preview_file_id }"
                  />
                  <span>
                    {{ task.full_entity_name }}
                  </span>
                </div>
              </router-link>
            </th>
            <time-slider-cell
              :duration="
                timeSpentMap[task.id] ? timeSpentMap[task.id].duration / 60 : 0
              "
              class="time-spent"
              :task-id="task.id"
              @change="onSliderChange"
              v-if="!personIsDayOff"
            />
            <td v-else></td>
          </tr>
        </tbody>
        <tbody class="datatable-body" v-if="!isLoading && !hideDone">
          <tr v-if="!hideDone" class="datatable-type-header">
            <th colspan="4" scope="rowgroup">
              <div class="datatable-row-header">
                <page-subtitle :text="$t('timesheets.done_tasks')" />
              </div>
            </th>
          </tr>
          <tr
            class="datatable-row"
            v-for="(task, i) in doneTasks"
            :key="task + '-' + i"
          >
            <th
              class="production datatable-row-header datatable-row-header--nobd"
              scope="row"
            >
              <production-name-cell
                :entry="productionMap.get(task.project_id)"
                :only-avatar="true"
              />
            </th>
            <task-type-cell
              class="type datatable-row-header datatable-row-header--nobd"
              :production-id="task.project_id"
              :task-type="{
                id: task.task_type_id,
                name: task.task_type_name,
                color: task.task_type_color,
                for_entity: ['Shot', 'Edit'].includes(task.entity_type_name)
                  ? task.entity_type_name
                  : 'Asset'
              }"
              :style="{ left: colTypePosX }"
            />

            <th
              class="name datatable-row-header"
              :style="{ left: colNamePosX }"
            >
              <router-link :to="task.entity_path">
                {{ task.full_entity_name }}
              </router-link>
            </th>
            <time-slider-cell
              :duration="
                timeSpentMap[task.id] ? timeSpentMap[task.id].duration / 60 : 0
              "
              class="time-spent"
              :task-id="task.id"
              @change="onSliderChange"
              v-if="!personIsDayOff"
            />
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered footer-info" v-if="!isLoading">
      {{ tasks.length }} {{ $tc('tasks.tasks', tasks.length) }}
    </p>

    <delete-modal
      :text="$t('timesheets.confirm_day_off')"
      @confirm="
        modals.dayOff = false
        $emit('set-day-off')
      "
      @cancel="modals.dayOff = false"
      :active="modals.dayOff"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import Datepicker from 'vuejs-datepicker'
import { en, fr } from 'vuejs-datepicker/dist/locale'

import { PAGE_SIZE } from '@/lib/pagination'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import DeleteModal from '@/components/modals/DeleteModal'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PageSubtitle from '@/components/widgets/PageSubtitle'
import ProductionNameCell from '@/components/cells/ProductionNameCell'
import TableInfo from '@/components/widgets/TableInfo'
import TaskTypeCell from '@/components/cells/TaskTypeCell'
import TimeSliderCell from '@/components/cells/TimeSliderCell'

export default {
  name: 'timesheet-list',

  components: {
    ButtonSimple,
    Datepicker,
    DeleteModal,
    EntityThumbnail,
    ProductionNameCell,
    PageSubtitle,
    TableInfo,
    TaskTypeCell,
    TimeSliderCell
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
    },
    hideDayOff: {
      default: true,
      type: Boolean
    }
  },

  data() {
    return {
      colNamePosX: '',
      colTypePosX: '',
      disabledDates: {},
      page: 1,
      selectedDate: moment().toDate(), // By default current day.
      modals: {
        dayOff: false
      }
    }
  },

  mounted() {
    this.colTypePosX = this.$refs['th-prod'].offsetWidth + 'px'
    this.colNamePosX =
      this.$refs['th-prod'].offsetWidth +
      this.$refs['th-type'].offsetWidth +
      'px'
    const beginningOfTheWeek = moment().startOf('isoWeek').toDate()
    this.disabledDates = {
      to:
        this.isCurrentUserArtist &&
        this.organisation.timesheets_locked === 'true'
          ? beginningOfTheWeek
          : undefined,
      from: moment().toDate() // Disable dates after today.
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserArtist',
      'isCurrentUserAdmin',
      'nbSelectedTasks',
      'organisation',
      'personIsDayOff',
      'productionMap',
      'taskTypeMap',
      'user'
    ]),

    locale() {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    },

    displayedTasks() {
      return this.tasks.slice(0, this.page * (PAGE_SIZE / 2))
    }
  },

  methods: {
    ...mapActions([]),

    onBodyScroll(event, position) {
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < position.scrollTop + 100) {
        this.page++
      }
    },

    currentDate() {
      return moment().format('LL')
    },

    onSliderChange(valueInfo) {
      this.$emit('time-spent-change', valueInfo)
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

      if (entity.episode_id) {
        route.name = `episode-${entityType}`
        route.params.episode_id = entity.episode_id
      }

      return route
    },

    toggleDayOff() {
      if (this.personIsDayOff) {
        this.$emit('unset-day-off')
      } else {
        this.modals.dayOff = true
      }
    }
  },

  watch: {
    selectedDate() {
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
