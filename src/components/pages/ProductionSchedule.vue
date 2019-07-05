<template>
<div
  class="columns fixed-page"
>
  <div
    class="column main-column"
  >
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
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

import TaskInfo from '../sides/TaskInfo'
import Schedule from './schedule/Schedule'

export default {
  name: 'production-schedule',
  components: {
    // Spinner,
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
      startDate: moment()
    }
  },

  mounted () {
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    onBodyScroll () {
    }
  },

  socket: {
  },

  watch: {
  },

  metaInfo () {
    if (this.currentProduction) {
      return {
        title: `${this.currentProduction.name} ${this.$t('schedule.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.$t('schedule.title')} - Kitsu`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
}

.fixed-page {
  padding: 1em;
  padding-top: 90px;
  padding-left: 2em;
}

.main-column {
  position: relative;
  display: flex;
  border: 0;
  overflow: hidden;
}
</style>
