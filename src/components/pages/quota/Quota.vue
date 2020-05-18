<template>
<div class="data-list">
  <div
    class="datatable-wrapper"
    ref="body"
  >
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th
            scope="col"
            class="name datatable-row-header"
            ref="rowHeaderName"
          >
            {{ $t('quota.name') }}
          </th>
          <th
            scope="col"
            class="average datatable-row-header"
            :style="{left: averageColumnX}"
          >
            {{ $t('quota.average') }}
          </th>
          <th
            scope="col"
            :key="'month-' + month"
            v-for="month in monthRange"
            v-if="detailLevel === 'month'"
          >
            {{ monthToString(month) }}
          </th>
          <th
            scope="col"
            :key="'week-' + week"
            v-for="week in weekRange"
            v-if="detailLevel === 'week'"
          >
            {{ week }}
          </th>

          <th
            scope="col"
            :key="'day-' + day"
            v-for="day in dayRange"
            v-if="detailLevel === 'day'"
          >
            {{ day }}
          </th>
        </tr>
      </thead>
      <tbody
        class="datatable-body"
        v-if="this.quotaLength > 0 && !isLoading"
      >
        <tr
          class="datatable-row"
          v-for="key in personIds"
          :key="'name-' + key"
        >
          <th scope="row" class="name datatable-row-header">
            <div class="flexrow">
              <people-avatar :size="30" :person="personMap[key]"/>
              {{ personMap[key].full_name }}
            </div>
          </th>
          <td
            class="average datatable-row-header"
            :style="{left: averageColumnX}"
            v-if="detailLevel === 'month'"
          >
            {{ getQuotaAverage(key, { year }) }}
          </td>
          <td
            class="average datatable-row-header"
            :style="{left: averageColumnX}"
            v-if="detailLevel === 'week'"
          >
            {{ getQuotaAverage(key, { year }) }}
          </td>
          <td
            class="average datatable-row-header"
            :style="{left: averageColumnX}"
            v-if="detailLevel === 'day'"
          >
            {{ getQuotaAverage(key, { year, month }) }}
          </td>
          <td
            :class="{
              selected: isMonthSelected(key, year, month)
            }"
            :key="'month-' + month"
            v-for="month in monthRange"
            v-if="detailLevel === 'month'"
          >
            <router-link
              class="quota-button"
              :to="episodifyRoute({
                name: 'quota-month-person',
                params: {
                  person_id: key,
                  year: year,
                  month: month
                }
              })"
              v-if="getQuota(key, {year, month})"
            >
              {{ getQuota(key, {year, month}) }}
            </router-link>
            <span v-else>-</span>
          </td>

          <td
            :class="{
              selected: isWeekSelected(key, year, week)
            }"
            :key="'week-' + week"
            v-for="week in weekRange"
            v-if="detailLevel === 'week'"
          >
            <router-link
              class="quota-button"
              :to="episodifyRoute({
                name: 'quota-week-person',
                params: {
                  person_id: key,
                  year: year,
                  week: week
                }
              })"
              v-if="getQuota(key, {year, week})"
            >
              {{ getQuota(key, {year, week}) }}
            </router-link>
            <span v-else>
            -
            </span>
          </td>

          <td
            :class="{
              weekend: isWeekend(year, month, day),
              selected: isDaySelected(key, year, month, day)
            }"
            :key="'day-' + day"
            v-for="day in dayRange"
            v-if="detailLevel === 'day'"
          >
            <router-link
              class="quota-button"
              :to="episodifyRoute({
                name: 'quota-day-person',
                params: {
                  person_id: key,
                  year: year,
                  month: month,
                  day: day
                }
              })"
              v-if="getQuota(key, {year, month, day})"
            >
              {{ getQuota(key, {year, month, day}) }}
            </router-link>
            <span v-else>
            -
            </span>
          </td>
        </tr>
      </tbody>
    </table>
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
import { episodifyRoute } from '../../../lib/path'
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
      isLoading: true,
      isError: false,
      quotaMap: {},
      quotaLength: 0,
      selected: undefined,
      averageColumnX: '12rem'
    }
  },

  mounted () {
    if (Object.keys(this.shotMap).length < 2) {
      setTimeout(() => {
        this.loadShots((err) => {
          setTimeout(() => {
            this.isLoading = false
          }, 200)
          if (!err) {
            this.loadData()
          }
        })
      }, 100)
    } else {
      if (!this.isShotsLoading) this.isLoading = false
      this.loadData()
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'isShotsLoading',
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
    },

    personIds () {
      const personIds = Object.keys(this.quotaMap)
      return personIds.sort((a, b) => {
        const personAName = this.personMap[a].full_name
        const personBName = this.personMap[b].full_name
        return personAName.localeCompare(personBName)
      })
    }
  },

  methods: {
    ...mapActions([
      'loadShots',
      'computeQuota',
      'getPeriodDetails'
    ]),

    episodifyRoute (route) {
      if (this.currentEpisode) {
        episodifyRoute(route, this.currentEpisode.id)
      }
      return route
    },

    isWeekend (year, month, day) {
      let date = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD')
      if (day < 10) date = moment(`${year}-${month}-0${day}`, 'YYYY-MM-DD')
      return [0, 6].includes(date.day())
    },

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
            this.calcAverageColumnX()
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

    dateDigit (date) {
      return date.toString().padStart(2, '0')
    },

    getQuota (personId, opt = {}) {
      if (opt.day) {
        const yearKey =
          `${opt.year}-${this.dateDigit(opt.month)}-${this.dateDigit(opt.day)}`
        return this.quotaMap[personId][yearKey]
      } else if (opt.week) {
        const weekKey = `${opt.year}-${opt.week}`
        return this.quotaMap[personId][weekKey]
      } else {
        const dayKey = `${opt.year}-${this.dateDigit(opt.month)}`
        return this.quotaMap[personId][dayKey]
      }
    },

    getQuotaAverage (personId, opt = {}) {
      let average
      if (opt.month) {
        const monthKey = opt.year + '-' + this.dateDigit(opt.month)
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
    },

    calcAverageColumnX () {
      if (this.quotaLength > 0) {
        this.averageColumnX = `${this.$refs.rowHeaderName.offsetWidth}px`
      }
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

    $route () {
      const els = document.getElementsByClassName('selected')
      if (els.length === 0) { // selected element is not visible
        setTimeout(() => {
          this.$refs.body.scrollLeft += 380
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

  .dark {
    .weekend {
      background-color: $dark-grey;
    }
   .quota-button:hover {
      color: #333;
    }
  }

  .data-list {
    margin-top: 0;
  }

  .datatable-wrapper {
    overflow: auto;
    margin-bottom: 1rem;
  }

  .datatable {
    min-width: auto;
    .name {
      min-width: 12rem;
      text-align: left;
      justify-content: flex-start;
      .avatar {
        margin-right: .5rem;
      }
    }
    .average {
      width: 8rem;
    }
    th,
    td {
      text-align: center
    }
  }

  .datatable-head th {
    min-width: 4rem;
  }

  .datatable-body th {
    padding: 1rem;
  }

  .datatable-body {
    th, td {
      border: 0;
    }
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

  .weekend {
    background-color: $white-grey;
  }
</style>
