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

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered footer-info" v-if="!isLoading">
      {{ sortedDaysOff.length }}
      {{ $tc('days_off.nb_days_off', sortedDaysOff.length) }}
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

<script>
import moment from 'moment-timezone'

import { formatSimpleDate } from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DayOffModal from '@/components/modals/DayOffModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'day-off-list',

  components: {
    ButtonSimple,
    DayOffModal,
    DeleteModal,
    TableInfo
  },

  props: {
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
  },

  emits: ['set-day-off', 'unset-day-off'],

  data() {
    return {
      dayOffToEdit: null,
      modals: {
        setDayOff: false,
        unsetDayOff: false
      }
    }
  },

  computed: {
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
    },

    sortedDaysOff() {
      return [...this.daysOff]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(dayOff => {
          return {
            ...dayOff,
            period:
              dayOff.date !== dayOff.end_date
                ? `${dayOff.date} - ${dayOff.end_date}`
                : dayOff.date,
            date: moment.utc(dayOff.date).toDate(),
            end_date: moment.utc(dayOff.end_date || dayOff.date).toDate()
          }
        })
    }
  },

  methods: {
    formatSimpleDate,

    openSetDayOffModal(dayOff = null) {
      if (!dayOff) {
        dayOff = { date: new Date() }
      }
      this.dayOffToEdit = dayOff
      this.modals.setDayOff = true
    },

    openUnsetDayOffModal(dayOff) {
      this.dayOffToEdit = dayOff
      this.modals.unsetDayOff = true
    },

    closeSetDayOffModal() {
      this.modals.setDayOff = false
    },

    closeUnsetDayOffModal() {
      this.modals.unsetDayOff = false
    }
  }
}
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
