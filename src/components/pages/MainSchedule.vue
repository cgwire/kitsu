<template>
<div
  class="columns fixed-page"
>
  <div
    class="column main-column"
  >
    <div class="flexrow project-dates">
      <div class="flexrow-item">
        <label class="label">
          {{ $t('main.start_date') }}
        </label>
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
      <div class="flexrow-item field">
        <label class="label">
          {{ $t('main.end_date') }}
        </label>
        <datepicker
          wrapper-class="datepicker"
          input-class="date-input input"
          :language="locale"
          :disabled-dates="{ days: [6, 0] }"
          :monday-first="true"
          format="d MMMM yyyy"
          v-model="selectedEndDate"
        />
      </div>
      <combobox-number
        class="flexrow-item zoom-level"
        :label="$t('schedule.zoom_level')"
        :options="zoomOptions"
        v-model="zoomLevel"
      />
    </div>

    <schedule
      :start-date="startDate"
      :end-date="endDate"
      :hierarchy="scheduleItems"
      :zoom-level="zoomLevel"
      :is-loading="loading.schedule"
      :is-error="errors.schedule"
      @item-changed="saveScheduleItem"
      @change-zoom="changeZoom"
      @root-element-expanded="expandProductionElement"
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

import {
  getFirstStartDate,
  getLastEndDate,
  getStartDateFromString,
  getEndDateFromString
} from '../../lib/time'
import colors from '../../lib/colors'

import ComboboxNumber from '../widgets/ComboboxNumber'
import Schedule from './schedule/Schedule'

export default {
  name: 'production-schedule',
  components: {
    ComboboxNumber,
    Datepicker,
    Schedule
  },

  data () {
    return {
      endDate: moment().add(6, 'months'),
      scheduleItems: [],
      startDate: moment(),
      selectedStartDate: null,
      selectedEndDate: null,
      zoomLevel: 2,
      zoomOptions: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ],
      loading: {
        schedule: false
      },
      errors: {
        schedule: false
      }
    }
  },

  mounted () {
    this.reset()
  },

  computed: {
    ...mapGetters([
      'openProductions',
      'taskTypeMap',
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
      'loadScheduleItems',
      'saveScheduleItem'
    ]),

    changeZoom (event) {
      if (event.wheelDelta < 0 && this.zoomLevel > 1) this.zoomLevel--
      if (event.wheelDelta > 0 && this.zoomLevel < 3) this.zoomLevel++
    },

    reset () {
      this.scheduleItems = this.convertScheduleItems(this.openProductions)
      this.startDate = getFirstStartDate(this.scheduleItems)
      this.endDate = getLastEndDate(this.scheduleItems)
      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()
    },

    convertScheduleItems (scheduleItems) {
      return scheduleItems.map((item) => {
        const startDate = getStartDateFromString(item.start_date)
        const endDate = getEndDateFromString(startDate, item.end_date)
        return {
          ...item,
          avatar: item.type === 'Project',
          color: item.color || colors.fromString(item.name, true),
          startDate: startDate,
          endDate: endDate,
          expanded: false,
          loading: false,
          editable: false,
          children: []
        }
      })
    },

    convertTaskTypeScheduleItems (scheduleItems) {
      return scheduleItems.map((item) => {
        const startDate = getStartDateFromString(item.start_date)
        const endDate = getEndDateFromString(startDate, item.end_date)
        const taskType = this.taskTypeMap[item.task_type_id]

        return {
          ...item,
          name: taskType.name,
          color: taskType.color,
          startDate: startDate,
          endDate: endDate,
          expanded: false,
          loading: false,
          editable: false,
          children: []
        }
      })
    },

    expandProductionElement (productionElement) {
      if (!productionElement.expanded) {
        productionElement.loading = true
        productionElement.expanded = true
        this.loadScheduleItems(productionElement)
          .then((scheduleItems) => {
            scheduleItems = this.convertTaskTypeScheduleItems(scheduleItems)
            productionElement.children = scheduleItems
            productionElement.loading = false
          })
      } else {
        productionElement.expanded = false
      }
    }
  },

  socket: {
  },

  watch: {
  },

  metaInfo () {
    return {
      title: `${this.$t('schedule.title_main')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .project-dates {
    color: $white-grey;
    border-bottom: 1px solid $grey;
  }
}

.project-dates {
  border-bottom: 1px solid #EEE;
  padding-bottom: 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .overall-man-days {
    width: 120px;
    font-size: 0.9em;
    margin-right: 1em;
  }
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

.zoom-level {
  margin-top: -10px;
}
</style>
