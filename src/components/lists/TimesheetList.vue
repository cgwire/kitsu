<template>
  <div class="user-timesheet data-list">
    <div class="flexrow timesheet-header">
      <div class="flexrow-item current-date">
        <date-field
          :can-delete="false"
          :min-date="disabledDates.to"
          :max-date="disabledDates.from"
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
      <table class="datatable">
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
            <th scope="col" class="time-spent datatable-row-header">
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
            <td class="time-spent day-off-cell" v-else>
              {{ $t('timesheets.day_off_no_logging') }}
            </td>
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
            <td class="time-spent day-off-cell" v-else>
              {{ $t('timesheets.day_off_no_logging') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="2"
      :with-thumbnail="false"
      :with-actions="false"
    />

    <p class="has-text-centered footer-info" v-if="!isLoading">
      {{ tasks.length }} {{ $t('tasks.number', { count: tasks.length }) }}
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
      @confirm="$emit('unset-day-off', personDayOff)"
      @cancel="closeUnsetDayOffModal"
    />
  </div>
</template>

<script setup>
import moment from 'moment-timezone'
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { PAGE_SIZE } from '@/lib/pagination'
import { getTaskEntityPath } from '@/lib/path'

import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import TimeSliderCell from '@/components/cells/TimeSliderCell.vue'
import DayOffModal from '@/components/modals/DayOffModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits
const props = defineProps({
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
  daysOff: {
    default: () => [],
    type: Array
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
  },
  initialDate: {
    default: null,
    type: String
  }
})

const emit = defineEmits([
  'date-changed',
  'set-day-off',
  'time-spent-change',
  'unset-day-off'
])

// State
const colNamePosX = ref('')
const colTypePosX = ref('')
const disabledDates = ref({})
const page = ref(1)
const selectedDate = ref(
  props.initialDate
    ? moment(props.initialDate, 'YYYY-MM-DD').toDate()
    : new Date()
)
const modals = reactive({
  setDayOff: false,
  unsetDayOff: false
})

const bodyRef = useTemplateRef('body')
const thProdRef = useTemplateRef('th-prod')
const thTypeRef = useTemplateRef('th-type')

// Computed
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const organisation = computed(() => store.getters.organisation)
const productionMap = computed(() => store.getters.productionMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const personDayOff = computed(() => {
  const date = moment(selectedDate.value).format('YYYY-MM-DD')
  return props.daysOff.find(
    dayOff => date >= dayOff.date && date <= (dayOff.end_date || dayOff.date)
  )
})

const personIsDayOff = computed(() => Boolean(personDayOff.value))

const displayedTasks = computed(() =>
  props.tasks.slice(0, page.value * (PAGE_SIZE / 2))
)

const dayOffInfo = computed(() => {
  const { description, date, end_date } = personDayOff.value
  const period = end_date && date !== end_date ? `${date} - ${end_date}` : date
  return `${description || t('timesheets.day_off')} (${period})`
})

const isDayOffError = computed(() => Boolean(props.dayOffError))

const dayOffTextError = computed(() =>
  props.dayOffError?.length ? props.dayOffError : null
)

// Functions
const onBodyScroll = event => {
  if (!bodyRef.value) return
  const maxHeight = bodyRef.value.scrollHeight - bodyRef.value.offsetHeight
  if (maxHeight < event.target.scrollTop + 100) {
    page.value++
  }
}

const onSliderChange = valueInfo => {
  emit('time-spent-change', valueInfo)
}

const entityPath = entity => getTaskEntityPath(entity, entity.episode_id)

const toggleDayOff = () => {
  if (personIsDayOff.value) {
    modals.unsetDayOff = true
  } else {
    modals.setDayOff = true
  }
}

const closeSetDayOffModal = () => {
  modals.setDayOff = false
}

const closeUnsetDayOffModal = () => {
  modals.unsetDayOff = false
}

// The parent pages close the modals from their day-off event handlers.
defineExpose({ closeSetDayOffModal, closeUnsetDayOffModal })

// Watchers
watch(selectedDate, () => {
  emit('date-changed', selectedDate.value)
})

// Lifecycle
onMounted(() => {
  colTypePosX.value = `${thProdRef.value.offsetWidth}px`
  colNamePosX.value = `${
    thProdRef.value.offsetWidth + thTypeRef.value.offsetWidth
  }px`
  disabledDates.value = {
    to:
      isCurrentUserArtist.value && organisation.value.timesheets_locked
        ? moment().subtract(1, 'weeks').toDate() // Disable dates older than one week
        : undefined,
    from: moment().toDate() // Disable dates after today
  }
})
</script>

<style lang="scss" scoped>
.datatable-head .datatable-row-header {
  z-index: 8; // sticky <th> must be above all

  &.time-spent {
    z-index: 6; // <th> must be under the sticky <th> on horizontal scroll
  }
}

.datatable-body .datatable-row-header {
  z-index: 7; // <th> must be over the .vue-slider (z-index: 5) and .vue-slider-dot (z-index: 6)

  &.time-spent {
    z-index: 5; // <th> must be under <td> on vertical scroll
  }
}

:deep(.vue-slider-dot:hover) {
  z-index: 6; // hack to put slider tooltip hover the header
}

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

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
  max-width: 70px;
}

.type {
  width: 160px;
  min-width: 160px;
}

.time-spent {
  width: 100%;
}

.day-off-cell {
  color: var(--text-alt);
  font-style: italic;
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

.time-spent-total {
  font-size: 1.6em;
  line-height: 1.7em;
}
</style>
