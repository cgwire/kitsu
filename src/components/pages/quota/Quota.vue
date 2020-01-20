<template>
  <div class="quota">
    <div
      class="quota-fixed"
      v-if="this.quotaLength > 0 && !isLoading"
    >
      <div class="quota-header quota-row">
        <div class="header-cell row-cell row-cell--name">
          {{ $t('quota.name') }}
        </div>
        <div class="header-cell row-cell row-cell--average">
          {{ $t('quota.average') }}
        </div>
      </div>
      <div
        class="quota-row"
        v-for="(people, key, i) in quotaMap"
        :key="'-' + i"
      >
        <div class="row-cell row-cell--name">
          <people-avatar :size="30" :person="personMap[key]"/>
          {{ personMap[key].full_name }}
        </div>
        <div
          class="row-cell row-cell--average"
          v-if="detailLevel === 'month'"
        >
          {{ getQuotaAverage(key, { year }) }}
        </div>
        <div
          class="row-cell row-cell--average"
          v-if="detailLevel === 'week'"
        >
          {{ getQuotaAverage(key, { year }) }}
        </div>
        <div
          class="row-cell row-cell--average"
          v-if="detailLevel === 'day'"
        >
          {{ getQuotaAverage(key, { year, month }) }}
        </div>
      </div>
    </div>
    <div
      class="quota-scrolled"
      ref="body"
      v-if="this.quotaLength > 0 && !isLoading"
    >
      <div class="quota-header quota-row">
        <div
          class="header-cell row-cell"
          :key="'month-' + month"
          v-for="month in monthRange"
          v-if="detailLevel === 'month'"
        >
          {{ monthToString(month) }}
        </div>
        <div
          class="header-cell row-cell"
          :key="'week-' + week"
          v-for="week in weekRange"
          v-if="detailLevel === 'week'"
        >
          {{ week }}
        </div>

        <div
          class="header-cell row-cell"
          :key="'day-' + day"
          v-for="day in dayRange"
          v-if="detailLevel === 'day'"
        >
          {{ day }}
        </div>
      </div>
      <div
        class="quota-row"
        v-for="(people, key) in quotaMap"
        :key="key"
      >
        <div
          :class="{
            'row-cell': true,
            selected: isMonthSelected(key, year, month)
          }"
          :key="'month-' + month"
          v-for="month in monthRange"
          v-if="detailLevel === 'month'"
        >
          <router-link
            class="quota-button"
            :to="{
              name: 'quota-month-person',
              params: {
                person_id: key,
                year: year,
                month: month
              }
            }"
            v-if="getQuota(key, {year, month})"
          >
            {{ getQuota(key, {year, month}) }}
          </router-link>
          <span v-else>-</span>
        </div>

        <div
          :class="{
            'row-cell': true,
            selected: isWeekSelected(key, year, week)
          }"
          :key="'week-' + week"
          v-for="week in weekRange"
          v-if="detailLevel === 'week'"
        >
          <router-link
            class="quota-button"
            :to="{
              name: 'quota-week-person',
              params: {
                person_id: key,
                year: year,
                week: week
              }
            }"
            v-if="getQuota(key, {year, week})"
          >
            {{ getQuota(key, {year, week}) }}
          </router-link>
          <span v-else>
          -
          </span>
        </div>

        <div
          :class="{
            'row-cell': true,
            selected: isDaySelected(key, year, month, day)
          }"
          :key="'day-' + day"
          v-for="day in dayRange"
          v-if="detailLevel === 'day'"
        >
          <router-link
            class="quota-button"
            :to="{
              name: 'quota-day-person',
              params: {
                person_id: key,
                year: year,
                month: month,
                day: day
              }
            }"
            v-if="getQuota(key, {year, month, day})"
          >
            {{ getQuota(key, {year, month, day}) }}
          </router-link>
          <span v-else>
          -
          </span>
        </div>
      </div>
    </div>

    <div
      class="has-text-centered empty-quota"
      v-if="this.quotaLength === 0 && !isLoading"
    >
      <p class="info">{{ $t('quota.no_quota') }}</p>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
    />
  </div>
</template>

<script>

import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from '../../widgets/PeopleAvatar'
import TableInfo from '../../widgets/TableInfo'
import {
  monthToString,
  getMonthRange,
  getWeekRange,
  getDayRange
} from '../../../lib/time'

