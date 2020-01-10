<template>
  <div class="quota">
    <div class="quota-fixed" v-if="this.quotaLength > 0 && !isLoading">
      <div class="quota-header quota-row">
        <div class="header-cell row-cell row-cell--name">
          {{ $t('quota.name') }}
        </div>
        <div class="header-cell row-cell row-cell--weekly">
          {{ $t('quota.quota_week') }}
        </div>
        <div class="header-cell row-cell row-cell--average">
          {{ $t('quota.average') }}
        </div>
      </div>
      <div class="quota-row" v-for="(people, key, i) in quotaMap" :key="'-' + i">
        <div class="row-cell row-cell--name">
          <people-avatar :size="30" :person="personMap[key]"/>
          {{ personMap[key].full_name }}
        </div>
        <div class="row-cell row-cell--weekly">{{ '-' }}</div>
        <div class="row-cell row-cell--average">{{ '-' }}</div>
      </div>
    </div>
    <div class="quota-scrolled" v-if="this.quotaLength > 0 && !isLoading">
      <div class="quota-header quota-row">
        <div
          class="header-cell row-cell"
          v-for="month in monthRange"
          :key="'month-' + month"
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
      <div class="quota-row" v-for="(people, key, i) in quotaMap" :key="'-' + i">
        <div class="row-cell"
          v-for="month in monthRange"
          :key="'month-' + month"
          v-if="detailLevel === 'month'"
        >
          {{ quotaMap[key][year+'-'+ month.toString().padStart(2, '0')] || '-'}}
        </div>
        <div class="row-cell"
          v-for="week in weekRange"
          :key="'week-' + week"
          v-if="detailLevel === 'week'"
        >
          {{ quotaMap[key][year+'-'+week] || '-'}}
        </div>
        <div class="row-cell"
          v-for="day in dayRange"
          :key="'day-' + day"
          v-if="detailLevel === 'day'"
        >
          {{ quotaMap[key][year+'-'+ month.toString().padStart(2, '0') +'-'+day] || '-'}}
        </div>
      </div>
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

  mounted () {
    this.loadData()
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
      isLoading: false,
      isError: false,
      quotaMap: {},
      quotaLength: 0,
      currentMonth: moment().month() + 1,
      currentYear: moment().year(),
      currentWeek: moment().week()
    }
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
      'computeQuota'
    ]),
    loadData () {
      this.loadShots((err) => {
        this.isLoading = true
        if (err) {
          console.error(err)
        } else {
          if (this.taskTypeId) {
            this.computeQuota({
              taskTypeId: this.taskTypeId,
              detailLevel: this.detailLevel
            })
              .then(quotas => {
                this.quotaMap = quotas
                this.isLoading = false
                this.quotaLength = Object.keys(this.quotaMap).length
                console.debug('method', this.quotaMap)
              })
          }
        }
      })
    },
    monthToString
  },

  watch: {
    taskTypeId () {
      if (this.taskTypeId) {
        this.loadData()
      }
    },
    detailLevel () {
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
  .dark {
    .quota {
      color: $white;
    }
    .row-cell {
      border-bottom-color: $dark-grey-light;
    }
    .quota-row:nth-child(odd):not(.quota-header) .row-cell {
      background-color: $dark-grey-lightmore;
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
</style>
