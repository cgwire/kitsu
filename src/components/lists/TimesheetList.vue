<template>
  <div class="user-timesheet data-list">
    <div class="flexrow timesheet-header">
      <div class="flexrow-item current-date">
        <date-field
          :min-date="disabledDates.from"
          :max-date="disabledDates.to"
          :with-margin="false"
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
      <info-question-mark
        class="flexrow-item mt05"
        position="right"
        :text="dayOffInfo"
        v-if="personIsDayOff"
      />
    </div>

    <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
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
            :key="`${task.id}-${i}`"
            v-for="(task, i) in displayedTasks"
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
              class="time-spent"
              :duration="
                timeSpentMap[task.id] ? timeSpentMap[task.id].duration / 60 : 0
              "
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
            :key="`${task}-${i}`"
            v-for="(task, i) in doneTasks"
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
              <router-link :to="entityPath(task)">
                {{ task.full_entity_name }}
              </router-link>
            </th>
            <time-slider-cell
              class="time-spent"
              :duration="
                timeSpentMap[task.id] ? timeSpentMap[task.id].duration / 60 : 0
              "
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

    <day-off-modal
      :active="modals.setDayOff"
      :day-off-to-edit="{
        date: selectedDate
      }"
      :is-error="isDayOffError"
      :error-text="dayOffTextError"
      @confirm="
        dayOff => {
          $emit('set-day-off', dayOff)
        }
      "
      @cancel="closeSetDayOffModal"
    />

    <delete-modal
      :active="modals.unsetDayOff"
      :text="
        $t('days_off.confirm_unset_day_offs', {
          start: personDayOff?.date,
          end: personDayOff?.end_date
        })
      "
      :is-error="isDayOffError"
      :error-text="dayOffTextError"
      @confirm="$emit('unset-day-off')"
      @cancel="closeUnsetDayOffModal"
    />
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters } from 'vuex'

import { PAGE_SIZE } from '@/lib/pagination'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'
import DayOffModal from '@/components/modals/DayOffModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import TimeSliderCell from '@/components/cells/TimeSliderCell.vue'

export default {
  name: 'timesheet-list',

  components: {
    ButtonSimple,
    DayOffModal,
    DateField,
    DeleteModal,
    EntityThumbnail,
    InfoQuestionMark,
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
    dayOffError: {
      default: false,
      type: [String, Boolean]
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

  emits: ['date-changed', 'set-day-off', 'time-spent-change', 'unset-day-off'],

  data() {
    const today = new Date()
    return {
      colNamePosX: '',
      colTypePosX: '',
      disabledDates: {},
      page: 1,
      selectedDate: today,
      modals: {
        setDayOff: false,
        unsetDayOff: false
      }
    }
  },

  mounted() {
    this.colTypePosX = `${this.$refs['th-prod'].offsetWidth}px`
    this.colNamePosX = `${
      this.$refs['th-prod'].offsetWidth + this.$refs['th-type'].offsetWidth
    }px`
    this.disabledDates = {
      to:
        this.isCurrentUserArtist && this.organisation.timesheets_locked
          ? moment().subtract(1, 'weeks').toDate() // Disable dates older than one week
          : undefined,
      from: moment().toDate() // Disable dates after today
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserArtist',
      'organisation',
      'personDayOff',
      'personIsDayOff',
      'productionMap',
      'taskTypeMap',
      'user'
    ]),

    displayedTasks() {
      return this.tasks.slice(0, this.page * (PAGE_SIZE / 2))
    },

    dayOffInfo() {
      const { description, date, end_date } = this.personDayOff
      const period =
        end_date && date !== end_date ? `${date} - ${end_date}` : date
      return `${description || this.$t('timesheets.day_off')} (${period})`
    },

    isDayOffError() {
      return Boolean(this.dayOffError)
    },

    dayOffTextError() {
      return this.dayOffError?.length ? this.dayOffError : null
    }
  },

  methods: {
    onBodyScroll(event) {
      const position = event.target
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
        this.modals.unsetDayOff = true
      } else {
        this.modals.setDayOff = true
      }
    },

    closeSetDayOffModal() {
      this.modals.setDayOff = false
    },

    closeUnsetDayOffModal() {
      this.modals.unsetDayOff = false
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
.datatable-head th {
  z-index: 6; // over the .vue-slider (z-index: 5)
}

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

  :deep(.vue-slider:hover) {
    z-index: 6; // hover the ".datatable-head th" (z-index: 6)
  }
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
</style>
