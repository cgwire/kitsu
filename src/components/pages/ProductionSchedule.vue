<template>
<div
  class="columns fixed-page"
>
  <div
    class="column main-column"
  >
    <div class="flexrow project-dates">
      <div class="flexrow-item">
        {{ $t('main.start_date') }}
      </div>
      <div class="flexrow-item">
        <datepicker
          wrapper-class="datepicker"
          input-class="date-input input"
          :language="locale"
          :disabled-dates="{ days: [6, 0] }"
          :monday-first="true"
          format="d MMMM yyyy"
          v-model="selectedStartDate"
        />
      </div>
      <div class="flexrow-item">
        {{ $t('main.end_date') }}
      </div>
      <div class="flexrow-item">
        <datepicker
          wrapper-class="datepicker"
          input-class="date input"
          :language="locale"
          :disabled-dates="{ days: [6, 0] }"
          :monday-first="true"
          format="d MMMM yyyy"
          v-model="selectedEndDate"
        />
      </div>
    </div>

    <schedule
      :start-date="startDate"
      :end-date="endDate"
      :hierarchy="entityDates"
    />
  </div>

  <div
    class="column side-column is-hidden-mobile hide-small-screen"
    v-if="currentTask"
  >
    <task-info
      :task="currentTask"
      :is-loading="false"
    />
  </div>
</div>

</template>

<script>
/*
 * Page to manage the schedule of the big steps of the production. It allows
 * to set milestones too.
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'

import TaskInfo from '../sides/TaskInfo'
import Schedule from './schedule/Schedule'

export default {
  name: 'production-schedule',
  components: {
    // Spinner,
    Datepicker,
    Schedule,
    TaskInfo
  },

  data () {
    return {
      currentTask: null,
      endDate: moment().add(6, 'months'),
      entityDates: [
        {
          id: 1,
          name: 'Modeling',
          color: '#5C6BC0',
          startDate: moment('2019-07-16', 'YYYY-MM-DD'),
          endDate: moment('2019-08-01', 'YYYY-MM-DD')
        },
        {
          id: 2,
          name: 'Setup',
          color: '#64B5F6',
          startDate: moment('2019-07-31', 'YYYY-MM-DD'),
          endDate: moment('2019-08-15', 'YYYY-MM-DD')
        },
        {
          id: 3,
          name: 'Texture',
          color: '#F9A825',
          startDate: moment('2019-08-15', 'YYYY-MM-DD'),
          endDate: moment('2019-08-30', 'YYYY-MM-DD')
        },
        {
          id: 4,
          name: 'Modeling',
          color: '#5C6BC0'
        },
        {
          id: 5,
          name: 'Setup',
          color: '#64B5F6'
        },
        {
          id: 6,
          name: 'Texture',
          color: '#F9A825'
        },
        {
          id: 7,
          name: 'Modeling',
          color: '#5C6BC0'
        },
        {
          id: 8,
          name: 'Setup',
          color: '#64B5F6'
        },
        {
          id: 9,
          name: 'Texture',
          color: '#F9A825'
        },
        {
          id: 10,
          name: 'Modeling',
          color: '#5C6BC0'
        },
        {
          id: 11,
          name: 'Setup',
          color: '#64B5F6'
        },
        {
          id: 12,
          name: 'Texture',
          color: '#F9A825'
        }
      ],
      startDate: moment(),
      selectedStartDate: null,
      selectedEndDate: null
    }
  },

  mounted () {
    if (this.currentProduction.start_date) {
      this.startDate = moment(this.currentProduction.start_date)
    }
    if (this.currentProduction.end_date) {
      this.endDate = moment(this.currentProduction.end_date)
    }
    this.selectedStartDate = this.startDate.toDate()
    this.selectedEndDate = this.endDate.toDate()
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'user'
    ]),

    locale () {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    }
  },

  methods: {
    ...mapActions([
      'editProduction'
    ]),

    onBodyScroll () {
    }
  },

  socket: {
  },

  watch: {
    selectedStartDate () {
      this.startDate = moment(this.selectedStartDate)
      this.editProduction({
        data: {
          ...this.currentProduction,
          start_date: this.startDate.format('YYYY-MM-DD')
        }
      })
    },

    selectedEndDate () {
      this.endDate = moment(this.selectedEndDate)
      this.editProduction({
        data: {
          ...this.currentProduction,
          end_date: this.endDate.format('YYYY-MM-DD')
        }
      })
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''}` +
               ` - ${this.currentEpisode ? this.currentEpisode.name : ''}` +
               ` | ${this.$t('schedule.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.currentProduction.name} ` +
               `| ${this.$t('schedule.title')} - Kitsu`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
}

.project-dates {
  border-bottom: 1px solid #EEE;
  margin-left: 205px;
  padding-bottom: 1em;
}

.fixed-page {
  padding: 1em;
  padding-top: 90px;
  padding-left: 2em;
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}
</style>
