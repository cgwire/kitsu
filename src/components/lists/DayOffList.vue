<template>
  <div class="day-off-list data-list">
    <div class="flexrow header">
      <div class="filler"></div>
      <button-simple
        class="flexrow-item"
        :text="$t('days_off.add')"
        icon="plus"
        @click="openSetDayOffModal"
      />
    </div>
    <div class="datatable-wrapper" v-if="sortedDaysOff.length > 0">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th class="datatable-row-header datatable-row-header--nobd period">
              {{ $t('days_off.period') }}
            </th>
            <th
              class="datatable-row-header datatable-row-header--nobd description"
            >
              {{ $t('days_off.description') }}
            </th>
            <th class="datatable-row-header datatable-row-header--nobd"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="sortedDaysOff.length && !isLoading">
          <tr
            class="datatable-row"
            :key="dayOff.id"
            v-for="dayOff in sortedDaysOff"
          >
            <td class="period">{{ dayOff.period }}</td>
            <td class="description">{{ dayOff.description }}</td>
            <td class="actions">
              <button-simple
                @click="openSetDayOffModal(dayOff)"
                :title="$t('days_off.edit')"
                icon="edit"
              />
              <button-simple
                @click="openUnsetDayOffModal(dayOff)"
                :title="$t('days_off.delete')"
                icon="trash"
              />
            </td>
          </tr>
        </tbody>
        <tbody class="datatable-body" v-else-if="!isLoading">
          <tr class="datatable-row">
            <td class="datatable-row-header" colspan="4"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="has-text-centered mt2 mb1 strong"
      v-if="sortedDaysOff.length === 0 && !isLoading"
    >
      <p>{{ $t('days_off.no_days_off') }}</p>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="1"
      :with-thumbnail="false"
    />

    <p class="has-text-centered footer-info" v-if="!isLoading">
      {{ sortedDaysOff.length }}
      {{ $t('days_off.nb_days_off', { count: sortedDaysOff.length }) }}
    </p>

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
          start: formatSimpleDate(dayOffToEdit?.date),
          end: formatSimpleDate(dayOffToEdit?.end_date)
        })
      "
      :is-error="isDayOffError"
      :error-text="dayOffTextError"
      @confirm="$emit('unset-day-off', dayOffToEdit)"
      @cancel="closeUnsetDayOffModal"
    />
  </div>
</template>

<script setup>
import moment from 'moment-timezone'
import { computed, reactive, ref } from 'vue'

import { formatSimpleDate } from '@/lib/time'

import DayOffModal from '@/components/modals/DayOffModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  daysOff: {
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
  }
})

defineEmits(['set-day-off', 'unset-day-off'])

// State
// --------------------------------------------------------------------------
const dayOffToEdit = ref(null)
const modals = reactive({
  setDayOff: false,
  unsetDayOff: false
})

// Computed
// --------------------------------------------------------------------------
const isDayOffError = computed(() => Boolean(props.dayOffError))

const dayOffTextError = computed(() =>
  props.dayOffError?.length ? props.dayOffError : null
)

const sortedDaysOff = computed(() =>
  [...props.daysOff]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(dayOff => ({
      ...dayOff,
      period:
        dayOff.date !== dayOff.end_date
          ? `${dayOff.date} - ${dayOff.end_date}`
          : dayOff.date,
      date: moment.utc(dayOff.date).toDate(),
      end_date: moment.utc(dayOff.end_date || dayOff.date).toDate()
    }))
)

// Functions
// --------------------------------------------------------------------------
const openSetDayOffModal = (dayOff = null) => {
  dayOffToEdit.value = dayOff || { date: new Date() }
  modals.setDayOff = true
}

const openUnsetDayOffModal = dayOff => {
  dayOffToEdit.value = dayOff
  modals.unsetDayOff = true
}

const closeSetDayOffModal = () => {
  modals.setDayOff = false
}

const closeUnsetDayOffModal = () => {
  modals.unsetDayOff = false
}

// The parent pages close the modals from their day-off event handlers.
defineExpose({ closeSetDayOffModal, closeUnsetDayOffModal })
</script>

<style lang="scss" scoped>
.day-off-list {
  max-width: 800px;
}

.header {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: none;
}

.period {
  width: 230px;
  min-width: 200px;
}

.description {
  width: 100%;
  min-width: 200px;
}

.actions {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5em;
  min-width: auto;
}
</style>
