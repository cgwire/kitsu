<template>
  <div class="user-timesheet data-list">
    <div class="timesheet-header">
      <date-field
        :can-delete="false"
        :min-date="disabledDates.to"
        :max-date="disabledDates.from"
        :with-margin="false"
        v-model="selectedDate"
      />
      <div class="time-spent-total">
        <strong>{{ timeSpentTotal }}</strong>
        {{ $t('timesheets.hours') }}
      </div>
      <div class="filler"></div>
      <div class="week-time-spent-total" v-if="weekTimeSpentTotal !== null">
        {{ $t('timesheets.week_total', { hours: weekTimeSpentTotal }) }}
      </div>
      <button-simple
        :text="$t('timesheets.day_off')"
        :active="personIsDayOff"
        @click="toggleDayOff"
        v-if="!hideDayOff"
      />
      <info-question-mark
        class="day-off-info"
        position="right"
        :text="dayOffInfo"
        v-if="personIsDayOff"
      />
    </div>

    <div class="timesheet-panel">
      <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
        <table class="datatable datatable--cards">
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
                :data-label="$t('main.production')"
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
                :data-label="$t('tasks.fields.task_type')"
              />

              <th
                class="name datatable-row-header card-head"
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
                  timeSpentMap[task.id]
                    ? timeSpentMap[task.id].duration / 60
                    : 0
                "
                :task-id="task.id"
                :data-label="$t('timesheets.time_spents')"
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
                :data-label="$t('main.production')"
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
                :data-label="$t('tasks.fields.task_type')"
              />

              <th
                class="name datatable-row-header card-head"
                :style="{ left: colNamePosX }"
              >
                <router-link :to="entityPath(task)">
                  {{ task.full_entity_name }}
                </router-link>
              </th>
              <time-slider-cell
                class="time-spent"
                :duration="
                  timeSpentMap[task.id]
                    ? timeSpentMap[task.id].duration / 60
                    : 0
                "
                :task-id="task.id"
                :data-label="$t('timesheets.time_spents')"
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
    </div>

    <day-off-modal
      :active="modals.setDayOff"
      :day-off-to-edit="dayOffToEdit"
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
import { getUserDay } from '@/lib/time'

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
// --------------------------------------------------------------------------
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
    default: () => ({}),
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
  },
  personId: {
    default: null,
    type: String
  }
})

const emit = defineEmits([
  'date-changed',
  'set-day-off',
  'time-spent-change',
  'unset-day-off',
  'update:day-off-error'
])

// State
// --------------------------------------------------------------------------
const colNamePosX = ref('')
const colTypePosX = ref('')
const dayOffToEdit = ref(null)
const disabledDates = ref({})
const filledTaskIds = ref(new Set())
const otherDaysDuration = ref(null)
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
// --------------------------------------------------------------------------
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

const sortedTasks = computed(() =>
  [...props.tasks].sort(
    (a, b) => filledTaskIds.value.has(b.id) - filledTaskIds.value.has(a.id)
  )
)

const displayedTasks = computed(() =>
  sortedTasks.value.slice(0, page.value * (PAGE_SIZE / 2))
)

