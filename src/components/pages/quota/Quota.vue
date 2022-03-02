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
          v-for="key in filteredPersonIds"
          :key="'name-' + key"
        >
          <th scope="row" class="name datatable-row-header">
            <div class="flexrow">
              <people-avatar :size="30" :person="personMap.get(key)"/>
              {{ personMap.get(key).full_name }}
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
              selected: isMonthSelected(key, year, month),
              'quota-low': isMonthQuotaLow(key, year, month)
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
              {{
                countMode === 'seconds'
                ? getQuota(key, {year, month}).toFixed(2)
                : getQuota(key, {year, month})
              }}
            </router-link>
            <span v-else>-</span>
          </td>

          <td
            :class="{
              selected: isWeekSelected(key, year, week),
              'quota-low': isWeekQuotaLow(key, year, month)
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
              {{
                countMode === 'seconds'
                ? getQuota(key, {year, week}).toFixed(2)
                : getQuota(key, {year, week})
              }}
            </router-link>
            <span v-else>
            -
            </span>
          </td>

          <td
            :class="{
              weekend: isWeekend(year, month, day),
              selected: isDaySelected(key, year, month, day),
              'quota-low': isDayQuotaLow(key, year, month, day)
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
              {{
                countMode === 'seconds'
                ? getQuota(key, {year, month, day}).toFixed(2)
                : getQuota(key, {year, month, day})
              }}
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
import { episodifyRoute } from '@/lib/path'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TableInfo from '@/components/widgets/TableInfo'
import {
  buildNameIndex,
  indexSearch
} from '@/lib/indexing'
import {
  monthToString,
  getMonthRange,
  getWeekRange,
  getDayRange
} from '@/lib/time'

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
    computeMode: {
      type: String,
      default: 'weighted',
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
    },
    searchText: {
      type: String,
      default: ''
    },
    maxQuota: {
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
      personIds: [],
      quotaMap: {},
      quotaLength: 0,
      selected: undefined,
      averageColumnX: '12rem'
    }
  },

  mounted () {
    if (this.shotMap.size < 2) {
      this.isLoading = true
      setTimeout(() => {
        this.loadShots((err) => {
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

    filteredPersonIds () {
      let personIds = this.personIds
      if (this.searchText.length > 0) {
        personIds = indexSearch(this.personIndex, this.searchText.split(' '))
          .map(person => person.id)
      }
      return personIds
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
        this.isLoading = true
        this.computeQuota({
          taskTypeId: this.taskTypeId,
          detailLevel: this.detailLevel,
          countMode: this.countMode,
          computeMode: this.computeMode
        })
          .then(quotas => {
            this.quotaMap = quotas
            this.quotaLength = Object.keys(this.quotaMap).length
            this.calcAverageColumnX()
            this.$nextTick(() => {
              this.isLoading = false
            })
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
        const dayKey =
          `${opt.year}-${this.dateDigit(opt.month)}-${this.dateDigit(opt.day)}`
        return this.quotaMap[personId].day[this.countMode][dayKey]
      } else if (opt.week) {
        const weekKey = `${opt.year}-${opt.week}`
        return this.quotaMap[personId].week[this.countMode][weekKey]
      } else {
        const monthKey = `${opt.year}-${this.dateDigit(opt.month)}`
        return this.quotaMap[personId].month[this.countMode][monthKey]
      }
    },

    getQuotaAverage (personId, opt = {}) {
      let average = 0
      let total = 0
      let nbEntries
      if (this.detailLevel === 'day') {
        const monthKey = `${opt.year}-${this.dateDigit(opt.month)}`
        total = this.quotaMap[personId].month[this.countMode][monthKey]
        nbEntries = this.quotaMap[personId].day.entries[monthKey]
      } else if (this.detailLevel === 'week') {
        const yearKey = opt.year
        total = this.quotaMap[personId].year[this.countMode][yearKey]
        nbEntries = this.quotaMap[personId].week.entries[yearKey]
      } else if (this.detailLevel === 'month') {
        const yearKey = opt.year
        total = this.quotaMap[personId].year[this.countMode][yearKey]
        nbEntries = this.quotaMap[personId].month.entries[yearKey]
      }
      average = total / nbEntries
      return average ? average.toFixed(2) : '-'
    },

    isDaySelected (personId, year, month, day) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        '' + this.$route.params.year === '' + year &&
        '' + this.$route.params.month === '' + month &&
        '' + this.$route.params.day === '' + day
      )
    },

    isWeekSelected (personId, year, week) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        '' + this.$route.params.year === '' + year &&
        '' + this.$route.params.week === '' + week
      )
    },

    isMonthSelected (personId, year, month) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        '' + this.$route.params.year === '' + year &&
        '' + this.$route.params.month === '' + month
      )
    },

    isDayQuotaLow (personId, year, month, day) {
      const quota = this.getQuota(personId, { year, month, day })
      return (
        quota !== null &&
        this.maxQuota > quota
      )
    },

    isWeekQuotaLow (personId, year, week) {
      return this.maxQuota > this.getQuota(personId, { year, week })
    },

    isMonthQuotaLow (personId, year, month) {
      return this.maxQuota > this.getQuota(personId, { year, month })
    },

    calcAverageColumnX () {
      if (this.quotaLength > 0) {
        this.averageColumnX = `${this.$refs.rowHeaderName.offsetWidth}px`
      }
    },

    resetPersonIds () {
      const personIds = Object.keys(this.quotaMap)
      const persons = personIds.map(pId => this.personMap.get(pId))
      this.personIndex = buildNameIndex(persons)
      this.personIds = personIds.sort((a, b) => {
        const personAName = this.personMap.get(a).full_name
        const personBName = this.personMap.get(b).full_name
        return personAName.localeCompare(personBName)
      })
    }
  },

  watch: {
    $route () {
      const els = document.getElementsByClassName('selected')
      if (els.length === 0) { // selected element is not visible
        setTimeout(() => {
          this.$refs.body.scrollLeft += 380
        }, 100)
      }
    },

    computeMode () {
      if (this.taskTypeId) {
        this.loadData()
      }
    },

    quotaMap () {
      this.resetPersonIds()
    },

    taskTypeId () {
      if (this.taskTypeId) {
        this.loadData()
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
  .info {
    color: $white;
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

.quota-low {
  color: red;
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