export default {
  name: 'quota',

  components: {
    PeopleAvatar,
    TableInfo
  },

  props: {
    taskTypeId: {
      type: String,
      required: true
    },
    detailLevel: {
      type: String,
      default: 'day',
      required: true
    },
    countMode: {
      type: String,
      default: 'frames',
      required: true
    },
    year: {
      type: Number,
      default: 0
    },
    month: {
      type: Number,
      default: 0
    },
    week: {
      type: Number,
      default: 0
    },
    day: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      currentMonth: moment().month() + 1,
      currentYear: moment().year(),
      currentWeek: moment().week(),
      detailsTitle: '',
      detailsMap: {},
      isPanelShown: false,
      isLoading: false,
      isError: false,
      quotaMap: {},
      quotaLength: 0,
      selected: undefined
    }
  },

  mounted () {
    this.loadData()
  },

  computed: {
    ...mapGetters([
      'shotMap',
      'personMap'
    ]),

    monthRange () {
      return getMonthRange(this.year, this.currentYear, this.currentMonth)
    },

    dayRange () {
      return getDayRange(
        this.year,
        this.month,
        this.currentYear,
        this.currentMonth
      )
    },

    weekRange () {
      return getWeekRange(this.year, this.currentYear, this.currentWeek)
    }
  },

  methods: {
    ...mapActions([
      'loadShots',
      'computeQuota',
      'getPeriodDetails'
    ]),

    loadData () {
      if (this.taskTypeId) {
        this.computeQuota({
          taskTypeId: this.taskTypeId,
          detailLevel: this.detailLevel,
          countMode: this.countMode
        })
          .then(quotas => {
            this.quotaMap = quotas
            this.isLoading = false
            this.quotaLength = Object.keys(this.quotaMap).length
          })
      }
    },

    loadDetails (personId, dateString) {
      this.loadShots((err) => {
        this.isLoading = true
        if (err) {
          console.error(err)
        } else {
          if (this.taskTypeId) {
            this.getPeriodDetails({
              taskTypeId: this.taskTypeId,
              detailLevel: this.detailLevel,
              personId,
              dateString
            })
              .then(shots => {
                this.detailsMap = shots
                this.isLoading = false
              })
          }
        }
      })
    },
    monthToString,

    getQuota (personId, opt = {}) {
      if (opt.day) {
        const yearKey =
          `${opt.year}-${opt.month.toString().padStart(2, '0')}-${opt.day}`
        return this.quotaMap[personId][yearKey]
      } else if (opt.week) {
        const weekKey = `${opt.year}-${opt.week}`
        return this.quotaMap[personId][weekKey]
      } else {
        const dayKey = `${opt.year}-${opt.month.toString().padStart(2, '0')}`
        return this.quotaMap[personId][dayKey]
      }
    },

    getQuotaAverage (personId, opt = {}) {
      let average
      if (opt.month) {
        const monthKey = opt.year + '-' + opt.month.toString().padStart(2, '0')
        average = this.quotaMap[personId].average[monthKey]
      } else if (opt.week) {
        const weekKey = `${opt.year}-${opt.week}`
        average = this.quotaMap[personId].average[weekKey]
      } else if (this.quotaMap[personId].average) {
        average = this.quotaMap[personId].average[opt.year]
      }
      return average ? average.toFixed(2) : '-'
    },

    isDaySelected (personId, year, month, day) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        this.$route.params.year === year &&
        this.$route.params.month === month &&
        this.$route.params.day === day
      )
    },

    isWeekSelected (personId, year, week) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        this.$route.params.year === year &&
        this.$route.params.week === week
      )
    },

    isMonthSelected (personId, year, month) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        this.$route.params.year === year &&
        this.$route.params.month === month
      )
    }
  },

  watch: {
    taskTypeId () {
      if (this.taskTypeId) {
        this.loadData()
      }
    },

    detailLevel () {
      this.loadData()
    },

    countMode () {
      this.loadData()
    },

    shotMap () {
      this.loadData()
    },

    route () {
      const els = document.getElementsByClassName('selected')
      if (els.length === 0) { // selected element is not visible
        this.$refs.body.scrollLeft += 350
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .dark {
    .quota {
      color: $white;
    }
    .quota-panel {
      border-left-color: $dark-grey-light;
    }
    .row-cell,
    .details tr {
      border-bottom-color: $dark-grey-light;
    }
    .quota-row:nth-child(odd):not(.quota-header) .row-cell,
    .details tbody tr:nth-child(even) {
      background-color: $dark-grey-lightmore;
    }
    .details td,
    .details th {
      color: $white;
    }

    .weekend {
      background-color: $dark-grey;
    }

   .quota-button:hover {
      color: #333;
    }
  }

  .quota {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    max-width: 100%;
    color: $dark-grey;
  }

  .quota-fixed {
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
  }

  .quota-scrolled {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    overflow: hidden;
    overflow-x: auto;
  }

  .quota-panel {
    padding: 1rem;
    border-left: 1px solid $light-grey-light;
  }

  .quota-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .row-cell {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 4rem;
    padding: 1rem;
    height: 4rem;
    max-height: 4rem;
    border-bottom: 1px solid $light-grey-light;
    flex: 0 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .quota-row:nth-child(odd):not(.quota-header) .row-cell {
    background-color: $white-grey-light;
  }

  .quota-row:last-child .row-cell {
    border: 0;
  }

  .header-cell {
    font-weight: bold;
  }

  .row-cell--name {
    width: 12rem;
    justify-content: flex-start;
    .avatar {
      margin-right: .5rem;
    }
  }

  .row-cell--weekly {
    width: 10rem;
  }

  .row-cell--average {
    width: 8rem;
  }

  .quota-button {
    border-radius: .5rem;
    padding: .5rem;
    background: transparent;
    border: 0;
    cursor: pointer;
    color: inherit;
    font-size: inherit;
    &:hover,
    &:focus,
    &.is-selected {
      background-color: $dark-grey-lightest;
    }
  }

  .details {
    min-width: 14rem;
    td, th {
      color: $dark-grey;
      font-size: .8rem;
      padding: .25rem;
      text-align: center;
      &:first-child {
        text-align: left;
      }
    }
    tr {
      border-bottom: 1px solid $light-grey-light;
    }
    tbody {
      tr:nth-child(even) {
        background-color: $white-grey-light;
      }
    }
  }

  .details-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
  }

  .empty-quota {
    width: 100%;
  }

  .selected .quota-button {
    background: $purple;
    color: #333;
  }

  .quota-button:hover {
    background: #BBEEBB;
  }

</style>