// The selected day comes from the live total, so the edits show at once.
const weekTimeSpentTotal = computed(() =>
  otherDaysDuration.value === null
    ? null
    : otherDaysDuration.value / 60 + props.timeSpentTotal
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
// --------------------------------------------------------------------------
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

const loadWeekTimeSpents = async () => {
  otherDaysDuration.value = null
  if (props.personId) {
    const day = moment(selectedDate.value).format('YYYY-MM-DD')
    const timeSpents = await store.dispatch('loadPersonTimeSpentsByPeriod', {
      personId: props.personId,
      startDate: moment(day).startOf('isoWeek').format('YYYY-MM-DD'),
      endDate: moment(day).endOf('isoWeek').format('YYYY-MM-DD')
    })
    // A quicker answer for a later day may have landed first.
    if (day !== moment(selectedDate.value).format('YYYY-MM-DD')) return
    otherDaysDuration.value = (timeSpents || [])
      .filter(timeSpent => timeSpent.date.slice(0, 10) !== day)
      .reduce((total, timeSpent) => total + timeSpent.duration, 0)
  }
}

const entityPath = entity => getTaskEntityPath(entity, entity.episode_id)

// The page keeps the error of a refused confirm: each form opens without it.
const toggleDayOff = () => {
  emit('update:day-off-error', false)
  if (personIsDayOff.value) {
    modals.unsetDayOff = true
  } else {
    dayOffToEdit.value = { date: getUserDay(selectedDate.value).toDate() }
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
// --------------------------------------------------------------------------
// The stores replace the map on each load and mutate it on each edit: the
// filled rows move up on a load only, never under the cursor.
watch(
  () => props.timeSpentMap,
  timeSpentMap => {
    filledTaskIds.value = new Set(
      Object.keys(timeSpentMap || {}).filter(
        taskId => timeSpentMap[taskId].duration > 0
      )
    )
  },
  { immediate: true }
)

watch(selectedDate, () => {
  emit('date-changed', selectedDate.value)
})

watch(
  [selectedDate, () => props.personId],
  () => loadWeekTimeSpents().catch(console.error),
  { immediate: true }
)

// Lifecycle
// --------------------------------------------------------------------------
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
  align-items: center;
  background: var(--background-panel);
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em 1em;
  margin-bottom: 1em;
  padding: 1em;
}

.timesheet-panel {
  background: var(--background-panel);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 1em;

  // the sticky shadow of the last head cell overflows the table by 11px and
  // brings a useless horizontal scrollbar
  .datatable-head th.time-spent::after {
    display: none;
  }

  // overflow: auto clips the rows and the sticky head to the corners
  .datatable-wrapper {
    border-radius: 10px;
    margin-bottom: 0;
  }

  .footer-info {
    margin: 0.75em 0 0;
  }
}

// softer than the near-black strong text of the light theme
.timesheet-header,
.timesheet-panel {
  --text-strong: #46494f;
}

.dark .timesheet-header,
.dark .timesheet-panel {
  --text-strong: #fefefe;
}

// the panel token is near the page background in dark theme
.dark .timesheet-header,
.dark .timesheet-panel {
  background: #2a2d33;
}

// the dark background of the filter comboboxes
.dark .timesheet-header :deep(.dp--input) {
  background: $dark-grey-light;
}

.time-spent-total {
  color: var(--text);
  white-space: nowrap;

  strong {
    color: var(--text-strong);
    font-size: 1.6em;
    font-variant-numeric: tabular-nums;
    margin-right: 0.15em;
  }
}

.week-time-spent-total {
  background: rgba(var(--skeleton-rgb), 0.25);
  border-radius: 999px;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  padding: 0.25em 0.9em;
  white-space: nowrap;
}

@media screen and (max-width: 768px) {
  // the Day off button takes the place of the week total
  .day-off-info,
  .week-time-spent-total {
    display: none;
  }

  // the page scrolls on a phone, not the list
  .timesheet-header {
    padding: 0.5em;
  }

  .timesheet-panel {
    padding: 0.5em;

    .datatable-wrapper {
      background: transparent;
      border: 0;
      overflow: visible;
    }
  }

  // The global card rule styles td cells only: these rows open on th ones.
  .datatable--cards .datatable-body th {
    background: transparent !important;
    border: 0;
    left: auto !important;
    max-width: none;
    min-width: 0;
    position: static;
    width: auto;

    &::after {
      display: none;
    }
  }

  .datatable--cards .datatable-body th.card-head {
    display: block;
    order: -1;
    padding: 0.75em 0 1em;
  }

  .datatable--cards .datatable-body th[data-label] {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 0.25em 0;

    &::before {
      color: var(--text-alt);
      content: attr(data-label);
      font-size: 0.8em;
      font-weight: normal;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  }

  // The production avatar opens the card head, left of the thumbnail: the
  // card wraps as a row, every other line takes the full width.
  // the global card rule also names :hover and :last-child, which a bare
  // row selector loses against: the tapped and the last card stacked again
  .datatable--cards .datatable-row,
  .datatable--cards .datatable-row:last-child,
  .datatable--cards .datatable-row:hover {
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .datatable--cards .datatable-body td[data-label],
  .datatable--cards .datatable-body th[data-label] {
    flex: 1 0 100%;
  }

  .datatable--cards .datatable-body th.production {
    display: block;
    flex: none;
    order: -2;
    padding-right: 0.75em;

    &::before {
      display: none;
    }
  }

  .datatable--cards .datatable-body th.card-head {
    flex: 1;
    min-width: 0;
  }

  .datatable--cards .datatable-type-header {
    display: block;

    th {
      display: block;
      padding: 1em 0 0.5em;
    }
  }

  // Time logging stays possible on a phone: the label faces the field, the
  // slider takes the line below.
  .datatable--cards .datatable-body td.time-spent {
    flex-wrap: wrap;
    row-gap: 0.5em;

    &::before {
      flex: 1 1 auto;
      text-align: left;
    }

    > :deep(.flexrow) {
      display: contents;
    }

    // no hover on a phone: the field shows its border at once
    // flexrow-item gives it a 1em right margin: flush with the card instead
    :deep(input.value) {
      border-color: var(--border);
      margin-right: 0;
      order: 1;
    }

    // a flex basis too wide for the first line sends the slider to the
    // second one
    // the marks hang under the rail, out of the flow: the bottom padding
    // keeps them inside the card
    :deep(.slider-item) {
      flex: 1 0 100%;
      order: 2;
      // the slider pads itself for its dot: no side padding on top of it
      padding: 0 0 1.5em;
    }

    // the slider is 400px wide inline on desktop
    :deep(.slider) {
      width: 100% !important;
    }

    // the slider and the field are enough on a phone
    :deep(.button) {
      display: none;
    }
  }
}
</style>
